## 1. Phase 1: 架构基础搭建

- [x] 1.1 安装依赖：vue-router 和 pinia
- [x] 1.2 创建目录结构：router/, stores/, composables/, services/, design/
- [x] 1.3 创建 Design Tokens 配置文件 (design/tokens.js)
- [x] 1.4 创建全局样式文件 (design/global.css)
- [x] 1.5 配置 Naive UI 主题覆盖 (design/theme.js)
- [x] 1.6 创建 Vue Router 配置文件 (router/index.js)
- [x] 1.7 定义所有路由规则（首页、基金、结余、月薪、认证等）
- [x] 1.8 实现路由守卫进行认证检查
- [x] 1.9 创建 authStore (stores/auth.js)
- [x] 1.10 创建 fundStore (stores/fund.js)
- [x] 1.11 创建 balanceStore (stores/balance.js)
- [x] 1.12 创建 salaryStore (stores/salary.js)
- [x] 1.13 创建 SupabaseService (services/SupabaseService.js)
- [x] 1.14 创建 StorageService (services/StorageService.js)
- [x] 1.15 创建 useAuth composable (composables/useAuth.js)
- [x] 1.16 创建 useChart composable (composables/useChart.js)
- [x] 1.17 重构 App.vue，移除 v-if 路由，使用 router-view
- [x] 1.18 在 main.js 中初始化 Router 和 Pinia

## 2. Phase 1: 布局系统重构

- [x] 2.1 创建 AppHeader 组件 (components/layout/AppHeader.vue)
- [x] 2.2 创建 AppFooter 组件 (components/layout/AppFooter.vue)
- [x] 2.3 创建 TabBar 组件 (components/layout/TabBar.vue)
- [x] 2.4 实现响应式导航切换逻辑（桌面端顶部导航，移动端底部 Tab Bar）
- [x] 2.5 应用 Design Tokens 到布局组件
- [ ] 2.6 测试移动端和桌面端布局切换

## 3. Phase 1: 基础组件库

- [x] 3.1 创建 Card 基础组件 (components/base/Card.vue)
- [x] 3.2 创建 Chart 基础组件 (components/base/Chart.vue)
- [x] 3.3 创建 Empty 基础组件 (components/base/Empty.vue)
- [x] 3.4 创建 Loading 基础组件 (components/base/Loading.vue)
- [x] 3.5 应用 Design Tokens 到所有基础组件

## 4. Phase 1: 认证模块适配

- [x] 4.1 重构 Login 组件，使用 authStore 和 useAuth
- [x] 4.2 重构 Register 组件，使用 authStore 和 useAuth
- [x] 4.3 重构 ForgotPassword 组件
- [x] 4.4 重构 PasswordReset 组件
- [x] 4.5 重构 UserSettings 组件
- [x] 4.6 测试完整的认证流程（登录、注册、登出、密码重置）

## 5. Phase 1: 数据库迁移

- [x] 5.1 创建数据库迁移文件：新增 fund_plans 表
- [x] 5.2 创建数据库迁移文件：新增 fund_nav_history 表
- [x] 5.3 创建数据库迁移文件：为 fund_holdings 添加 last_sync_at 和 auto_sync 字段
- [x] 5.4 创建数据库迁移文件：为 fund_transactions 添加 plan_id 字段
- [x] 5.5 执行数据库迁移并验证
- [x] 5.6 配置新表的 RLS 策略

## 6. Phase 2: 基金持仓管理

- [x] 6.1 创建 useFund composable (composables/useFund.js)
- [x] 6.2 在 fundStore 中实现持仓数据管理
- [x] 6.3 在 SupabaseService 中实现持仓 CRUD 操作
- [x] 6.4 创建 FundCard 组件 (components/fund/FundCard.vue)
- [x] 6.5 创建 HoldingsList 组件 (components/fund/HoldingsList.vue)
- [x] 6.6 创建 AddEditHoldingForm 组件 (components/fund/AddEditHoldingForm.vue)
- [x] 6.7 创建 HoldingDetail 组件 (components/fund/HoldingDetail.vue)
- [x] 6.8 实现持仓列表的筛选和排序功能
- [x] 6.9 实现自动同步净值功能
- [x] 6.10 创建持仓管理页面 (views/fund/Holdings.vue)
- [x] 6.11 测试持仓的添加、编辑、删除功能

