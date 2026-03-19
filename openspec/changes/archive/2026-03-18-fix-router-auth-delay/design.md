## Context

当前路由守卫在每次导航时都会检查 `authStore.loading` 状态，如果为 true 则等待其变为 false。这导致每次路由切换都可能触发等待逻辑，即使认证状态已经初始化完成。

**当前实现问题：**
- `authStore.loading` 在每次调用 `initialize()` 时都会设置为 true
- 路由守卫没有区分"首次初始化"和"已初始化"状态
- 每次导航都可能触发 `$subscribe` 监听，造成不必要的等待

**技术栈：**
- Vue Router 4
- Pinia store
- Async/await 路由守卫

## Goals / Non-Goals

**Goals:**
- 路由切换响应时间从数秒降低到 <10ms
- 保持认证安全性不变
- 清理不必要的调试日志
- 代码简洁易维护

**Non-Goals:**
- 不改变认证逻辑本身
- 不优化 Supabase 认证 API 调用性能
- 不重构整个路由系统

## Decisions

### Decision 1: 在 authStore 中添加 `initialized` 标记

**选择：** 添加一个 `initialized` ref 来跟踪初始化状态

**理由：**
- 简单直接，无需复杂的状态机
- 可以在路由守卫中快速检查
- 不影响现有的 `loading` 状态逻辑

**替代方案：**
- 使用时间戳判断：过于复杂，需要处理时间差
- 使用 Promise 缓存：增加复杂度，不易理解

### Decision 2: 路由守卫只在未初始化时等待

**选择：** 检查 `initialized` 标记，只在 false 时等待初始化

```javascript
if (!authStore.initialized) {
  await authStore.initialize()
}
// 直接使用 authStore.isAuthenticated 进行判断
```

**理由：**
- 避免重复等待
- 逻辑清晰，易于理解
- 性能最优

**替代方案：**
- 使用全局标记：污染全局作用域
- 使用路由 meta：不适合存储运行时状态

### Decision 3: 移除或条件化调试日志

**选择：** 使用环境变量控制日志输出

```javascript
if (import.meta.env.DEV) {
  console.log('路由守卫:', ...)
}
```

**理由：**
- 开发时保留调试能力
- 生产环境保持控制台清洁
- 符合最佳实践

## Risks / Trade-offs

### Risk 1: 初始化失败后的重试
**风险：** 如果首次初始化失败，`initialized` 仍为 false，可能导致每次导航都重试

**缓解：**
- 在 `initialize()` 中添加错误处理
- 即使失败也设置 `initialized = true`，避免无限重试
- 记录错误日志供调试

### Risk 2: 并发导航
**风险：** 用户快速点击多个链接，可能导致多个导航同时触发

**缓解：**
- Vue Router 本身会取消未完成的导航
- `initialized` 标记在第一次初始化完成后立即设置
- 后续导航会跳过等待逻辑

### Risk 3: Session 过期后的状态更新
**风险：** Session 过期后，`isAuthenticated` 变为 false，但 `initialized` 仍为 true

**缓解：**
- 这是预期行为：初始化完成不等于永久登录
- 路由守卫会正确检查 `isAuthenticated` 并重定向
- 不影响安全性

## Migration Plan

**部署步骤：**
1. 修改 `authStore` 添加 `initialized` 标记
2. 修改路由守卫逻辑
3. 测试各种导航场景
4. 部署到生产环境

**回滚策略：**
- 如果出现问题，恢复原有路由守卫代码
- `initialized` 标记不影响其他功能，可以保留

**测试清单：**
- [ ] 首次访问应用
- [ ] 刷新页面
- [ ] 登录后导航
- [ ] 登出后导航
- [ ] 快速切换多个路由
- [ ] 访问受保护路由（未登录）
- [ ] 访问受保护路由（已登录）
