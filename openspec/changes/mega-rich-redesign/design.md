## Context

当前 Mega Rich 应用使用基于 v-if 的页面切换和简单的 provide/inject 状态管理，导致无法使用浏览器历史、URL 分享，状态管理混乱。基金投资功能缺失核心能力，UI 不统一且移动端体验差。

现有技术栈：Vue 3 Composition API、Naive UI、Supabase、ECharts。现有模块：结余管理、月薪管理、基金投资（基础版）。

约束条件：
- 必须保持与 Supabase 的集成
- 必须保留现有的结余和月薪模块功能
- 必须使用现有的 FundApi.js 调用基金数据
- 必须支持移动端和桌面端

利益相关者：个人用户（开发者本人），需要专业的资产管理工具。

## Goals / Non-Goals

**Goals:**
- 建立可维护的架构基础（Vue Router + Pinia + Composables）
- 实现完整的基金投资功能（市场、持仓、交易、自选、定投）
- 建立统一的设计系统，提升 UI 一致性和美观度
- 实现真正的响应式布局，优化移动端体验
- 优化现有结余和月薪模块，适配新架构

**Non-Goals:**
- 不支持多用户协作功能
- 不实现实时推送通知（仅应用内提醒）
- 不支持第三方账户导入（如支付宝、微信）
- 不实现复杂的投资组合分析（如夏普比率、最大回撤等）
- 不支持股票、债券等其他资产类型（仅基金）

## Decisions

### 决策 1: 使用 Vue Router 替代基于状态的路由

**选择**: Vue Router 4.x

**理由**:
- 提供标准的 URL 路由和浏览器历史支持
- 支持路由守卫，便于实现认证检查
- 支持路由懒加载，优化首屏性能
- 社区标准方案，文档完善

**替代方案**:
- 保持现有的基于状态路由：无法支持 URL 分享和浏览器历史
- 使用 Vue Router 的 hash 模式：URL 不够美观，但兼容性更好

**最终选择**: 使用 Vue Router 的 history 模式，配合 Supabase 的重定向规则。

### 决策 2: 使用 Pinia 替代 provide/inject

**选择**: Pinia

**理由**:
- Vue 官方推荐的状态管理方案
- TypeScript 支持更好
- DevTools 集成，便于调试
- 模块化设计，每个功能模块独立 store
- 支持插件（如持久化）

**替代方案**:
- 继续使用 provide/inject：缺乏结构化，难以调试和维护
- 使用 Vuex：Pinia 是 Vuex 的继任者，API 更简洁

**Store 设计**:
```
stores/
├── auth.js       # 用户认证和资料
├── fund.js       # 基金数据（持仓、交易、关注、计划）
├── balance.js    # 结余管理
└── salary.js     # 月薪管理
```

### 决策 3: 引入 Composables 层封装业务逻辑

**选择**: 创建 composables/ 目录，封装可复用的业务逻辑

**理由**:
- 分离业务逻辑和 UI 逻辑
- 提高代码复用性
- 便于单元测试
- 符合 Vue 3 Composition API 最佳实践

**Composables 设计**:
```
composables/
├── useAuth.js      # 认证相关逻辑
├── useFund.js      # 基金业务逻辑
├── useBalance.js   # 结余业务逻辑
├── useSalary.js    # 月薪业务逻辑
└── useChart.js     # 图表配置逻辑
```

### 决策 4: 创建统一的 API 服务层

**选择**: 创建 services/ 目录，封装所有 API 调用

**理由**:
- 统一错误处理
- 统一请求/响应格式
- 便于 mock 和测试
- 隔离 Supabase 实现细节

**服务层设计**:
```
services/
├── SupabaseService.js   # Supabase 数据库操作封装
├── StorageService.js    # Supabase 存储操作封装
└── FundApi.js          # 基金 API（已存在）
```

### 决策 5: 建立 Design Tokens 设计系统

**选择**: 创建 design/ 目录，定义 Design Tokens

**理由**:
- 统一视觉风格
- 便于主题切换（未来可扩展暗色模式）
- 提高设计和开发效率
- 符合现代前端最佳实践

**Design Tokens 结构**:
```javascript
{
  colors: { primary, danger, warning, info, gray, bg },
  spacing: { xs, sm, md, lg, xl, 2xl, 3xl },
  radius: { sm, md, lg, xl, full },
  shadow: { sm, md, lg },
  fontSize: { xs, sm, base, lg, xl, 2xl, 3xl, 4xl }
}
```

### 决策 6: 移动端使用底部 Tab Bar 导航

**选择**: 移动端（≤768px）显示底部固定 Tab Bar

**理由**:
- 符合移动端用户习惯（类似支付宝、微信）
- 拇指操作区域，易于点击
- 始终可见，无需展开菜单

**Tab Bar 结构**:
- 首页（Dashboard）
- 基金（Fund）
- 结余（Balance）
- 月薪（Salary）
- 我的（Profile）

### 决策 7: 数据库表结构优化

**选择**: 新增 fund_plans 和 fund_nav_history 表，优化现有表

**理由**:
- fund_plans: 支持定投计划功能
- fund_nav_history: 缓存基金净值数据，减少 API 调用
- 优化 fund_holdings: 添加 last_sync_at 和 auto_sync 字段
- 优化 fund_transactions: 添加 plan_id 关联定投计划

**数据同步策略**:
- 用户打开应用时，检查距离上次同步时间
- 超过1小时自动同步所有持仓净值
- 用户可手动触发同步
- 净值数据缓存到 fund_nav_history 表，有效期24小时

