<template>
  <div class="salary-page">
    <!-- 统计卡片 -->
    <SalaryStatsCards :stats="statsData" />

    <!-- 操作和筛选 -->
    <SalaryActions
      :filters="filters"
      @add-record="showAddModal = true"
      @batch-import="showBatchImportModal = true"
      @refresh="refreshData"
      @update:type="filters.type = $event"
      @update:date="filters.date = $event"
      @update:timeRange="filters.timeRange = $event"
    />

    <!-- 趋势图 -->
    <SalaryTrendChart :chart-data="trendChartData" />

    <!-- 数据列表 -->
    <SalaryDataTable
      :data="filteredRecords"
      :loading="loading"
      :pagination="pagination"
      @add-record="showAddModal = true"
      @view="handleViewRecord"
      @edit="handleEditRecord"
      @delete="handleDeleteRecord"
    />

    <!-- 弹窗 -->
    <n-modal
      v-model:show="showAddModal"
      title="新增记录"
      preset="dialog"
      style="width: 90%; max-width: 600px"
    >
      <AddEditRecordForm
        @success="handleAddSuccess"
        @cancel="showAddModal = false"
      />
    </n-modal>

    <n-modal
      v-model:show="showEditModal"
      title="编辑记录"
      preset="dialog"
      style="width: 90%; max-width: 600px"
    >
      <AddEditRecordForm
        :record="currentRecord"
        @success="handleEditSuccess"
        @cancel="showEditModal = false"
      />
    </n-modal>

    <n-modal
      v-model:show="showViewModal"
      title="查看记录"
      preset="dialog"
      style="width: 90%; max-width: 600px"
    >
      <RecordDetail
        :record="currentRecord"
        @close="showViewModal = false"
      />
    </n-modal>

    <n-modal
      v-model:show="showBatchImportModal"
      title="批量导入"
      preset="dialog"
      style="width: 90%; max-width: 600px"
    >
      <div class="batch-import-content">
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx,.xls"
          style="display: none"
          @change="handleFileChange"
        />
        <n-button type="primary" @click="triggerFileInput" :loading="importing">
          选择 Excel 文件
        </n-button>
        <div v-if="importResult" class="import-result">
          <n-alert
            :type="importResult.success ? 'success' : 'error'"
            :title="importResult.success ? '导入成功' : '导入失败'"
          >
            {{ importResult.message }}
          </n-alert>
        </div>
      </div>
    </n-modal>

    <n-modal
      v-model:show="showDeleteConfirm"
      preset="dialog"
      title="确认删除"
      positive-text="确认"
      negative-text="取消"
      @positive-click="confirmDelete"
      @negative-click="showDeleteConfirm = false"
    >
      确定要删除这条记录吗？此操作不可恢复。
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NModal, NButton, NAlert, useMessage } from 'naive-ui'
import { useAuthStore } from '../../stores/auth.js'
import { supabase } from '../../supabase.js'
import * as XLSX from 'xlsx'

// 导入新组件
import SalaryStatsCards from './SalaryStatsCards.vue'
import SalaryActions from './SalaryActions.vue'
import SalaryTrendChart from './SalaryTrendChart.vue'
import SalaryDataTable from './SalaryDataTable.vue'

// 导入子组件
import AddEditRecordForm from './sub/AddEditRecordForm.vue'
import RecordDetail from './sub/RecordDetail.vue'

import { pagination } from '../../utils/TableConfig.js'

const message = useMessage()
const authStore = useAuthStore()

// 数据状态
const loading = ref(false)
const records = ref([])

// 筛选状态
const filters = ref({
  type: null,
  date: null,
  timeRange: 'all'
})

// 弹窗状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteConfirm = ref(false)
const showBatchImportModal = ref(false)

// 当前操作项
const currentRecord = ref(null)

// 批量导入
const fileInputRef = ref(null)
const importing = ref(false)
const importResult = ref(null)

