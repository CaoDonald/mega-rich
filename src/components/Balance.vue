<template>
  <div class="balance-container">
    <h2>结余管理</h2>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <n-button type="primary" @click="showAddItemModal = true">
        <template #icon>
          <n-icon><AddOutline /></n-icon>
        </template>
        新增资金条目
      </n-button>
      <n-button @click="refreshData">
        <template #icon>
          <n-icon><RefreshOutline /></n-icon>
        </template>
        刷新数据
      </n-button>
    </div>
    
    <!-- 数据筛选 -->
    <div class="filter-section">
      <n-select
        v-model:value="selectedCategory"
        placeholder="选择一级分类"
        :options="categoryOptions"
        class="filter-select"
        @update:value="handleCategoryChange"
      />
      <n-select
        v-model:value="selectedSubcategory"
        placeholder="选择二级分类"
        :options="subcategoryOptions"
        class="filter-select"
        :disabled="!selectedCategory"
      />
      <n-date-picker
        v-model:value="selectedDate"
        type="month"
        placeholder="选择月份"
        class="filter-select"
      />
      <n-button @click="applyFilters">
        <template #icon>
          <n-icon><SearchOutline /></n-icon>
        </template>
        筛选
      </n-button>
    </div>
    
    <!-- 资金条目列表 -->
    <div class="items-list">
      <n-card>
        <n-data-table
          :columns="columns"
          :data="filteredItems"
          :pagination="{ pageSize: 10 }"
          :loading="loading"
          row-key="id"
        >
          <template #body-cell-actions="{ row }">
            <div class="actions-cell">
              <n-button
                type="primary"
                size="small"
                @click="handleViewItem(row)"
              >
                <template #icon>
                  <n-icon><EyeOutline /></n-icon>
                </template>
                查看
              </n-button>
              <n-button
                type="info"
                size="small"
                @click="handleEditItem(row)"
              >
                <template #icon>
                  <n-icon><CreateOutline /></n-icon>
                </template>
                编辑
              </n-button>
              <n-button
                type="error"
                size="small"
                @click="handleDeleteItem(row)"
              >
                <template #icon>
                  <n-icon><TrashOutline /></n-icon>
                </template>
                删除
              </n-button>
            </div>
          </template>
        </n-data-table>
      </n-card>
    </div>
    
    <!-- 统计信息 -->
    <div class="statistics-section">
      <n-card>
        <h3>统计信息</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <n-statistic label="总金额" :value="totalAmount" suffix="元" />
          </div>
          <div class="stat-item">
            <n-statistic label="同比增长率" :value="yoyGrowthRate" suffix="%" />
          </div>
          <div class="stat-item">
            <n-statistic label="环比增长率" :value="momGrowthRate" suffix="%" />
          </div>
        </div>
      </n-card>
    </div>
    
    <!-- 新增资金条目弹窗 -->
    <n-modal
      v-model:show="showAddItemModal"
      title="新增资金条目"
      preset="dialog"
      :destroy-on-close="true"
    >
      <AddEditItemForm
        :categories="categories"
        :subcategories="subcategories"
        @submit="handleAddItem"
        @cancel="showAddItemModal = false"
      />
    </n-modal>
    
    <!-- 编辑资金条目弹窗 -->
    <n-modal
      v-model:show="showEditItemModal"
      title="编辑资金条目"
      preset="dialog"
      :destroy-on-close="true"
    >
      <AddEditItemForm
        v-if="editingItem"
        :categories="categories"
        :subcategories="subcategories"
        :item="editingItem"
        @submit="handleUpdateItem"
        @cancel="showEditItemModal = false"
      />
    </n-modal>
    
    <!-- 查看资金条目详情弹窗 -->
    <n-modal
      v-model:show="showViewItemModal"
      title="资金条目详情"
      preset="dialog"
      :destroy-on-close="true"
    >
      <ItemDetail
        v-if="viewingItem"
        :item="viewingItem"
        :categories="categories"
        :subcategories="subcategories"
        @close="showViewItemModal = false"
      />
    </n-modal>
    
    <!-- 删除确认弹窗 -->
    <n-modal
      v-model:show="showDeleteConfirm"
      title="删除确认"
      preset="dialog"
      negative-text="取消"
      positive-text="删除"
      @positive-click="confirmDelete"
    >
      <div class="delete-confirm-content">
        <p>确定要删除这条资金条目吗？</p>
        <p class="item-info">金额：{{ deletingItem?.amount }}元</p>
        <p class="item-info">日期：{{ deletingItem?.record_date }}</p>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { useMessage, NIcon } from 'naive-ui'
