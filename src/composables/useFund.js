/**
 * useFund Composable - 基金业务逻辑
 */

import { computed } from 'vue'
import { useFundStore } from '../stores/fund.js'
import { useAuthStore } from '../stores/auth.js'
import SupabaseService from '../services/SupabaseService.js'
import * as FundApi from '../utils/FundApi.js'

export function useFund() {
  const fundStore = useFundStore()
  const authStore = useAuthStore()

  // 计算属性
  const holdings = computed(() => fundStore.holdings)
  const transactions = computed(() => fundStore.transactions)
  const watchlist = computed(() => fundStore.watchlist)
  const plans = computed(() => fundStore.plans)
  const totalAssets = computed(() => fundStore.totalAssets)
  const totalProfit = computed(() => fundStore.totalProfit)
  const totalProfitRate = computed(() => fundStore.totalProfitRate)
  const todayProfit = computed(() => fundStore.todayProfit)

  // 持仓管理
  const loadHoldings = async () => {
    if (!authStore.user) return

    fundStore.holdingsLoading = true
    try {
      const data = await SupabaseService.fundHoldings.list(authStore.user.id)
      fundStore.setHoldings(data)
    } catch (error) {
      console.error('加载持仓失败:', error)
      throw error
    } finally {
      fundStore.holdingsLoading = false
    }
  }

  const createHolding = async (holding) => {
    if (!authStore.user) return

    try {
      const data = await SupabaseService.fundHoldings.create({
        ...holding,
        user_id: authStore.user.id
      })
      fundStore.addHolding(data)
      return { success: true, data }
    } catch (error) {
      console.error('创建持仓失败:', error)
      return { success: false, error: error.message }
    }
  }

  const updateHolding = async (id, updates) => {
    try {
      const data = await SupabaseService.fundHoldings.update(id, updates)
      fundStore.updateHolding(id, data)
      return { success: true, data }
    } catch (error) {
      console.error('更新持仓失败:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteHolding = async (id) => {
    try {
      await SupabaseService.fundHoldings.delete(id)
      fundStore.removeHolding(id)
      return { success: true }
    } catch (error) {
      console.error('删除持仓失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 交易记录管理
  const loadTransactions = async (filters = {}) => {
    if (!authStore.user) return

    fundStore.transactionsLoading = true
    try {
      const data = await SupabaseService.fundTransactions.list(authStore.user.id, filters)
      fundStore.setTransactions(data)
    } catch (error) {
      console.error('加载交易记录失败:', error)
      throw error
    } finally {
      fundStore.transactionsLoading = false
    }
  }

  const createTransaction = async (transaction) => {
    if (!authStore.user) return

    try {
      const data = await SupabaseService.fundTransactions.create({
        ...transaction,
        user_id: authStore.user.id
      })
      fundStore.addTransaction(data)
      return { success: true, data }
    } catch (error) {
      console.error('创建交易记录失败:', error)
      return { success: false, error: error.message }
    }
  }

  const updateTransaction = async (id, updates) => {
    try {
      const data = await SupabaseService.fundTransactions.update(id, updates)
      fundStore.updateTransaction(id, data)
      return { success: true, data }
    } catch (error) {
      console.error('更新交易记录失败:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteTransaction = async (id) => {
    try {
      await SupabaseService.fundTransactions.delete(id)
      fundStore.removeTransaction(id)
      return { success: true }
    } catch (error) {
      console.error('删除交易记录失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 关注列表管理
  const loadWatchlist = async () => {
    if (!authStore.user) return

    fundStore.watchlistLoading = true
    try {
      const data = await SupabaseService.fundWatchlist.list(authStore.user.id)
      fundStore.setWatchlist(data)
    } catch (error) {
      console.error('加载关注列表失败:', error)
      throw error
    } finally {
      fundStore.watchlistLoading = false
    }
  }

  const addToWatchlist = async (fundCode, fundName) => {
    if (!authStore.user) return

    try {
      const data = await SupabaseService.fundWatchlist.add({
        user_id: authStore.user.id,
        fund_code: fundCode,
        fund_name: fundName
      })
      fundStore.addToWatchlist(data)
      return { success: true, data }
    } catch (error) {
      console.error('添加关注失败:', error)
      return { success: false, error: error.message }
    }
  }

  const removeFromWatchlist = async (fundCode) => {
    if (!authStore.user) return

    try {
      await SupabaseService.fundWatchlist.remove(authStore.user.id, fundCode)
      fundStore.removeFromWatchlist(fundCode)
      return { success: true }
    } catch (error) {
      console.error('取消关注失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 基金搜索
  const searchFund = async (keyword) => {
    try {
      const result = await FundApi.fundSearchInfoByName(keyword)
      return result
    } catch (error) {
      console.error('搜索基金失败:', error)
      throw error
    }
  }

  // 获取基金详情
  const getFundDetail = async (fundCode) => {
    try {
      const result = await FundApi.fundMNDetailInformation(fundCode)
      return result
    } catch (error) {
      console.error('获取基金详情失败:', error)
      throw error
    }
  }

  // 获取基金净值
  const getFundNav = async (fundCode) => {
    try {
      // 先尝试从缓存获取
      const cached = fundStore.getNavHistory(fundCode)
      if (cached) return cached

      // 从 API 获取
      const result = await FundApi.fundVPageDiagram(fundCode)

      // 缓存到 store
      if (result && result.data) {
        fundStore.setNavHistory(fundCode, result.data)
      }

      return result
    } catch (error) {
      console.error('获取基金净值失败:', error)
      throw error
    }
  }

  // 同步持仓净值
  const syncHoldingsNav = async () => {
    if (!holdings.value || holdings.value.length === 0) return

    try {
      for (const holding of holdings.value) {
        const navData = await getFundNav(holding.fund_code)
        if (navData && navData.data && navData.data.length > 0) {
          const latestNav = navData.data[0]
          await updateHolding(holding.id, {
            current_nav: latestNav.nav,
            last_sync_at: new Date().toISOString()
          })
        }
      }
      return { success: true }
    } catch (error) {
      console.error('同步净值失败:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    // 状态
    holdings,
    transactions,
    watchlist,
    plans,
    totalAssets,
    totalProfit,
    totalProfitRate,
    todayProfit,

    // 持仓方法
    loadHoldings,
    createHolding,
    updateHolding,
    deleteHolding,

    // 交易方法
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // 关注列表方法
    loadWatchlist,
    addToWatchlist,
    removeFromWatchlist,

    // 基金查询方法
    searchFund,
    getFundDetail,
    getFundNav,
    syncHoldingsNav
  }
}
