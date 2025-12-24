<script setup>
import { ref, provide, onMounted } from 'vue'
import Layout from './components/Layout.vue'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import ForgotPassword from './components/ForgotPassword.vue'
import PasswordReset from './components/PasswordReset.vue'
import Balance from './components/Balance.vue'
import Salary from './components/Salary.vue'
import UserSettings from './components/UserSettings.vue'
import { NMessageProvider } from 'naive-ui'
import { supabase } from './supabase'
import { NConfigProvider } from 'naive-ui'

  /**
   * js 文件下使用这个做类型提示
   * @type import('naive-ui').GlobalThemeOverrides
   */
  const themeOverrides = {
    Button: {
      round: true
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
const updateUser = async () => {
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

// 提供全局状态和方法给所有子组件
provide('navigateTo', navigateTo)
provide('currentPage', currentPage)
provide('user', user)
provide('session', session)
provide('updateUser', updateUser)

// 应用加载时检查URL路径和用户登录状态
onMounted(async () => {
  const path = window.location.pathname
  
  // 映射URL路径到页面名称
  const pathToPage = {
    '/login': 'login',
    '/register': 'register',
    '/forgot-password': 'forgot-password',
    '/password-reset': 'password-reset',
    '/balance': 'balance',
    '/salary': 'salary',
    '/user-settings': 'user-settings',
    '/home': 'home'
  }
  
  // 如果路径存在映射关系，则切换到对应的页面
  if (pathToPage[path]) {
    currentPage.value = pathToPage[path]
  }
  
  // 检查用户登录状态
  await updateUser()
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
}
</style>