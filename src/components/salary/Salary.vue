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
<!--      <n-button @click="applyFilters">-->
<!--        <template #icon>-->
<!--          <n-icon>-->
<!--            <SearchOutline/>-->
<!--          </n-icon>-->
<!--        </template>-->
<!--        筛选-->
<!--      </n-button>-->
    </div>

    <!-- 数据列表 -->
    <div class="records-list">
      <n-card size="small">
        <n-data-table
            :columns="columns"
            :data="filteredRecords"
            :loading="loading"
            :row-key="row => row.id"
            :pagination="{ pageSize: 10 }"
        />
      </n-card>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-section">
      <n-card>
        <div class="stats-header">
          <h3>统计信息</h3>
          <div class="time-range-selector">
            <span>时间范围：</span>
            <n-radio-group v-model:value="timeRange" button-style="solid">
              <n-radio-button value="all">全部</n-radio-button>
              <n-radio-button value="thisYear">今年</n-radio-button>
              <n-radio-button value="lastYear">上一年</n-radio-button>
              <n-radio-button value="1y">近一年</n-radio-button>
              <n-radio-button value="last3Years">上三年</n-radio-button>
              <n-radio-button value="3y">近三年</n-radio-button>
            </n-radio-group>
          </div>
        </div>
        
        <!-- 上下限设置表单 -->
        <n-collapse v-model:expanded-names="expandedNames" style="margin-bottom: 20px;">
          <n-collapse-item name="limitSettings" title="自定义上下限">
            <div class="limit-settings-form">
              <div class="limit-item">
                <h4>月薪（元）</h4>
                <div class="limit-inputs">
                  <n-input 
                    v-model:value="customLimits.salary.min" 
                    type="number" 
                    placeholder="最小值" 
                    style="width: 100px; margin-right: 10px;"
                  />
                  <n-input 
                    v-model:value="customLimits.salary.max" 
                    type="number" 
                    placeholder="最大值" 
                    style="width: 100px;"
                  />
                </div>
              </div>
              
              <div class="limit-item">
                <h4>增长（元）</h4>
                <div class="limit-inputs">
                  <n-input 
                    v-model:value="customLimits.growth.min" 
                    type="number" 
                    placeholder="最小值" 
                    style="width: 100px; margin-right: 10px;"
                  />
                  <n-input 
                    v-model:value="customLimits.growth.max" 
                    type="number" 
                    placeholder="最大值" 
                    style="width: 100px;"
                  />
                </div>
              </div>
              
              <div class="limit-item">
                <h4>同比（%）</h4>
                <div class="limit-inputs">
                  <n-input 
                    v-model:value="customLimits.yoy.min" 
                    type="number" 
                    placeholder="最小值" 
                    style="width: 100px; margin-right: 10px;"
                  />
                  <n-input 
                    v-model:value="customLimits.yoy.max" 
                    type="number" 
                    placeholder="最大值" 
                    style="width: 100px;"
                  />
                </div>
              </div>
              
              <div class="limit-item">
                <h4>环比（%）</h4>
                <div class="limit-inputs">
                  <n-input 
                    v-model:value="customLimits.mom.min" 
                    type="number" 
                    placeholder="最小值" 
                    style="width: 100px; margin-right: 10px;"
                  />
                  <n-input 
                    v-model:value="customLimits.mom.max" 
                    type="number" 
                    placeholder="最大值" 
                    style="width: 100px;"
                  />
                </div>
              </div>
              
              <div class="limit-actions">
                <n-button type="primary" @click="updateChart">应用设置</n-button>
                <n-button @click="resetLimits">重置</n-button>
              </div>
            </div>
          </n-collapse-item>
        </n-collapse>
        
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
          <div class="stat-item">
            <n-statistic label="平均年薪" :value="averageAnnualSalary" suffix="元"/>
          </div>
        </div>
        
        <!-- 主图表容器 -->
        <div class="chart-container">
          <div ref="chartRef" class="chart" :style="{ width: '100%', height: chartHeight }"></div>
        </div>
        
        <!-- 面积图容器 -->
        <div class="chart-container" style="margin-top: 30px;">
          <div ref="areaChartRef" class="chart" :style="{ width: '100%', height: chartHeight }"></div>
        </div>
        
        <!-- 年度收入柱状图容器 -->
        <div class="chart-container" style="margin-top: 30px;">
          <div ref="annualBarChartRef" class="chart" :style="{ width: '100%', height: chartHeight }"></div>
        </div>
        
        <!-- 年维度月均工资图表容器 -->
        <div class="chart-container" style="margin-top: 30px;">
          <div ref="annualAverageSalaryChartRef" class="chart" :style="{ width: '100%', height: chartHeight }"></div>
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
          :existing-records="records.value"
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
          :existing-records="records.value"
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
            <li><strong>record_date</strong>: 工资月份（YYYY-MM-DD）</li>
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
import {ref, onMounted, computed, h, watch} from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必需的组件
use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer
])
import {supabase} from '../../supabase.js'
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
  CloudUploadOutline,
  CashOutline,
  GiftOutline,
  CaretUpOutline,
  CaretDownOutline
} from '@vicons/ionicons5'

