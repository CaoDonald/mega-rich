## ADDED Requirements

### Requirement: 基金排行榜

系统 SHALL 以分页列表展示基金排行榜数据，支持多维度筛选排序。

#### Scenario: 排行榜列表
- **WHEN** 用户进入 `/fund/rank` 页面
- **THEN** 系统 SHALL 调用 `fundMNRank(fundType, sortColumn, sort, pageIndex, 30, '', filters)` 加载排行数据，以 `CardListView` 展示：基金代码、基金名称、基金类型、最新净值、近1周涨幅、近1月涨幅、近3月涨幅、近1年涨幅、评级、操作（查看详情/加自选）

#### Scenario: 按类型筛选
- **WHEN** 用户在选择分类下拉框中选择基金类型（全部/股票型/混合型/债券型/货币型/QDII/指数/ETF）
- **THEN** 系统 SHALL 传递对应类型编码（25=股票/27=混合/31=债券/35=货币/6=QDII/26=指数/3=ETF）到 `fundMNRank` 的 `FundType` 参数并刷新列表

#### Scenario: 按排序列排序
- **WHEN** 用户在排序下拉框中选择排序列（近1周/近1月/近3月/近1年/日涨幅/净值增长率/净值）
- **THEN** 系统 SHALL 传递对应 `SortColumn` 参数到 `fundMNRank` 并刷新列表

#### Scenario: 升序/降序切换
- **WHEN** 用户点击排序方向按钮
- **THEN** 系统 SHALL 切换 `Sort` 参数（desc→asc→desc），重新加载排行数据

#### Scenario: 分页加载
- **WHEN** 用户滚动到列表底部或点击"下一页"
- **THEN** 系统 SHALL 增加 `pageIndex` 参数，加载下一页 30 条数据

### Requirement: 从排行榜添加自选

系统 SHALL 支持用户在排行榜中直接加自选。

#### Scenario: 排行榜加自选
- **WHEN** 用户在排行榜中点击某只基金的"加自选"按钮
- **THEN** 系统 SHALL INSERT `fund_watchlist`，按钮变为"已自选"（禁用）

#### Scenario: 已自选标识
- **WHEN** 排行榜加载时，系统查询当前用户的 `fund_watchlist`
- **THEN** 已存在于自选中的基金，列表中的操作按钮显示为"已自选"（禁用）

### Requirement: 高级筛选

系统 SHALL 支持用户通过更多条件精细过滤排行结果。

#### Scenario: 高级筛选弹窗
- **WHEN** 用户点击"高级筛选"按钮
- **THEN** 系统 SHALL 弹出筛选面板，包含：风险等级、基金规模最小值、成立年限、申购费率、评级（五星/四星/三星）等条件

#### Scenario: 筛选条件应用
- **WHEN** 用户设置筛选条件并确认
- **THEN** 系统 SHALL 构造 `fundMNRank` 的 `filters` 参数（如 `{RISKLEVEL:'1',ESTABDATE:'1900-01-01|2026-06-23'}`），重新加载排行数据
