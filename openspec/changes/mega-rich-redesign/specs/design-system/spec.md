## ADDED Requirements

### Requirement: Design Tokens 定义
系统 SHALL 定义统一的 Design Tokens，包括颜色、间距、圆角、阴影、字体等。

#### Scenario: 使用主色
- **WHEN** 组件需要显示盈利状态
- **THEN** 使用 `colors.primary` (#18A058 绿色)

#### Scenario: 使用危险色
- **WHEN** 组件需要显示亏损状态
- **THEN** 使用 `colors.danger` (#D03050 红色)

#### Scenario: 使用间距系统
- **WHEN** 组件需要设置内边距
- **THEN** 使用 `spacing.md` (12px) 或其他预定义间距值

### Requirement: 简约风格 UI
系统 SHALL 采用简约风格设计，使用卡片式布局和清晰的信息层级。

#### Scenario: 卡片组件样式
- **WHEN** 显示基金持仓卡片
- **THEN** 使用白色背景、圆角 12px、阴影 shadow.md

#### Scenario: 按钮样式
- **WHEN** 显示主要操作按钮
- **THEN** 使用主色背景、白色文字、圆角 8px

### Requirement: 主题配置
系统 SHALL 支持 Naive UI 主题配置，覆盖默认样式以匹配设计系统。

#### Scenario: 覆盖 Naive UI 主题
- **WHEN** 应用初始化
- **THEN** 使用 themeOverrides 配置 Naive UI 组件样式

### Requirement: 响应式字体
系统 SHALL 根据屏幕尺寸调整字体大小。

#### Scenario: 桌面端字体
- **WHEN** 屏幕宽度 > 768px
- **THEN** 使用基础字体大小 16px

#### Scenario: 移动端字体
- **WHEN** 屏幕宽度 ≤ 768px
- **THEN** 使用基础字体大小 14px
