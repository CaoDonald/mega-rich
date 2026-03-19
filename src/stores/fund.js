/**
 * Fund Store - 基金数据状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFundStore = defineStore('fund', () => {
  // 持仓数据
  const holdings = ref([])
  const holdingsLoading = ref(false)

  // 交易记录
  const transactions = ref([])
  const transactionsLoading = ref(false)

  // 关注列表
  const watchlist = ref([])
  const watchlistLoading = ref(false)

  // 定投计划
  const plans = ref([])
  const plansLoading = ref(false)

  // 净值历史缓存
  const navHistoryCache = ref({})

  // 计算属性 - 资产汇总
  const totalAssets = computed(() => {
    return holdings.value.reduce((sum, holding) => {
      return sum + (holding.current_nav || 0) * (holding.shares || 0)
    }, 0)
  })

  const totalCost = computed(() => {
    return holdings.value.reduce((sum, holding) => {
      return sum + (holding.avg_cost || 0) * (holding.shares || 0)
    }, 0)
  })

  const totalProfit = computed(() => {
    return totalAssets.value - totalCost.value
  })

  const totalProfitRate = computed(() => {
    return totalCost.value > 0 ? (totalProfit.value / totalCost.value) * 100 : 0
  })

  const todayProfit = computed(() => {
    return holdings.value.reduce((sum, holding) => {
      return sum + (holding.today_change || 0) * (holding.shares || 0)
    }, 0)
  })

  // 持仓数据方法
  const setHoldings = (data) => {
    holdings.value = data
  }

  const addHolding = (holding) => {
    holdings.value.push(holding)
  }

  const updateHolding = (id, updates) => {
    const index = holdings.value.findIndex(h => h.id === id)
    if (index !== -1) {
      holdings.value[index] = { ...holdings.value[index], ...updates }
    }
  }

  const removeHolding = (id) => {
    holdings.value = holdings.value.filter(h => h.id !== id)
  }

  // 交易记录方法
  const setTransactions = (data) => {
    transactions.value = data
  }

  const addTransaction = (transaction) => {
    transactions.value.unshift(transaction)
  }

  const updateTransaction = (id, updates) => {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transactions.value[index] = { ...transactions.value[index], ...updates }
    }
  }

  const removeTransaction = (id) => {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  // 关注列表方法
  const setWatchlist = (data) => {
    watchlist.value = data
  }

  const addToWatchlist = (fund) => {
    watchlist.value.push(fund)
  }

  const removeFromWatchlist = (fundCode) => {
    watchlist.value = watchlist.value.filter(f => f.fund_code !== fundCode)
  }

  const isInWatchlist = (fundCode) => {
    return watchlist.value.some(f => f.fund_code === fundCode)
  }

  // 定投计划方法
  const setPlans = (data) => {
    plans.value = data
  }

  const addPlan = (plan) => {
    plans.value.push(plan)
  }

  const updatePlan = (id, updates) => {
    const index = plans.value.findIndex(p => p.id === id)
    if (index !== -1) {
      plans.value[index] = { ...plans.value[index], ...updates }
    }
  }

  const removePlan = (id) => {
    plans.value = plans.value.filter(p => p.id !== id)
  }

  // 净值历史缓存方法
  const setNavHistory = (fundCode, data) => {
    navHistoryCache.value[fundCode] = {
      data,
      timestamp: Date.now()
    }
  }

  const getNavHistory = (fundCode) => {
    const cached = navHistoryCache.value[fundCode]
    if (!cached) return null

    // 缓存有效期 24 小时
    const isValid = Date.now() - cached.timestamp < 24 * 60 * 60 * 1000
    return isValid ? cached.data : null
  }

  // 重置状态
  const $reset = () => {
    holdings.value = []
    transactions.value = []
    watchlist.value = []
    plans.value = []
    navHistoryCache.value = {}
    holdingsLoading.value = false
    transactionsLoading.value = false
    watchlistLoading.value = false
    plansLoading.value = false
  }

  return {
    // 状态
    holdings,
    holdingsLoading,
    transactions,
    transactionsLoading,
    watchlist,
    watchlistLoading,
    plans,
    plansLoading,
    navHistoryCache,

    // 计算属性
    totalAssets,
    totalCost,
    totalProfit,
    totalProfitRate,
    todayProfit,

    // 方法
    setHoldings,
    addHolding,
    updateHolding,
    removeHolding,
    setTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    setWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    setPlans,
    addPlan,
    updatePlan,
    removePlan,
    setNavHistory,
    getNavHistory,
    $reset
  }
})
