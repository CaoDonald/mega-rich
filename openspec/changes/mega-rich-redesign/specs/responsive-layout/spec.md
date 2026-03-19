## ADDED Requirements

### Requirement: 响应式断点
系统 SHALL 定义响应式断点：移动端 (≤768px)、平板 (769-1024px)、桌面端 (>1024px)。

#### Scenario: 移动端布局
- **WHEN** 屏幕宽度 ≤ 768px
- **THEN** 系统使用移动端布局，显示底部 Tab Bar

#### Scenario: 桌面端布局
- **WHEN** 屏幕宽度 > 1024px
- **THEN** 系统使用桌面端布局，显示顶部导航栏

### Requirement: 移动端底部导航
系统 SHALL 在移动端显示底部 Tab Bar 导航。

#### Scenario: 显示底部导航
- **WHEN** 用户在移动端访问应用
- **THEN** 系统在屏幕底部显示固定的 Tab Bar，包含首页、基金、结余、月薪、我的五个标签

#### Scenario: 切换标签
- **WHEN** 用户点击底部导航的"基金"标签
- **THEN** 系统导航到基金投资页面并高亮该标签

#### Scenario: 隐藏顶部导航
- **WHEN** 用户在移动端访问应用
- **THEN** 系统隐藏顶部的横向导航菜单

### Requirement: 桌面端顶部导航
系统 SHALL 在桌面端显示顶部导航栏。

#### Scenario: 显示顶部导航
- **WHEN** 用户在桌面端访问应用
- **THEN** 系统在顶部显示横向导航菜单

#### Scenario: 隐藏底部导航
- **WHEN** 用户在桌面端访问应用
- **THEN** 系统不显示底部 Tab Bar

### Requirement: 响应式网格布局
系统 SHALL 使用响应式网格布局适配不同屏幕尺寸。

#### Scenario: 移动端单列布局
- **WHEN** 用户在移动端查看持仓列表
- **THEN** 系统使用单列布局显示持仓卡片

#### Scenario: 桌面端多列布局
- **WHEN** 用户在桌面端查看持仓列表
- **THEN** 系统使用2-3列网格布局显示持仓卡片

### Requirement: 触摸优化
系统 SHALL 优化移动端的触摸交互。

#### Scenario: 增大点击区域
- **WHEN** 用户在移动端点击按钮
- **THEN** 按钮的最小点击区域为 44x44px

#### Scenario: 滑动操作
- **WHEN** 用户在移动端左滑持仓卡片
- **THEN** 系统显示删除和编辑操作按钮
