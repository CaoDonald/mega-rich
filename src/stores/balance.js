/**
 * Balance Store - 结余管理状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBalanceStore = defineStore('balance', () => {
  // 状态
  const categories = ref([])
  const subcategories = ref([])
  const items = ref([])
  const loading = ref(false)

  // 计算属性 - 总结余
  const totalBalance = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.amount || 0), 0)
  })

  // 按分类统计
  const balanceByCategory = computed(() => {
    const stats = {}

    items.value.forEach(item => {
      const categoryId = item.category_id
      if (!stats[categoryId]) {
        const category = categories.value.find(c => c.id === categoryId)
        stats[categoryId] = {
          categoryId,
          categoryName: category?.name || '未知分类',
          total: 0,
          items: []
        }
      }
      stats[categoryId].total += item.amount || 0
      stats[categoryId].items.push(item)
    })

    return Object.values(stats)
  })

  // 按月统计
  const balanceByMonth = computed(() => {
    const stats = {}

    items.value.forEach(item => {
      if (!item.record_date) return

      const month = item.record_date.substring(0, 7) // YYYY-MM
      if (!stats[month]) {
        stats[month] = {
          month,
          total: 0,
          items: []
        }
      }
      stats[month].total += item.amount || 0
      stats[month].items.push(item)
    })

    return Object.values(stats).sort((a, b) => b.month.localeCompare(a.month))
  })

  // 分类方法
  const setCategories = (data) => {
    categories.value = data
  }

  const addCategory = (category) => {
    categories.value.push(category)
  }

  const updateCategory = (id, updates) => {
    const index = categories.value.findIndex(c => c.id === id)
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...updates }
    }
  }

  const removeCategory = (id) => {
    categories.value = categories.value.filter(c => c.id !== id)
  }

  // 子分类方法
  const setSubcategories = (data) => {
    subcategories.value = data
  }

  const addSubcategory = (subcategory) => {
    subcategories.value.push(subcategory)
  }

  const updateSubcategory = (id, updates) => {
    const index = subcategories.value.findIndex(s => s.id === id)
    if (index !== -1) {
      subcategories.value[index] = { ...subcategories.value[index], ...updates }
    }
  }

  const removeSubcategory = (id) => {
    subcategories.value = subcategories.value.filter(s => s.id !== id)
  }

  const getSubcategoriesByCategory = (categoryId) => {
    return subcategories.value.filter(s => s.category_id === categoryId)
  }

  // 条目方法
  const setItems = (data) => {
    items.value = data
  }

  const addItem = (item) => {
    items.value.unshift(item)
  }

  const updateItem = (id, updates) => {
    const index = items.value.findIndex(i => i.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates }
    }
  }

  const removeItem = (id) => {
    items.value = items.value.filter(i => i.id !== id)
  }

  // 重置状态
  const $reset = () => {
    categories.value = []
    subcategories.value = []
    items.value = []
    loading.value = false
  }

  return {
    // 状态
    categories,
    subcategories,
    items,
    loading,

    // 计算属性
    totalBalance,
    balanceByCategory,
    balanceByMonth,

    // 方法
    setCategories,
    addCategory,
    updateCategory,
    removeCategory,
    setSubcategories,
    addSubcategory,
    updateSubcategory,
    removeSubcategory,
    getSubcategoriesByCategory,
    setItems,
    addItem,
    updateItem,
    removeItem,
    $reset
  }
})