import {
  AddOutline,
  RefreshOutline,
  SearchOutline,
  EyeOutline,
  CreateOutline,
  TrashOutline
} from '@vicons/ionicons5'
import AddEditItemForm from './AddEditItemForm.vue'
import ItemDetail from './ItemDetail.vue'

// 获取消息实例
const message = useMessage()

// 数据状态
const loading = ref(false)
const categories = ref([])
const subcategories = ref([])
const items = ref([])

// 筛选状态
const selectedCategory = ref(null)
const selectedSubcategory = ref(null)
const selectedDate = ref(null)

// 弹窗状态
const showAddItemModal = ref(false)
const showEditItemModal = ref(false)
const showViewItemModal = ref(false)
const showDeleteConfirm = ref(false)

// 当前操作的条目
const editingItem = ref(null)
const viewingItem = ref(null)
const deletingItem = ref(null)

// 计算属性
const categoryOptions = computed(() => {
  return categories.value.map(c => ({ label: c.name, value: c.id }))
})

const subcategoryOptions = computed(() => {
  if (!selectedCategory.value) {
    return subcategories.value.map(s => ({ label: s.name, value: s.id }))
  }
  return subcategories.value
    .filter(s => s.category_id === selectedCategory.value)
    .map(s => ({ label: s.name, value: s.id }))
})

const filteredItems = computed(() => {
  let result = [...items.value]
  
  // 按一级分类筛选
  if (selectedCategory.value) {
    const categorySubcategories = subcategories.value
      .filter(s => s.category_id === selectedCategory.value)
      .map(s => s.id)
    result = result.filter(item => categorySubcategories.includes(item.subcategory_id))
  }
  
  // 按二级分类筛选
  if (selectedSubcategory.value) {
    result = result.filter(item => item.subcategory_id === selectedSubcategory.value)
  }
  
  // 按月份筛选
  if (selectedDate.value) {
    const year = selectedDate.value.getFullYear()
    const month = selectedDate.value.getMonth()
    result = result.filter(item => {
      const itemDate = new Date(item.record_date)
      return itemDate.getFullYear() === year && itemDate.getMonth() === month
    })
  }
  
  // 按日期降序排序
  return result.sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
})

const totalAmount = computed(() => {
  return filteredItems.value.reduce((sum, item) => sum + item.amount, 0).toFixed(2)
})

const yoyGrowthRate = computed(() => {
  // 简单计算：使用最新条目的同比增长率
  const latestItem = filteredItems.value[0]
  return latestItem?.yoy_growth_rate || 0
})

const momGrowthRate = computed(() => {
  // 简单计算：使用最新条目的环比增长率
  const latestItem = filteredItems.value[0]
  return latestItem?.mom_growth_rate || 0
})