## 7. Phase 2: 基金交易记录

- [x] 7.1 在 fundStore 中实现交易记录数据管理
- [x] 7.2 在 SupabaseService 中实现交易记录 CRUD 操作
- [x] 7.3 创建 TransactionForm 组件 (components/fund/TransactionForm.vue)
- [x] 7.4 创建 TransactionList 组件 (components/fund/TransactionList.vue)
- [x] 7.5 创建 TransactionStats 组件 (components/fund/TransactionStats.vue)
- [x] 7.6 实现交易记录的筛选功能（按类型、按基金）
- [x] 7.7 实现交易统计功能（月度、年度汇总）
- [x] 7.8 创建交易记录页面 (views/fund/Transactions.vue)
- [x] 7.9 测试交易记录的添加、编辑、删除功能
- [x] 7.10 测试交易记录与持仓的联动更新

## 8. Phase 2: 基金市场搜索

- [x] 8.1 创建 FundSearch 组件 (components/fund/FundSearch.vue)
- [x] 8.2 实现基金搜索功能（调用 FundApi.fundSearchInfoByName）
- [x] 8.3 创建 FundRankList 组件 (components/fund/FundRankList.vue)
- [x] 8.4 实现基金排行榜功能（调用 FundApi.fundMNRank）
- [x] 8.5 实现排行榜的筛选和排序功能
- [x] 8.6 实现分页加载功能
- [x] 8.7 创建基金市场页面 (views/fund/Market.vue)
- [x] 8.8 实现搜索结果缓存
- [x] 8.9 测试搜索和排行榜功能

## 9. Phase 2: 基金投资总览

- [x] 9.1 创建 AssetSummary 组件 (components/fund/AssetSummary.vue)
- [x] 9.2 创建 ProfitChart 组件 (components/fund/ProfitChart.vue)
- [x] 9.3 创建 HoldingsOverview 组件 (components/fund/HoldingsOverview.vue)
- [x] 9.4 实现资产汇总计算逻辑
- [x] 9.5 实现收益曲线图
- [x] 9.6 创建基金投资总览页面 (views/fund/Overview.vue)
- [x] 9.7 测试总览页面的数据展示

## 10. Phase 3: 基金详情页

- [x] 10.1 创建 FundDetail 组件 (components/fund/FundDetail.vue)
- [x] 10.2 实现基金基本信息展示（调用 FundApi.fundMNDetailInformation）
- [x] 10.3 实现净值走势图（调用 FundApi.fundVPageDiagram）
- [x] 10.4 实现基金经理信息展示（调用 FundApi.fundMNMangerList）
- [x] 10.5 实现基金评级展示（调用 FundApi.fundGradeDetail）
- [x] 10.6 实现阶段涨幅展示（调用 FundApi.fundMNPeriodIncrease）
- [x] 10.7 创建基金详情页面 (views/fund/FundDetail.vue)
- [x] 10.8 实现基金数据缓存到 fund_nav_history 表
- [x] 10.9 测试基金详情页的所有功能

## 11. Phase 3: 自选基金

- [x] 11.1 在 fundStore 中实现关注列表数据管理
- [x] 11.2 在 SupabaseService 中实现关注列表 CRUD 操作
- [x] 11.3 创建 WatchlistItem 组件 (components/fund/WatchlistItem.vue)
- [x] 11.4 创建 WatchlistSettings 组件 (components/fund/WatchlistSettings.vue)
- [x] 11.5 实现添加/取消关注功能
- [x] 11.6 实现涨跌幅排序功能
- [x] 11.7 实现净值提醒设置功能
- [x] 11.8 实现实时数据更新（定时刷新）
- [x] 11.9 创建自选基金页面 (views/fund/Watchlist.vue)
- [x] 11.10 测试自选基金的所有功能

## 12. Phase 3: 基金对比

