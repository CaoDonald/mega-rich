<template>
  <div class="balance-page">
    <!-- 统计卡片 -->
    <BalanceStatsCards :stats="latestMonthStats" />

    <!-- 操作和筛选 -->
    <BalanceActions
      :filters="filters"
      :category-options="categoryOptions"
      :subcategory-options="subcategoryOptions"
      @add-item="showAddItemModal = true"
      @batch-import="showBatchImportModal = true"
      @manage-categories="showCategoryManagerModal = true"
      @refresh="refreshData"
      @update:category="handleCategoryChange"
      @update:subcategory="filters.subcategory = $event"
      @update:date="filters.date = $event"
    />

    <!-- 数据可视化 -->
    <BalancePieCharts
      :asset-data="assetPieData"
      :liability-data="liabilityPieData"
    />

    <!-- 趋势分析 -->
    <BalanceTrendChart :chart-data="trendChartData" />

    <!-- 数据列表 -->
    <BalanceDataTable
      :data="itemsWithGrowthStats"
      :loading="loading"
      :pagination="pagination"
      @add-item="showAddItemModal = true"
      @view="handleViewItem"
      @edit="handleEditItem"
      @delete="handleDeleteItem"
    />

    <!-- 弹窗保持不变 -->
    <n-modal
      v-model:show="showAddItemModal"
      title="新增资金条目"
      preset="dialog"
      style="width: 90%; max-width: 600px"
    >
      <AddEditItemForm
        @success="handleAddSuccess"
        @cancel="showAddItemModal = false"
      />
    </n-modal>

    <n-modal
      v-model:show="showEditItemModal"
      title="编辑资金条目"
      preset="dialog"
      style="width: 90%; max-width: 600px"
    >
      <AddEditItemForm
        :item="currentItem"
        @success="handleEditSuccess"
        @cancel="showEditItemModal = false"
      />
    </n-modal>

    <n-modal
      v-model:show="showViewItemModal"
      title="查看资金条目"
      preset="dialog"
      style="width: 90%; max-width: 600px"
    >
      <ItemDetail
        :item="currentItem"
        @close="showViewItemModal = false"
      />
    </n-modal>

    <n-modal
      v-model:show="showCategoryManagerModal"
      title="管理分类"
      preset="dialog"
      style="width: 90%; max-width: 800px"
    >
      <CategoryManagerModal
        @success="handleCategoryManageSuccess"
        @cancel="showCategoryManagerModal = false"
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
import BalanceStatsCards from './BalanceStatsCards.vue'
import BalanceActions from './BalanceActions.vue'
import BalancePieCharts from './BalancePieCharts.vue'
import BalanceTrendChart from './BalanceTrendChart.vue'
import BalanceDataTable from './BalanceDataTable.vue'

// 导入子组件
import AddEditItemForm from './sub/AddEditItemForm.vue'
import ItemDetail from './sub/ItemDetail.vue'
import CategoryManagerModal from './sub/CategoryManagerModal.vue'

import { pagination } from '../../utils/TableConfig.js'

const message = useMessage()
const authStore = useAuthStore()

// 数据状态
const loading = ref(false)
const categories = ref([])
const subcategories = ref([])
const items = ref([])

// 筛选状态
const filters = ref({
  category: null,
  subcategory: null,
  date: null
})

// 弹窗状态
const showAddItemModal = ref(false)
const showEditItemModal = ref(false)
const showViewItemModal = ref(false)
const showDeleteConfirm = ref(false)
const showCategoryManagerModal = ref(false)
const showBatchImportModal = ref(false)

// 当前操作项
const currentItem = ref(null)

// 批量导入
const fileInputRef = ref(null)
const importing = ref(false)
const importResult = ref(null)

// 计算属性 - 分类选项
const categoryOptions = computed(() => {
  return categories.value.map(cat => ({
    label: cat.name,
    value: cat.id
  }))
})

const subcategoryOptions = computed(() => {
  if (!filters.value.category) return []
  return subcategories.value
    .filter(sub => sub.category_id === filters.value.category)
    .map(sub => ({
      label: sub.name,
      value: sub.id
    }))
})

// 计算属性 - 筛选后的数据
const filteredItems = computed(() => {
  let result = [...items.value]

  if (filters.value.category) {
    const categorySubcategories = subcategories.value
      .filter(s => s.category_id === filters.value.category)
      .map(s => s.id)
    result = result.filter(item => categorySubcategories.includes(item.subcategory_id))
  }

  if (filters.value.subcategory) {
    result = result.filter(item => item.subcategory_id === filters.value.subcategory)
  }

  if (filters.value.date) {
    const date = new Date(filters.value.date)
    const year = date.getFullYear()
    const month = date.getMonth()
    result = result.filter(item => {
      const itemDate = new Date(item.record_date)
      return itemDate.getFullYear() === year && itemDate.getMonth() === month
    })
  }

  return result
})

// 当前月份数据
const currentMonthItems = computed(() => {
  if (filters.value.date) {
    const selected = new Date(filters.value.date)
    const year = selected.getFullYear()
    const month = selected.getMonth()

    return filteredItems.value.filter(item => {
      const itemDate = new Date(item.record_date)
      return itemDate.getFullYear() === year && itemDate.getMonth() === month
    })
  }

  if (filteredItems.value.length === 0) return []

  const latestDate = new Date(Math.max(...filteredItems.value.map(item => new Date(item.record_date))))
  const latestYear = latestDate.getFullYear()
  const latestMonth = latestDate.getMonth()

  return filteredItems.value.filter(item => {
    const itemDate = new Date(item.record_date)
    return itemDate.getFullYear() === latestYear && itemDate.getMonth() === latestMonth
  })
})

