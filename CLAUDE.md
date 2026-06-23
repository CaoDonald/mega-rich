# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

Mega Rich —— 个人资产管理应用。核心功能：结余管理（三级分类的资金跟踪）和月薪管理（月薪+年终奖记录），基于 Supabase 后端。

## 技术栈

- **前端**: Vue 3 (Composition API + `<script setup>`)
- **UI 组件库**: Naive UI（部分组件在 `src/main.js` 中全局注册）
- **图表**: ECharts + vue-echarts（配置集中管理于 `src/utils/ChartConfig.js`）
- **构建**: Vite 7
- **后端**: Supabase (Auth + PostgreSQL + Edge Functions + Storage)
- **外部数据**: 基金/股票数据通过 Supabase Edge Function (`fund-api`) 从天天基金等渠道获取
- **包管理**: pnpm
- **测试**: Vitest

## 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm preview      # 预览构建产物
pnpm test         # 运行所有测试（verbose 模式）
pnpm test:ui      # 以 UI 模式运行测试
```

## 项目结构

```
src/
├── components/
│   ├── auth/          # 登录、注册、忘记密码、重置密码、用户设置
│   ├── balance/       # 结余管理主组件 + sub/（表单、分类管理、详情）
│   ├── salary/        # 月薪管理主组件 + sub/（表单、详情）
│   ├── Home.vue       # 首页
│   ├── Layout.vue     # 布局（header + content + footer / 移动端 TabBar）
│   └── MobileTabBar.vue
├── composables/
│   └── useMobileModal.js   # 移动端全屏弹窗适配
├── utils/
│   ├── ChartConfig.js      # ECharts 统一配置
│   ├── FundApi.js          # 通过 Supabase Edge Function 调用基金/股票接口
│   ├── TableConfig.js      # 表格配置
│   └── device.js           # 响应式设备检测（768px/480px 断点）
├── router/index.js   # Hash 路由，懒加载页面组件
├── supabase.js       # Supabase 客户端初始化
├── App.vue           # 根组件，全局用户状态 provide/inject
├── main.js           # 入口（全局注册 Naive UI 组件 + 路由）
└── styles/
    ├── component.css       # 组件样式
    └── style.css           # 全局样式
```

## 架构要点

### 状态管理
- 无 Vuex/Pinia，使用 Vue 3 原生 Provide/Inject 模式
- `App.vue` 通过 `provide('user')` / `provide('session')` / `provide('loadUser')` 向全应用提供用户认证状态
- 子组件通过 `inject('user')` 等方式消费

### 路由
- `createWebHashHistory()` 哈希路由
- 页面组件均为懒加载（动态 `import()`）
- 部分页面需要登录验证（`balance`、`salary`、`user-settings`），在 `App.vue` 中守卫

### 数据层
- **结余模块** 使用 `balance_categories`（一级分类）、`balance_subcategories`（二级分类）、`balance_items`（资金条目）三张表
- **月薪模块** 使用 `salary_records` 单表（区分月薪和年终奖）
- **用户资料** 使用 `profiles` 表
- **外部数据** 通过 Supabase Edge Function `fund-api` 代理调用天天基金/新浪财经等接口，`src/utils/FundApi.js` 封装调用逻辑

### 认证
- Supabase Auth 邮箱/密码登录
- `supabase.auth.onAuthStateChange` 监听会话变化（在 `App.vue` 中）

### 响应式适配
- `src/utils/device.js` 导出的 `isMobile` ref（768px 断点）被全应用共享
- 移动端：底部 TabBar 导航（`MobileTabBar.vue`），全屏弹窗（`useMobileModal` composable）

### 图标
- Naive UI 图标 + `@vicons/ionicons5`（在 `main.js` 中全局注册了常用图标）

## 测试

- 测试框架：Vitest 4
- 测试文件位置：`tests/` 目录
- 现有测试：`tests/fundApi.test.js` —— 对 `FundApi` 中所有接口（基金搜索、列表、详情、涨幅、历史净值、主题、排行、公司、基金经理、股票）进行集成测试
- 测试依赖外部 API，超时设置为 60 秒

## 配置

- `.env` 文件配置 Supabase 项目 URL 和 Anon Key
- `vite.config.js` 配置了手动代码分割（`vue-vendor`、`naive-ui`、`supabase`）
- `pnpm-workspace.yaml` 存在，声明了工作区配置
