<template>
  <div class="salary-container">
    <h2>月薪管理</h2>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <n-icon>
            <AddOutline/>
          </n-icon>
        </template>
        新增记录
      </n-button>
      <n-button type="success" @click="showBatchImportModal = true">
        <template #icon>
          <n-icon>
            <CloudUploadOutline/>
          </n-icon>
        </template>
        批量导入
      </n-button>
      <n-button @click="refreshData">
        <template #icon>
          <n-icon>
            <RefreshOutline/>
          </n-icon>
        </template>
        刷新数据
      </n-button>
    </div>

    <!-- 数据筛选 -->
    <div class="filter-section">
      <n-select
          clearable
          v-model:value="selectedType"
          placeholder="选择记录类型"
          :options="typeOptions"
          class="filter-select"
      />
      <n-date-picker
          clearable
          v-model:value="selectedDate"
          type="month"
          placeholder="选择月份"
          class="filter-select"
      />
      <n-button @click="applyFilters">
        <template #icon>
          <n-icon>
            <SearchOutline/>
          </n-icon>
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
        />
      </n-card>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-section">
      <n-card>
        <h3>统计信息</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <n-statistic label="总金额" :value="totalAmount" suffix="元"/>
          </div>
          <div class="stat-item">
            <n-statistic label="月薪平均" :value="averageSalary" suffix="元"/>
          </div>
          <div class="stat-item">
            <n-statistic label="年终奖平均" :value="averageBonus" suffix="元"/>
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
        <p class="record-info">类型：{{ deletingRecord?.type }}</p>
        <p class="record-info">日期：{{ deletingRecord?.record_date }}</p>
      </div>
    </n-modal>

    <!-- 批量导入弹窗 -->
    <n-modal
        v-model:show="showBatchImportModal"
        title="批量导入月薪记录"
        preset="dialog"
        :destroy-on-close="true"
    >
      <div class="batch-import-container">
        <div class="import-info">
          <p>请上传CSV或Excel格式的文件，文件应包含以下列：</p>
          <ul>
            <li><strong>amount</strong>: 金额（数字）</li>
            <li><strong>type</strong>: 类型（salary/月薪 或 bonus/年终奖）</li>
            <li><strong>record_date</strong>: 记录日期（YYYY-MM-DD）</li>
            <li><strong>description</strong>: 描述（可选）</li>
          </ul>
        </div>

        <div class="file-upload-section">
          <input
              ref="fileInputRef"
              type="file"
              accept=".csv,.xlsx,.xls"
              style="display: none"
              @change="handleFileChange"
          />

          <div class="upload-buttons-wrapper">
            <n-button
                type="primary"
                size="small"
                :loading="importing"
                @click="triggerFileInput"
            >
              {{ importing ? '解析中...' : '选择CSV/Excel文件' }}
            </n-button>

            <n-button
                type="info"
                size="small"
                @click="downloadTemplate"
            >
              下载Excel模板
            </n-button>
          </div>
        </div>

        <div v-if="importResult" class="import-result">
          <n-alert
              :type="importResult.success ? 'success' : 'error'"
              :title="importResult.success ? '导入成功' : '导入失败'"
              :description="importResult.message"
              show-icon
          />
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, h} from 'vue'
import {supabase} from '../supabase'
import {
  NButton,
  NCard,
  NDataTable,
  NSelect,
  NDatePicker,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NAlert,
  NStatistic,
  NIcon,
  useMessage
} from 'naive-ui'
import * as XLSX from 'xlsx'
import {
  AddOutline,
  RefreshOutline,
  SearchOutline,
  EyeOutline,
  CreateOutline,
  TrashOutline,
  CloudUploadOutline
} from '@vicons/ionicons5'

import AddEditRecordForm from './AddEditRecordForm.vue'
import RecordDetail from './RecordDetail.vue'

// 基础状态
const message = useMessage()
const loading = ref(false)
const records = ref([])
const selectedType = ref(null)
const selectedDate = ref(null)

// 弹窗状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showDeleteConfirm = ref(false)
const showBatchImportModal = ref(false)

// 操作记录
const editingRecord = ref(null)
const viewingRecord = ref(null)
const deletingRecord = ref(null)

