# Mega Rich

个人资产管理应用，帮助用户轻松跟踪和管理个人财务状况，包括结余管理和月薪管理两大核心功能模块。

## 技术栈
- **后端**: Supabase (PostgreSQL数据库 + 身份认证 + 存储)
- **前端**: Vue 3 (Composition API) + Naive UI
- **构建工具**: Vite
- **图表库**: ECharts + vue-echarts
- **图标库**: @vicons/ionicons5
- **工具库**: xlsx (Excel导出), class-variance-authority, clsx, tailwind-merge
- **样式**: CSS + Tailwind CSS 工具类
- **状态管理**: Vue 3 Provide/Inject API

## 功能特点

### 🛡️ 用户认证系统
- 邮箱/密码登录注册
- 忘记密码与密码重置功能
- 用户信息管理与设置
- 基于Supabase Auth的安全身份验证机制

### 💰 结余管理模块
- **三级分类管理**：一级分类 → 二级分类 → 资金条目
- **完整的CRUD操作**：资金条目的添加、编辑、删除和查看
- **智能数据聚合**：按月份聚合数据，取当月最新记录
- **增长率计算**：自动计算同比（YoY）/环比（MoM）增长率
- **丰富的数据可视化**：
  - 环形饼图展示资金分布
  - 折线图展示资金趋势
  - 支持数据筛选和对比分析

### 🏷️ 月薪管理模块
- **多类型收入管理**：基本月薪和年终奖记录
- **完整的CRUD操作**：支持数据的增删改查
- **智能数据聚合**：按月份聚合数据
- **增长率计算**：自动计算同比/环比增长率
- **多样化图表展示**：
  - 柱状图展示月度收入
  - 折线图展示收入趋势
  - 年度对比分析

### 📊 数据可视化
- 基于ECharts的专业图表库
- 响应式设计，适配不同屏幕尺寸
- 支持图表交互和数据钻取
- 统一的图表样式配置

### 📱 用户体验优化
- 响应式设计，适配各种设备
- 完善的表单验证和错误处理
- 友好的加载状态提示
- 平滑的动画过渡效果
- 新用户注册时自动生成默认分类体系
- 清晰的导航和布局结构

### 📋 其他功能
- Excel导出功能
- 分类管理功能
- 详细的数据详情页
- 模态框交互设计

## 配置说明

### 1. 安装依赖
```bash
npm install         # 安装项目依赖
```

### 2. 配置Supabase
创建 `.env` 文件并添加以下内容：
```env
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 构建生产版本
```bash
npm run build
```

### 5. 预览生产版本
```bash
npm run preview
```

## 页面结构
- `home` - 首页
- `login` - 登录页面
- `register` - 注册页面
- `forgot-password` - 忘记密码页面
- `password-reset` - 密码重置页面
- `balance` - 结余管理页面
- `salary` - 月薪管理页面
- `user-settings` - 用户设置页面

## 项目结构
```
src/
├── components/          # Vue组件
│   ├── auth/            # 认证相关组件
│   │   ├── ForgotPassword.vue     # 忘记密码组件
│   │   ├── Login.vue              # 登录组件
│   │   ├── PasswordReset.vue      # 密码重置组件
│   │   ├── Register.vue           # 注册组件
│   │   └── UserSettings.vue       # 用户设置组件
│   ├── balance/         # 结余管理组件
│   │   ├── sub/         # 结余子组件
│   │   │   ├── AddEditItemForm.vue    # 结余条目编辑表单
│   │   │   ├── CategoryManagerModal.vue # 分类管理弹窗
│   │   │   └── ItemDetail.vue         # 结余条目详情
│   │   └── Balance.vue            # 结余管理主组件
│   ├── salary/          # 月薪管理组件
│   │   ├── sub/         # 月薪子组件
│   │   │   ├── AddEditRecordForm.vue  # 月薪记录编辑表单
│   │   │   └── RecordDetail.vue       # 月薪记录详情
│   │   └── Salary.vue             # 月薪管理主组件
│   ├── Home.vue               # 首页组件
│   └── Layout.vue             # 布局组件
├── styles/              # 样式文件
│   └── component.css         # 组件样式
├── utils/               # 工具函数
│   ├── ChartConfig.js        # 图表配置
│   └── TableConfig.js        # 表格配置
├── App.vue              # 根组件
├── main.js              # 应用入口
├── style.css            # 全局样式
└── supabase.js          # Supabase配置
```

## 开发说明

### 组件使用规范
- UI组件统一使用Naive UI
- 常用组件已在main.js中全局注册
- 图标库使用@vicons/ionicons5

### 项目架构
- 采用Vue 3 Composition API
- 使用Provide/Inject进行全局状态管理
- 组件化设计，按功能模块组织
- 样式文件分离管理

### 代码规范
- 组件按功能模块划分目录
- 使用驼峰命名法
- 样式采用CSS变量管理主题色
- 图表配置统一抽离到utils/ChartConfig.js

### 数据结构

#### 结余模块
- `balance_categories` - 一级分类表
- `balance_subcategories` - 二级分类表
- `balance_items` - 资金条目表

#### 月薪模块
- `salary_records` - 月薪记录表（包含月薪和年终奖）

### 用户认证
- 使用Supabase Auth进行用户认证
- 新用户注册时自动创建用户资料和默认分类体系

## 贡献
欢迎提交Issue和Pull Request！

## 许可证
MIT License

