## ADDED Requirements

### Requirement: 交易记录列表

系统 SHALL 以表格/卡片形式展示当前用户的所有基金交易记录。

#### Scenario: 交易流水列表
- **WHEN** 用户进入 `/fund/transactions` 页面
- **THEN** 系统 SHALL 渲染 `CardListView`，调用 `supabase.from('fund_transactions').select('*')` 加载数据，每行展示：交易日期、基金代码、基金名称、基金类型、交易类型、份额、净值、金额、手续费、关联持仓、关联定投计划、备注

#### Scenario: 交易类型图标区分
- **WHEN** 交易列表渲染
- **THEN** 系统 SHALL 在列表中使用图标区分交易类型：买入（`ArrowUpOutline` 绿色）、卖出（`ArrowDownOutline` 红色）、分红（`CashOutline` 黄色）

#### Scenario: 移动端卡片视图
- **WHEN** 用户在移动端访问交易记录
- **THEN** 系统 SHALL 自动切换为卡片列表，卡片展示：基金名称、交易类型图标、金额、交易日期

### Requirement: 交易记录筛选

系统 SHALL 支持用户对交易记录进行多维度筛选。

#### Scenario: 按日期范围筛选
- **WHEN** 用户选择开始日期和结束日期
- **THEN** 系统 SHALL 仅展示 `transaction_date` 在该范围内的交易记录

#### Scenario: 按交易类型筛选
- **WHEN** 用户在下拉框中选择交易类型（全部/买入/卖出/分红）
- **THEN** 系统 SHALL 仅展示 `transaction_type` 匹配该类型的记录

#### Scenario: 按基金代码筛选
- **WHEN** 用户输入或选择基金代码
- **THEN** 系统 SHALL 仅展示 `fund_code` 匹配该基金的交易记录

#### Scenario: 按关联持仓筛选
- **WHEN** 用户选择某个持仓
- **THEN** 系统 SHALL 仅展示 `holding_id` 匹配该持仓的交易记录

### Requirement: 交易统计

系统 SHALL 在交易记录页面顶部展示关键统计指标。

#### Scenario: 统计卡片
- **WHEN** 用户进入交易记录页面
- **THEN** 系统 SHALL 在顶部展示：累计买入金额、累计卖出金额、累计手续费、净投入金额

#### Scenario: 月度交易图表
- **WHEN** 用户进入交易记录页面
- **THEN** 系统 SHALL 在列表上方渲染 `v-chart` 柱状图，展示最近 12 个月的月度交易金额汇总（买入为正柱，卖出为负柱），配置复用 `commonChartConfig`

### Requirement: 新增买入交易

系统 SHALL 支持用户录入买入记录并自动增加持仓份额。

#### Scenario: 新增买入表单
- **WHEN** 用户点击"新增交易"按钮，选择"买入"类型
- **THEN** 系统 SHALL 弹出 `AddEditTransactionForm`，包含字段：基金（搜索选择/手动输入代码）、关联持仓（下拉从已有持仓选，或选"新建持仓"）、份额、净值（选填，可按日期查询自动填写）、金额（自动算 `份额 × 净值`，可手动覆盖）、手续费、交易日期（默认今天）、备注、关联定投计划（选填）

#### Scenario: 买入后持仓更新
- **WHEN** 用户提交买入交易
- **THEN** 系统 SHALL INSERT `fund_transactions`，然后 UPDATE `fund_holdings`：
  - `shares += 交易份额`
  - `total_invest += 交易金额 + 手续费`
  - `avg_cost = (total_invest - total_redeem) / shares`
  - `buy_date = MIN(buy_date, 交易日期)`
  - 若关联了新持仓则创建 `fund_holdings` 记录

#### Scenario: 买入回写失败
- **WHEN** INSERT `fund_transactions` 成功但 UPDATE `fund_holdings` 失败
- **THEN** 系统 SHALL 自动回滚，DELETE 刚插入的交易记录，并通过 `message.error` 提示创建失败

### Requirement: 新增卖出交易

系统 SHALL 支持用户录入卖出记录并自动减少持仓份额。

#### Scenario: 新增卖出表单
- **WHEN** 用户点击"新增交易"按钮，选择"卖出"类型
- **THEN** 系统 SHALL 弹出表单，必须关联已有持仓（下拉选择），且卖出份额不得大于该持仓的当前份额

#### Scenario: 卖出后持仓更新
- **WHEN** 用户提交卖出交易
- **THEN** 系统 SHALL INSERT `fund_transactions`，然后 UPDATE `fund_holdings`：
  - `shares -= 交易份额`
  - `total_redeem += 交易金额 - 手续费`
  - 若 `shares = 0` 保留记录（不清除），前端展示"已清仓"标识

#### Scenario: 卖出份额超限校验
- **WHEN** 用户输入的卖出份额大于持仓当前份额
- **THEN** 系统 SHALL 阻止提交并提示"卖出份额超过持仓份额"

### Requirement: 新增分红交易

系统 SHALL 支持用户录入分红记录。

#### Scenario: 新增分红
- **WHEN** 用户点击"新增交易"按钮，选择"分红"类型
- **THEN** 系统 SHALL 弹出表单，包含：关联持仓、分红金额、分红方式（现金/再投资）、交易日期

#### Scenario: 分红后持仓更新（现金分红）
- **WHEN** 用户提交现金分红
- **THEN** 系统 SHALL INSERT `fund_transactions`，UPDATE `fund_holdings.dividend += 分红金额`

#### Scenario: 分红后持仓更新（再投资）
- **WHEN** 用户提交再投资分红
- **THEN** 系统 SHALL INSERT `fund_transactions`（transaction_type=dividend），同时同买入逻辑增加 `shares` 和 `total_invest`

### Requirement: 编辑和删除交易

系统 SHALL 允许用户编辑或删除交易记录。

#### Scenario: 编辑交易
- **WHEN** 用户点击交易行的编辑按钮并修改后提交
- **THEN** 系统 SHALL UPDATE `fund_transactions`，然后 REFRESH 持仓数据（先还原旧交易的影响，再应用新交易的影响）

#### Scenario: 删除交易
- **WHEN** 用户点击交易行的删除按钮并确认
- **THEN** 系统 SHALL DELETE `fund_transactions`，然后重新聚合该持仓下所有交易重算 shares/avg_cost/total_invest/total_redeem/dividend

### Requirement: 交易批量导入

系统 SHALL 支持通过 CSV/Excel 文件批量导入交易记录。

#### Scenario: 导入模板下载
- **WHEN** 用户点击"批量导入"按钮 → "下载模板"
- **THEN** 系统 SHALL 用 `xlsx` 库生成 < 100 行示例数据的 .xlsx 文件，列名：基金代码、基金名称、交易类型、份额、净值、金额、手续费、交易日期、备注

#### Scenario: 解析与校验
- **WHEN** 用户上传 CSV 或 Excel 文件
- **THEN** 系统 SHALL 解析文件，逐行校验：基金代码格式、交易类型（buy/sell/dividend 或中文字段映射）、金额/份额为数字、日期格式，校验失败的记录汇总展示错误信息，不中断整体导入

#### Scenario: 批量写入
- **WHEN** 校验通过后用户确认导入
- **THEN** 系统 SHALL 按 50 条/批 INSERT `fund_transactions`，每条交易后执行持仓回写逻辑，完成后 `loadData` 刷新页面
