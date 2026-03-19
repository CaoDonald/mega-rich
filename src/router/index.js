/**
 * Vue Router 配置
 */

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../components/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/Home.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'fund',
        name: 'fund',
        component: () => import('../views/fund/Overview.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'fund/holdings',
        name: 'fund-holdings',
        component: () => import('../views/fund/Holdings.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'fund/transactions',
        name: 'fund-transactions',
        component: () => import('../views/fund/Transactions.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'fund/market',
        name: 'fund-market',
        component: () => import('../views/fund/Market.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'fund/watchlist',
        name: 'fund-watchlist',
        component: () => import('../views/fund/Watchlist.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'fund/plans',
        name: 'fund-plans',
        component: () => import('../views/fund/Plans.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'fund/detail/:code',
        name: 'fund-detail',
        component: () => import('../views/fund/FundDetail.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'fund/compare',
        name: 'fund-compare',
        component: () => import('../views/fund/Compare.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'balance',
        name: 'balance',
        component: () => import('../views/balance/Index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'salary',
        name: 'salary',
        component: () => import('../views/salary/Index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../components/auth/UserSettings.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../components/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../components/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../components/auth/ForgotPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/password-reset',
    name: 'password-reset',
    component: () => import('../components/auth/PasswordReset.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 认证检查
router.beforeEach(async (to, from, next) => {
  // 动态导入 authStore 避免循环依赖
  const { useAuthStore } = await import('../stores/auth.js')
  const authStore = useAuthStore()

  // 只在未初始化时等待初始化完成
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  if (import.meta.env.DEV) {
    console.log('路由守卫:', {
      to: to.path,
      from: from.path,
      requiresAuth: to.meta.requiresAuth,
      isAuthenticated: authStore.isAuthenticated
    })
  }

  // 检查路由是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    if (import.meta.env.DEV) {
      console.log('未登录，重定向到登录页')
    }
    // 保存原始目标路由
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    if (import.meta.env.DEV) {
      console.log('已登录，重定向到首页')
    }
    // 已登录用户访问登录/注册页面，重定向到首页
    next({ name: 'home' })
  } else {
    if (import.meta.env.DEV) {
      console.log('允许访问')
    }
    next()
  }
})

export default router
