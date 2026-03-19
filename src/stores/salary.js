/**
 * Salary Store - 月薪管理状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSalaryStore = defineStore('salary', () => {
  // 状态
  const records = ref([])
  const loading = ref(false)

  // 计算属性 - 总收入
  const totalIncome = computed(() => {
    return records.value.reduce((sum, record) => {
      return sum + (record.base_salary || 0) + (record.bonus || 0)
    }, 0)
  })

  // 平均月薪
  const averageSalary = computed(() => {
    if (records.value.length === 0) return 0
    return totalIncome.value / records.value.length
  })

  // 按年统计
  const incomeByYear = computed(() => {
    const stats = {}

    records.value.forEach(record => {
      if (!record.salary_month) return

      const year = record.salary_month.substring(0, 4) // YYYY
      if (!stats[year]) {
        stats[year] = {
          year,
          totalBaseSalary: 0,
          totalBonus: 0,
          total: 0,
          months: 0,
          records: []
        }
      }

      const baseSalary = record.base_salary || 0
      const bonus = record.bonus || 0

      stats[year].totalBaseSalary += baseSalary
      stats[year].totalBonus += bonus
      stats[year].total += baseSalary + bonus
      stats[year].months += 1
      stats[year].records.push(record)
    })

    return Object.values(stats).sort((a, b) => b.year.localeCompare(a.year))
  })

  // 按月统计
  const incomeByMonth = computed(() => {
    return records.value
      .map(record => ({
        month: record.salary_month,
        baseSalary: record.base_salary || 0,
        bonus: record.bonus || 0,
        total: (record.base_salary || 0) + (record.bonus || 0),
        record
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
  })

  // 最近12个月统计
  const recentMonths = computed(() => {
    return incomeByMonth.value.slice(0, 12)
  })

  // 记录方法
  const setRecords = (data) => {
    records.value = data
  }

  const addRecord = (record) => {
    records.value.unshift(record)
  }

  const updateRecord = (id, updates) => {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
      records.value[index] = { ...records.value[index], ...updates }
    }
  }

  const removeRecord = (id) => {
    records.value = records.value.filter(r => r.id !== id)
  }

  const getRecordByMonth = (month) => {
    return records.value.find(r => r.salary_month === month)
  }

  // 重置状态
  const $reset = () => {
    records.value = []
    loading.value = false
  }

  return {
    // 状态
    records,
    loading,

    // 计算属性
    totalIncome,
    averageSalary,
    incomeByYear,
    incomeByMonth,
    recentMonths,

    // 方法
    setRecords,
    addRecord,
    updateRecord,
    removeRecord,
    getRecordByMonth,
    $reset
  }
})
