## ADDED Requirements

### Requirement: Vue Router Integration
系统 SHALL 使用 Vue Router 管理应用路由，支持 URL 导航和浏览器历史记录。

#### Scenario: 页面导航通过 URL
- **WHEN** 用户访问 `/fund/holdings`
- **THEN** 系统显示基金持仓页面

#### Scenario: 浏览器后退按钮工作
- **WHEN** 用户从持仓页面点击浏览器后退按钮
- **THEN** 系统返回到上一个访问的页面

#### Scenario: URL 分享
- **WHEN** 用户复制当前页面 URL 并在新标签页打开
- **THEN** 系统显示相同的页面内容

### Requirement: 路由守卫认证检查
系统 SHALL 在路由守卫中检查用户认证状态，未登录用户访问受保护页面时重定向到登录页。

#### Scenario: 未登录访问受保护页面
- **WHEN** 未登录用户访问 `/fund`
- **THEN** 系统重定向到 `/login`

#### Scenario: 登录后访问受保护页面
- **WHEN** 已登录用户访问 `/fund`
- **THEN** 系统显示基金投资页面

### Requirement: 路由懒加载
系统 SHALL 使用路由懒加载优化首屏加载性能。

#### Scenario: 首次访问应用
- **WHEN** 用户首次访问应用
- **THEN** 系统仅加载首页相关代码，不加载其他页面代码

#### Scenario: 导航到新页面
- **WHEN** 用户导航到基金投资页面
- **THEN** 系统动态加载基金投资模块代码

### Requirement: Pinia 状态管理
系统 SHALL 使用 Pinia 管理全局状态，包括 authStore、fundStore、balanceStore、salaryStore。

#### Scenario: 状态持久化
- **WHEN** 用户刷新页面
- **THEN** 系统从 localStorage 恢复用户认证状态

#### Scenario: 跨组件状态共享
- **WHEN** 用户在持仓页面添加新持仓
- **THEN** 资产总览页面自动更新总资产数据

### Requirement: Composables 业务逻辑封装
系统 SHALL 使用 Composables 封装可复用的业务逻辑。

#### Scenario: 使用 useAuth 处理认证
- **WHEN** 组件需要获取当前用户信息
- **THEN** 组件调用 `const { user, isAuthenticated } = useAuth()`

#### Scenario: 使用 useFund 处理基金数据
- **WHEN** 组件需要获取持仓列表
- **THEN** 组件调用 `const { holdings, fetchHoldings } = useFund()`

### Requirement: API 服务层封装
系统 SHALL 创建统一的 API 服务层封装 Supabase 操作。

#### Scenario: 使用 SupabaseService 查询数据
- **WHEN** 需要查询基金持仓数据
- **THEN** 调用 `SupabaseService.fundHoldings.list()`

#### Scenario: 错误处理统一
- **WHEN** API 调用失败
- **THEN** 服务层统一处理错误并返回标准格式的错误信息
