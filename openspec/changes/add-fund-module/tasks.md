## Phase 1 — MVP（核心闭环）

### 1. 数据库迁移

- [x] 1.1 统一 `fund_watchlist.fund_type` 类型为 varchar
- [x] 1.2 `fund_transactions` 新增 `fund_type` 冗余列
- [x] 1.3 `fund_transactions.holding_id` 外键改为 `ON DELETE SET NULL`
- [x] 1.4 确认迁移后表结构无异常，运行 `list_tables` 验证

### 2. 路由与入口

- [x] 2.1 `src/router/index.js` 新增 6 条懒加载路由
- [x] 2.2 `src/App.vue` 第 26 行 `authRequiredPages` 数组加入基金相关路由
- [x] 2.3 `src/components/Home.vue` 的 `features-grid` 增加"基金管理"卡片

### 3. 基金搜索弹窗（共享组件）

- [ ] 3.1 创建 `SearchFundModal.vue`：`n-modal` 包含搜索输入框，调用 `fundSearch(1, key)` 获取结果列表，emit('select', { fundCode, fundName, fundType }) 供父组件使用
- [ ] 3.2 搜索结果以 `n-data-table` 展示：基金代码、基金名称、基金类型

### 4. 基金持仓（fund-portfolio）

- [ ] 4.1 创建 `fund/Fund.vue` 主页面：顶部统计卡片 + 搜索/同步工具栏 + `NTabs`（持仓/自选/定投），实现 `loadData` 加载 `fund_holdings`
- [ ] 4.2 创建 `fund/sub/HoldingsTab.vue`：持仓 `CardListView` + 筛选（基金类型/盈亏状态/排序）+ 总览 computed（totalMarketValue/totalCost/totalProfit/totalProfitRate/todayChange）
- [ ] 4.3 实现持仓类型占比嵌套饼图（复用 `pieChartCommonConfig`）和盈亏对比柱状图（复用 `commonChartConfig`）
- [ ] 4.4 创建 `fund/sub/AddEditHoldingForm.vue`：支持从 `SearchFundModal` 选基金，填写份额/成本/净值/买入日期，提交 INSERT `fund_holdings`
- [ ] 4.5 创建 `fund/sub/HoldingDetail.vue`：只读展示所有持仓字段 + "查看走势"按钮跳转 `/fund/detail/:code`
- [ ] 4.6 实现持仓删除（先 SET NULL 关联交易记录的 holding_id，再 DELETE holdings）
- [ ] 4.7 实现净值同步逻辑：单只同步 + 全部同步（Promise pool 限并发 3-5）+ 进入页面 >4h 自动同步
- [ ] 4.8 NavBar/工具栏集成："新增持仓"、"同步全部净值"、"刷新"按钮

### 5. 基金交易（fund-transactions）

- [ ] 5.1 创建 `fund/Transactions.vue`：`CardListView` + 筛选（日期范围/交易类型/基金代码/关联持仓）+ 统计卡片（累计买入/卖出/手续费/净投入）
- [ ] 5.2 创建 `fund/sub/AddEditTransactionForm.vue`：交易类型（buy/sell/dividend）切换表单字段，基金搜索选择，关联持仓下拉，金额自动计算，交易日期默认今天
- [ ] 5.3 实现"买入"后持仓回写：INSERT 交易 → UPDATE holdings（shares+=、total_invest+=、avg_cost=、buy_date=），含失败回滚
- [ ] 5.4 实现"卖出"后持仓回写：INSERT 交易 → UPDATE holdings（shares-=、total_redeem+=），含份额超限校验
- [ ] 5.5 实现"分红"后持仓回写：INSERT 交易 → UPDATE holdings.dividend+=；再投资另增份额
- [ ] 5.6 实现编辑/删除交易：先还原旧交易影响，再应用新交易或删除后重算持仓
- [ ] 5.7 实现月度交易柱状图（复用 `commonChartConfig`）
- [ ] 5.8 实现批量导入：模板下载（xlsx）+ 解析校验（CSV/Excel）+ 50条/批写入 + 持仓回写

### 6. 基金详情（fund-detail）

