/**
 * useBalance Composable - 结余管理业务逻辑
 */

import { computed } from 'vue'
import { useBalanceStore } from '../stores/balance.js'
import { useAuthStore } from '../stores/auth.js'
import SupabaseService from '../services/SupabaseService.js'

export function useBalance() {
  const balanceStore = useBalanceStore()
  const authStore = useAuthStore()

  // 计算属性
  const categories = computed(() => balanceStore.categories)
  const subcategories = computed(() => balanceStore.subcategories)
  const items = computed(() => balanceStore.items)
  const totalBalance = computed(() => balanceStore.totalBalance)
  const balanceByCategory = computed(() => balanceStore.balanceByCategory)
  const balanceByMonth = computed(() => balanceStore.balanceByMonth)
  const loading = computed(() => balanceStore.loading)

  // 分类管理
  const loadCategories = async () => {
    if (!authStore.user) return

    balanceStore.loading = true
    try {
      const data = await SupabaseService.balanceCategories.list(authStore.user.id)
      balanceStore.setCategories(data)
    } catch (error) {
      console.error('加载分类失败:', error)
      throw error
    } finally {
      balanceStore.loading = false
    }
  }

  const createCategory = async (category) => {
    if (!authStore.user) return

    try {
      const data = await SupabaseService.balanceCategories.create({
        ...category,
        user_id: authStore.user.id
      })
      balanceStore.addCategory(data)
      return { success: true, data }
    } catch (error) {
      console.error('创建分类失败:', error)
      return { success: false, error: error.message }
    }
  }

  const updateCategory = async (id, updates) => {
    try {
      const data = await SupabaseService.balanceCategories.update(id, updates)
      balanceStore.updateCategory(id, data)
      return { success: true, data }
    } catch (error) {
      console.error('更新分类失败:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteCategory = async (id) => {
    try {
      await SupabaseService.balanceCategories.delete(id)
      balanceStore.removeCategory(id)
      return { success: true }
    } catch (error) {
      console.error('删除分类失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 子分类管理
  const loadSubcategories = async (categoryId = null) => {
    if (!authStore.user) return

    balanceStore.loading = true
    try {
      const data = await SupabaseService.balanceSubcategories.list(authStore.user.id, categoryId)
      balanceStore.setSubcategories(data)
    } catch (error) {
      console.error('加载子分类失败:', error)
      throw error
    } finally {
      balanceStore.loading = false
    }
  }

  const createSubcategory = async (subcategory) => {
    if (!authStore.user) return

    try {
      const data = await SupabaseService.balanceSubcategories.create({
        ...subcategory,
        user_id: authStore.user.id
      })
      balanceStore.addSubcategory(data)
      return { success: true, data }
    } catch (error) {
      console.error('创建子分类失败:', error)
      return { success: false, error: error.message }
    }
  }

  const updateSubcategory = async (id, updates) => {
    try {
      const data = await SupabaseService.balanceSubcategories.update(id, updates)
      balanceStore.updateSubcategory(id, data)
      return { success: true, data }
    } catch (error) {
      console.error('更新子分类失败:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteSubcategory = async (id) => {
    try {
      await SupabaseService.balanceSubcategories.delete(id)
      balanceStore.removeSubcategory(id)
      return { success: true }
    } catch (error) {
      console.error('删除子分类失败:', error)
      return { success: false, error: error.message }
    }
  }

  const getSubcategoriesByCategory = (categoryId) => {
    return balanceStore.getSubcategoriesByCategory(categoryId)
  }

  // 条目管理
  const loadItems = async (filters = {}) => {
    if (!authStore.user) return

    balanceStore.loading = true
    try {
      const data = await SupabaseService.balanceItems.list(authStore.user.id, filters)
      balanceStore.setItems(data)
    } catch (error) {
      console.error('加载条目失败:', error)
      throw error
    } finally {
      balanceStore.loading = false
    }
  }

  const createItem = async (item) => {
    if (!authStore.user) return

    try {
      const data = await SupabaseService.balanceItems.create({
        ...item,
        user_id: authStore.user.id
      })
      balanceStore.addItem(data)
      return { success: true, data }
    } catch (error) {
      console.error('创建条目失败:', error)
      return { success: false, error: error.message }
    }
  }

  const updateItem = async (id, updates) => {
    try {
      const data = await SupabaseService.balanceItems.update(id, updates)
      balanceStore.updateItem(id, data)
      return { success: true, data }
    } catch (error) {
      console.error('更新条目失败:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteItem = async (id) => {
    try {
      await SupabaseService.balanceItems.delete(id)
      balanceStore.removeItem(id)
      return { success: true }
    } catch (error) {
      console.error('删除条目失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 加载所有数据
  const loadAll = async () => {
    await Promise.all([
      loadCategories(),
      loadSubcategories(),
      loadItems()
    ])
  }

  return {
    // 状态
    categories,
    subcategories,
    items,
    totalBalance,
    balanceByCategory,
    balanceByMonth,
    loading,

    // 分类方法
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // 子分类方法
    loadSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getSubcategoriesByCategory,

    // 条目方法
    loadItems,
    createItem,
    updateItem,
    deleteItem,

    // 工具方法
    loadAll
  }
}
