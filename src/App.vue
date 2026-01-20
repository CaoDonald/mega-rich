<script setup>
import { ref, provide, onMounted,watch } from 'vue'
import Layout from './components/Layout.vue'
import Home from './components/Home.vue'
import Login from './components/auth/Login.vue'
import Register from './components/auth/Register.vue'
import ForgotPassword from './components/auth/ForgotPassword.vue'
import PasswordReset from './components/auth/PasswordReset.vue'
import Balance from './components/balance/Balance.vue'
import Salary from './components/salary/Salary.vue'
import UserSettings from './components/auth/UserSettings.vue'
import Invest from './components/invest/Invest.vue'
import { NMessageProvider } from 'naive-ui'
import { supabase } from './supabase'
import { NConfigProvider } from 'naive-ui'

  /**
   * js 文件下使用这个做类型提示
   * @type import('naive-ui').GlobalThemeOverrides
   */
  const themeOverrides = {
    Button: {
    }
  }

// 页面切换状态管理
const currentPage = ref('home')

// 全局用户状态管理
const user = ref(null)
const session = ref(null)

// 页面切换方法
const navigateTo = (page) => {
  currentPage.value = page
}

// 更新用户信息的方法
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

watch(currentPage, (newPage) => {
  checkLoginRequired(newPage)
})

// 检查页面是否需要登录
const checkLoginRequired = (page = currentPage.value) => {
  // 不需要登录的页面列表
  const noLoginRequired = ['login', 'register', 'forgot-password', 'password-reset', 'home']

  // 如果页面需要登录且用户未登录，则跳转到登录页面
  if (!noLoginRequired.includes(page) && !session.value) {
    navigateTo('login')
  }
}

// 提供全局状态和方法给所有子组件
provide('navigateTo', navigateTo)
provide('currentPage', currentPage)
provide('user', user)
provide('session', session)
provide('loadUser', loadUser)

// 应用加载时检查URL路径和用户登录状态
onMounted(async () => {
  // 检查用户登录状态
  await loadUser()

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      // 密码重置成功
      loadUser()
      navigateTo('password-reset')
    } else if (event === 'SIGNED_IN') {
      // 用户登录成功
      loadUser()
    } else if (event === 'SIGNED_OUT') {
      // 用户登出
      checkLoginRequired()
    }
  })
})
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <Layout>
        <!-- 根据当前页面状态显示不同组件 -->
        <Home v-if="currentPage === 'home'" />
        <Login v-else-if="currentPage === 'login'" />
        <Register v-else-if="currentPage === 'register'" />
        <ForgotPassword v-else-if="currentPage === 'forgot-password'" />
        <PasswordReset v-else-if="currentPage === 'password-reset'" />
        <Balance v-else-if="currentPage === 'balance'" />
        <Salary v-else-if="currentPage === 'salary'" />
        <Invest v-else-if="currentPage === 'invest'" />
        <UserSettings v-else-if="currentPage === 'user-settings'" />
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
}

/* 确保所有组件都有合适的盒模型 */
* {
  box-sizing: border-box;
}

/* 移动端触摸优化 */
button, a, input, select, textarea {
  -webkit-tap-highlight-color: transparent;
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
</style>