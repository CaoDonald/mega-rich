/**
 * useAuth Composable - 认证相关逻辑
 */

import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // 计算属性
  const user = computed(() => authStore.user)
  const session = computed(() => authStore.session)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const loading = computed(() => authStore.loading)

  // 登录
  const login = async (email, password) => {
    const result = await authStore.login(email, password)

    if (result.success) {
      // 检查是否有重定向目标
      const redirect = router.currentRoute.value.query.redirect
      if (redirect) {
        router.push(redirect)
      } else {
        router.push({ name: 'home' })
      }
    }

    return result
  }

  // 注册
  const register = async (email, password, userData = {}) => {
    const result = await authStore.register(email, password, userData)

    if (result.success) {
      router.push({ name: 'login' })
    }

    return result
  }

  // 登出
  const logout = async () => {
    const result = await authStore.logout()

    if (result.success) {
      router.push({ name: 'home' })
    }

    return result
  }

  // 更新用户资料
  const updateProfile = async (updates) => {
    return await authStore.updateProfile(updates)
  }

  // 请求密码重置
  const requestPasswordReset = async (email) => {
    return await authStore.requestPasswordReset(email)
  }

  // 更新密码
  const updatePassword = async (newPassword) => {
    return await authStore.updatePassword(newPassword)
  }

  // 检查是否有权限
  const hasPermission = (permission) => {
    // 预留权限检查逻辑
    return isAuthenticated.value
  }

  return {
    // 状态
    user,
    session,
    isAuthenticated,
    loading,

    // 方法
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    updatePassword,
    hasPermission
  }
}
