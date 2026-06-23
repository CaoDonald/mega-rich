## ADDED Requirements

### Requirement: 自选列表展示

系统 SHALL 展示当前用户的自选基金列表。

#### Scenario: 自选列表
- **WHEN** 用户进入 `watchlist` 页面（通过路由或 Tab）
- **THEN** 系统 SHALL 调用 `supabase.from('fund_watchlist').select('*')` 加载自选列表，以 `CardListView` 展示：基金代码、基金名称、基金类型、最新净值、当日涨跌幅、近1周涨幅、近1月涨幅、近3月涨幅、预警状态、操作

#### Scenario: 空自选提示
- **WHEN** 当前用户没有任何自选基金
- **THEN** 系统 SHALL 展示 `NEmpty` 空状态提示 + "添加自选" 按钮

#### Scenario: 实时数据联动
- **WHEN** 自选列表加载
- **THEN** 系统 SHALL 对每个自选基金调用 `fundVarietieValuationDetail(code)` 获取实时估值涨跌，展示在列表中（"最新净值"和"当日涨跌%"列）

### Requirement: 添加自选

系统 SHALL 支持用户将基金添加到自选列表。

#### Scenario: 搜索添加自选
- **WHEN** 用户点击"添加自选"按钮，输入关键字搜索基金
- **THEN** 系统 SHALL 调用 `fundSearch(1, key)` 展示搜索结果，用户点击选中后 INSERT `fund_watchlist`（`user_id`、`fund_code`、`fund_name`、`fund_type`）

#### Scenario: 从详情页加自选
- **WHEN** 用户在基金详情页点击底部"加自选"按钮
- **THEN** 系统 SHALL INSERT `fund_watchlist`，按钮变为"已自选"（禁用状态），并提示"已加入自选"

#### Scenario: 重复自选拦截
- **WHEN** 用户添加已在自选中的基金
- **THEN** 系统 SHALL 通过 `UNIQUE(user_id, fund_code)` 约束阻止重复插入，并提示"该基金已在自选中"

### Requirement: 从自选移除

系统 SHALL 支持用户从自选列表中移除基金。

#### Scenario: 删除确认
- **WHEN** 用户点击自选行的删除按钮
- **THEN** 系统 SHALL 弹出确认对话框，确认后 DELETE `fund_watchlist` 记录

### Requirement: 预警阈值设置

系统 SHALL 支持用户为自选基金设置涨跌预警阈值。

#### Scenario: 开启预警
- **WHEN** 用户点击自选行的预警开关
- **THEN** 系统 SHALL 显示预警阈值输入区，用户可设置上涨预警百分比（`alert_up`）和下跌预警百分比（`alert_down`），提交后 UPDATE `fund_watchlist.alert_enabled=true`、`alert_up`、`alert_down`

#### Scenario: 关闭预警
- **WHEN** 用户再次点击预警开关
- **THEN** 系统 SHALL 关闭预警，UPDATE `fund_watchlist.alert_enabled=false`

### Requirement: 预警触发检查

系统 SHALL 在访问自选页面时检查已开启的预警条件。

#### Scenario: 上涨预警触发
- **WHEN** 用户进入自选页面，某自选基金的实时涨跌幅 `GSZZL >= alert_up`
- **THEN** 系统 SHALL 在页面顶部展示 `n-alert type="error"`："{基金名称} 触发上涨预警（{实时涨跌幅}% ≥ {预警阈值}%）"，同时通过 `message.warning` 推送通知

#### Scenario: 下跌预警触发
- **WHEN** 用户进入自选页面，某自选基金的实时涨跌幅 `GSZZL <= alert_down`
- **THEN** 系统 SHALL 在页面顶部展示 `n-alert type="warning"`："{基金名称} 触发下跌预警（{实时涨跌幅}% ≤ {预警阈值}%）"

### Requirement: 自选涨幅对比

系统 SHALL 以图表形式对比展示各自选基金的阶段涨幅。

#### Scenario: 涨幅对比柱状图
- **WHEN** 用户进入自选页面
- **THEN** 系统 SHALL 在列表上方渲染 `v-chart` 柱状图，X 轴为基金名称，Y 轴为涨幅率%，系列分近1周/近1月/近3月，数据来源 `fundMNPeriodIncrease(code, '')`，配置复用 `commonChartConfig`
