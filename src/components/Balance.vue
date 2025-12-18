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
      <n-button @click="showCategoryManagerModal = true">
        <template #icon>
          <n-icon><ListOutline /></n-icon>
        </template>
        管理分类
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
           :row-key="row => row.id"
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
        @manage-categories="showCategoryManagerModal = true"
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
        @manage-categories="showCategoryManagerModal = true"
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
    
    <!-- 分类管理弹窗 -->
    <n-modal
      v-model:show="showCategoryManagerModal"
      title="分类管理"
      preset="dialog"
      :destroy-on-close="true"
      :width="800"
    >
      <CategoryManagerModal
        :primary-categories="categories"
        :secondary-categories="subcategories"
        @update:primary-categories="handlePrimaryCategoriesUpdate"
        @update:secondary-categories="handleSecondaryCategoriesUpdate"
      />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { useMessage } from 'naive-ui'
import {
  AddOutline,
  RefreshOutline,
  SearchOutline,
  EyeOutline,
  CreateOutline,
  TrashOutline,
  ListOutline
} from '@vicons/ionicons5'
import AddEditItemForm from './AddEditItemForm.vue'
import ItemDetail from './ItemDetail.vue'
import CategoryManagerModal from './CategoryManagerModal.vue'

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
const showCategoryManagerModal = ref(false)

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
    
    //message.success('数据加载成功')
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