- [ ] 6.1 创建 `fund/FundDetail.vue`：路由级页面，头部信息区（fundMNDetailInformation）+ 实时估值卡片（fundVarietieValuationDetail）+ 底部操作栏
- [ ] 6.2 实现"净值走势"Tab：`fundVPageDiagram(code, range)` 折线图 + 时间范围切换按钮 + 累计净值叠加开关
- [ ] 6.3 实现"累计收益对比"Tab：`fundVPageAcc(code, range, '000300')` 双系列折线图
- [ ] 6.4 实现"阶段涨幅"Tab：`fundMNPeriodIncrease(code, '')` 表格展示（基金 vs 同类平均 vs 沪深300）
- [ ] 6.5 实现"同类排名"Tab：`fundRankDiagram(code, range)` 排名走势折线图
- [ ] 6.6 实现"历史净值"Tab：`fundMNHisNetList(code, page, 20)` 分页表格
- [ ] 6.7 实现"基金经理"Tab：`fundMNMangerList` → 详情（fundMSNMangerInfo/fundMSNMangerAcc/fundMSNMangerPerRank）
- [ ] 6.8 实现"基金公司"Tab：`companyApi2FundCompanyBaseInfo(cc)` + `companyApi2CompanyArchives(cc)`
- [ ] 6.9 实现 Tab 懒加载（切换 Tab 首次请求），各 Tab 加载中展示 NSpin

### 7. 自选基金（fund-watchlist）

- [ ] 7.1 创建 `fund/Watchlist.vue`：`CardListView` + 实时数据联动（进入时批量调用 fundVarietieValuationDetail）
- [ ] 7.2 实现添加自选（搜索/详情页）+ 删除自选 + UNIQUE 防重复
- [ ] 7.3 实现预警阈值设置：alert_up/alert_down 输入 + alert_enabled 开关，进入页面时检查阈值触发提示
- [ ] 7.4 实现自选涨幅对比柱状图（近1周/近1月/近3月，复用 `commonChartConfig` + `fundMNPeriodIncrease`）

## Phase 2 — 增强

### 8. 定投计划（fund-plans）

- [ ] 8.1 创建 `fund/Plans.vue`：`CardListView` + 统计卡片（活跃计划数/月度总额/累计投入）
- [ ] 8.2 创建 `fund/sub/AddEditPlanForm.vue`：计划名称、基金搜索、每期金额、频率、开始/结束日期，提交 INSERT `fund_plans` 并计算 next_execute_date
- [ ] 8.3 实现暂停/恢复/删除计划
- [ ] 8.4 实现待执行检查（进入页面扫描 active 且 next_execute_date ≤ today 的计划），n-alert 提醒 + "一键执行"入口
- [ ] 8.5 实现手动执行定投：预填 `AddEditTransactionForm`，执行后更新 `fund_plans` 的 total_invested/total_shares/next_execute_date

### 9. 基金排行（fund-rank）

- [ ] 9.1 创建 `fund/Rank.vue`：`CardListView` + 分类/排序下拉 + init 调用 `fundMNRank`
- [ ] 9.2 实现类型筛选（全部/股票/混合/债券/货币/QDII/指数/ETF）、排序列切换、升降序切换、分页
- [ ] 9.3 实现从排行加自选 + 已自选标识
- [ ] 9.4 实现高级筛选弹窗（风险等级/规模/成立年限/申购费率/评级）

### 10. 后端增强

- [ ] 10.1 新建 Edge Function `fund-nav-sync`（verify_jwt: true），携带 service_role key 向 `fund_nav_history` 做 UPSERT
- [ ] 10.2 净值同步逻辑升级：手动同步时调用 `fund-nav-sync` 顺带写入当日净值到 `fund_nav_history`
- [ ] 10.3 创建 DB 触发器 `update_fund_holdings_profit()`：fund_holdings BEFORE UPDATE 自动重算 profit/profit_rate
- [ ] 10.4 创建 DB 触发器 `recalc_holding_from_transactions()`：fund_transactions AFTER INSERT/UPDATE/DELETE 自动聚合重算关联持仓，以 `pg_trigger_depth() < 1` 防止递归
- [ ] 10.5 前端交易回写方案 B 替换为方案 A（移除前端二次 UPDATE，依赖 DB 触发器）
