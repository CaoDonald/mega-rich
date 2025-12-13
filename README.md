# Mega Rich

个人资产管理应用

## 技术栈
- 后端: Supabase
- 前端: Vue 3 + Naive UI

## 配置说明

1. **安装依赖**
```bash
npm install
```

2. **配置Supabase**
   - 复制或编辑 `.env` 文件
   - 将 `your-supabase-url-here` 替换为您的Supabase项目URL
   - 将 `your-supabase-anon-key-here` 替换为您的Supabase匿名密钥

3. **启动开发服务器**
```bash
npm run dev
```

4. **构建生产版本**
```bash
npm run build
```

## 功能特点
- 响应式首页布局
- 用户认证（登录/注册/忘记密码）
- 个人信息展示
- 财富追踪功能

## 页面结构
- `/` - 首页
- `/login` - 登录页面
- `/register` - 注册页面
- `/forgot-password` - 忘记密码页面

