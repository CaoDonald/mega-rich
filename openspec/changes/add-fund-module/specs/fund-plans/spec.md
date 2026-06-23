## ADDED Requirements

### Requirement: 定投计划列表

系统 SHALL 展示当前用户的所有定投计划。

#### Scenario: 计划列表
- **WHEN** 用户进入定投计划页面（通过路由或 Tab）
- **THEN** 系统 SHALL 调用 `supabase.from('fund_plans').select('*')` 加载计划列表，以 `CardListView` 展示：计划名称、基金代码、基金名称、每期金额、频率、开始日期、下次执行日期、状态、累计投入、累计份额、操作

#### Scenario: 状态图标区分
- **WHEN** 计划列表渲染
- **THEN** 系统 SHALL 以 badge 展示计划状态：绿色"进行中"（active）、灰色"已暂停"（paused）、红色"已结束"（inactive）

### Requirement: 定投计划 CRUD

系统 SHALL 支持用户新增、编辑、暂停和删除定投计划。

#### Scenario: 新增计划
- **WHEN** 用户点击"新增定投"按钮
- **THEN** 系统 SHALL 弹出 `AddEditPlanForm`，包含：计划名称、基金（搜索选择）、每期金额、频率（周/双周/月/季度）、开始日期、结束日期（选填），提交后 INSERT `fund_plans`，自动计算 `next_execute_date` 为开始日期后的第一个执行日

#### Scenario: 编辑计划
- **WHEN** 用户点击计划行的编辑按钮
- **THEN** 系统 SHALL 弹出表单预填当前计划数据，用户可修改后提交 UPDATE

#### Scenario: 暂停计划
- **WHEN** 用户点击计划行的"暂停"按钮
- **THEN** 系统 SHALL UPDATE `fund_plans.status = 'paused'`，暂停期间不再检查待执行

#### Scenario: 恢复计划
- **WHEN** 用户在已暂停的计划上点击"恢复"按钮
- **THEN** 系统 SHALL UPDATE `fund_plans.status = 'active'`，恢复待执行检查

#### Scenario: 删除计划
- **WHEN** 用户点击计划行的删除按钮并确认
- **THEN** 系统 SHALL DELETE `fund_plans`，关联交易记录的 `plan_id` 置 NULL

### Requirement: 定投待执行提醒

系统 SHALL 在用户进入基金主页时检查是否有待执行的定投计划。

#### Scenario: 待执行检查
- **WHEN** 用户进入 `/fund` 页面
- **THEN** 系统 SHALL 查询 `fund_plans WHERE status='active' AND next_execute_date <= CURRENT_DATE`

#### Scenario: 待执行提醒
- **WHEN** 存在待执行的定投计划
- **THEN** 系统 SHALL 在页面顶部展示 `n-alert type="info"`："您有 {N} 个定投计划待执行"，并列出每组"计划名 - 基金名"，提供"一键执行"按钮

### Requirement: 手动执行定投

系统 SHALL 支持用户手动执行待执行的定投计划。

#### Scenario: 执行一期定投
- **WHEN** 用户在待执行提醒中点击"执行"按钮（或单条计划的"执行"按钮）
- **THEN** 系统 SHALL 打开 `AddEditTransactionForm`，预填：基金代码、基金名称、交易类型（买入）、份额（用估算净值反算 `amount / 当前净值`）、金额（= 计划每期金额）、关联计划、交易日期（今天），用户确认后提交

#### Scenario: 执行后续状态更新
- **WHEN** 定投执行确认提交
- **THEN** 系统 SHALL INSERT `fund_transactions`，UPDATE `fund_plans`：
  - `total_invested += 每期金额`
  - `total_shares += 本次份额`
  - `next_execute_date = 下一个周期日期`（按 frequency 推进：周→7天后、双周→14天后、月→下月同日、季→下季度同日）
  - 若 `next_execute_date > end_date`（设置了结束日期），SET `status = 'inactive'`

### Requirement: 定投统计

系统 SHALL 展示定投计划的汇总统计。

#### Scenario: 统计卡片
- **WHEN** 用户进入定投页面
- **THEN** 系统 SHALL 展示统计卡片：活跃计划数、月度定投总额、累计已投入金额