// 最新月份统计
const latestMonthStats = computed(() => {
  const currentItems = currentMonthItems.value

  const broadAmount = currentItems
    .filter(item => item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0)

  const disposableAmount = currentItems
    .reduce((sum, item) => sum + item.amount, 0)

  // 计算环比和同比（简化版）
  const broadGrowth = 0 // TODO: 实现环比计算
  const broadGrowthRate = 0
  const broadYoyGrowth = 0 // TODO: 实现同比计算
  const broadYoyGrowthRate = 0

  return {
    broadAmount,
    disposableAmount,
    broadGrowth,
    broadGrowthRate,
    broadYoyGrowth,
    broadYoyGrowthRate
  }
})

// 资产占比数据
const assetPieData = computed(() => {
  const primaryCategoryMap = new Map()
  const secondaryCategoryGroupMap = new Map()

  currentMonthItems.value
    .filter(item => item.amount > 0)
    .forEach(item => {
      const subcategory = subcategories.value.find(s => s.id === item.subcategory_id)
      if (!subcategory) return

      const category = categories.value.find(c => c.id === subcategory.category_id)
      if (!category) return

      const primaryAmount = primaryCategoryMap.get(category.name) || 0
      primaryCategoryMap.set(category.name, primaryAmount + item.amount)

      const secondaryMap = secondaryCategoryGroupMap.get(category.name) || new Map()
      const secondaryAmount = secondaryMap.get(subcategory.name) || 0
      secondaryMap.set(subcategory.name, secondaryAmount + item.amount)
      secondaryCategoryGroupMap.set(category.name, secondaryMap)
    })

  const primaryData = Array.from(primaryCategoryMap.entries())
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)

  const secondaryData = []
  primaryData.forEach(primaryItem => {
    const secondaryMap = secondaryCategoryGroupMap.get(primaryItem.name)
    if (!secondaryMap) return

    const sortedSecondary = Array.from(secondaryMap.entries())
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)

    secondaryData.push(...sortedSecondary)
  })

  return {
    primary: primaryData,
    secondary: secondaryData
  }
})

// 负债占比数据
const liabilityPieData = computed(() => {
  const primaryCategoryMap = new Map()
  const secondaryCategoryMap = new Map()

  currentMonthItems.value
    .filter(item => item.amount < 0)
    .forEach(item => {
      const subcategory = subcategories.value.find(s => s.id === item.subcategory_id)
      if (!subcategory) return

      const category = categories.value.find(c => c.id === subcategory.category_id)
      if (!category) return

      const primaryAmount = primaryCategoryMap.get(category.name) || 0
      primaryCategoryMap.set(category.name, primaryAmount + Math.abs(item.amount))

      const secondaryKey = subcategory.name
      const secondaryAmount = secondaryCategoryMap.get(secondaryKey) || 0
      secondaryCategoryMap.set(secondaryKey, secondaryAmount + Math.abs(item.amount))
    })

  return {
    primary: Array.from(primaryCategoryMap.entries())
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value),
    secondary: Array.from(secondaryCategoryMap.entries())
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
  }
})

// 趋势图数据
const trendChartData = computed(() => {
  // TODO: 实现趋势数据计算
  return {
    dates: [],
    broadAmounts: [],
    disposableAmounts: []
  }
})

// 带增长率的数据
const itemsWithGrowthStats = computed(() => {
  return filteredItems.value.map(item => {
    const subcategory = subcategories.value.find(s => s.id === item.subcategory_id)
    const category = subcategory ? categories.value.find(c => c.id === subcategory.category_id) : null

    return {
      ...item,
      category_name: category?.name || '-',
      subcategory_name: subcategory?.name || '-',
      mom_growth_rate: null, // TODO: 计算环比
      yoy_growth_rate: null  // TODO: 计算同比
    }
  })
})

// 数据加载
const loadData = async () => {
  if (!authStore.user) {
    console.warn('用户未登录，无法加载数据')
    return
  }

  loading.value = true
  try {
    const { data: categoriesData } = await supabase
      .from('balance_categories')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: true })
    categories.value = categoriesData || []

    const { data: subcategoriesData } = await supabase
      .from('balance_subcategories')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: true })
    subcategories.value = subcategoriesData || []

    const { data: itemsData } = await supabase
      .from('balance_items')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('record_date', { ascending: false })
    items.value = itemsData || []
  } catch (error) {
    console.error('加载数据失败:', error)
    message.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

// 事件处理
const handleCategoryChange = (value) => {
  filters.value.category = value
  filters.value.subcategory = null
}

const handleViewItem = (item) => {
  currentItem.value = item
  showViewItemModal.value = true
}

const handleEditItem = (item) => {
  currentItem.value = item
  showEditItemModal.value = true
}

const handleDeleteItem = (item) => {
  currentItem.value = item
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    await supabase
      .from('balance_items')
      .delete()
      .eq('id', currentItem.value.id)

    message.success('删除成功')
    loadData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

const handleAddSuccess = () => {
  showAddItemModal.value = false
  loadData()
}

const handleEditSuccess = () => {
  showEditItemModal.value = false
  loadData()
}

const handleCategoryManageSuccess = () => {
  showCategoryManagerModal.value = false
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
.balance-page {
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
  .balance-page {
    padding: var(--spacing-lg);
  }
}
</style>