import AddEditRecordForm from './sub/AddEditRecordForm.vue'
import RecordDetail from './sub/RecordDetail.vue'

// 基础状态
const message = useMessage()
const loading = ref(false)
const records = ref([])
const selectedType = ref(null)
const selectedDate = ref(null)

// 图表相关状态
const chartRef = ref(null)
const chartInstance = ref(null)
const areaChartRef = ref(null)
const areaChartInstance = ref(null)
const annualBarChartRef = ref(null)
const annualBarChartInstance = ref(null)
const annualAverageSalaryChartRef = ref(null)
const annualAverageSalaryChartInstance = ref(null)
const timeRange = ref('all') // 'all', '1y', '3y', 'thisYear'
const chartHeight = ref('400px')

// 根据屏幕宽度动态调整图表高度
const updateChartHeight = () => {
  if (window.innerWidth < 768) {
    chartHeight.value = '300px'
  } else if (window.innerWidth < 480) {
    chartHeight.value = '250px'
  } else if (window.innerWidth < 360) {
    chartHeight.value = '220px'
  } else {
    chartHeight.value = '400px'
  }
  
  // 更新所有图表实例的尺寸
  chartInstance.value?.resize()
  areaChartInstance.value?.resize()
  annualBarChartInstance.value?.resize()
}

// 自定义上下限状态
const customLimits = ref({
  salary: { min: null, max: null },
  growth: { min: null, max: null },
  yoy: { min: null, max: null },
  mom: { min: null, max: null }
})

// 显示/隐藏上下限设置
const expandedNames = ref([])

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
  
  // 按日期排序（从旧到新）
  result = result.sort((a, b) => new Date(a.record_date) - new Date(b.record_date))
  
  // 计算增长、同比和环比
  const calculatedResult = result.map(record => {
    const recordDate = new Date(record.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    
    let growth = 0
    let yoy = 0
    let mom = 0
    
    if (record.type === 'salary') {
      // 月薪计算逻辑：月度比较
      // 查找上个月同类型记录
      const lastMonthRecord = result.find(r => {
        const rDate = new Date(r.record_date)
        return r.type === record.type && 
               rDate.getFullYear() === (month === 0 ? year - 1 : year) && 
               rDate.getMonth() === (month === 0 ? 11 : month - 1)
      })
      
      // 查找去年同期同类型记录
      const lastYearRecord = result.find(r => {
        const rDate = new Date(r.record_date)
        return r.type === record.type && 
               rDate.getFullYear() === year - 1 && 
               rDate.getMonth() === month
      })
      
      // 计算增长（当前金额 - 上个月金额）
      growth = lastMonthRecord ? record.amount - lastMonthRecord.amount : 0
      
      // 计算环比（增长 / 上个月金额 * 100%）
      mom = lastMonthRecord ? (growth / lastMonthRecord.amount * 100).toFixed(2) : 0
      
      // 计算同比（(当前金额 - 去年同期金额) / 去年同期金额 * 100%）
      yoy = lastYearRecord ? ((record.amount - lastYearRecord.amount) / lastYearRecord.amount * 100).toFixed(2) : 0
    } else if (record.type === 'bonus') {
      // 年终奖计算逻辑：年度比较
      // 查找去年同类型记录（不考虑月份，只考虑年份）
      const lastYearRecord = result.find(r => {
        const rDate = new Date(r.record_date)
        return r.type === record.type && 
               rDate.getFullYear() === year - 1
      })
      
      // 计算增长（当前金额 - 去年金额）
      growth = lastYearRecord ? record.amount - lastYearRecord.amount : 0
      
      // 计算同比（(当前金额 - 去年金额) / 去年金额 * 100%）
      yoy = lastYearRecord ? ((record.amount - lastYearRecord.amount) / lastYearRecord.amount * 100).toFixed(2) : 0
      
      // 年终奖环比为0（因为是年度发放，没有月度环比）
      mom = 0
    }
    
    return {
      ...record,
      growth,
      yoy,
      mom
    }
  })
  
  // 最终按日期从新到旧排序
  const sortedResult = calculatedResult.sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
  
  // 分页处理
  return sortedResult
})



// 按时间范围过滤的记录
const timeFilteredRecords = computed(() => {
  let result = [...records.value]
  
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  // 根据时间范围过滤记录
  if (timeRange.value === '1y') {
    // 近一年
    const oneYearAgo = new Date(currentYear - 1, currentMonth, now.getDate())
    result = result.filter(r => new Date(r.record_date) >= oneYearAgo)
  } else if (timeRange.value === '3y') {
    // 近三年
    const threeYearsAgo = new Date(currentYear - 3, currentMonth, now.getDate())
    result = result.filter(r => new Date(r.record_date) >= threeYearsAgo)
  } else if (timeRange.value === 'thisYear') {
    // 今年
    const thisYearStart = new Date(currentYear, 0, 1)
    result = result.filter(r => new Date(r.record_date) >= thisYearStart)
  } else if (timeRange.value === 'lastYear') {
    // 上一年（去年完整自然年）
    const lastYearStart = new Date(currentYear - 1, 0, 1)
    const lastYearEnd = new Date(currentYear, 0, 0)
    result = result.filter(r => {
      const recordDate = new Date(r.record_date)
      return recordDate >= lastYearStart && recordDate <= lastYearEnd
    })
  } else if (timeRange.value === 'last3Years') {
    // 上三年（前三个完整自然年）
    const threeYearsAgoStart = new Date(currentYear - 3, 0, 1)
    const lastYearEnd = new Date(currentYear, 0, 0)
    result = result.filter(r => {
      const recordDate = new Date(r.record_date)
      return recordDate >= threeYearsAgoStart && recordDate <= lastYearEnd
    })
  }
  
  return result
})

