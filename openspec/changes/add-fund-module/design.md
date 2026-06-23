## Context

Mega Rich 当前前端按功能模块划分目录（`components/balance/`、`components/salary/`、`components/auth/`），主组件模式一致：

1. **数据加载**：在 `onMounted` 中 `supabase.from(table).select('*').order()` 全量加载
2. **筛选**：`selectedXxx` ref + `filteredXxx` computed（前端过滤）
3. **统计**：`computed` 链对过滤后数据做聚合计算
4. **图表**：`v-chart` + `computed chartOption`（配置复用 `ChartConfig.js`）
5. **表格**：`CardListView.vue`（桌面 NDataTable + 移动端卡片，自动切换）
6. **CRUD 弹窗**：`n-modal preset="dialog"` + `useMobileModal()` 移动端全屏适配
7. **批量导入**：`xlsx` 库解析 CSV/Excel → 校验 → 50条/批 INSERT

基金模块将沿用此范式，复用现有组件和配置体系——无新增包依赖。

### 核心复用清单

| 复用对象 | 来源 | 用途 |
|---|---|---|
| `CardListView.vue` | `src/components/` | 持仓/交易/计划/自选所有列表 |
| `commonChartConfig` / `pieChartCommonConfig` / `mobileChartConfig` | `src/utils/ChartConfig.js` | 净值走势、持仓占比等所有图表 |
| `pagination` / `mobilePagination` / `labelWidth` | `src/utils/TableConfig.js` | 表格列宽与分页 |
| `useMobileModal()` | `src/composables/useMobileModal.js` | 所有弹窗移动端全屏适配 |
| `isMobile` | `src/utils/device.js` | 响应式断点 |
| `FundApi.js` 30+ 函数 | `src/utils/FundApi.js` | 基金行情/搜索/详情/排行 |
| 批量导入范式（parseCSV/parseExcel/validate/batchInsert） | `Balance.vue` | 交易记录批量导入 |
| 增长率/环比/同比计算 | `Balance.vue` `calculateGrowthStats` | 持仓收益同比环比（如需） |

### 现有基金数据层

- 5 张表全部启用 RLS，策略：`auth.uid() = user_id`（`fund_nav_history` 仅 SELECT 开放）
- `fund_holdings` 有 `update_fund_holdings_updated_at` 触发器，无盈亏自动计算触发器
- `fund_transactions` 外键 `holding_id → fund_holdings.id` 当前无 ON DELETE 策略（默认为 NO ACTION）
- `fund_watchlist` 有 `UNIQUE(user_id, fund_code)` 约束
- Edge Function `fund-api` 当前 `verify_jwt: false`，所有 30+ 接口以 POST 代理形式可用

## Goals / Non-Goals

**Goals:**

- 用户可在 Mega Rich 中查看名下所有基金持仓及其盈亏（持仓列表 + 总览统计 + 类型占比）
- 用户可录入/编辑/删除基金交易记录（买入/卖出/分红），持仓数据随交易自动更新
- 用户可查看单只基金的详细行情数据（净值走势/阶段涨幅/同类排名/经理信息）
- 用户可管理自选基金并设置涨跌预警阈值
- 所有基金模块遵循项目现有 UI 范式（Naive UI + CardListView + vue-echarts），复用已有组件和配置
- 基金模块在移动端（768px 断点）正常使用，列表自动切换卡片视图，弹窗自动全屏

**Non-Goals:**

- 自动扣款或真实券商对接（不在本项目范围内）
- Web Push / 邮件推送预警通知（MVP 仅应用内提醒）
- pg_cron 定时同步逻辑（MVP 仅手动 + 页面进入触发）
- 基金定投的自动执行（MVP 仅提醒 + 手动确认执行）
- 历史净值数据的批量回填（历史数据按需通过 FundApi 实时拉取）
- 基金费用自动计算（申购/赎回费率用户手动填写）
- `fund-api` Edge Function 的 verify_jwt 收紧（监控用量后再决策）

## Decisions

### 1. 页面规划：Tab 容器 + 独立路由

- `/fund` 主入口用 `NTabs` 内嵌 3 个 Tab：**持仓总览 / 自选 / 定投**。三者共享统计概览卡片栏和搜索/刷新/同步工具栏，Tab 切换不触发路由变更。
- `/fund/detail/:code` 独立路由：信息密度大（4-6 张图表+多 Tab 信息），支持从持仓/自选/排行/搜索多处入口跳转 + 浏览器后退。
- `/fund/transactions` 独立路由：交易流水是跨基金的、高频写入、需要复杂筛选，独立页面更清晰。
- `/fund/rank` 独立路由：选基工具，非资产核心，独立路由避免污染主流程。
- `/fund/watchlist` 独立路由（同步可做 `/fund` 的 tab）：自选功能不频繁操作但有独立页面和路由更方便。

