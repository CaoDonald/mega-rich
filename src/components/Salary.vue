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
      <n-button type="success" @click="showBatchImportModal = true">
        <template #icon>
          <n-icon><CloudUploadOutline /></n-icon>
        </template>
        批量导入
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
          <!-- 修复：使用原生input + 按钮触发，确保100%触发 -->
          <input
              ref="fileInputRef"
              type="file"
              accept=".csv,.xlsx,.xls"
              style="display: none"
              @change="handleFileChange"
          />

          <!-- 新增按钮容器，用flex布局控制间距 -->
          <div class="upload-buttons-wrapper">
            <n-button
                round
                type="primary"
                size="small"
                :loading="importing"
                @click="triggerFileInput"
            >
              {{ importing ? '解析中...' : '选择CSV/Excel文件' }}
            </n-button>

            <n-button
                round
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { useMessage } from 'naive-ui'
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
// 注意：如果这两个组件不存在，注释掉并替换为占位组件
// import AddEditRecordForm from './AddEditRecordForm.vue'
// import RecordDetail from './RecordDetail.vue'

// 占位组件（如果AddEditRecordForm/RecordDetail不存在）
const AddEditRecordForm = {
  props: ['record'],
  emits: ['submit', 'cancel'],
  template: `
    <div>
      <n-form label-width="80px">
        <n-form-item label="金额">
          <n-input v-model:value="form.amount" type="number" placeholder="请输入金额" />
        </n-form-item>
        <n-form-item label="类型">
          <n-select v-model:value="form.type" :options="[{label:'月薪',value:'salary'},{label:'年终奖',value:'bonus'}]" />
        </n-form-item>
        <n-form-item label="日期">
          <n-date-picker v-model:value="form.record_date" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="form.description" type="textarea" />
        </n-form-item>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
          <n-button @click="$emit('cancel')">取消</n-button>
          <n-button type="primary" @click="$emit('submit', form)">提交</n-button>
        </div>
      </n-form>
    </div>
  `,
  setup(props, { emit }) {
    const form = ref(props.record || { amount: '', type: 'salary', record_date: '', description: '' })
    return { form }
  }
}

const RecordDetail = {
  props: ['item'],
  emits: ['close'],
  template: `
    <div>
      <div v-for="(v,k) in item" :key="k" style="margin:10px 0;">
        <span style="font-weight:bold;margin-right:10px;">{{k}}:</span>
        <span>{{v}}</span>
      </div>
      <n-button style="margin-top:20px;" @click="$emit('close')">关闭</n-button>
    </div>
  `
}

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
const showBatchImportModal = ref(false)

// 当前操作的记录
const editingRecord = ref(null)
const viewingRecord = ref(null)
const deletingRecord = ref(null)

// 批量导入相关
const fileInputRef = ref(null)
const importResult = ref(null)
const importing = ref(false)

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
    // 确保selectedDate.value是Date对象
    const selectedDateObj = selectedDate.value instanceof Date ? selectedDate.value : new Date(selectedDate.value)
    
    // 检查日期是否有效
    if (!isNaN(selectedDateObj.getTime())) {
      const year = selectedDateObj.getFullYear()
      const month = selectedDateObj.getMonth()
      result = result.filter(record => {
        const recordDate = new Date(record.record_date)
        return recordDate.getFullYear() === year && recordDate.getMonth() === month
      })
    }
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
    console.log('开始加载salary_records数据')
    // 修复：添加RLS策略所需的user_id筛选
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      message.error('请先登录')
      loading.value = false
      return
    }
    
    const { data: recordsData, error } = await supabase
      .from('salary_records')
      .select('*')
      .eq('user_id', user.id) // 只查当前用户的数据
      .order('record_date', { ascending: false })
      
    if (error) throw error
    console.log('加载数据成功:', recordsData)
    records.value = recordsData || []
  } catch (error) {
    console.error('加载数据失败:', error)
    message.error('数据加载失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const applyFilters = () => {
  console.log('应用筛选：', selectedType.value, selectedDate.value)
}

const handleAddRecord = async (formData) => {
  try {
    console.log('新增记录:', formData)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      message.error('请先登录')
      return
    }
    
    const { data, error } = await supabase
      .from('salary_records')
      .insert({
        ...formData,
        user_id: user.id // 补充user_id
      })
      .select()
      .single()
    
    if (error) throw error
    
    records.value.unshift(data)
    showAddModal.value = false
    message.success('记录新增成功')
  } catch (error) {
    console.error('新增记录失败:', error)
    message.error('记录新增失败: ' + error.message)
  }
}