// 修改统计信息，使其受时间范围影响
const totalAmount = computed(() => {
  return timeFilteredRecords.value.reduce((sum, record) => sum + record.amount, 0).toFixed(2)
})

const averageSalary = computed(() => {
  const salaryRecords = timeFilteredRecords.value.filter(record => record.type === 'salary')
  return salaryRecords.length === 0 ? 0 : (salaryRecords.reduce((sum, r) => sum + r.amount, 0) / salaryRecords.length).toFixed(2)
})

const averageBonus = computed(() => {
  const bonusRecords = timeFilteredRecords.value.filter(record => record.type === 'bonus')
  return bonusRecords.length === 0 ? 0 : (bonusRecords.reduce((sum, r) => sum + r.amount, 0) / bonusRecords.length).toFixed(2)
})

const averageAnnualSalary = computed(() => {
  // 计算所选时间范围内的总收入
  const total = timeFilteredRecords.value.reduce((sum, record) => sum + record.amount, 0)
  
  // 计算实际月份数（精确到月份）
  const monthMap = new Map() // 存储每个年份包含的月份
  
  timeFilteredRecords.value.forEach(record => {
    const recordDate = new Date(record.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    const key = `${year}-${month}`
    monthMap.set(key, true)
  })
  
  // 计算实际年份数（按12个月为一年计算）
  const actualMonthCount = monthMap.size
  const actualYearCount = actualMonthCount / 12
  
  return actualYearCount === 0 ? 0 : (total / actualYearCount).toFixed(2)
})

// 图表数据处理
const chartData = computed(() => {
  // 首先获取所有原始记录
  let chartRecords = [...records.value]
  
  // 应用selectedType和selectedDate过滤
  if (selectedType.value) {
    chartRecords = chartRecords.filter(record => record.type === selectedType.value)
  }
  if (selectedDate.value) {
    const selectedDateObj = selectedDate.value instanceof Date ? selectedDate.value : new Date(selectedDate.value)
    if (!isNaN(selectedDateObj.getTime())) {
      const year = selectedDateObj.getFullYear()
      const month = selectedDateObj.getMonth()
      chartRecords = chartRecords.filter(record => {
        const recordDate = new Date(record.record_date)
        return recordDate.getFullYear() === year && recordDate.getMonth() === month
      })
    }
  }
  
  // 应用timeRange过滤
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  if (timeRange.value === '1y') {
    const oneYearAgo = new Date(currentYear - 1, currentMonth, now.getDate())
    chartRecords = chartRecords.filter(r => new Date(r.record_date) >= oneYearAgo)
  } else if (timeRange.value === '3y') {
    const threeYearsAgo = new Date(currentYear - 3, currentMonth, now.getDate())
    chartRecords = chartRecords.filter(r => new Date(r.record_date) >= threeYearsAgo)
  } else if (timeRange.value === 'thisYear') {
    const thisYearStart = new Date(currentYear, 0, 1)
    chartRecords = chartRecords.filter(r => new Date(r.record_date) >= thisYearStart)
  } else if (timeRange.value === 'lastYear') {
    // 上一年（去年完整自然年）
    const lastYearStart = new Date(currentYear - 1, 0, 1)
    const lastYearEnd = new Date(currentYear, 0, 0)
    chartRecords = chartRecords.filter(r => {
      const recordDate = new Date(r.record_date)
      return recordDate >= lastYearStart && recordDate <= lastYearEnd
    })
  } else if (timeRange.value === 'last3Years') {
    // 上三年（前三个完整自然年）
    const threeYearsAgoStart = new Date(currentYear - 3, 0, 1)
    const lastYearEnd = new Date(currentYear, 0, 0)
    chartRecords = chartRecords.filter(r => {
      const recordDate = new Date(r.record_date)
      return recordDate >= threeYearsAgoStart && recordDate <= lastYearEnd
    })
  }
  
  // 按日期排序（从旧到新）
  chartRecords = chartRecords.sort((a, b) => new Date(a.record_date) - new Date(b.record_date))
  
  // 计算增长、同比和环比
  const calculatedChartRecords = chartRecords.map(record => {
    const recordDate = new Date(record.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    
    let growth = 0
    let yoy = 0
    let mom = 0
    
    if (record.type === 'salary') {
      // 月薪计算逻辑：月度比较
      // 查找上个月同类型记录
      const lastMonthRecord = chartRecords.find(r => {
        const rDate = new Date(r.record_date)
        return r.type === record.type && 
               rDate.getFullYear() === (month === 0 ? year - 1 : year) && 
               rDate.getMonth() === (month === 0 ? 11 : month - 1)
      })
      
      // 查找去年同期同类型记录
      const lastYearRecord = chartRecords.find(r => {
        const rDate = new Date(r.record_date)
        return r.type === record.type && 
               rDate.getFullYear() === year - 1 && 
               rDate.getMonth() === month
      })
      
      // 计算增长（当前金额 - 上个月金额）
      growth = lastMonthRecord ? record.amount - lastMonthRecord.amount : 0
      
      // 计算环比（增长 / 上个月金额 * 100%）
      mom = lastMonthRecord ? (growth / lastMonthRecord.amount * 100).toFixed(2) : 0
      
      // 计算同比（(当前金额 - 去年同期金额) / 去年同期金额 * 100%）
      yoy = lastYearRecord ? ((record.amount - lastYearRecord.amount) / lastYearRecord.amount * 100).toFixed(2) : 0
    }
    
    return {
      ...record,
      growth,
      yoy,
      mom
    }
  })
  
  // 过滤出月薪记录
  const salaryRecords = calculatedChartRecords
    .filter(r => r.type === 'salary')
    .sort((a, b) => new Date(a.record_date) - new Date(b.record_date))
  
  // 按月份分组
  const monthGroups = {}
  
  salaryRecords.forEach(record => {
    const date = new Date(record.record_date)
    const year = date.getFullYear()
    const month = date.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    
    if (!monthGroups[key]) {
      monthGroups[key] = {
        month: key,
        amount: 0,
        yoy: 0,
        mom: 0
      }
    }
    
    // 使用最新的记录数据（如果同一月份有多个记录）
    monthGroups[key] = {
      month: key,
      amount: record.amount,
      yoy: parseFloat(record.yoy || 0),
      mom: parseFloat(record.mom || 0)
    }
  })
  
  // 转换为数组并按月份排序
  const sortedData = Object.values(monthGroups).sort((a, b) => a.month.localeCompare(b.month))
  
  // 提取图表所需数据
  const months = sortedData.map(item => item.month)
  const amounts = sortedData.map(item => item.amount)
  // 计算增长数据
  const growthData = sortedData.map((item, index) => {
    if (index === 0) return 0 // 第一个月没有增长数据
    return item.amount - sortedData[index - 1].amount
  })
  const yoyData = sortedData.map(item => item.yoy)
  const momData = sortedData.map(item => item.mom)
  
  // 计算累计总收入
  let cumulativeTotal = 0
  const cumulativeTotalData = sortedData.map(item => {
    cumulativeTotal += item.amount
    return cumulativeTotal
  })
  
  // 计算每年累计收入 - 改进版本：显示每年独立累计，更有比较价值
  let cumulativeByYear = {} // 按年份存储累计值
  const cumulativeThisYearData = sortedData.map(item => {
    const itemYear = parseInt(item.month.split('-')[0])
    
    // 初始化该年份的累计值
    if (!cumulativeByYear[itemYear]) {
      cumulativeByYear[itemYear] = 0
    }
    
    // 累计该月份金额（每个年份独立累计）
    cumulativeByYear[itemYear] += item.amount
    
    // 返回该年份的累计值，这样可以看到每年的累计趋势
    return cumulativeByYear[itemYear]
  })
  
  // 计算年度收入数据和实际月份数
  const annualData = {} // 按年份存储总收入
  const annualMonthCount = {} // 按年份存储实际月份数
  
  sortedData.forEach(item => {
    const year = parseInt(item.month.split('-')[0])
    if (!annualData[year]) {
      annualData[year] = 0
      annualMonthCount[year] = 0
    }
    annualData[year] += item.amount
    
    // 统计每个年份的实际月份数（使用月份作为唯一标识）
    const month = parseInt(item.month.split('-')[1])
    const monthKey = `${year}-${month}`
    if (!annualMonthCount[year]) {
      annualMonthCount[year] = new Set()
    }
    annualMonthCount[year].add(monthKey)
  })
  
  // 计算年维度月均工资：年度总收入 / 实际月份数
  const annualAverageSalary = {} // 按年份存储月均工资
  Object.entries(annualData).forEach(([year, total]) => {
    const monthCount = annualMonthCount[year] ? annualMonthCount[year].size : 0
    // 避免除以0，最少按1个月计算
    annualAverageSalary[year] = monthCount > 0 ? total / monthCount : total
  })
  
  // 转换为数组并按年份排序
  const annualDataArray = Object.entries(annualData)
    .map(([year, amount]) => ({ year: parseInt(year), amount }))
    .sort((a, b) => a.year - b.year)
  
  // 转换年维度月均工资为数组并按年份排序
  const annualAverageSalaryArray = Object.entries(annualAverageSalary)
    .map(([year, average]) => ({ year: parseInt(year), average }))
    .sort((a, b) => a.year - b.year)
  
  return {
    months,
    amounts,
    growthData,
    yoyData,
    momData,
    cumulativeTotalData,
    cumulativeThisYearData,
    annualData: annualDataArray,
    annualAverageSalary: annualAverageSalaryArray
  }
})

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  // 销毁已有实例
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  
  // 创建新实例
  chartInstance.value = echarts.init(chartRef.value)
  
  // 更新图表
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chartInstance.value) return
  
  const { months, amounts, growthData, yoyData, momData, cumulativeTotalData, cumulativeThisYearData } = chartData.value
  
  // 处理数据，将超出上下限的数据显示在上下限上
  const processData = (data, min, max) => {
    return data.map(value => {
      if (min !== null && value < min) return parseFloat(min)
      if (max !== null && value > max) return parseFloat(max)
      return value
    })
  }
  
  // 应用上下限处理
  const processedAmounts = processData(amounts, customLimits.value.salary.min, customLimits.value.salary.max)
  const processedGrowthData = processData(growthData, customLimits.value.growth.min, customLimits.value.growth.max)
  const processedYoyData = processData(yoyData, customLimits.value.yoy.min, customLimits.value.yoy.max)
  const processedMomData = processData(momData, customLimits.value.mom.min, customLimits.value.mom.max)
  const processedCumulativeTotal = processData(cumulativeTotalData, null, null) // 累计总收入不应用上下限
  const processedCumulativeThisYear = processData(cumulativeThisYearData, null, null) // 本年累计收入不应用上下限
  
  // 设置y轴上下限
  const yAxis1 = {
    type: 'value',
    name: '金额（元）',
    position: 'left',
    axisLabel: {
      formatter: '{value}',
      fontSize: '8px',
      margin: 4
    },
    axisTick: {
      show: false
    },
    // 应用自定义上下限
    min: customLimits.value.salary.min !== null ? parseFloat(customLimits.value.salary.min) : undefined,
    max: customLimits.value.salary.max !== null ? parseFloat(customLimits.value.salary.max) : undefined
  }
  
  const yAxis2 = {
    type: 'value',
    name: '增长率（%）',
    position: 'right',
    axisLabel: {
      formatter: '{value}%',
      fontSize: '8px',
      margin: 4
    },
    // 0%位置加粗
    splitLine: {
      show: true,
      lineStyle: {
        color: '#999',
        type: 'solid',
        width: 1
      }
    },
    axisLine: {
      onZero: true,
      lineStyle: {
        color: '#333',
        width: 2
      }
    },
    axisTick: {
      show: true,
      alignWithLabel: true
    },
    // 应用自定义上下限
    min: customLimits.value.yoy.min !== null ? parseFloat(customLimits.value.yoy.min) : undefined,
    max: customLimits.value.yoy.max !== null ? parseFloat(customLimits.value.yoy.max) : undefined
  }
  
  const option = {
      tooltip: {
        trigger: 'axis',
        triggerOn: 'mousemove',
        axisPointer: {
          type: 'cross',
          animation: true
        },
        formatter: function(params) {
          if (!params || params.length === 0) return ''
          
          const month = params[0].axisValue || '未知月份'
          let result = `<div style="font-weight: bold; margin-bottom: 8px; font-size: 12px;">${month}</div>`
          
          // 格式化显示每个系列的数据
          params.forEach(item => {
            const value = item.value
            const name = item.seriesName
            let formattedValue = value
            
            // 根据系列名称格式化数据
            if (name === '同比' || name === '环比') {
              formattedValue = `${value.toFixed(2)}%`
            } else {
              formattedValue = `${value.toFixed(2)}元`
            }
            
            result += `<div style="display: flex; align-items: center; margin: 2px 0; font-size: 11px;">
              <span style="display: inline-block; width: 8px; height: 8px; background-color: ${item.color}; border-radius: 50%; margin-right: 6px;"></span>
              <span>${name}: ${formattedValue}</span>
            </div>`
          })
          return result
        },
        padding: 8
      },
      legend: {
        data: ['月薪', '增长', '同比', '环比'],
        top: 30,
        left: 'center',
        type: 'scroll',
        orient: 'horizontal',
        textStyle: {
          fontSize: '10px'
        },
        itemWidth: 8,
        itemHeight: 8,
        pageIconSize: 8,
        pageTextStyle: {
          fontSize: '9px'
        },
        pageButtonGap: 5
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '10%',
        top: '30%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLabel: {
          interval: 2,
          rotate: 45,
          margin: 8,
          fontSize: '8px'
        },
        axisTick: {
          show: false
        },
        axisLine: {
          onZero: true
        }
      },
      yAxis: [yAxis1, yAxis2],
      series: [
        {
          name: '月薪',
          type: 'line',
          data: processedAmounts,
          smooth: true,
          symbol: 'none', // 移除折线上的点
          itemStyle: {
            color: '#2080f0'
          }
        },
        {
          name: '增长',
          type: 'bar',
          data: processedGrowthData,
          itemStyle: {
            color: '#ff9800'
          }
        },
        {
          name: '同比',
          type: 'line',
          yAxisIndex: 1,
          data: processedYoyData,
          smooth: true,
          symbol: 'none', // 移除折线上的点
          itemStyle: {
            color: '#f53f3f'
          }
        },
        {
          name: '环比',
          type: 'line',
          yAxisIndex: 1,
          data: processedMomData,
          smooth: true,
          symbol: 'none', // 移除折线上的点
          itemStyle: {
            color: '#18a058'
          }
        }
      ]
    }
  
  chartInstance.value.setOption(option)
}

