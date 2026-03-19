# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Mega Rich 是一个个人资产管理应用，使用 Vue 3 + Vue Router + Pinia + Supabase 构建。主要功能包括基金投资管理、结余管理和月薪管理。

## 技术栈

- **前端**: Vue 3 (Composition API) + Vue Router 4 + Pinia
- **UI**: Naive UI + ECharts
- **后端**: Supabase (PostgreSQL + Auth + Storage)
- **构建**: Vite
- **样式**: CSS Variables (Design Tokens)

## 常用命令

### 开发
```bash
pnpm install                    # 安装依赖
pnpm run dev                    # 启动开发服务器
pnpm run build                  # 构建生产版本
pnpm run preview                # 预览生产构建
```

### 测试
```bash
pnpm run test                   # 运行所有测试
pnpm run test:ui                # 运行测试并打开UI界面
```

### Supabase
```bash
supabase start                  # 启动本地Supabase实例
supabase stop                   # 停止本地Supabase实例
supabase db reset               # 重置数据库并应用迁移
supabase migration new <name>   # 创建新的数据库迁移
```

## 架构说明

### 路由系统
应用使用 **Vue Router 4** 进行路由管理：
- 路由配置在 `src/router/index.js`
- 支持 URL 路由和浏览器历史
- 路由守卫进行认证检查
- 路由懒加载优化性能

### 状态管理
使用 **Pinia** 进行状态管理：
- `stores/auth.js`: 用户认证状态
- `stores/fund.js`: 基金数据状态
- `stores/balance.js`: 结余数据状态
- `stores/salary.js`: 月薪数据状态

### Composables 层
业务逻辑封装在 composables 中：
- `composables/useAuth.js`: 认证相关逻辑
- `composables/useFund.js`: 基金业务逻辑
- `composables/useBalance.js`: 结余业务逻辑
- `composables/useSalary.js`: 月薪业务逻辑
- `composables/useChart.js`: 图表配置逻辑

### 服务层
API 调用封装在 services 中：
- `services/SupabaseService.js`: Supabase 数据库操作
- `services/StorageService.js`: Supabase 存储操作
- `utils/FundApi.js`: 基金 API 调用

### 设计系统
统一的设计系统：
- `design/tokens.js`: Design Tokens 配置
- `design/global.css`: 全局 CSS 变量和样式
- `design/theme.js`: Naive UI 主题配置

### 响应式布局
- **桌面端** (>768px): 顶部导航栏
- **移动端** (≤768px): 底部 Tab Bar
- 布局组件: `components/layout/MainLayout.vue`

## 数据库架构

### 基金模块
- `fund_holdings`: 持仓（fund_code, fund_name, shares, avg_cost, current_nav, last_sync_at, auto_sync）
- `fund_transactions`: 交易记录（fund_code, transaction_type, shares, price, transaction_date, plan_id）
- `fund_watchlist`: 关注列表（fund_code, fund_name, alert_settings）
- `fund_plans`: 定投计划（fund_code, plan_type, amount, frequency, status, total_invested）
- `fund_nav_history`: 净值历史缓存（fund_code, nav_date, nav, acc_nav, daily_growth）

### 结余模块
- `balance_categories`: 一级分类
- `balance_subcategories`: 二级分类
- `balance_items`: 资金条目

### 月薪模块
- `salary_records`: 月薪记录（salary_month, base_salary, bonus）

### 用户模块
- `profiles`: 用户资料

所有表都启用了 Row Level Security (RLS)，用户只能访问自己的数据。

## UI 组件库

### Naive UI
- 主要 UI 组件库
- 常用组件已在 `src/main.js` 中全局注册
- 主题配置在 `design/theme.js`

### 基础组件
- `components/base/Card.vue`: 卡片组件
- `components/base/Chart.vue`: 图表组件（ECharts 封装）
- `components/base/Empty.vue`: 空状态组件
- `components/base/Loading.vue`: 加载状态组件

### 图表配置
- 所有图表配置使用 `useChart` composable
- 提供了 `getLineChartConfig`, `getBarChartConfig`, `getPieChartConfig` 等方法
- 使用 Design Tokens 保持样式一致

## 开发规范

### 环境变量
需要在 `.env` 文件中配置：
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 页面导航
使用 Vue Router 进行导航：
```javascript
import { useRouter } from 'vue-router'
const router = useRouter()
router.push({ name: 'fund-holdings' })
```

### 状态管理
使用 Pinia stores：
```javascript
import { useFundStore } from '@/stores/fund'
const fundStore = useFundStore()
```

### 业务逻辑
使用 composables：
```javascript
import { useFund } from '@/composables/useFund'
const { loadHoldings, createHolding } = useFund()
```

### 样式规范
使用 CSS 变量：
```css
.my-component {
  color: var(--color-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
}
```

### 响应式设计
使用媒体查询：
```css
@media (max-width: 768px) {
  /* 移动端样式 */
}
```

## 路由结构

```
/                      # 首页 Dashboard
/login                 # 登录
/register              # 注册
/fund                  # 基金投资总览
/fund/holdings         # 持仓管理
/fund/transactions     # 交易记录
/fund/market           # 基金市场
/fund/watchlist        # 自选基金
/fund/plans            # 定投计划
/fund/detail/:code     # 基金详情
/fund/compare          # 基金对比
/balance               # 结余管理
/salary                # 月薪管理
/settings              # 用户设置
```

## 注意事项

### 认证
- 所有需要认证的路由都有 `meta: { requiresAuth: true }`
- 路由守卫会自动检查认证状态
- 未登录用户会被重定向到登录页

### 数据同步
- 基金持仓支持自动同步净值（通过 `auto_sync` 字段）
- 净值数据缓存在 `fund_nav_history` 表，有效期 24 小时

### 基金 API
- 基金数据来自 `utils/FundApi.js`
- 支持搜索、排行、详情、净值、经理、评级等功能
- API 调用有频率限制，使用缓存优化

### 定投计划
- 定投计划支持定额和定比两种类型
- 支持每日、每周、每月三种频率
- 手动执行定投会创建交易记录并更新统计

## 常见任务

### 添加新页面
1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.js` 添加路由配置
3. 在布局组件中添加导航链接

### 添加新的数据表
1. 在 `supabase/migrations/` 创建迁移文件
2. 在 `services/SupabaseService.js` 添加 CRUD 操作
3. 在对应的 store 中添加状态管理
4. 在对应的 composable 中添加业务逻辑

### 添加新的图表
1. 使用 `useChart` composable 获取配置方法
2. 使用 `components/base/Chart.vue` 组件
3. 传入配置好的 option

### 样式调整
1. 优先使用 CSS 变量（Design Tokens）
2. 如需修改全局样式，编辑 `design/global.css`
3. 如需修改 Naive UI 主题，编辑 `design/theme.js`
