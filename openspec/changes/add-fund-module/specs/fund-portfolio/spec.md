## ADDED Requirements

### Requirement: 持仓列表展示

系统 SHALL 以表格/卡片形式展示当前用户的所有基金持仓记录。

#### Scenario: 持仓列表默认展示
- **WHEN** 用户登录后进入 `/fund` 页面的"持仓"Tab
- **THEN** 系统 SHALL 渲染 `CardListView`，每行展示一只持仓的：基金代码、基金名称、基金类型、持有份额、平均成本、当前净值、当日涨跌%、市值、累计投入、累计赎回、累计盈亏、盈亏率、最后同步时间

#### Scenario: 移动端卡片视图
- **WHEN** 用户在移动端（屏幕宽度 ≤ 768px）进入持仓 Tab
- **THEN** 系统 SHALL 自动切换为卡片列表模式（CardListView 移动端渲染），卡片展示核心字段（基金名称、类型、市值、盈亏、当日涨跌）和操作按钮

#### Scenario: 空持仓提示
- **WHEN** 当前用户没有任何持仓记录
- **THEN** 系统 SHALL 展示 `NEmpty` 空状态提示 + "新增持仓" 按钮引导用户

### Requirement: 持仓筛选与排序

系统 SHALL 支持用户对持仓列表进行多维度的筛选和排序。

#### Scenario: 按基金类型筛选
- **WHEN** 用户在持仓 Tab 的筛选下拉框中选择基金类型（如"股票型""混合型""债券型""货币型"）
- **THEN** 系统 SHALL 仅展示 `fund_holdings.fund_type` 匹配该类型的持仓记录

#### Scenario: 按盈亏状态筛选
- **WHEN** 用户在筛选下拉框中选择盈亏状态（"盈利""亏损""持平"）
- **THEN** 系统 SHALL 根据 `profit` 正负区间筛选持仓：profit > 0 为盈利、profit < 0 为亏损、profit = 0 为持平

#### Scenario: 按盈亏率排序
- **WHEN** 用户在列表表头点击"盈亏率"列的排序箭头（升降序切换）
- **THEN** 系统 SHALL 按 `profit_rate` 字段对持仓重新排序

### Requirement: 总览统计卡

系统 SHALL 在持仓 Tab 顶部展示关键汇总指标。

#### Scenario: 统计卡片展示
- **WHEN** 用户进入持仓 Tab
- **THEN** 系统 SHALL 在 Tab 顶部以统计卡片组展示：总市值、总成本（净投入）、总盈亏、盈亏率、当日总涨跌

#### Scenario: 统计值跟随数据变化
- **WHEN** 用户新增/编辑/删除持仓后
- **THEN** 系统 SHALL 自动重算所有统计指标并更新卡片数值

### Requirement: 持仓新增

系统 SHALL 允许用户手动创建新的持仓记录。

#### Scenario: 新增持仓弹窗
- **WHEN** 用户点击"新增持仓"按钮
- **THEN** 系统 SHALL 弹出 `AddEditHoldingForm` 弹窗（移动端全屏），包含字段：基金搜索/选择、基金代码（自动填充）、基金名称（自动填充）、基金类型（自动填充）、持有份额、平均成本、当前净值、买入日期、备注、自动同步开关

#### Scenario: 从搜索选基金
- **WHEN** 用户在新增持仓弹窗中点击"选择基金"
- **THEN** 系统 SHALL 打开 `SearchFundModal`，用户输入关键字后调用 `fundSearch(1, key)` 搜索，选中后自动填充 fund_code/fund_name/fund_type

#### Scenario: 初次持仓快照保存
- **WHEN** 用户填写份额、平均成本、当前净值等信息并提交
- **THEN** 系统 SHALL INSERT `fund_holdings` 记录，设置 `remark = '手工初始化'`，且派生字段（shares/avg_cost/total_invest）在此次写入后变为只读

### Requirement: 持仓编辑

系统 SHALL 允许用户编辑持仓的非派生字段。

#### Scenario: 编辑非派生字段
- **WHEN** 用户点击持仓行的编辑按钮，修改基金备注或自动同步开关
- **THEN** 系统 SHALL UPDATE `fund_holdings` 的 `remark`/`auto_sync` 字段，不得更新 shares/avg_cost/current_nav 等派生字段

#### Scenario: 编辑禁用派生字段
- **WHEN** 用户打开编辑弹窗
- **THEN** 系统 SHALL 将份额、平均成本、累计投入、累计赎回、盈亏字段置为只读或隐藏，并提示"由交易记录和净值同步自动维护"