// 监听记录变化，更新图表
watch(records, () => {
  updateChart()
  updateAreaChart()
  updateAnnualBarChart()
  updateAnnualAverageSalaryChart()
}, { deep: true })

// 监听时间范围变化，更新图表
watch(timeRange, () => {
  updateChart()
  updateAreaChart()
  updateAnnualBarChart()
  updateAnnualAverageSalaryChart()
})

// 监听窗口大小变化，调整图表
const handleResize = () => {
  chartInstance.value?.resize()
  areaChartInstance.value?.resize()
  annualBarChartInstance.value?.resize()
  annualAverageSalaryChartInstance.value?.resize()
}

// 重置上下限设置
const resetLimits = () => {
  customLimits.value = {
    salary: { min: null, max: null },
    growth: { min: null, max: null },
    yoy: { min: null, max: null },
    mom: { min: null, max: null }
  }
  updateChart()
}

// 切换上下限设置面板
const toggleLimitSettings = () => {
  if (expandedNames.value.includes('limitSettings')) {
    expandedNames.value = expandedNames.value.filter(name => name !== 'limitSettings')
  } else {
    expandedNames.value.push('limitSettings')
  }
}

// 初始化面积图
const initAreaChart = () => {
  if (!areaChartRef.value) return
  
  // 销毁已有实例
  if (areaChartInstance.value) {
    areaChartInstance.value.dispose()
  }
  
  areaChartInstance.value = echarts.init(areaChartRef.value)
  updateAreaChart()
}