// 批量导入
const fileInputRef = ref(null)
const importResult = ref(null)
const importing = ref(false)

// 计算属性
const typeOptions = [
  {label: '所有类型', value: null},
  {label: '月薪', value: 'salary'},
  {label: '年终奖', value: 'bonus'}
]

const filteredRecords = computed(() => {
  let result = [...records.value]
  if (selectedType.value) {
    result = result.filter(record => record.type === selectedType.value)
  }
  if (selectedDate.value) {
    const selectedDateObj = selectedDate.value instanceof Date ? selectedDate.value : new Date(selectedDate.value)
    if (!isNaN(selectedDateObj.getTime())) {
      const year = selectedDateObj.getFullYear()
      const month = selectedDateObj.getMonth()
      result = result.filter(record => {
        const recordDate = new Date(record.record_date)
        return recordDate.getFullYear() === year && recordDate.getMonth() === month
      })
    }
  }
  return result.sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
})

const totalAmount = computed(() => {
  return filteredRecords.value.reduce((sum, record) => sum + record.amount, 0).toFixed(2)
})

const averageSalary = computed(() => {
  const salaryRecords = filteredRecords.value.filter(record => record.type === 'salary')
  return salaryRecords.length === 0 ? 0 : (salaryRecords.reduce((sum, r) => sum + r.amount, 0) / salaryRecords.length).toFixed(2)
})

const averageBonus = computed(() => {
  const bonusRecords = filteredRecords.value.filter(record => record.type === 'bonus')
  return bonusRecords.length === 0 ? 0 : (bonusRecords.reduce((sum, r) => sum + r.amount, 0) / bonusRecords.length).toFixed(2)
})

// 表格列配置（核心：操作列用render函数实现）
const columns = [
  {
    title: '记录类型',
    key: 'type',
    width: 120
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
    ellipsis: {tooltip: true}
  },
  {
    title: '操作',
    key: 'actions',
    width: 150, // 纯图标列宽可更小
    fixed: 'right',
    render(row) {
      return h('div', { class: 'actions-cell' }, [
        // 查看图标按钮（原生 div + NIcon）
        h('div', {
          class: 'icon-btn icon-btn-primary',
          onClick: () => {
            viewingRecord.value = { ...row }
            showViewModal.value = true
          },
          title: '查看记录' // 悬浮提示
        }, [
          h(NIcon, { size: 18 }, { default: () => h(EyeOutline) })
        ]),
        // 编辑图标按钮
        h('div', {
          class: 'icon-btn icon-btn-info',
          onClick: () => {
            editingRecord.value = { ...row }
            showEditModal.value = true
          },
          title: '编辑记录'
        }, [
          h(NIcon, { size: 18 }, { default: () => h(CreateOutline) })
        ]),
        // 删除图标按钮
        h('div', {
          class: 'icon-btn icon-btn-error',
          onClick: () => {
            deletingRecord.value = { ...row }
            showDeleteConfirm.value = true
          },
          title: '删除记录'
        }, [
          h(NIcon, { size: 18 }, { default: () => h(TrashOutline) })
        ])
      ])
    }
  }]

// 数据加载
const loadData = async () => {
  loading.value = true
  try {
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) {
      message.error('请先登录')
      loading.value = false
      // 模拟数据（测试用：如果登录失败，手动加测试数据）
      records.value = [
        {id: 1, amount: 15000, type: 'salary', record_date: '2025-12-01', description: '测试月薪'},
        {id: 2, amount: 60000, type: 'bonus', record_date: '2025-12-20', description: '测试年终奖'}
      ]
      return
    }
    const {data: recordsData, error} = await supabase
        .from('salary_records')
        .select('*')
        .eq('user_id', user.id)
        .order('record_date', {ascending: false})
    if (error) throw error
    records.value = recordsData || []
  } catch (error) {
    console.error('加载失败:', error)
    message.error('数据加载失败: ' + error.message)
    // 兜底测试数据
    records.value = [
      {id: 1, amount: 15000, type: 'salary', record_date: '2025-12-01', description: '测试月薪'},
      {id: 2, amount: 60000, type: 'bonus', record_date: '2025-12-20', description: '测试年终奖'}
    ]
  } finally {
    loading.value = false
  }
}