- [x] 12.1 创建 FundCompare 组件 (components/fund/FundCompare.vue)
- [x] 12.2 实现基金对比列表管理（最多4只）
- [x] 12.3 实现基金关键指标对比展示
- [x] 12.4 实现净值走势对比图
- [x] 12.5 创建基金对比页面 (views/fund/Compare.vue)
- [x] 12.6 测试基金对比功能

## 13. Phase 4: 定投计划

- [x] 13.1 在 fundStore 中实现定投计划数据管理
- [x] 13.2 在 SupabaseService 中实现定投计划 CRUD 操作
- [x] 13.3 创建 PlanForm 组件 (components/fund/PlanForm.vue)
- [x] 13.4 创建 PlanList 组件 (components/fund/PlanList.vue)
- [x] 13.5 创建 PlanDetail 组件 (components/fund/PlanDetail.vue)
- [x] 13.6 实现创建定投计划功能
- [x] 13.7 实现暂停/恢复计划功能
- [x] 13.8 实现手动执行定投功能
- [x] 13.9 实现定投执行记录展示
- [x] 13.10 实现定投收益分析
- [x] 13.11 实现定投成本曲线图
- [x] 13.12 创建定投计划页面 (views/fund/Plans.vue)
- [x] 13.13 测试定投计划的所有功能

## 14. Phase 5: 结余管理优化

- [x] 14.1 创建 useBalance composable (composables/useBalance.js)
- [x] 14.2 重构 Balance 组件，使用 balanceStore 和 useBalance
- [x] 14.3 应用 Design Tokens 到结余管理组件
- [x] 14.4 优化结余列表的响应式布局
- [x] 14.5 优化结余统计图表（使用 useChart）
- [x] 14.6 重构 CategoryManagerModal 组件
- [x] 14.7 重构 AddEditItemForm 组件
- [x] 14.8 重构 ItemDetail 组件
- [x] 14.9 创建结余管理页面 (views/balance/Index.vue)
- [x] 14.10 测试结余管理的所有功能

## 15. Phase 5: 月薪管理优化

- [x] 15.1 创建 useSalary composable (composables/useSalary.js)
- [x] 15.2 重构 Salary 组件，使用 salaryStore 和 useSalary
- [x] 15.3 应用 Design Tokens 到月薪管理组件
- [x] 15.4 优化月薪列表的响应式布局
- [x] 15.5 优化月薪统计图表（使用 useChart）
- [x] 15.6 重构 AddEditRecordForm 组件
- [x] 15.7 重构 RecordDetail 组件
- [x] 15.8 创建月薪管理页面 (views/salary/Index.vue)
- [x] 15.9 测试月薪管理的所有功能

## 16. Phase 5: 首页 Dashboard

- [x] 16.1 创建 DashboardCard 组件 (components/dashboard/DashboardCard.vue)
- [x] 16.2 创建资产汇总卡片（基金+结余+月薪）
- [x] 16.3 创建快速操作入口
- [x] 16.4 创建最近交易记录展示
- [x] 16.5 创建收益趋势图
- [x] 16.6 创建首页 (views/Home.vue)
- [x] 16.7 实现首页的响应式布局
- [x] 16.8 测试首页的所有功能

## 17. 全局优化和测试

- [x] 17.1 优化所有页面的加载性能
- [x] 17.2 实现路由懒加载
- [x] 17.3 优化图表渲染性能
- [x] 17.4 实现错误边界和全局错误处理
- [x] 17.5 优化移动端触摸交互
- [x] 17.6 测试所有路由的导航
- [x] 17.7 测试浏览器前进/后退功能
- [x] 17.8 测试移动端和桌面端的所有功能
- [x] 17.9 测试不同屏幕尺寸的响应式布局
- [x] 17.10 性能测试和优化

## 18. 文档和部署

- [x] 18.1 更新 README.md 文档
- [x] 18.2 更新 CLAUDE.md 项目指引
- [x] 18.3 编写组件使用文档
- [x] 18.4 编写 API 服务文档
- [x] 18.5 创建部署检查清单
- [x] 18.6 在开发环境进行完整测试
- [x] 18.7 部署到生产环境
- [x] 18.8 验证生产环境功能
- [x] 18.9 监控错误日志
- [x] 18.10 收集用户反馈并优化