// 初始化年度收入柱状图
const initAnnualBarChart = () => {
  if (!annualBarChartRef.value) return
  
  // 销毁已有实例
  if (annualBarChartInstance.value) {
    annualBarChartInstance.value.dispose()
  }
  
  annualBarChartInstance.value = echarts.init(annualBarChartRef.value)
  updateAnnualBarChart()
}

// 更新面积图
const updateAreaChart = () => {
  if (!areaChartInstance.value) return
  
  const { months, cumulativeTotalData, cumulativeThisYearData } = chartData.value
  
  const option = {
        tooltip: {
          trigger: 'axis',
          triggerOn: 'mousemove',
          axisPointer: {
            type: 'cross',
            animation: true
          },
          formatter: function(params) {
            if (!params || params.length === 0) return ''
            
            const month = params[0].axisValue || '未知月份'
            let result = `<div style="font-weight: bold; margin-bottom: 8px; font-size: 12px;">${month}</div>`
            
            // 格式化显示每个系列的数据
            params.forEach(item => {
              const value = item.value
              const name = item.seriesName
              const formattedValue = `${value.toFixed(2)}元`
              
              result += `<div style="display: flex; align-items: center; margin: 2px 0; font-size: 11px;">
                <span style="display: inline-block; width: 8px; height: 8px; background-color: ${item.color}; border-radius: 50%; margin-right: 6px;"></span>
                <span>${name}: ${formattedValue}</span>
              </div>`
            })
            return result
          },
          padding: 8
        },
        legend: {
          data: ['累计总收入', '年度累计收入'],
          top: 30,
          left: 'center',
          type: 'scroll',
          orient: 'horizontal',
          textStyle: {
            fontSize: '10px'
          },
          itemWidth: 8,
          itemHeight: 8,
          pageIconSize: 8,
          pageTextStyle: {
            fontSize: '9px'
          },
          pageButtonGap: 5
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '10%',
          top: '30%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: months,
          axisLabel: {
            interval: 2,
            rotate: 45,
            margin: 8,
            fontSize: '8px'
          },
          axisTick: {
            show: false
          },
          axisLine: {
            onZero: true
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '金额（元）',
            position: 'left',
            axisLabel: {
              formatter: '{value}',
              fontSize: '8px',
              margin: 4
            },
            axisTick: {
              show: false
            }
          }
        ],
    series: [
      {
        name: '累计总收入',
        type: 'line',
        data: cumulativeTotalData,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#67c23a',
          width: 1
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ]
          }
        }
      },
      {
        name: '年度累计收入',
        type: 'line',
        data: cumulativeThisYearData,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#e6a23c',
          width: 1
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
              { offset: 1, color: 'rgba(230, 162, 60, 0.05)' }
            ]
          }
        }
      }
    ]
  }
  
  areaChartInstance.value.setOption(option)
}