// 计算属性 - 筛选后的记录
const filteredRecords = computed(() => {
  let result = [...records.value]

  // 按类型筛选
  if (filters.value.type) {
    result = result.filter(r => r.type === filters.value.type)
  }

  // 按月份筛选
  if (filters.value.date) {
    const date = new Date(filters.value.date)
    const year = date.getFullYear()
    const month = date.getMonth()
    result = result.filter(r => {
      const recordDate = new Date(r.record_date)
      return recordDate.getFullYear() === year && recordDate.getMonth() === month
    })
  }

  // 按时间范围筛选
  if (filters.value.timeRange !== 'all') {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    result = result.filter(r => {
      const recordDate = new Date(r.record_date)
      const recordYear = recordDate.getFullYear()
      const recordMonth = recordDate.getMonth()

      switch (filters.value.timeRange) {
        case 'this_year':
          return recordYear === currentYear
        case 'last_year':
          return recordYear === currentYear - 1
        case 'last_12_months':
          const monthsAgo12 = new Date(now)
          monthsAgo12.setMonth(monthsAgo12.getMonth() - 12)
          return recordDate >= monthsAgo12
        case 'last_3_years':
          return recordYear >= currentYear - 3 && recordYear < currentYear
        case 'last_36_months':
          const monthsAgo36 = new Date(now)
          monthsAgo36.setMonth(monthsAgo36.getMonth() - 36)
          return recordDate >= monthsAgo36
        default:
          return true
      }
    })
  }

  return result
})

// 统计数据
const statsData = computed(() => {
  const total = filteredRecords.value.reduce((sum, r) => sum + r.amount, 0)
  const count = filteredRecords.value.length
  const average = count > 0 ? total / count : 0

  // TODO: 实现环比和同比计算
  const momGrowth = 0
  const momGrowthRate = 0
  const yoyGrowth = 0
  const yoyGrowthRate = 0

  return {
    totalIncome: total,
    averageSalary: average,
    momGrowth,
    momGrowthRate,
    yoyGrowth,
    yoyGrowthRate
  }
})

// 趋势图数据
const trendChartData = computed(() => {
  // 按月份分组
  const monthlyData = new Map()

  filteredRecords.value.forEach(record => {
    const date = new Date(record.record_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyData.has(key)) {
      monthlyData.set(key, { salary: 0, bonus: 0, total: 0 })
    }

    const data = monthlyData.get(key)
    if (record.type === 'salary') {
      data.salary += record.amount
    } else if (record.type === 'bonus') {
      data.bonus += record.amount
    }
    data.total += record.amount
  })

  // 排序并转换为数组
  const sortedMonths = Array.from(monthlyData.keys()).sort()
  const months = sortedMonths
  const salaries = sortedMonths.map(m => monthlyData.get(m).salary)
  const bonuses = sortedMonths.map(m => monthlyData.get(m).bonus)
  const totals = sortedMonths.map(m => monthlyData.get(m).total)

  return {
    months,
    salaries,
    bonuses,
    totals
  }
})

// 数据加载
const loadData = async () => {
  if (!authStore.user) {
    console.warn('用户未登录，无法加载数据')
    return
  }

  loading.value = true
  try {
    const { data: recordsData, error } = await supabase
      .from('salary_records')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('record_date', { ascending: false })

    if (error) throw error
    records.value = recordsData || []
  } catch (error) {
    console.error('加载失败:', error)
    message.error('数据加载失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

// 事件处理
const handleViewRecord = (record) => {
  currentRecord.value = record
  showViewModal.value = true
}

const handleEditRecord = (record) => {
  currentRecord.value = record
  showEditModal.value = true
}

const handleDeleteRecord = (record) => {
  currentRecord.value = record
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    await supabase
      .from('salary_records')
      .delete()
      .eq('id', currentRecord.value.id)

    message.success('删除成功')
    loadData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

const handleAddSuccess = () => {
  showAddModal.value = false
  loadData()
}

const handleEditSuccess = () => {
  showEditModal.value = false
  loadData()
}

// 批量导入
const triggerFileInput = () => fileInputRef.value?.click()

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  e.target.value = ''
  await handleBatchImport(file)
}

const handleBatchImport = async (file) => {
  try {
    importing.value = true
    importResult.value = null
    message.loading('解析文件中...', { duration: 2000 })

    // TODO: 实现批量导入逻辑

    message.success('导入成功')
    importResult.value = { success: true, message: '成功导入数据' }
    loadData()
  } catch (error) {
    console.error('导入失败:', error)
    message.error('导入失败')
    importResult.value = { success: false, message: error.message }
  } finally {
    importing.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.salary-page {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.batch-import-content {
  padding: var(--spacing-lg);
}

.import-result {
  margin-top: var(--spacing-lg);
}

@media (max-width: 768px) {
  .salary-page {
    padding: var(--spacing-lg);
  }
}
</style>