### Requirement: 持仓删除

系统 SHALL 允许用户删除持仓记录。

#### Scenario: 删除前确认
- **WHEN** 用户点击持仓行的删除按钮
- **THEN** 系统 SHALL 弹出确认对话框，提示"删除后将同时删除该持仓下的所有交易记录"

#### Scenario: 级联忽略交易记录（软删除）
- **WHEN** 用户确认删除
- **THEN** 系统 SHALL 将 `fund_transactions.holding_id` 置为 NULL（外键 ON DELETE SET NULL），再删除该 `fund_holdings` 记录

### Requirement: 持仓类型占比图表

系统 SHALL 以嵌套饼图展示持仓按类型的市值分布。

#### Scenario: 饼图渲染
- **WHEN** 用户进入持仓 Tab
- **THEN** 系统 SHALL 在持仓列表上方渲染 `v-chart` 嵌套饼图：内环按基金类型分组（股票/混合/债券/货币/QDII/指数），外环展示该类型下各基金的市值明细，配置复用 `pieChartCommonConfig`

#### Scenario: 饼图数据动态更新
- **WHEN** 持仓数据发生变动（新增/编辑/删除/净值同步后）
- **THEN** 系统 SHALL 自动重算饼图各分类的市值汇总并更新渲染

### Requirement: 持仓盈亏对比柱状图

系统 SHALL 以柱状图展示各持仓的盈亏对比。

#### Scenario: 盈亏柱状图
- **WHEN** 用户进入持仓 Tab
- **THEN** 系统 SHALL 在饼图下方渲染 `v-chart` 柱状图，X 轴为基金名称，Y 轴为盈亏金额，盈利为正柱（红色系），亏损为负柱（绿色系），配置复用 `commonChartConfig`

### Requirement: 净值同步

系统 SHALL 支持用户手动同步单只或多只持仓的基金净值。

#### Scenario: 单只手动同步
- **WHEN** 用户点击持仓行的"同步"按钮
- **THEN** 系统 SHALL 依次调用 `fundVarietieValuationDetail(code)`（实时估值/今日涨跌）和 `fundMNHisNetList(code, 1, 1)`（最新确认净值），更新 `fund_holdings` 的 `current_nav`、`today_change`、`last_sync_at`，重算 `profit`/`profit_rate`

#### Scenario: 全部手动同步
- **WHEN** 用户点击工具栏的"同步全部净值"按钮
- **THEN** 系统 SHALL 遍历所有 `auto_sync=true` 的持仓，以并发池（限 3-5 个并发）依次执行净值拉取与更新。执行过程中 UI 展示进度指示（如"正在同步：3/8"）

#### Scenario: 自动后台同步
- **WHEN** 用户进入 `/fund` 页面
- **THEN** 系统 SHALL 检查所有 `auto_sync=true` 的持仓的 `last_sync_at`，对距今超过 4 小时的持仓自动发起后台同步（不阻塞列表展示）

#### Scenario: 同步失败降级
- **WHEN** 净值同步调用 FundApi 失败（网络错误/接口限流/返回异常）
- **THEN** 系统 SHALL 不更新该持仓的 `current_nav`/`last_sync_at`，通过 `message.warning` 提示用户"基金 {name} 净值同步失败"

### Requirement: 持仓详情

系统 SHALL 提供持仓详情弹窗查看完整持仓信息。

#### Scenario: 详情弹窗
- **WHEN** 用户点击持仓行的"查看"按钮
- **THEN** 系统 SHALL 弹出详情弹窗，展示：基金代码、基金名称、基金类型、持有份额、平均成本、当前净值、当日涨跌、市值、累计投入、累计赎回、累计分红、累计盈亏、盈亏率、买入日期、备注、最后同步时间、自动同步状态，并提供"查看走势"按钮跳转 `/fund/detail/:code`

### Requirement: 数据加载与刷新

系统 SHALL 在进入页面时加载基金数据并在 CRUD 后自动刷新。

#### Scenario: 页面加载
- **WHEN** 用户进入 `/fund` 页面
- **THEN** 系统 SHALL 调用 `supabase.from('fund_holdings').select('*')` 加载当前用户所有持仓

#### Scenario: CRUD 后刷新
- **WHEN** 用户在持仓 Tab 中完成新增/编辑/删除操作
- **THEN** 系统 SHALL 自动重新拉取 `fund_holdings` 全量数据并更新 UI