// 更新年度收入柱状图
const updateAnnualBarChart = () => {
  if (!annualBarChartInstance.value) return
  
  const { annualData } = chartData.value
  
  // 提取年度数据
  const years = annualData.map(item => item.year)
  const amounts = annualData.map(item => item.amount)
  
  const option = {
        tooltip: {
          trigger: 'axis',
          triggerOn: 'mousemove',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            if (!params || params.length === 0) return ''
            const item = params[0]
            return `${item.name}年<br/>总收入：${item.value.toFixed(2)}元`
          },
          padding: 8
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '10%',
          top: '30%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: years,
          axisLabel: {
            interval: 0,
            rotate: 0,
            fontSize: '8px'
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '金额（元）',
          axisLabel: {
            formatter: '{value}',
            fontSize: '8px',
            margin: 4
          },
          axisTick: {
            show: false
          }
        },
    series: [
      {
        name: '年度收入',
        type: 'bar',
        data: amounts,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#5b8ff9' },
              { offset: 1, color: '#3b5998' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#67c23a' },
                { offset: 1, color: '#85ce61' }
              ]
            }
          }
        }
      },
      {
        name: '年度收入趋势',
        type: 'line',
        data: amounts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#f53f3f',
          width: 2
        },
        itemStyle: {
          color: '#f53f3f',
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            symbolSize: 8
          }
        }
      }
    ]
  }
  
  annualBarChartInstance.value.setOption(option)
}