### 2. 持仓盈亏计算：三口径展示

- **实现盈亏**（已落袋）：`total_redeem + dividend - total_invest`
- **浮动盈亏**（当前持有）：`current_nav * shares - (total_invest - total_redeem) - dividend`
- **总盈亏**：`current_nav * shares + total_redeem + dividend - total_invest`
- **盈亏率**：`总盈亏 / (total_invest - total_redeem) * 100`
- DB 字段 `profit`/`profit_rate` 存储总盈亏口径快照

### 3. 交易回写持仓：MVP 前端方案，Phase 2 DB 触发器

- **MVP（方案 B）**：`AddEditTransactionForm` 提交时，先 INSERT `fund_transactions`，再 `supabase.from('fund_holdings').update({...})` 重算 shares/avg_cost/profit 等。两步包裹 try/catch，失败时回滚 DELETE 交易。
- **Phase 2（方案 A）**：给 `fund_transactions` 建 `AFTER INSERT OR UPDATE OR DELETE` 触发器，PL/pgSQL 函数聚合该 holding_id 下所有交易重算持仓，`pg_trigger_depth() < 1` 防止递归。

### 4. 净值同步策略

- **触发时机**：手动（行按钮"同步" / 工具栏"同步全部"）；自动（进入 `/fund` 时，`auto_sync=true` 且 `last_sync_at` 距今 > 4 小时的持仓后台同步）
- **同步过程**：`fundVarietieValuationDetail(code)` → 实时估值/涨跌 + `fundMNHisNetList(code, 1, 1)` → 最新确认净值 → UPDATE `fund_holdings.current_nav/today_change/last_sync_at` → 重算 profit/profit_rate
- **并发控制**：同步全部时用 Promise pool 限 3-5 个并发
- **同步间隔**：自动同步不低于 4 小时间隔（避免上游限流）
- **历史净值入库**：手动同步时顺带写入 `fund_nav_history`（Phase 2 通过 `fund-nav-sync` Edge Function 入库）

### 5. fund_nav_history 写入：新建 Edge Function，不放宽 RLS

`fund_nav_history` 当前 INSERT/UPDATE 仅 service_role 可写（RLS 策略），保持安全不变。新建 Edge Function `fund-nav-sync`（`verify_jwt: true`），携带 service_role key 做 UPSERT。前端调用此函数而非直接写表。

### 6. fund_type 类型统一

`fund_holdings.fund_type` 是 `varchar`（存储天天基金类型编码如 `25`=股票型），`fund_watchlist.fund_type` 是 `integer`。统一为 `varchar`，并给 `fund_transactions` 加 `fund_type varchar` 冗余字段便于筛选展示。

## Risks / Trade-offs

### Edge Function `fund-api` 安全（verify_jwt: false）
- **风险**：任何人可匿名调用，上游限流或 Supabase 配额耗尽
- **缓解**：上游数据本身公开，无数据泄露风险；MVP 保持现状，监控用量
- **长期**：改 `verify_jwt: true`，前端 auth header 自动带 anon JWT，需验证上游兼容性

### 天天基金接口稳定性
- **风险**：上游 `tiantian-fund-api.vercel.app` 可能下线/限流/改接口结构
- **缓解**：所有 FundApi 调用包裹 try/catch 降级；同步并发限流 3-5；净值入库 `fund_nav_history` 作为缓存；响应字段加 normalize 适配层

### 前端二次 UPDATE 原子性（方案 B）
- **风险**：INSERT `fund_transactions` 成功但 UPDATE `fund_holdings` 失败 → 数据不一致
- **缓解**：try/catch + 回滚 DELETE 交易；Phase 2 用 DB 触发器彻底解决

### 净值同步频率与准确度
- **T+1 确认**：交易日 15:00 后净值才确认。盘中同步用估算净值（GSZ）而非确认净值（DWJZ），UI 应标注"估算"标识
- **非交易日**：同步时接口可能返回昨日数据，`last_sync_at` 仍更新避免重复调用

### 持仓手动编辑 vs 交易记录驱动
- 同一字段（shares/avg_cost）既可手动编辑又可被交易回写，会产生冲突
- **决策**：持仓表单只允许编辑非派生字段（fund_code/name/type/buy_date/auto_sync/remark），派生字段只读
- "初始化持仓"时允许一次性写入初始快照值，标记 `remark = '手工初始化'`

### 移动端 TabBar 容量
- 当前 4 个 tab（首页/月薪/结余/设置）已满
- **决策**：Home.vue 增加基金入口卡片，不额外占用 TabBar。若基金成为主流程后续调整。