const handleEditRecord = (record) => {
  console.log('编辑记录:', record)
  editingRecord.value = { ...record }
  showEditModal.value = true
}

const handleUpdateRecord = async (formData) => {
  try {
    console.log('更新记录:', formData)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      message.error('请先登录')
      return
    }
    
    const { data, error } = await supabase
      .from('salary_records')
      .update({
        amount: formData.amount,
        type: formData.type,
        record_date: formData.record_date,
        description: formData.description
      })
      .eq('id', formData.id)
      .eq('user_id', user.id) // 只更新当前用户的记录
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
    message.error('记录更新失败: ' + error.message)
  }
}

const handleViewRecord = (record) => {
  console.log('查看记录:', record)
  viewingRecord.value = { ...record }
  showViewModal.value = true
}

const handleDeleteRecord = (record) => {
  console.log('删除记录:', record)
  deletingRecord.value = { ...record }
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    console.log('确认删除:', deletingRecord.value)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      message.error('请先登录')
      return
    }
    
    const { error } = await supabase
      .from('salary_records')
      .delete()
      .eq('id', deletingRecord.value.id)
      .eq('user_id', user.id) // 只删除当前用户的记录
    
    if (error) throw error
    
    records.value = records.value.filter(record => record.id !== deletingRecord.value.id)
    showDeleteConfirm.value = false
    deletingRecord.value = null
    message.success('记录删除成功')
  } catch (error) {
    console.error('删除记录失败:', error)
    message.error('记录删除失败: ' + error.message)
  }
}

const getRecordTypeLabel = (type) => {
  return type === 'salary' ? '月薪' : '年终奖'
}

// 批量导入核心方法（带全量日志）
const triggerFileInput = () => {
  console.log('触发文件选择框点击')
  fileInputRef.value?.click()
}

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) {
    console.log('未选择文件')
    return
  }
  
  // 重置input值（否则选择相同文件不会触发change）
  e.target.value = ''
  
  // 调用导入逻辑
  await handleBatchImport(file)
}

const handleBatchImport = async (file) => {
  console.log('==================== 开始导入流程 ====================')
  console.log('选择的文件:', {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: file.name.split('.').pop().toLowerCase()
  })
  
  try {
    importing.value = true
    importResult.value = null
    message.loading('开始解析文件...', { duration: 2000 })

    let records
    const ext = file.name.split('.').pop().toLowerCase()
    
    if (ext === 'csv') {
      console.log('开始解析CSV文件')
      const content = await readFile(file)
      console.log('CSV文件内容:', content)
      records = parseCSV(content)
    } else if (['xlsx', 'xls'].includes(ext)) {
      console.log('开始解析Excel文件')
      records = await parseExcel(file)
      console.log('Excel解析结果:', records)
    } else {
      throw new Error(`不支持的文件格式: ${ext}，仅支持csv/xlsx/xls`)
    }
    
    console.log('原始解析记录:', records)
    if (!records || records.length === 0) {
      throw new Error('文件解析后无数据')
    }

    // 验证记录
    const validRecords = validateRecords(records)
    console.log('验证后有效记录:', validRecords)
    
    // 批量插入数据库
    await batchInsertRecords(validRecords)
    console.log('数据库插入完成')
    
    // 刷新数据
    await loadData()
    
    importResult.value = {
      success: true,
      message: `成功导入 ${validRecords.length} 条记录`
    }
    message.success(`成功导入 ${validRecords.length} 条记录`)
    
    // 关闭弹窗
    setTimeout(() => {
      showBatchImportModal.value = false
      importResult.value = null
    }, 2000)
    
  } catch (error) {
    console.error('导入流程错误:', error)
    importResult.value = {
      success: false,
      message: `导入失败: ${error.message}`
    }
    message.error(`导入失败: ${error.message}`)
  } finally {
    importing.value = false
    console.log('==================== 导入流程结束 ====================')
  }
}

