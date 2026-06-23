## Why

Mega Rich 的资产管理能力目前集中在「事后记录」（收支结余、月薪管理），缺少「投资跟踪」这一核心环节。基金模块的基础已经打好——5 张数据库表（fund_holdings/fund_transactions/fund_plans/fund_watchlist/fund_nav_history）全部建好、RLS 已开、30+ 个天天基金数据接口已通过 `FundApi.js` + Edge Function `fund-api` 完成封装——但前端 UI 完全空白，用户无法在应用中查看持仓、交易记录或基金行情。投入产出比极高，只需补齐前端层即可完成资产管理的完整闭环。

## What Changes

- **新增 `src/components/fund/` 目录**：按 `balance/` 和 `salary/` 的目录规范，创建 Fund.vue（主入口 Tab 容器）+ FundDetail.vue（详情页）+ Transactions.vue（交易流水）+ Rank.vue（排行选基）路由级组件 + sub/ 子组件系列（表单/详情弹窗） + SearchFundModal.vue（搜索弹窗）
- **新增 6 条路由**：`/fund`（持仓/自选/定投 Tab）、`/fund/detail/:code`（详情）、`/fund/transactions`（交易）、`/fund/plans`（定投）、`/fund/watchlist`（自选）、`/fund/rank`（排行）；全部懒加载
- **数据库 4 项迁移**：`fund_watchlist.fund_type` 类型统一为 varchar（与 holdings 一致）、`fund_transactions` 增加 `fund_type` 冗余字段、`fund_transactions.holding_id` 外键改为 `ON DELETE SET NULL`、`fund_holdings` 增加盈亏自动计算触发器（Phase 2）
- **新增 Edge Function `fund-nav-sync`**（Phase 2）：携带 service_role key 向 `fund_nav_history` 写入基金当日净值
- **修改现有文件**：`src/router/index.js`（新增路由）、`src/App.vue`（`authRequiredPages` 数组同步）、`src/components/Home.vue`（增加基金入口卡片）

### BREAKING

`fund_watchlist.fund_type` 从 integer 改为 varchar，已存在的自选基金记录需要迁移。

## Capabilities

### New Capabilities

- `fund-portfolio`: 基金持仓列表、总览统计（总市值/总盈亏/当日涨跌）、持仓 CRUD、净值同步、持仓类型占比图表
- `fund-transactions`: 基金交易记录 CRUD（买入/卖出/分红）、交易回写持仓、交易流水筛选与统计、批量导入
- `fund-detail`: 基金详情页——净值走势/累计收益对比/阶段涨幅/同类排名/历史净值/基金经理/基金公司多 Tab 图表
- `fund-watchlist`: 自选基金 CRUD、预警阈值设置与触发检查、自选涨幅对比图表
- `fund-plans`: 定投计划 CRUD、待执行计划提醒、手动执行定投
- `fund-rank`: 基金排行榜——按类型/阶段涨幅/评级等多维度筛选的选基工具

## Impact

- **新增代码**：~20 个新文件（`src/components/fund/` 目录下 + `fund-nav-sync` Edge Function）
- **数据库迁移**：4 项 DDL（fund_type 统一、fund_transactions 加列、外键 ON DELETE、触发器）
- **API 接入**：`src/utils/FundApi.js` 中 30+ 个函数从仅测试调用变为被业务组件正式使用
- **路由变更**：`src/router/index.js` 新增 6 条懒加载路由，`src/App.vue` 第 26 行 `authRequiredPages` 数组加入基金相关路由名
- **首页入口**：`src/components/Home.vue` `features-grid` 增加基金卡片
- **包依赖**：无新增（图表复用 ECharts/vue-echarts + ChartConfig，列表复用 CardListView）
