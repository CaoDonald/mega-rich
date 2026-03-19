<script setup>
import { onMounted } from 'vue'
import { NMessageProvider, NConfigProvider } from 'naive-ui'
import { useAuthStore } from './stores/auth.js'
import { useRouter } from 'vue-router'
import { supabase } from './supabase'
import themeOverrides from './design/theme.js'

const authStore = useAuthStore()
const router = useRouter()

// 应用加载时初始化认证状态
onMounted(async () => {
  // 初始化认证状态
  await authStore.initialize()

  // 监听认证状态变化
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      // 密码重置
      await authStore.initialize()
      router.push({ name: 'password-reset' })
    } else if (event === 'SIGNED_IN') {
      // 用户登录成功
      await authStore.initialize()
    } else if (event === 'SIGNED_OUT') {
      // 用户登出
      authStore.user = null
      authStore.session = null
      router.push({ name: 'home' })
    }
  })
})
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<style>
@import './design/global.css';
</style>