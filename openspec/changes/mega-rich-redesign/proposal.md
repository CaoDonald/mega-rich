## Why

当前应用存在严重的架构和用户体验问题：使用基于 v-if 的页面切换导致无法使用浏览器历史和 URL 分享；简单的 provide/inject 状态管理难以维护；基金投资功能缺失核心的"养基宝"能力（实时净值、基金搜索、定投计划等）；UI 样式不统一且布局混乱；移动端导航在小屏幕下完全隐藏。需要进行全面的架构重构和功能增强，打造一个专业的个人资产管理应用。

## What Changes

- **BREAKING** 引入 Vue Router 替代基于状态的路由系统，支持 URL 路由和浏览器历史
- **BREAKING** 引入 Pinia 替代 provide/inject，实现结构化的状态管理
- 建立统一的设计系统（Design Tokens），实现简约风格的 UI
- 实现响应式布局，移动端使用底部 Tab Bar 导航
- 重构基金投资模块，新增基金市场、自选基金、定投计划等核心功能
- 优化结余管理和月薪管理模块的 UI 和交互
- 新增数据库表：fund_plans（定投计划）、fund_nav_history（净值历史缓存）
- 创建 Composables 层封装业务逻辑
- 创建统一的 API 服务层（SupabaseService、StorageService）
- 重构组件结构，分离基础组件和业务组件

## Capabilities

### New Capabilities
- `architecture-foundation`: 核心架构层（Vue Router、Pinia、Composables、API 服务层）
- `design-system`: UI 设计系统（Design Tokens、主题配置、通用样式）
- `fund-market`: 基金市场功能（搜索、排行、详情、对比）
- `fund-holdings`: 基金持仓管理（持仓列表、详情、添加/编辑）
- `fund-transactions`: 基金交易记录管理
- `fund-watchlist`: 自选基金功能（关注列表、涨跌幅、提醒）
- `fund-plans`: 定投计划功能（创建计划、执行记录、收益分析）
- `responsive-layout`: 响应式布局系统（移动端/桌面端适配）

### Modified Capabilities
- `balance-management`: 优化结余管理的 UI 和数据流，适配新架构
- `salary-management`: 优化月薪管理的 UI 和数据流，适配新架构
- `user-authentication`: 适配新的路由和状态管理系统

## Impact

**代码影响**
- `src/App.vue`: 完全重构，移除 v-if 路由逻辑，改用 router-view
- `src/main.js`: 添加 Vue Router 和 Pinia 初始化
- `src/components/Layout.vue`: 重构导航系统，添加移动端 Tab Bar
- `src/components/invest/*`: 完全重构基金投资模块
- `src/components/balance/*`: 优化现有组件，适配新架构
- `src/components/salary/*`: 优化现有组件，适配新架构
- 新增目录：`src/router/`, `src/stores/`, `src/composables/`, `src/services/`, `src/design/`

**数据库影响**
- 新增表：`fund_plans`, `fund_nav_history`
- 修改表：`fund_holdings` 添加 `last_sync_at`, `auto_sync` 字段
- 修改表：`fund_transactions` 添加 `plan_id` 字段

**依赖影响**
- 新增依赖：`vue-router`, `pinia`
- 现有依赖：`naive-ui`, `vue-echarts`, `@vicons/ionicons5` 保持不变

**用户影响**
- **BREAKING** URL 结构变化，旧的页面状态无法保留
- 移动端用户体验显著提升（底部导航）
- 基金投资功能大幅增强
- 整体 UI 更加统一和美观