// 初始化年维度月均工资图表
const initAnnualAverageSalaryChart = () => {
  if (!annualAverageSalaryChartRef.value) return
  
  // 销毁已有实例
  if (annualAverageSalaryChartInstance.value) {
    annualAverageSalaryChartInstance.value.dispose()
  }
  
  annualAverageSalaryChartInstance.value = echarts.init(annualAverageSalaryChartRef.value)
  updateAnnualAverageSalaryChart()
}

// 更新年维度月均工资图表
const updateAnnualAverageSalaryChart = () => {
  if (!annualAverageSalaryChartInstance.value) return
  
  const { annualAverageSalary } = chartData.value
  
  // 提取年维度月均工资数据
  const years = annualAverageSalary.map(item => item.year)
  const averageSalaries = annualAverageSalary.map(item => item.average)
  
  const option = {
        tooltip: {
          trigger: 'axis',
          triggerOn: 'mousemove',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            if (!params || params.length === 0) return ''
            let result = `${params[0].name}年<br/>`
            params.forEach(item => {
              const value = item.value
              const name = item.seriesName
              result += `${name}：${value.toFixed(2)}元<br/>`
            })
            return result
          },
          padding: 8
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '10%',
          top: '30%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: years,
          axisLabel: {
            interval: 0,
            rotate: 0,
            fontSize: '8px'
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: '金额（元）',
          axisLabel: {
            formatter: '{value}',
            fontSize: '8px',
            margin: 4
          },
          axisTick: {
            show: false
          }
        },
    series: [
      {
        name: '月均工资',
        type: 'bar',
        data: averageSalaries,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#ff9800' },
              { offset: 1, color: '#f57c00' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#67c23a' },
                { offset: 1, color: '#85ce61' }
              ]
            }
          }
        }
      },
      {
        name: '月均工资趋势',
        type: 'line',
        data: averageSalaries,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#3b82f6',
          width: 2
        },
        itemStyle: {
          color: '#3b82f6',
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            symbolSize: 8
          }
        }
      }
    ]
  }
  
  annualAverageSalaryChartInstance.value.setOption(option)
}

// 组件挂载时初始化
onMounted(() => {
  console.log('组件挂载，加载数据')
  loadData()
  
  // 初始化图表高度
  updateChartHeight()
  
  // 延迟初始化图表，确保DOM已渲染
  setTimeout(() => {
    initChart()
    initAreaChart()
    initAnnualBarChart()
    initAnnualAverageSalaryChart()
    window.addEventListener('resize', handleResize)
    window.addEventListener('resize', updateChartHeight)
  }, 100)
})

// 组件卸载时清理
const cleanup = () => {
  chartInstance.value?.dispose()
  areaChartInstance.value?.dispose()
  annualBarChartInstance.value?.dispose()
  annualAverageSalaryChartInstance.value?.dispose()
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('resize', updateChartHeight)
}