// 读取文件内容
const readFile = (file) => {
  console.log('读取文件内容:', file.name)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log('文件读取成功，内容长度:', e.target.result.length)
      resolve(e.target.result)
    }
    reader.onerror = (e) => {
      console.error('文件读取失败:', e)
      reject(new Error('文件读取失败: ' + e.message))
    }
    reader.readAsText(file)
  })
}

// 解析CSV文件
const parseCSV = (content) => {
  console.log('解析CSV内容:', content)
  const lines = content.split('\n').filter(line => line.trim() !== '')
  console.log('CSV行数据:', lines)
  
  if (lines.length < 1) return []
  
  const headers = lines[0].split(',').map(header => header.trim().toLowerCase())
  console.log('CSV表头:', headers)
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(value => value.trim())
    const record = {}
    
    headers.forEach((header, i) => {
      record[header] = values[i] || ''
    })
    
    console.log(`CSV第${index+2}行解析结果:`, record)
    return record
  })
}

// 解析Excel文件
const parseExcel = async (file) => {
  console.log('解析Excel文件:', file.name)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        console.log('Excel文件二进制数据长度:', data.length)
        
        const workbook = XLSX.read(data, { type: 'array' })
        console.log('Excel工作簿信息:', workbook)
        
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        let json = XLSX.utils.sheet_to_json(worksheet)
        
        // 统一字段名（转小写 + 去空格）
        json = json.map((item, index) => {
          const normalized = {}
          Object.keys(item).forEach(key => {
            const newKey = key.trim().toLowerCase()
            normalized[newKey] = item[key]
          })
          console.log(`Excel第${index+2}行解析结果:`, normalized)
          return normalized
        })
        
        resolve(json)
      } catch (error) {
        console.error('Excel解析失败:', error)
        reject(new Error('Excel文件解析失败: ' + error.message))
      }
    }
    reader.onerror = (e) => {
      console.error('Excel文件读取失败:', e)
      reject(new Error('Excel文件读取失败: ' + e.message))
    }
    reader.readAsArrayBuffer(file)
  })
}

// 验证记录
const validateRecords = (records) => {
  console.log('开始验证记录，总数:', records.length)
  const validRecords = []
  
  records.forEach((record, index) => {
    const errors = []
    const rowNum = index + 2; // 行号（表头是第1行）
    
    // 验证amount
    const amount = record.amount ? parseFloat(record.amount.toString().trim()) : NaN
    if (isNaN(amount) || amount <= 0) {
      errors.push(`金额必须是正数（第${rowNum}行）`)
    }
    
    // 验证type（兼容中文）
    let type = record.type ? record.type.toString().trim().toLowerCase() : ''
    if (type === '月薪') type = 'salary'
    if (type === '年终奖') type = 'bonus'
    if (!['salary', 'bonus'].includes(type)) {
      errors.push(`类型无效（第${rowNum}行），必须是salary/bonus或月薪/年终奖`)
    }
    
    // 验证record_date
    let recordDate = record.record_date
    if (recordDate) {
      // 兼容Excel日期格式（数字转日期）
      if (typeof recordDate === 'number') {
        recordDate = XLSX.SSF.format('yyyy-mm-dd', recordDate)
        console.log(`Excel日期转换（第${rowNum}行）: ${record.record_date} → ${recordDate}`)
      }
      recordDate = recordDate.toString().trim()
    }
    if (!recordDate || isNaN(Date.parse(recordDate))) {
      errors.push(`日期无效（第${rowNum}行），格式应为YYYY-MM-DD`)
    }
    
    if (errors.length === 0) {
      const validRecord = {
        amount: amount,
        type: type,
        record_date: recordDate,
        description: (record.description || '').toString().trim()
      }
      validRecords.push(validRecord)
      console.log(`第${rowNum}行验证通过:`, validRecord)
    } else {
      console.warn(`第${rowNum}行验证失败:`, errors)
      message.warning(`第 ${rowNum} 行数据无效：${errors.join('；')}`)
    }
  })
  
  if (validRecords.length === 0) {
    throw new Error('没有有效的记录可以导入，请检查文件格式')
  }
  
  return validRecords
}

