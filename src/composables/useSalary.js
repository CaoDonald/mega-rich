/**
 * useSalary Composable - 月薪管理业务逻辑
 */

import { computed } from 'vue'
import { useSalaryStore } from '../stores/salary.js'
import { useAuthStore } from '../stores/auth.js'
import SupabaseService from '../services/SupabaseService.js'

export function useSalary() {
  const salaryStore = useSalaryStore()
  const authStore = useAuthStore()

  // 计算属性
  const records = computed(() => salaryStore.records)
  const totalIncome = computed(() => salaryStore.totalIncome)
  const averageSalary = computed(() => salaryStore.averageSalary)
  const incomeByYear = computed(() => salaryStore.incomeByYear)
  const incomeByMonth = computed(() => salaryStore.incomeByMonth)
  const recentMonths = computed(() => salaryStore.recentMonths)
  const loading = computed(() => salaryStore.loading)

  // 记录管理
  const loadRecords = async () => {
    if (!authStore.user) return

    salaryStore.loading = true
    try {
      const data = await SupabaseService.salaryRecords.list(authStore.user.id)
      salaryStore.setRecords(data)
    } catch (error) {
      console.error('加载月薪记录失败:', error)
      throw error
    } finally {
      salaryStore.loading = false
    }
  }

  const createRecord = async (record) => {
    if (!authStore.user) return

    try {
      const data = await SupabaseService.salaryRecords.create({
        ...record,
        user_id: authStore.user.id
      })
      salaryStore.addRecord(data)
      return { success: true, data }
    } catch (error) {
      console.error('创建月薪记录失败:', error)
      return { success: false, error: error.message }
    }
  }

  const updateRecord = async (id, updates) => {
    try {
      const data = await SupabaseService.salaryRecords.update(id, updates)
      salaryStore.updateRecord(id, data)
      return { success: true, data }
    } catch (error) {
      console.error('更新月薪记录失败:', error)
      return { success: false, error: error.message }
    }
  }

  const deleteRecord = async (id) => {
    try {
      await SupabaseService.salaryRecords.delete(id)
      salaryStore.removeRecord(id)
      return { success: true }
    } catch (error) {
      console.error('删除月薪记录失败:', error)
      return { success: false, error: error.message }
    }
  }

  const getRecordByMonth = (month) => {
    return salaryStore.getRecordByMonth(month)
  }

  return {
    // 状态
    records,
    totalIncome,
    averageSalary,
    incomeByYear,
    incomeByMonth,
    recentMonths,
    loading,

    // 方法
    loadRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecordByMonth
  }
}