// 表格列配置
const columns = [
  {
    title: '一级分类',
    key: 'category',
    width: 120,
    render(row) {
      const subcategory = subcategories.value.find(s => s.id === row.subcategory_id)
      if (!subcategory) return ''
      const category = categories.value.find(c => c.id === subcategory.category_id)
      return category?.name || ''
    }
  },
  {
    title: '二级分类',
    key: 'subcategory',
    width: 120,
    render(row) {
      const subcategory = subcategories.value.find(s => s.id === row.subcategory_id)
      return subcategory?.name || ''
    }
  },
  {
    title: '金额',
    key: 'amount',
    width: 120,
    render(row) {
      return `${row.amount.toFixed(2)}元`
    }
  },
  {
    title: '记录日期',
    key: 'record_date',
    width: 150,
    render(row) {
      return new Date(row.record_date).toLocaleDateString()
    }
  },
  {
    title: '同比增长率',
    key: 'yoy_growth_rate',
    width: 120,
    render(row) {
      return `${row.yoy_growth_rate || 0}%`
    }
  },
  {
    title: '环比增长率',
    key: 'mom_growth_rate',
    width: 120,
    render(row) {
      return `${row.mom_growth_rate || 0}%`
    }
  },
  {
    title: '描述',
    key: 'description',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 加载一级分类
    const { data: categoriesData } = await supabase
      .from('balance_categories')
      .select('*')
      .order('created_at', { ascending: true })
    categories.value = categoriesData || []
    
    // 加载二级分类
    const { data: subcategoriesData } = await supabase
      .from('balance_subcategories')
      .select('*')
      .order('created_at', { ascending: true })
    subcategories.value = subcategoriesData || []
    
    // 加载资金条目
    const { data: itemsData } = await supabase
      .from('balance_items')
      .select('*')
      .order('record_date', { ascending: false })
    items.value = itemsData || []
    
    message.success('数据加载成功')
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

const handleCategoryChange = (value) => {
  selectedCategory.value = value
  selectedSubcategory.value = null
}

const applyFilters = () => {
  // 筛选逻辑已在computed属性中实现
}

const handleAddItem = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('balance_items')
      .insert({
        subcategory_id: formData.subcategory_id,
        amount: formData.amount,
        record_date: formData.record_date,
        description: formData.description
      })
      .select()
      .single()
    
    if (error) throw error
    
    items.value.unshift(data)
    showAddItemModal.value = false
    message.success('资金条目新增成功')
  } catch (error) {
    console.error('新增资金条目失败:', error)
    message.error('资金条目新增失败')
  }
}

const handleEditItem = (item) => {
  editingItem.value = { ...item }
  showEditItemModal.value = true
}

const handleUpdateItem = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('balance_items')
      .update({
        subcategory_id: formData.subcategory_id,
        amount: formData.amount,
        record_date: formData.record_date,
        description: formData.description
      })
      .eq('id', formData.id)
      .select()
      .single()
    
    if (error) throw error
    
    const index = items.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      items.value[index] = data
    }
    
    showEditItemModal.value = false
    editingItem.value = null
    message.success('资金条目更新成功')
  } catch (error) {
    console.error('更新资金条目失败:', error)
    message.error('资金条目更新失败')
  }
}

const handleViewItem = (item) => {
  viewingItem.value = { ...item }
  showViewItemModal.value = true
}

const handleDeleteItem = (item) => {
  deletingItem.value = { ...item }
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    const { error } = await supabase
      .from('balance_items')
      .delete()
      .eq('id', deletingItem.value.id)
    
    if (error) throw error
    
    items.value = items.value.filter(item => item.id !== deletingItem.value.id)
    showDeleteConfirm.value = false
    deletingItem.value = null
    message.success('资金条目删除成功')
  } catch (error) {
    console.error('删除资金条目失败:', error)
    message.error('资金条目删除失败')
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.balance-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-select {
  min-width: 150px;
}

.items-list {
  margin-bottom: 20px;
}

.statistics-section {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.actions-cell {
  display: flex;
  gap: 5px;
}

.form-container {
  max-width: 500px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.item-detail {
  max-width: 500px;
}

.detail-row {
  margin-bottom: 15px;
}

.detail-label {
  display: inline-block;
  width: 120px;
  font-weight: bold;
}

.detail-value {
  display: inline-block;
  vertical-align: top;
}

.item-info {
  color: #666;
  margin: 5px 0;
}

@media (max-width: 768px) {
  .balance-container {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>