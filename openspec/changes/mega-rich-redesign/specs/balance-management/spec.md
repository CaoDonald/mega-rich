## MODIFIED Requirements

### Requirement: 结余分类管理
系统 SHALL 使用新的架构管理结余分类，通过 Pinia store 和 Composables 处理数据。

#### Scenario: 使用 balanceStore 获取分类
- **WHEN** 组件需要获取分类列表
- **THEN** 组件调用 `const balanceStore = useBalanceStore()` 并访问 `balanceStore.categories`

#### Scenario: 通过 Composable 操作分类
- **WHEN** 组件需要添加新分类
- **THEN** 组件调用 `const { addCategory } = useBalance()` 并执行 `addCategory(data)`

### Requirement: 结余条目管理
系统 SHALL 优化结余条目的 UI 展示，使用新的设计系统。

#### Scenario: 卡片式展示
- **WHEN** 用户查看结余列表
- **THEN** 系统使用统一的卡片样式展示条目，应用 Design Tokens

#### Scenario: 响应式布局
- **WHEN** 用户在移动端查看结余列表
- **THEN** 系统使用单列布局并优化触摸交互

### Requirement: 结余统计图表
系统 SHALL 使用统一的图表配置展示结余统计。

#### Scenario: 使用 useChart 配置图表
- **WHEN** 组件需要显示结余趋势图
- **THEN** 组件调用 `const { getLineChartConfig } = useChart()` 获取统一配置

### Requirement: 路由集成
系统 SHALL 将结余管理集成到 Vue Router。

#### Scenario: 通过 URL 访问结余页面
- **WHEN** 用户访问 `/balance`
- **THEN** 系统显示结余管理页面

#### Scenario: 子路由支持
- **WHEN** 用户访问 `/balance/categories`
- **THEN** 系统显示分类管理页面