// 批量插入记录
const batchInsertRecords = async (records) => {
  console.log('开始批量插入记录，有效记录数:', records.length)
  
  // 检查登录状态
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('请先登录后再导入数据')
  }
  console.log('当前登录用户ID:', user.id)
  
  // 补充user_id
  const recordsWithUserId = records.map(record => ({
    ...record,
    user_id: user.id
  }))
  console.log('补充user_id后的记录:', recordsWithUserId)
  
  // 分批插入
  const batchSize = 50
  for (let i = 0; i < recordsWithUserId.length; i += batchSize) {
    const batch = recordsWithUserId.slice(i, i + batchSize)
    console.log(`插入第${i/batchSize + 1}批记录，数量:`, batch.length)
    
    const { error } = await supabase
      .from('salary_records')
      .insert(batch)
    
    if (error) {
      console.error('批量插入失败:', error)
      throw new Error(`插入数据库失败: ${error.message}`)
    }
  }
}

// 下载Excel模板
const downloadTemplate = () => {
  console.log('下载Excel模板')
  // 模板数据
  const templateData = [
    { amount: 10000, type: 'salary', record_date: '2025-12-01', description: '12月月薪' },
    { amount: 50000, type: 'bonus', record_date: '2025-12-20', description: '2025年终奖' }
  ];
  
  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '月薪记录模板');
  
  // 下载文件
  XLSX.writeFile(wb, '月薪记录导入模板.xlsx');
  message.success('模板下载成功')
}

// 生命周期
onMounted(() => {
  console.log('组件挂载，开始加载数据')
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

.action-buttons :deep(.n-button) {
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
}

.action-buttons :deep(.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-buttons :deep(.n-button:active) {
  transform: translateY(0);
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
  overflow: hidden;
}

.records-list :deep(.n-data-table-thead) {
  background-color: #f8f9fa;
}

.records-list :deep(.n-data-table-thead-th) {
  font-weight: 600;
  color: #333;
  padding: 12px 16px;
  border-bottom: 2px solid #e9ecef;
}

.records-list :deep(.n-data-table-tbody-td) {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f5;
}

.records-list :deep(.n-data-table-tbody-tr:hover) {
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.statistics-section {
  margin-bottom: 30px;
}

.statistics-section :deep(.n-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  padding: 25px;
}

.statistics-section h3 {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 25px 0;
  color: #333;
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
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-item:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
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

.import-info p {
  margin: 0 0 15px 0;
  color: #333;
}

.import-info ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.import-info li {
  margin-bottom: 8px;
}

.file-upload-section {
  margin-bottom: 25px;
  text-align: center;
}

.import-result {
  margin-top: 20px;
}

.delete-confirm-content {
  padding: 20px 0;
}

.record-info {
  color: #666;
  margin: 8px 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .salary-container {
    padding: 20px 15px;
  }
  
  .salary-container h2 {
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
  
  .actions-cell {
    flex-direction: column;
    gap: 5px;
    align-items: center;
  }
}
/* 按钮容器样式 - 核心是添加间距 */
.upload-buttons-wrapper {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap; /* 移动端自动换行 */
}

/* 保持原有样式不变，补充即可 */
.file-upload-section {
  margin-bottom: 25px;
  text-align: center;
  padding: 8px 0; /* 增加上下内边距，更美观 */
}
</style>