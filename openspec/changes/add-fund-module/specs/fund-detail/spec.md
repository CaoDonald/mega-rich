## ADDED Requirements

### Requirement: 基金详情页布局

系统 SHALL 以路由 `/fund/detail/:code` 提供单只基金的详细信息页面。

#### Scenario: 详情页头部
- **WHEN** 用户进入 `/fund/detail/:code`（从持仓/自选/排行/搜索跳转）
- **THEN** 系统 SHALL 展示头部信息区：基金代码（`fund_code`）、基金名称（`fund_name`）、基金类型、成立日期、基金规模、基金评级，数据来源 `fundMNDetailInformation(code)`

#### Scenario: 实时估值卡片
- **WHEN** 详情页加载
- **THEN** 系统 SHALL 调用 `fundVarietieValuationDetail(code)` 展示实时估算净值和估算涨跌幅，并标注"（盘中估算）"；若当前为 15:00 后（已收盘）则展示今日确认净值

#### Scenario: 底部操作栏
- **WHEN** 用户在详情页底部
- **THEN** 系统 SHALL 固定底部操作栏包含："加自选"按钮（若已在自选则显示"已自选"）和"买入"按钮（跳转 `AddEditTransactionForm` 预填 fund_code）

#### Scenario: 未登录限制
- **WHEN** 未登录用户访问详情页（`fund-detail` 不在 `authRequiredPages` 中）
- **THEN** 系统 SHALL 展示行情数据，但点击"加自选"和"买入"时提示"请先登录"

### Requirement: 净值走势 Tab

系统 SHALL 以折线图展示基金的历史净值走势。

#### Scenario: 净值折线图
- **WHEN** 用户进入"净值走势"Tab
- **THEN** 系统 SHALL 调用 `fundVPageDiagram(code, range, 500)` 渲染 `v-chart` 折线图，X 轴为日期，Y 轴为净值，areaStyle 半透明渐变填充，配置复用 `commonChartConfig`

#### Scenario: 时间范围切换
- **WHEN** 用户点击时间范围按钮（1个月/3个月/6个月/1年/3年/成立以来）
- **THEN** 系统 SHALL 重新调用 `fundVPageDiagram(code, range)` 并更新图表数据

#### Scenario: 累计净值叠加
- **WHEN** 用户点击"显示累计净值"开关
- **THEN** 系统 SHALL 在折线图中叠加显示累计净值曲线（`acc_nav`），双系列区分颜色

### Requirement: 累计收益对比 Tab

系统 SHALL 展示基金累计收益与基准指数的对比走势。

#### Scenario: 对比折线图
- **WHEN** 用户进入"累计收益对比"Tab
- **THEN** 系统 SHALL 调用 `fundVPageAcc(code, range, '000300')`（默认对比沪深300指数），渲染双系列折线图（基金累计收益 vs 沪深300累计收益），X 轴为日期，Y 轴为收益率%

### Requirement: 阶段涨幅 Tab

系统 SHALL 以表格形式展示基金各阶段的涨幅数据。

#### Scenario: 阶段涨幅表
- **WHEN** 用户进入"阶段涨幅"Tab
- **THEN** 系统 SHALL 调用 `fundMNPeriodIncrease(code, '')`，以表格列表展示：近1周、近1月、近3月、近6月、近1年、近3年、成立以来的涨幅率，同时展示同类平均和沪深300同期涨幅作为对比

### Requirement: 同类排名 Tab

系统 SHALL 以图表展示基金在同类中的排名走势。

#### Scenario: 排名走势图
- **WHEN** 用户进入"同类排名"Tab
- **THEN** 系统 SHALL 调用 `fundRankDiagram(code, range)` 渲染折线图，展示该基金在同类基金中的排名变化趋势，X 轴为时间段，Y 轴为排名（数值越小排名越靠前）

### Requirement: 历史净值 Tab

系统 SHALL 以分页表格展示基金的历史净值数据。

#### Scenario: 历史净值分页表
- **WHEN** 用户进入"历史净值"Tab
- **THEN** 系统 SHALL 调用 `fundMNHisNetList(code, pageIndex, 20)`，以分页表格展示：净值日期、单位净值、累计净值、日增长率，每页 20 条

#### Scenario: 历史净值加载更多
- **WHEN** 用户滚动到表格底部并点击"加载更多"
- **THEN** 系统 SHALL 请求下一页数据并追加到列表中

### Requirement: 基金经理 Tab

系统 SHALL 展示管理该基金的基金经理详细信息。

#### Scenario: 经理列表
- **WHEN** 用户进入"基金经理"Tab
- **THEN** 系统 SHALL 调用 `fundMNMangerList(code)` 展示经理列表，每项包含：经理姓名、任职日期、任职天数、任职回报

#### Scenario: 经理详情
- **WHEN** 用户点击经理姓名
- **THEN** 系统 SHALL 跳转展示该经理的详细信息：简介（`fundMSNMangerInfo(MGRID)`）、管理基金列表（`fundMSNMangerAcc`）、业绩排名（`fundMSNMangerPerRank`）、投资风格（`fundMSNMangerPosChar`）

### Requirement: 基金公司 Tab

系统 SHALL 展示管理该基金的基金公司信息。

#### Scenario: 公司信息
- **WHEN** 用户进入"基金公司"Tab
- **THEN** 系统 SHALL 调用 `companyApi2FundCompanyBaseInfo(cc)` 和 `companyApi2CompanyArchives(cc)` 展示：公司名称、成立日期、管理规模、旗下基金数量、基金经理数量、公司简介

### Requirement: 数据懒加载

系统 SHALL 在用户切换 Tab 时按需加载数据，避免一次性请求所有接口。

#### Scenario: Tab 懒加载
- **WHEN** 用户切换详情页 Tab
- **THEN** 系统 SHALL 仅在用户首次切换到该 Tab 时发起对应接口请求，切换回已加载的 Tab 不重复请求（除非用户手动刷新）

#### Scenario: 加载状态
- **WHEN** Tab 数据正在请求中
- **THEN** 系统 SHALL 在该 Tab 内容区展示 `NSpin` 加载动画
