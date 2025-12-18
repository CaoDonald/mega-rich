# Mega Rich

个人资产管理应用，帮助用户轻松跟踪和管理个人财务状况，包括结余管理和月薪管理两大核心功能模块。

## 技术栈
- **后端**: Supabase (PostgreSQL数据库 + 身份认证 + 存储)
- **前端**: Vue 3 (Composition API) + Naive UI
- **构建工具**: Vite
- **状态管理**: Vue 3 Provide/Inject API

## 功能特点
- ✅ **用户认证系统**
  - 邮箱/密码登录注册
  - 忘记密码功能
  - 用户信息管理
  - 安全的身份验证机制

- ✅ **结余管理模块**
  - 三级分类管理（一级分类 → 二级分类 → 资金条目）
  - 资金条目的添加、编辑、删除功能
  - 自动计算同比（YoY）/环比（MoM）增长率
  - 按月份聚合数据，取当月最新记录
  - 数据可视化和统计分析

- ✅ **月薪管理模块**
  - 合并基本月薪和年终奖记录
  - 支持数据的增删改查操作
  - 自动计算同比/环比增长率
  - 按月份聚合数据

- ✅ **用户体验优化**
  - 响应式设计，适配各种设备
  - 表单验证和错误处理
  - 加载状态提示
  - 平滑的动画过渡效果
  - 新用户注册时自动生成默认分类体系

## 配置说明

### 1. 安装依赖
```bash
npm install pnpm -g  # 全局安装pnpm
pnpm install         # 安装项目依赖
```

### 2. 配置Supabase
创建 `.env` 文件并添加以下内容：
```env
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. 启动开发服务器
```bash
pnpm run dev
```

### 4. 构建生产版本
```bash
pnpm run build
```

### 5. 预览生产版本
```bash
pnpm run preview
```

## 页面结构
- `home` - 首页
- `login` - 登录页面
- `register` - 注册页面
- `forgot-password` - 忘记密码页面
- `balance` - 结余管理页面
- `salary` - 月薪管理页面

## 项目结构
```
src/
├── assets/              # 静态资源文件
├── components/          # Vue组件
│   ├── AddEditItemForm.vue    # 结余条目编辑表单
│   ├── AddEditRecordForm.vue  # 月薪记录编辑表单
│   ├── Balance.vue            # 结余管理组件
│   ├── ForgotPassword.vue     # 忘记密码组件
│   ├── Home.vue               # 首页组件
│   ├── ItemDetail.vue         # 结余条目详情
│   ├── Layout.vue             # 布局组件
│   ├── Login.vue              # 登录组件
│   ├── RecordDetail.vue       # 月薪记录详情
│   ├── Register.vue           # 注册组件
│   └── Salary.vue             # 月薪管理组件
├── App.vue              # 根组件
├── main.js              # 应用入口
├── style.css            # 全局样式
└── supabase.js          # Supabase配置
```

## 开发说明

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

