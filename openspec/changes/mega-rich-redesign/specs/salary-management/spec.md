## MODIFIED Requirements

### Requirement: 月薪记录管理
系统 SHALL 使用新的架构管理月薪记录，通过 Pinia store 和 Composables 处理数据。

#### Scenario: 使用 salaryStore 获取记录
- **WHEN** 组件需要获取月薪记录
- **THEN** 组件调用 `const salaryStore = useSalaryStore()` 并访问 `salaryStore.records`

#### Scenario: 通过 Composable 操作记录
- **WHEN** 组件需要添加新记录
- **THEN** 组件调用 `const { addRecord } = useSalary()` 并执行 `addRecord(data)`

### Requirement: 月薪统计展示
系统 SHALL 优化月薪统计的 UI 展示，使用新的设计系统。

#### Scenario: 卡片式展示
- **WHEN** 用户查看月薪列表
- **THEN** 系统使用统一的卡片样式展示记录，应用 Design Tokens

#### Scenario: 响应式布局
- **WHEN** 用户在移动端查看月薪统计
- **THEN** 系统使用单列布局并优化图表显示

### Requirement: 月薪图表配置
系统 SHALL 使用统一的图表配置展示月薪趋势。

#### Scenario: 使用 useChart 配置图表
- **WHEN** 组件需要显示月薪趋势图
- **THEN** 组件调用 `const { getBarChartConfig } = useChart()` 获取统一配置

### Requirement: 路由集成
系统 SHALL 将月薪管理集成到 Vue Router。

#### Scenario: 通过 URL 访问月薪页面
- **WHEN** 用户访问 `/salary`
- **THEN** 系统显示月薪管理页面

#### Scenario: 子路由支持
- **WHEN** 用户访问 `/salary/records`
- **THEN** 系统显示月薪记录列表页面
