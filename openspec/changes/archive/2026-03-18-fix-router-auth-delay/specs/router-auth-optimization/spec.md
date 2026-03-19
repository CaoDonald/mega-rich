## ADDED Requirements

### Requirement: Router guard SHALL only wait for auth initialization once
路由守卫必须只在应用首次加载时等待认证状态初始化，后续路由切换不应重复等待。

#### Scenario: First navigation after app load
- **WHEN** 用户首次访问应用或刷新页面
- **THEN** 路由守卫等待认证状态初始化完成后再允许导航

#### Scenario: Subsequent navigation between routes
- **WHEN** 用户在已初始化的应用中切换路由
- **THEN** 路由守卫立即检查认证状态，无需等待

#### Scenario: Navigation to protected route when not authenticated
- **WHEN** 未登录用户尝试访问需要认证的路由
- **THEN** 系统立即重定向到登录页，无延迟

### Requirement: Auth store SHALL track initialization completion
认证 store 必须提供一个标记来指示初始化是否已完成，避免重复初始化。

#### Scenario: Auth store initialization
- **WHEN** 应用启动时调用 `authStore.initialize()`
- **THEN** 初始化完成后设置 `initialized` 标记为 true

#### Scenario: Check if initialization is needed
- **WHEN** 路由守卫检查认证状态
- **THEN** 如果 `initialized` 为 true，直接使用当前认证状态

### Requirement: Router guard SHALL not log debug messages in production
路由守卫不应在生产环境输出调试日志，避免控制台污染。

#### Scenario: Navigation in production
- **WHEN** 用户在生产环境中切换路由
- **THEN** 控制台不显示"路由守卫:"、"等待认证状态初始化..."等调试信息

#### Scenario: Navigation in development
- **WHEN** 开发者在开发环境中切换路由
- **THEN** 可以选择性地输出调试信息（通过环境变量控制）

### Requirement: Route transitions SHALL be instant after auth initialization
认证初始化完成后，路由切换必须是即时的，无明显延迟。

#### Scenario: User navigates between pages
- **WHEN** 已登录用户点击导航链接
- **THEN** 页面立即切换，无等待时间

#### Scenario: Performance measurement
- **WHEN** 测量路由切换性能
- **THEN** 路由守卫执行时间应小于 10ms