const handlePrimaryCategoriesUpdate = async (updatedCategories) => {
  try {
    // 找出新增的分类
    const newCategories = updatedCategories.filter(c => 
      !categories.value.some(existing => existing.id === c.id)
    )
    
    // 找出修改的分类
    const updatedExistingCategories = updatedCategories.filter(c => 
      categories.value.some(existing => existing.id === c.id && existing.name !== c.name)
    )
    
    // 找出删除的分类
    const deletedCategories = categories.value.filter(c => 
      !updatedCategories.some(updated => updated.id === c.id)
    )
    
    // 执行新增操作
    for (const category of newCategories) {
      const { error } = await supabase
        .from('balance_categories')
        .insert({
          name: category.name,
          description: category.description
        })
        .select()
        .single()
      
      if (error) throw error
    }
    
    // 执行更新操作
    for (const category of updatedExistingCategories) {
      const { error } = await supabase
        .from('balance_categories')
        .update({
          name: category.name,
          description: category.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id)
      
      if (error) throw error
    }
    
    // 执行删除操作
    for (const category of deletedCategories) {
      const { error } = await supabase
        .from('balance_categories')
        .delete()
        .eq('id', category.id)
      
      if (error) throw error
    }
    
    // 更新本地状态
    categories.value = updatedCategories
    message.success('一级分类管理成功')
  } catch (error) {
    console.error('管理一级分类失败:', error)
    message.error('管理一级分类失败')
    // 刷新数据以恢复一致性
    loadData()
  }
}

const handleSecondaryCategoriesUpdate = async (updatedSubcategories) => {
  try {
    // 找出新增的分类
    const newSubcategories = updatedSubcategories.filter(s => 
      !subcategories.value.some(existing => existing.id === s.id)
    )
    
    // 找出修改的分类
    const updatedExistingSubcategories = updatedSubcategories.filter(s => 
      subcategories.value.some(existing => existing.id === s.id && (existing.name !== s.name || existing.category_id !== s.category_id))
    )
    
    // 找出删除的分类
    const deletedSubcategories = subcategories.value.filter(s => 
      !updatedSubcategories.some(updated => updated.id === s.id)
    )
    
    // 执行新增操作
    for (const subcategory of newSubcategories) {
      const { error } = await supabase
        .from('balance_subcategories')
        .insert({
          category_id: subcategory.category_id,
          name: subcategory.name,
          description: subcategory.description
        })
        .select()
        .single()
      
      if (error) throw error
    }
    
    // 执行更新操作
    for (const subcategory of updatedExistingSubcategories) {
      const { error } = await supabase
        .from('balance_subcategories')
        .update({
          category_id: subcategory.category_id,
          name: subcategory.name,
          description: subcategory.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', subcategory.id)
      
      if (error) throw error
    }
    
    // 执行删除操作
    for (const subcategory of deletedSubcategories) {
      const { error } = await supabase
        .from('balance_subcategories')
        .delete()
        .eq('id', subcategory.id)
      
      if (error) throw error
    }
    
    // 更新本地状态
    subcategories.value = updatedSubcategories
    message.success('二级分类管理成功')
  } catch (error) {
    console.error('管理二级分类失败:', error)
    message.error('管理二级分类失败')
    // 刷新数据以恢复一致性
    loadData()
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
  padding: 30px 20px;
  min-height: calc(100vh - 120px);
}

.balance-container h2 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 30px 0;
  color: var(--custom-color);
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: flex-end;
}

.action-buttons :deep(.n-button) {
  transition: all 0.3s ease;
  border-radius: var(--custom-border-radius);
  font-weight: 500;
}

.action-buttons :deep(.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-buttons :deep(.n-button:active) {
  transform: translateY(0);
}

.action-buttons :deep(.n-button--primary) {
  background-color: var(--custom-color-brand);
  border-color: var(--custom-color-brand);
}

.action-buttons :deep(.n-button--primary:hover) {
  background-color: var(--custom-color-brand-hover);
  border-color: var(--custom-color-brand-hover);
}

.filter-section :deep(.n-button) {
  transition: all 0.3s ease;
  border-radius: var(--custom-border-radius);
  font-weight: 500;
}

.filter-section :deep(.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.filter-section :deep(.n-button:active) {
  transform: translateY(0);
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: center;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--custom-border-radius);
  border: var(--custom-border);
}

.filter-select {
  min-width: 180px;
  flex: 1;
  max-width: 250px;
}

.items-list {
  margin-bottom: 30px;
}

.items-list :deep(.n-card) {
  border-radius: var(--custom-border-radius);
  box-shadow: var(--custom-box-shadow);
  border: var(--custom-border);
  overflow: hidden;
}

.items-list :deep(.n-data-table) {
  font-size: 0.95rem;
}

.items-list :deep(.n-data-table-thead) {
  background-color: rgba(255, 255, 255, 0.08);
}

.items-list :deep(.n-data-table-thead-th) {
  font-weight: 600;
  color: var(--custom-color);
  padding: 12px 16px;
  border-bottom: 2px solid var(--custom-color-secondary);
}

.items-list :deep(.n-data-table-tbody-td) {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.items-list :deep(.n-data-table-tbody-tr:hover) {
  background-color: rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s ease;
}

.items-list :deep(.n-data-table-td) {
  color: var(--custom-color);
}

.items-list :deep(.n-pagination) {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.statistics-section {
  margin-bottom: 30px;
}

.statistics-section :deep(.n-card) {
  border-radius: var(--custom-border-radius);
  box-shadow: var(--custom-box-shadow);
  border: var(--custom-border);
  padding: 25px;
}

.statistics-section h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 25px 0;
  color: var(--custom-color);
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
}

.stat-item {
  text-align: center;
  padding: 25px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: var(--custom-border-radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-item:hover {
  background-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-item :deep(.n-statistic-label) {
  color: var(--custom-color-secondary);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.stat-item :deep(.n-statistic-value) {
  color: var(--custom-color-brand);
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-item :deep(.n-statistic-suffix) {
  color: var(--custom-color);
  font-size: 1.2rem;
  font-weight: 500;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.item-detail {
  max-width: 500px;
  margin: 0 auto;
}

.detail-row {
  margin-bottom: 20px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.detail-label {
  display: inline-block;
  width: 120px;
  font-weight: bold;
  color: var(--custom-color-secondary);
}

.detail-value {
  display: inline-block;
  vertical-align: top;
  color: var(--custom-color);
}

.item-info {
  color: var(--custom-color-secondary);
  margin: 8px 0;
  font-size: 0.9rem;
}

.delete-confirm-content {
  padding: 20px 0;
}

@media (max-width: 768px) {
  .balance-container {
    padding: 20px 15px;
  }
  
  .balance-container h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }
  
  .filter-select {
    width: 100%;
    max-width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .statistics-section :deep(.n-card) {
    padding: 15px;
  }
  
  .actions-cell {
    flex-direction: column;
    align-items: center;
  }
  
  .detail-label {
    display: block;
    width: 100%;
    margin-bottom: 5px;
  }
}
</style>