// 工具方法
const refreshData = () => loadData()
const applyFilters = () => console.log('筛选:', selectedType.value, selectedDate.value)

const handleAddRecord = async (formData) => {
  try {
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) {
      message.error('请先登录')
      return
    }
    const {data, error} = await supabase
        .from('salary_records')
        .insert({...formData, user_id: user.id})
        .select()
        .single()
    if (error) throw error
    records.value.unshift(data)
    showAddModal.value = false
    message.success('新增成功')
  } catch (error) {
    console.error('新增失败:', error)
    message.error('新增失败: ' + error.message)
  }
}

const handleUpdateRecord = async (formData) => {
  try {
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) {
      message.error('请先登录')
      return
    }
    const {data, error} = await supabase
        .from('salary_records')
        .update({
          amount: formData.amount,
          type: formData.type,
          record_date: formData.record_date,
          description: formData.description
        })
        .eq('id', formData.id)
        .eq('user_id', user.id)
        .select()
        .single()
    if (error) throw error
    const index = records.value.findIndex(r => r.id === formData.id)
    if (index !== -1) records.value[index] = data
    showEditModal.value = false
    editingRecord.value = null
    message.success('更新成功')
  } catch (error) {
    console.error('更新失败:', error)
    message.error('更新失败: ' + error.message)
  }
}

const confirmDelete = async () => {
  try {
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) {
      message.error('请先登录')
      return
    }
    const {error} = await supabase
        .from('salary_records')
        .delete()
        .eq('id', deletingRecord.value.id)
        .eq('user_id', user.id)
    if (error) throw error
    records.value = records.value.filter(r => r.id !== deletingRecord.value.id)
    showDeleteConfirm.value = false
    deletingRecord.value = null
    message.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败: ' + error.message)
  }
}

// 批量导入相关
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
    message.loading('解析文件中...', {duration: 2000})

    let records
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'csv') {
      const content = await readFile(file)
      records = parseCSV(content)
    } else if (['xlsx', 'xls'].includes(ext)) {
      records = await parseExcel(file)
    } else {
      throw new Error('仅支持csv/xlsx/xls格式')
    }

    if (!records || records.length === 0) throw new Error('文件无数据')
    const validRecords = validateRecords(records)
    await batchInsertRecords(validRecords)
    await loadData()

    importResult.value = {
      success: true,
      message: `成功导入 ${validRecords.length} 条记录`
    }
    message.success(`导入成功：${validRecords.length} 条`)
    setTimeout(() => {
      showBatchImportModal.value = false
      importResult.value = null
    }, 2000)
  } catch (error) {
    console.error('导入失败:', error)
    importResult.value = {
      success: false,
      message: error.message
    }
    message.error('导入失败: ' + error.message)
  } finally {
    importing.value = false
  }
}

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

const parseCSV = (content) => {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 1) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  return lines.slice(1).map((line, i) => {
    const values = line.split(',').map(v => v.trim())
    const record = {}
    headers.forEach((h, j) => record[h] = values[j] || '')
    return record
  })
}