### 决策 8: 路由结构设计

**选择**: 扁平化路由结构，避免过深嵌套

**路由设计**:
```
/                      # 首页（Dashboard）
/login                 # 登录
/register              # 注册
/fund                  # 基金投资总览
/fund/holdings         # 持仓管理
/fund/transactions     # 交易记录
/fund/market           # 基金市场
/fund/watchlist        # 自选基金
/fund/plans            # 定投计划
/balance               # 结余管理
/salary                # 月薪管理
/settings              # 用户设置
```

**理由**:
- URL 清晰易懂
- 便于分享和书签
- 避免过深嵌套导致的复杂性

### 决策 9: 组件结构重构

**选择**: 分离基础组件和业务组件

**组件结构**:
```
components/
├── base/              # 基础组件（通用）
│   ├── Card.vue
│   ├── Button.vue
│   ├── Chart.vue
│   └── ...
├── fund/              # 基金业务组件
│   ├── FundCard.vue
│   ├── FundSearch.vue
│   ├── TransactionForm.vue
│   └── ...
├── balance/           # 结余业务组件
├── salary/            # 月薪业务组件
└── layout/            # 布局组件
    ├── AppHeader.vue
    ├── AppFooter.vue
    └── TabBar.vue
```

### 决策 10: 分阶段实施策略

**选择**: 分5个阶段逐步实施，每个阶段可独立测试和部署

**阶段划分**:
1. Phase 1: 架构基础（Router + Pinia + Design System）
2. Phase 2: 基金核心功能（持仓 + 交易 + 市场搜索）
3. Phase 3: 基金扩展功能（自选 + 详情 + 对比）
4. Phase 4: 定投计划
5. Phase 5: 优化结余和月薪模块

**理由**:
- 降低风险，每个阶段可独立验证
- 快速交付核心价值
- 便于调整优先级

## Risks / Trade-offs

### 风险 1: 破坏性变更导致用户数据丢失
**风险**: 路由和状态管理的重构可能导致现有用户状态丢失

**缓解措施**:
- 所有用户数据存储在 Supabase，不受前端重构影响
- 在开发环境充分测试后再部署
- 提供数据备份和恢复机制

### 风险 2: FundApi 调用频率限制
**风险**: 频繁调用基金 API 可能触发限流

**缓解措施**:
- 实现 fund_nav_history 表缓存净值数据
- 设置合理的自动同步间隔（1小时）
- 使用防抖和节流优化搜索请求

### 风险 3: 移动端性能问题
**风险**: 大量数据和图表可能导致移动端性能下降

**缓解措施**:
- 使用路由懒加载
- 图表数据分页加载
- 使用虚拟滚动优化长列表
- 图片和资源懒加载

### 风险 4: 设计系统维护成本
**风险**: Design Tokens 的维护可能增加开发成本

**缓解措施**:
- 初期定义完善的 Tokens，减少后期修改
- 使用 CSS 变量，便于全局修改
- 文档化设计规范

### 权衡 1: 功能完整性 vs 开发时间
**权衡**: 完整实现所有功能需要较长时间

**决策**: 采用分阶段实施，优先交付核心功能

### 权衡 2: 性能 vs 功能丰富度
**权衡**: 实时数据更新会增加性能开销

**决策**: 使用缓存和合理的同步间隔平衡性能和实时性

### 权衡 3: 代码复用 vs 灵活性
**权衡**: 过度抽象可能降低代码灵活性

**决策**: 仅在明确有复用需求时才抽象，避免过度设计

## Migration Plan

### 部署步骤

**Phase 1: 数据库迁移**
1. 在 Supabase 中创建新表（fund_plans, fund_nav_history）
2. 为现有表添加新字段（fund_holdings, fund_transactions）
3. 验证 RLS 策略正确配置

**Phase 2: 前端部署**
1. 安装新依赖（vue-router, pinia）
2. 创建新的目录结构（router/, stores/, composables/, services/, design/）
3. 逐步迁移现有组件到新架构
4. 在开发环境测试所有功能
5. 部署到生产环境

**Phase 3: 验证**
1. 验证所有路由正常工作
2. 验证用户认证流程
3. 验证数据同步功能
4. 验证移动端和桌面端布局

### 回滚策略

如果部署后发现严重问题：
1. 回滚到上一个 Git 版本
2. 数据库表不需要回滚（新表不影响旧功能）
3. 如果需要回滚数据库，执行反向迁移脚本

### 数据迁移

无需数据迁移，因为：
- 现有数据结构保持不变
- 新增的表和字段不影响现有功能
- 前端重构不影响后端数据

## Open Questions

1. **是否需要支持暗色模式？**
   - 当前设计系统预留了主题切换能力
   - 可在后续版本中实现

2. **定投计划的自动执行如何实现？**
   - 选项 A: 使用 Supabase Edge Functions + Cron
   - 选项 B: 用户手动执行，系统仅提醒
   - **建议**: Phase 4 实施时再决定，初期使用选项 B

3. **是否需要支持基金数据的离线访问？**
   - 当前设计使用缓存，但不支持完全离线
   - 可考虑使用 Service Worker 实现 PWA

4. **图表库是否需要更换？**
   - 当前使用 ECharts，功能强大但体积较大
   - 可考虑轻量级替代方案（如 Chart.js）
   - **建议**: 保持 ECharts，已有使用经验

5. **是否需要单元测试和 E2E 测试？**
   - 当前未提及测试策略
   - **建议**: 至少为关键业务逻辑（Composables、Services）编写单元测试
