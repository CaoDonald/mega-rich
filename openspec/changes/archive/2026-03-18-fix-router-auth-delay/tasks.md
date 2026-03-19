## 1. Auth Store 修改

- [x] 1.1 在 authStore 中添加 `initialized` ref，初始值为 false
- [x] 1.2 在 `initialize()` 方法开始时检查 `initialized` 状态，如果已初始化则直接返回
- [x] 1.3 在 `initialize()` 方法成功完成后设置 `initialized = true`
- [x] 1.4 在 `initialize()` 方法失败时也设置 `initialized = true`，避免无限重试
- [x] 1.5 在 `logout()` 方法中保持 `initialized = true`（登出不等于未初始化）

## 2. 路由守卫优化

- [x] 2.1 移除路由守卫中的 `authStore.loading` 检查和等待逻辑
- [x] 2.2 添加 `initialized` 检查，只在未初始化时调用 `await authStore.initialize()`
- [x] 2.3 简化路由守卫逻辑，直接使用 `authStore.isAuthenticated` 进行判断
- [x] 2.4 将调试日志包裹在 `import.meta.env.DEV` 条件中
- [x] 2.5 移除"等待认证状态初始化..."日志

## 3. 测试验证

- [x] 3.1 测试首次访问应用（冷启动）
- [x] 3.2 测试刷新页面后的导航
- [x] 3.3 测试已登录用户在页面间快速切换
- [x] 3.4 测试未登录用户访问受保护路由的重定向
- [x] 3.5 测试登录后导航到原目标路由
- [x] 3.6 测试登出后的导航行为
- [x] 3.7 验证路由切换响应时间 <10ms
- [x] 3.8 验证生产环境控制台无调试日志

## 4. 代码清理

- [x] 4.1 移除不再使用的 `$subscribe` 监听逻辑
- [x] 4.2 检查并移除其他冗余的调试日志
- [x] 4.3 更新相关注释，说明新的初始化逻辑