const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, {type: 'array'})
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        let json = XLSX.utils.sheet_to_json(worksheet)
        json = json.map(item => {
          const normalized = {}
          Object.keys(item).forEach(key => normalized[key.trim().toLowerCase()] = item[key])
          return normalized
        })
        resolve(json)
      } catch (error) {
        reject(new Error('Excel解析失败: ' + error.message))
      }
    }
    reader.onerror = () => reject(new Error('Excel读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

const validateRecords = (records) => {
  const valid = []
  records.forEach((record, i) => {
    const errors = []
    const rowNum = i + 2

    // 验证金额
    const amount = record.amount ? parseFloat(record.amount.toString().trim()) : NaN
    if (isNaN(amount) || amount <= 0) errors.push(`金额必须是正数（第${rowNum}行）`)

    // 验证类型
    let type = record.type ? record.type.toString().trim().toLowerCase() : ''
    if (type === '月薪') type = 'salary'
    if (type === '年终奖') type = 'bonus'
    if (!['salary', 'bonus'].includes(type)) errors.push(`类型无效（第${rowNum}行）`)

    // 验证日期
    let recordDate = record.record_date
    if (recordDate && typeof recordDate === 'number') {
      recordDate = XLSX.SSF.format('yyyy-mm-dd', recordDate)
    }
    recordDate = recordDate ? recordDate.toString().trim() : ''
    if (!recordDate || isNaN(Date.parse(recordDate))) errors.push(`日期无效（第${rowNum}行）`)

    if (errors.length === 0) {
      valid.push({
        amount,
        type,
        record_date: recordDate,
        description: (record.description || '').toString().trim()
      })
    } else {
      message.warning(`第${rowNum}行：${errors.join('；')}`)
    }
  })
  if (valid.length === 0) throw new Error('无有效记录')
  return valid
}

const batchInsertRecords = async (records) => {
  const {data: {user}, error: authError} = await supabase.auth.getUser()
  if (authError || !user) throw new Error('请先登录')

  const recordsWithUserId = records.map(r => ({...r, user_id: user.id}))
  const batchSize = 50
  for (let i = 0; i < recordsWithUserId.length; i += batchSize) {
    const batch = recordsWithUserId.slice(i, i + batchSize)
    const {error} = await supabase.from('salary_records').insert(batch)
    if (error) throw new Error('插入失败: ' + error.message)
  }
}

const downloadTemplate = () => {
  const templateData = [
    {amount: 10000, type: 'salary', record_date: '2025-12-01', description: '12月月薪'},
    {amount: 50000, type: 'bonus', record_date: '2025-12-20', description: '2025年终奖'}
  ]
  const ws = XLSX.utils.json_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '月薪记录模板')
  XLSX.writeFile(wb, '月薪记录导入模板.xlsx')
  message.success('模板下载成功')
}

// 初始化
onMounted(() => {
  console.log('组件挂载，加载数据')
  loadData()
})
</script>

<style scoped>
.salary-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  min-height: calc(100vh - 120px);
}

.salary-container h2 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 30px 0;
  color: #333;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  justify-content: flex-end;
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.filter-select {
  min-width: 180px;
  flex: 1;
  max-width: 250px;
}

.records-list {
  margin-bottom: 30px;
}

.records-list :deep(.n-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

/* 强制显示操作列按钮 */
:deep(.actions-cell) {
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 4px !important;
  width: 100% !important;
}

:deep(.actions-cell .n-button) {
  display: inline-flex !important;
  opacity: 1 !important;
}

.statistics-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
}

.stat-item {
  text-align: center;
  padding: 25px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.batch-import-container {
  max-width: 500px;
  margin: 0 auto;
}

.import-info {
  margin-bottom: 25px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.file-upload-section {
  margin-bottom: 25px;
  text-align: center;
}

.upload-buttons-wrapper {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.delete-confirm-content {
  padding: 20px 0;
}

.record-info {
  color: #666;
  margin: 8px 0;
  font-size: 0.9rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .salary-container {
    padding: 20px 15px;
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

  :deep(.actions-cell) {
    flex-direction: column;
    gap: 5px !important;
  }
}
/* 操作列容器 */
:deep(.actions-cell) {
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 8px !important; /* 图标按钮间距 */
  width: 100% !important;
  padding: 4px 0;
}

/* 通用图标按钮样式 */
:deep(.icon-btn) {
  width: 32px;
  height: 32px;
  border-radius: 50%; /* 圆形 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

/* 主色调（查看） */
:deep(.icon-btn-primary) {
  color:#18a058;
}
:deep(.icon-btn-primary:hover) {
  background-color: #14874b;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.3);
  transform: scale(1.05);
}

/* 信息色（编辑） */
:deep(.icon-btn-info) {
  color: #2080f0;
}
:deep(.icon-btn-info:hover) {
  background-color: #1870e0;
  box-shadow: 0 2px 8px rgba(32, 128, 240, 0.3);
  transform: scale(1.05);
}

/* 错误色（删除） */
:deep(.icon-btn-error) {
  color: #f53f3f;
}
:deep(.icon-btn-error:hover) {
  background-color: #e03535;
  box-shadow: 0 2px 8px rgba(245, 63, 63, 0.3);
  transform: scale(1.05);
}

/* 点击反馈 */
:deep(.icon-btn:active) {
  transform: scale(0.95);
}
</style>