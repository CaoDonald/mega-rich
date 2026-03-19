/**
 * Auth Store - 用户认证状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase.js'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const initialized = ref(false) // 标记认证状态是否已初始化

  // 计算属性
  const isAuthenticated = computed(() => !!session.value)

  // 初始化认证状态
  const initialize = async () => {
    // 如果已经初始化过，直接返回
    if (initialized.value) {
      return
    }

    loading.value = true
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (currentSession) {
        session.value = currentSession
        await loadUserProfile(currentSession.user.id)
      }

      // 标记初始化完成
      initialized.value = true
    } catch (error) {
      console.error('初始化认证状态失败:', error)
      // 即使失败也标记为已初始化，避免无限重试
      initialized.value = true
    } finally {
      loading.value = false
    }
  }

  // 加载用户资料
  const loadUserProfile = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      user.value = profile ? { ...session.value.user, ...profile } : session.value.user
    } catch (error) {
      console.error('加载用户资料失败:', error)
      user.value = session.value.user
    }
  }

  // 登录
  const login = async (email, password) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      session.value = data.session
      await loadUserProfile(data.user.id)

      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (email, password, userData = {}) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      session.value = null
      // 注意：不重置 initialized，因为登出不等于未初始化

      // 清理其他 store 的数据
      const { useFundStore } = await import('./fund.js')
      const { useBalanceStore } = await import('./balance.js')
      const { useSalaryStore } = await import('./salary.js')

      useFundStore().$reset()
      useBalanceStore().$reset()
      useSalaryStore().$reset()

      return { success: true }
    } catch (error) {
      console.error('登出失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 更新用户资料
  const updateProfile = async (updates) => {
    loading.value = true
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.value.id)

      if (error) throw error

      // 重新加载用户资料
      await loadUserProfile(user.value.id)

      return { success: true }
    } catch (error) {
      console.error('更新用户资料失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 重置密码请求
  const requestPasswordReset = async (email) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('请求密码重置失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 更新密码
  const updatePassword = async (newPassword) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('更新密码失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    user,
    session,
    loading,
    initialized,
    isAuthenticated,

    // 方法
    initialize,
    loadUserProfile,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
    updatePassword
  }
})
