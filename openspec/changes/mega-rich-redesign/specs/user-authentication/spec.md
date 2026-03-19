## MODIFIED Requirements

### Requirement: 路由守卫认证
系统 SHALL 在 Vue Router 的路由守卫中检查用户认证状态。

#### Scenario: 路由守卫检查
- **WHEN** 用户导航到受保护的路由
- **THEN** 路由守卫检查 authStore 的认证状态

#### Scenario: 未登录重定向
- **WHEN** 未登录用户访问受保护路由
- **THEN** 路由守卫重定向到 `/login` 并保存原始目标路由

#### Scenario: 登录后跳转
- **WHEN** 用户登录成功
- **THEN** 系统跳转到原始目标路由或默认首页

### Requirement: 认证状态管理
系统 SHALL 使用 Pinia authStore 管理用户认证状态。

#### Scenario: 初始化认证状态
- **WHEN** 应用启动
- **THEN** authStore 从 Supabase 获取当前会话并初始化用户状态

#### Scenario: 登录状态持久化
- **WHEN** 用户刷新页面
- **THEN** authStore 从 localStorage 恢复认证状态

### Requirement: 用户资料管理
系统 SHALL 通过 authStore 管理用户资料信息。

#### Scenario: 获取用户资料
- **WHEN** 组件需要显示用户信息
- **THEN** 组件访问 `authStore.user` 获取用户资料

#### Scenario: 更新用户资料
- **WHEN** 用户修改个人信息
- **THEN** 组件调用 `authStore.updateProfile(data)` 更新资料

### Requirement: 登出处理
系统 SHALL 在用户登出时清理所有状态。

#### Scenario: 执行登出
- **WHEN** 用户点击登出按钮
- **THEN** authStore 清除用户状态、调用 Supabase 登出、清理其他 store 的数据、重定向到首页
