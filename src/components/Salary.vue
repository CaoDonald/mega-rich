<template>
  <div class="salary-container">
    <h2>月薪管理</h2>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <n-icon><AddOutline /></n-icon>
        </template>
        新增记录
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
        v-model:value="selectedType"
        placeholder="选择记录类型"
        :options="typeOptions"
        class="filter-select"
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
    
    <!-- 数据列表 -->
    <div class="records-list">
      <n-card>
        <n-data-table
          :columns="columns"
          :data="filteredRecords"
          :loading="loading"
          :row-key="row => row.id"
        >
          <template #body-cell-actions="{ row }">
            <div class="actions-cell">
              <n-button
                type="primary"
                size="small"
                @click="handleViewRecord(row)"
              >
                <template #icon>
                  <n-icon><EyeOutline /></n-icon>
                </template>
                查看
              </n-button>
              <n-button
                type="info"
                size="small"
                @click="handleEditRecord(row)"
              >
                <template #icon>
                  <n-icon><CreateOutline /></n-icon>
                </template>
                编辑
              </n-button>
              <n-button
                type="error"
                size="small"
                @click="handleDeleteRecord(row)"
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
            <n-statistic label="月薪平均" :value="averageSalary" suffix="元" />
          </div>
          <div class="stat-item">
            <n-statistic label="年终奖平均" :value="averageBonus" suffix="元" />
          </div>
        </div>
      </n-card>
    </div>
    
    <!-- 新增记录弹窗 -->
    <n-modal
      v-model:show="showAddModal"
      title="新增月薪记录"
      preset="dialog"
      :destroy-on-close="true"
    >
      <AddEditRecordForm
        @submit="handleAddRecord"
        @cancel="showAddModal = false"
      />
    </n-modal>
    
    <!-- 编辑记录弹窗 -->
    <n-modal
      v-model:show="showEditModal"
      title="编辑月薪记录"
      preset="dialog"
      :destroy-on-close="true"
    >
      <AddEditRecordForm
        v-if="editingRecord"
        :record="editingRecord"
        @submit="handleUpdateRecord"
        @cancel="showEditModal = false"
      />
    </n-modal>
    
    <!-- 查看记录详情弹窗 -->
    <n-modal
      v-model:show="showViewModal"
      title="月薪记录详情"
      preset="dialog"
      :destroy-on-close="true"
    >
      <RecordDetail
        v-if="viewingRecord"
        :item="viewingRecord"
        @close="showViewModal = false"
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
        <p>确定要删除这条记录吗？</p>
        <p class="record-info">金额：{{ deletingRecord?.amount }}元</p>
        <p class="record-info">类型：{{ getRecordTypeLabel(deletingRecord?.type) }}</p>
        <p class="record-info">日期：{{ deletingRecord?.record_date }}</p>
      </div>
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
  TrashOutline
} from '@vicons/ionicons5'
import AddEditRecordForm from './AddEditRecordForm.vue'
import RecordDetail from './RecordDetail.vue'

// 获取消息实例
const message = useMessage()

// 数据状态
const loading = ref(false)
const records = ref([])

// 筛选状态
const selectedType = ref(null)
const selectedDate = ref(null)

// 弹窗状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteConfirm = ref(false)

// 当前操作的记录
const editingRecord = ref(null)
const viewingRecord = ref(null)
const deletingRecord = ref(null)

// 计算属性
const typeOptions = [
  { label: '所有类型', value: null },
  { label: '月薪', value: 'salary' },
  { label: '年终奖', value: 'bonus' }
]

const filteredRecords = computed(() => {
  let result = [...records.value]
  
  // 按类型筛选
  if (selectedType.value) {
    result = result.filter(record => record.type === selectedType.value)
  }
  
  // 按月份筛选
  if (selectedDate.value) {
    const year = selectedDate.value.getFullYear()
    const month = selectedDate.value.getMonth()
    result = result.filter(record => {
      const recordDate = new Date(record.record_date)
      return recordDate.getFullYear() === year && recordDate.getMonth() === month
    })
  }
  
  // 按日期降序排序
  return result.sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
})

const totalAmount = computed(() => {
  return filteredRecords.value.reduce((sum, record) => sum + record.amount, 0).toFixed(2)
})

const averageSalary = computed(() => {
  const salaryRecords = filteredRecords.value.filter(record => record.type === 'salary')
  if (salaryRecords.length === 0) return 0
  const total = salaryRecords.reduce((sum, record) => sum + record.amount, 0)
  return (total / salaryRecords.length).toFixed(2)
})

const averageBonus = computed(() => {
  const bonusRecords = filteredRecords.value.filter(record => record.type === 'bonus')
  if (bonusRecords.length === 0) return 0
  const total = bonusRecords.reduce((sum, record) => sum + record.amount, 0)
  return (total / bonusRecords.length).toFixed(2)
})

// 表格列配置
const columns = [
  {
    title: '记录类型',
    key: 'type',
    width: 120,
    render(row) {
      return getRecordTypeLabel(row.type)
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
    const { data: recordsData } = await supabase
      .from('salary_records')
      .select('*')
      .order('record_date', { ascending: false })
    records.value = recordsData || []
    
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

const applyFilters = () => {
  // 筛选逻辑已在computed属性中实现
}

const handleAddRecord = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('salary_records')
      .insert({
        amount: formData.amount,
        type: formData.type,
        record_date: formData.record_date,
        description: formData.description
      })
      .select()
      .single()
    
    if (error) throw error
    
    records.value.unshift(data)
    showAddModal.value = false
    message.success('记录新增成功')
  } catch (error) {
    console.error('新增记录失败:', error)
    message.error('记录新增失败')
  }
}

const handleEditRecord = (record) => {
  editingRecord.value = { ...record }
  showEditModal.value = true
}

const handleUpdateRecord = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('salary_records')
      .update({
        amount: formData.amount,
        type: formData.type,
        record_date: formData.record_date,
        description: formData.description
      })
      .eq('id', formData.id)
      .select()
      .single()
    
    if (error) throw error
    
    const index = records.value.findIndex(record => record.id === formData.id)
    if (index !== -1) {
      records.value[index] = data
    }
    
    showEditModal.value = false
    editingRecord.value = null
    message.success('记录更新成功')
  } catch (error) {
    console.error('更新记录失败:', error)
    message.error('记录更新失败')
  }
}

const handleViewRecord = (record) => {
  viewingRecord.value = { ...record }
  showViewModal.value = true
}

const handleDeleteRecord = (record) => {
  deletingRecord.value = { ...record }
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    const { error } = await supabase
      .from('salary_records')
      .delete()
      .eq('id', deletingRecord.value.id)
    
    if (error) throw error
    
    records.value = records.value.filter(record => record.id !== deletingRecord.value.id)
    showDeleteConfirm.value = false
    deletingRecord.value = null
    message.success('记录删除成功')
  } catch (error) {
    console.error('删除记录失败:', error)
    message.error('记录删除失败')
  }
}

const getRecordTypeLabel = (type) => {
  return type === 'salary' ? '月薪' : '年终奖'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.salary-container {
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

.records-list {
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

.record-detail {
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

.record-info {
  color: #666;
  margin: 5px 0;
}

@media (max-width: 768px) {
  .salary-container {
    padding: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .filter-select {
    min-width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>