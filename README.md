# Mega Rich

个人资产管理应用，帮助用户轻松跟踪和管理个人财务状况，包括基金投资、结余管理和月薪管理三大核心功能模块。

## ✨ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **UI 组件库**: Naive UI
- **图表库**: ECharts + vue-echarts
- **图标库**: @vicons/ionicons5
- **后端服务**: Supabase (PostgreSQL + Auth + Storage)
- **构建工具**: Vite
- **样式系统**: CSS Variables (Design Tokens)

## 🚀 功能特点

### 💼 基金投资管理
- **持仓管理**: 添加、编辑、删除基金持仓，实时同步净值
- **交易记录**: 记录买入卖出交易，自动统计分析
- **基金市场**: 搜索基金、查看排行榜、基金详情
- **自选基金**: 关注基金列表，实时净值更新，涨跌提醒
- **基金对比**: 最多对比4只基金的关键指标和净值走势
- **定投计划**: 创建定投计划，手动执行，收益分析
- **投资总览**: 资产汇总、收益曲线、持仓概览

### 💰 结余管理
- **三级分类管理**: 一级分类 → 二级分类 → 资金条目
- **完整的 CRUD 操作**: 资金条目的添加、编辑、删除和查看
- **智能数据聚合**: 按月份聚合数据，取当月最新记录
- **增长率计算**: 自动计算同比（YoY）/环比（MoM）增长率
- **数据可视化**: 环形饼图、折线图展示资金分布和趋势

### 💵 月薪管理
- **多类型收入管理**: 基本月薪和年终奖记录
- **完整的 CRUD 操作**: 支持数据的增删改查
- **智能数据聚合**: 按月份聚合数据
- **增长率计算**: 自动计算同比/环比增长率
- **多样化图表展示**: 柱状图、折线图展示月度收入和趋势

### 🏠 首页 Dashboard
- **资产汇总**: 基金资产、结余总额、年度收入、总资产
- **快速操作**: 添加持仓、记录交易、添加结余、记录月薪
- **收益趋势**: 近30天累计收益曲线图
- **最近交易**: 显示最近5条交易记录

### 🎨 设计系统
- **统一的 Design Tokens**: 颜色、间距、圆角、阴影、字体等
- **响应式布局**: 桌面端顶部导航 + 移动端底部 Tab Bar
- **简约风格**: 现代化的 UI 设计
- **暗色模式**: 预留主题切换能力（待实现）

### 🔐 用户认证
- 邮箱/密码登录注册
- 忘记密码与密码重置
- 用户信息管理与设置
- 基于 Supabase Auth 的安全身份验证

## 📦 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置 Supabase
创建 `.env` 文件并添加以下内容：
```env
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. 数据库迁移
```bash
supabase db reset
```

### 4. 启动开发服务器
```bash
pnpm run dev
```

### 5. 构建生产版本
```bash
pnpm run build
```

### 6. 预览生产版本
```bash
pnpm run preview
```

## 📁 项目结构

```
src/
├── components/          # Vue 组件
│   ├── auth/            # 认证相关组件
│   ├── balance/         # 结余管理组件
│   ├── salary/          # 月薪管理组件
│   ├── fund/            # 基金投资组件
│   ├── dashboard/       # 仪表盘组件
│   ├── layout/          # 布局组件
│   └── base/            # 基础组件
├── views/               # 页面组件
│   ├── fund/            # 基金相关页面
│   ├── balance/         # 结余管理页面
│   ├── salary/          # 月薪管理页面
│   └── Home.vue         # 首页
├── stores/              # Pinia 状态管理
│   ├── auth.js          # 认证状态
│   ├── fund.js          # 基金状态
│   ├── balance.js       # 结余状态
│   └── salary.js        # 月薪状态
├── composables/         # 组合式函数
│   ├── useAuth.js       # 认证逻辑
│   ├── useFund.js       # 基金业务逻辑
│   ├── useBalance.js    # 结余业务逻辑
│   ├── useSalary.js     # 月薪业务逻辑
│   └── useChart.js      # 图表配置
├── services/            # API 服务层
│   ├── SupabaseService.js  # Supabase 数据库操作
│   └── StorageService.js   # Supabase 存储操作
├── router/              # Vue Router 配置
│   └── index.js
├── design/              # 设计系统
│   ├── tokens.js        # Design Tokens
│   ├── global.css       # 全局样式
│   └── theme.js         # Naive UI 主题配置
├── utils/               # 工具函数
│   └── FundApi.js       # 基金 API
├── App.vue              # 根组件
├── main.js              # 应用入口
└── supabase.js          # Supabase 配置
```

## 🗄️ 数据库表结构

### 用户模块
- `profiles` - 用户资料

### 基金模块
- `fund_holdings` - 持仓
- `fund_transactions` - 交易记录
- `fund_watchlist` - 关注列表
- `fund_plans` - 定投计划
- `fund_nav_history` - 净值历史缓存

### 结余模块
- `balance_categories` - 一级分类
- `balance_subcategories` - 二级分类
- `balance_items` - 资金条目

### 月薪模块
- `salary_records` - 月薪记录

## 🛣️ 路由结构

```
/                      # 首页
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

## 🎯 开发规范

### 组件使用规范
- UI 组件统一使用 Naive UI
- 常用组件已在 main.js 中全局注册
- 图标库使用 @vicons/ionicons5
- 基础组件放在 components/base/

### 状态管理
- 使用 Pinia 进行状态管理
- 每个模块独立 store
- 通过 composables 封装业务逻辑

### 样式规范
- 使用 CSS 变量（Design Tokens）
- 变量定义在 design/tokens.js 和 design/global.css
- 响应式断点: 移动端 ≤768px, 平板 769-1024px, 桌面端 >1024px

### 代码规范
- 使用 Vue 3 Composition API
- 组件按功能模块划分目录
- 使用驼峰命名法
- 图表配置使用 useChart composable

## 📝 待实现功能

- [ ] 暗色模式
- [ ] 数据导出（Excel/PDF）
- [ ] 数据备份和恢复
- [ ] 多账户支持
- [ ] 预算管理
- [ ] 账单提醒
- [ ] 数据分析报告

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
