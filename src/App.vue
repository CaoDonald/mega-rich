<script setup>
import { ref, provide, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import Layout from './components/Layout.vue'
import { supabase } from './supabase'
import { useDeviceDetect, isMobile } from './utils/device.js'

const router = useRouter()

// 设备检测
useDeviceDetect()

/**
 * js 文件下使用这个做类型提示
 * @type import('naive-ui').GlobalThemeOverrides
 */
const themeOverrides = {
  Button: {}
}

// 全局用户状态管理
const user = ref(null)
const session = ref(null)

// 需要登录才能访问的页面
const authRequiredPages = ['salary', 'balance', 'user-settings']

// 更新用户信息
const loadUser = async () => {
  const { data: { session: currentSession } } = await supabase.auth.getSession()
  if (currentSession) {
    session.value = currentSession
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentSession.user.id)
      .single()
    user.value = profile
      ? { ...currentSession.user, ...profile }
      : currentSession.user
  }
}

// 检查页面是否需要登录
const checkAuth = () => {
  const routeName = router.currentRoute.value?.name
  if (authRequiredPages.includes(routeName) && !session.value) {
    router.push('/login')
  }
}

// 路由守卫：每次路由变化检查登录状态
router.beforeEach(async (to) => {
  if (authRequiredPages.includes(to.name) && !session.value) {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    if (!currentSession) {
      return '/login'
    }
    session.value = currentSession
  }
  return true
})

// 提供全局状态给所有子组件
provide('user', user)
provide('session', session)
provide('loadUser', loadUser)

// 应用加载时检查登录状态
onMounted(async () => {
  await loadUser()

  supabase.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'PASSWORD_RECOVERY') {
      await loadUser()
      router.push('/password-reset')
    } else if (event === 'SIGNED_IN') {
      await loadUser()
    } else if (event === 'SIGNED_OUT') {
      session.value = null
      user.value = null
      checkAuth()
    }
  })
})
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <Layout>
        <router-view />
      </Layout>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  font-size: 16px;
  line-height: 1.5;
  /* 移动端滚动优化 */
  -webkit-overflow-scrolling: touch;
  /* 安全区域适配 */
  padding-bottom: env(safe-area-inset-bottom);
}

/* 全局响应式容器样式 */
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 15px;
}

/* 防止内容溢出 */
img, video, canvas, svg {
  max-width: 100%;
  height: auto;
}

/* 响应式字体大小 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }

  h1 {
    font-size: 1.8rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.3rem;
  }

  h4 {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  body {
    font-size: 13px;
  }

  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4 {
    font-size: 1rem;
  }
}

/* 通用按钮响应式样式 */
:root {
  --custom-border-radius: 8px;
  --custom-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --custom-border: 1px solid rgba(255, 255, 255, 0.1);
  --custom-color: #333;
  --custom-color-secondary: #666;
  --custom-color-brand: #3b82f6;
  --custom-color-brand-hover: #2563eb;
  --tab-bar-height: 56px;
  --header-height: 64px;
}

/* 确保所有组件都有合适的盒模型 */
* {
  box-sizing: border-box;
}

/* 移动端触摸优化 */
button, a, input, select, textarea {
  -webkit-tap-highlight-color: transparent;
}

/* 消除移动端 300ms 点击延迟 */
a, button, input[type="button"], input[type="submit"] {
  touch-action: manipulation;
}

/* 最小触摸区域 44x44px */
.n-button, button, a.nav-link, .tab-item {
  min-height: 44px;
  min-width: 44px;
}

/* 滚动条样式优化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 全屏弹窗样式（移动端） */
.mobile-fullscreen-modal {
  border-radius: 0 !important;
}

.mobile-fullscreen-modal .n-modal-content {
  border-radius: 0 !important;
  min-height: 100vh;
}

/* 移动端内容区底部留白（给 TabBar 留空间） */
@media (max-width: 768px) {
  .mobile-content-wrapper {
    padding-bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px) + 10px);
  }
}
</style>