// 表格列配置（核心：操作列用render函数实现）
const columns = [
  {
    title: '记录类型',
    key: 'type',
    width: 80,
    render(row) {
      // 使用图标表示类型
      const icon = row.type === 'salary' ? 
        h(NIcon, { size: 20, color: '#2080f0' }, { default: () => h(CashOutline) }) : 
        h(NIcon, { size: 20, color: '#f53f3f' }, { default: () => h(GiftOutline) })
      return h('div', { 
        class: 'type-icon-container',
        title: row.type === 'salary' ? '月薪' : '年终奖'
      }, [icon])
    }
  },
  {
    title: '金额',
    key: 'amount',
    width: 150,
    render(row) {
      return `${row.amount.toFixed(2)}元`
    }
  },
  {
    title: '工资月份',
    key: 'record_date',
    width: 150,
    render(row) {
      return new Date(row.record_date).toLocaleDateString()
    }
  },
  {
    title: '增长',
    key: 'growth',
    width: 150,
    render(row) {
      const value = parseFloat(row.growth || 0)
      const isNegative = value < 0
      const displayValue = Math.abs(value).toFixed(2)
      const icon = isNegative ? 
        h(NIcon, { size: 14, color: '#18a058' }, { default: () => h(CaretDownOutline) }) : 
        h(NIcon, { size: 14, color: '#f53f3f' }, { default: () => h(CaretUpOutline) })
      return h('div', { 
        class: 'growth-item',
        style: { color: isNegative ? '#18a058' : '#f53f3f' }
      }, [icon, ` ${displayValue}元`])
    }
  },
    {
    title: '环比',
    key: 'mom',
    width: 120,
    render(row) {
      const value = parseFloat(row.mom || 0)
      const isNegative = value < 0
      const displayValue = Math.abs(value).toFixed(2)
      const icon = isNegative ? 
        h(NIcon, { size: 14, color: '#18a058' }, { default: () => h(CaretDownOutline) }) : 
        h(NIcon, { size: 14, color: '#f53f3f' }, { default: () => h(CaretUpOutline) })
      return h('div', { 
        class: 'growth-item',
        style: { color: isNegative ? '#18a058' : '#f53f3f' }
      }, [icon, ` ${displayValue}%`])
    }
  },
  {
    title: '同比',
    key: 'yoy',
    width: 120,
    render(row) {
      const value = parseFloat(row.yoy || 0)
      const isNegative = value < 0
      const displayValue = Math.abs(value).toFixed(2)
      const icon = isNegative ? 
        h(NIcon, { size: 14, color: '#18a058' }, { default: () => h(CaretDownOutline) }) : 
        h(NIcon, { size: 14, color: '#f53f3f' }, { default: () => h(CaretUpOutline) })
      return h('div', { 
        class: 'growth-item',
        style: { color: isNegative ? '#18a058' : '#f53f3f' }
      }, [icon, ` ${displayValue}%`])
    }
  },
  {
    title: '',
    key: 'actions',
    width: 120, // 纯图标列宽可更小
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
    const {data: recordsData, error} = await supabase
        .from('salary_records')
        .select('*')
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

// 辅助函数：确保日期格式正确
const formatDateForDB = (date) => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  } else if (typeof date === 'number') {
    // 处理timestamp格式
    return new Date(date).toISOString().split('T')[0]
  } else if (typeof date === 'string') {
    // 处理字符串格式，确保是YYYY-MM-DD格式
    const dateObj = new Date(date)
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0]
    }
  }
  return new Date().toISOString().split('T')[0] // 默认返回今天日期
}

const handleAddRecord = async (formData) => {
  try {
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) {
      message.error('请先登录')
      return
    }
    // 确保日期格式正确
    const formattedData = {
      ...formData,
      user_id: user.id,
      record_date: formatDateForDB(formData.record_date)
    }
    const {data, error} = await supabase
        .from('salary_records')
        .insert(formattedData)
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
          record_date: formatDateForDB(formData.record_date),
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

  const recordsWithUserId = records.map(r => ({
    ...r, 
    user_id: user.id,
    record_date: formatDateForDB(r.record_date) // 确保日期格式正确
  }))
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


</script>

<style scoped>
.salary-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 10px;
  min-height: calc(100vh - 120px);
}

.salary-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.filter-select {
  min-width: 150px;
  flex: 1;
  max-width: 250px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .salary-container {
    padding: 15px 8px;
  }
  
  .salary-container h2 {
    font-size: 1.25rem;
    margin-bottom: 15px;
  }
  
  .action-buttons {
    gap: 8px;
    margin-bottom: 15px;
    justify-content: center;
  }
  
  .filter-section {
    gap: 8px;
    margin-bottom: 15px;
    padding: 12px;
  }
  
  .filter-select {
    min-width: 120px;
    max-width: 100%;
  }
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

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 10px;
}

.stats-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.time-range-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.time-range-selector span {
  font-size: 0.85rem;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-container {
  margin-bottom: 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .stats-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 15px;
    padding-bottom: 10px;
    gap: 8px;
  }
  
  .stats-header h3 {
    font-size: 1rem;
    width: 100%;
    text-align: center;
  }
  
  .time-range-selector {
    width: 100%;
    justify-content: center;
    gap: 5px;
  }
  
  .time-range-selector span {
    font-size: 0.75rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .chart-container {
    margin-bottom: 15px;
  }
  
  /* 调整图表容器高度 */
  .chart {
    height: 300px !important;
  }
}

.limit-settings-form {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

/* 上下限设置表单样式 */
:deep(.limit-settings-form) {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  overflow-x: auto;
}

:deep(.limit-item) {
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  flex-wrap: wrap;
}

:deep(.limit-item h4) {
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  width: 80px;
  flex-shrink: 0;
  min-width: 80px;
}

:deep(.limit-inputs) {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
  min-width: 200px;
}

:deep(.limit-actions) {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  flex-wrap: wrap;
}

/* 移动端适配 */
@media (max-width: 768px) {
  :deep(.limit-settings-form) {
    padding: 12px;
  }
  
  :deep(.limit-item) {
    margin-bottom: 12px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  :deep(.limit-item h4) {
    margin: 0 0 5px 0;
    width: auto;
    min-width: auto;
  }
  
  :deep(.limit-inputs) {
    gap: 8px;
    min-width: auto;
  }
  
  :deep(.limit-actions) {
    margin-top: 12px;
    padding-top: 12px;
    gap: 8px;
  }
}

.stat-item {
  text-align: center;
  padding: 20px 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .stat-item {
    padding: 15px 10px;
  }
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