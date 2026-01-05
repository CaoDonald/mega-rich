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
      <n-select
        v-model:value="selectedTimeRange"
        placeholder="选择时间范围"
        :options="timeRangeOptions"
        class="filter-select"
      />
      <n-button @click="applyFilters">
        <template #icon>
          <n-icon><SearchOutline /></n-icon>
        </template>
        筛选
      </n-button>
      <n-button @click="resetFilters">
        <template #icon>
          <n-icon><RefreshOutline /></n-icon>
        </template>
        重置
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
            <n-statistic label="本月金额" :value="latestMonthStats.currentAmount.toFixed(2)" suffix="元" />
          </div>
          <div class="stat-item">
            <n-statistic 
              label="增长金额" 
              :value="latestMonthStats.growth" 
              suffix="元"
              :value-style="{ color: latestMonthStats.growth >= 0 ? '#f53f3f' : '#18a058' }"
            >
              <template #prefix>
                <n-icon v-if="latestMonthStats.growth > 0"><TrendingUpOutline /></n-icon>
                <n-icon v-else-if="latestMonthStats.growth < 0"><TrendingDownOutline /></n-icon>
              </template>
            </n-statistic>
          </div>
          <div class="stat-item">
            <n-statistic 
              label="环比" 
              :value="latestMonthStats.growthRate" 
              suffix="%"
              :value-style="{ color: latestMonthStats.growthRate >= 0 ? '#f53f3f' : '#18a058' }"
            >
              <template #prefix>
                <n-icon v-if="latestMonthStats.growthRate > 0"><TrendingUpOutline /></n-icon>
                <n-icon v-else-if="latestMonthStats.growthRate < 0"><TrendingDownOutline /></n-icon>
              </template>
            </n-statistic>
          </div>
          <div class="stat-item">
            <n-statistic 
              label="同比" 
              :value="latestMonthStats.yoyGrowthRate" 
              suffix="%"
              :value-style="{ color: latestMonthStats.yoyGrowthRate >= 0 ? '#f53f3f' : '#18a058' }"
            >
              <template #prefix>
                <n-icon v-if="latestMonthStats.yoyGrowthRate > 0"><TrendingUpOutline /></n-icon>
                <n-icon v-else-if="latestMonthStats.yoyGrowthRate < 0"><TrendingDownOutline /></n-icon>
              </template>
            </n-statistic>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 图表配置区 -->
    <div class="charts-config-section">
      <div class="charts-config-actions">
        <n-button @click="showCustomLimitsForm = !showCustomLimitsForm">
          <template #icon>
            <n-icon><SettingsOutline /></n-icon>
          </template>
          {{ showCustomLimitsForm ? '关闭' : '自定义图表上下限' }}
        </n-button>
      </div>
      
      <!-- 自定义图表上下限表单 -->
      <n-card v-if="showCustomLimitsForm" class="custom-limits-form">
        <h4>自定义图表上下限</h4>
        <div class="form-row">
          <n-input-number
            v-model:value="customChartMin"
            placeholder="最小值"
            style="margin-right: 20px; width: 200px;"
            step="100"
          />
          <n-input-number
            v-model:value="customChartMax"
            placeholder="最大值"
            style="width: 200px;"
            step="100"
          />
          <div class="form-actions">
            <n-button @click="applyCustomLimits" type="primary" style="margin-right: 10px;">
              应用
            </n-button>
            <n-button @click="resetCustomLimits">
              重置
            </n-button>
          </div>
        </div>
      </n-card>
    </div>

    <!-- 折线图 -->
    <div class="chart-section">
      <n-card>
        <v-chart
          :option="lineChartOption"
          :style="{ height: chartHeight }"
          @click="handleChartClick"
        />
      </n-card>
    </div>

    <!-- 面积图 -->
    <div class="chart-section">
      <n-card>
        <v-chart
          :option="areaChartOption"
          :style="{ height: chartHeight }"
          @click="handleChartClick"
        />
      </n-card>
    </div>

    <!-- 年度汇总柱状图 -->
    <div class="chart-section">
      <n-card>
        <v-chart
          :option="annualBarChartOption"
          :style="{ height: chartHeight }"
          @click="handleChartClick"
        />
      </n-card>
    </div>
    
    <!-- 新增资金条目弹窗 -->
    <n-modal
      v-model:show="showAddItemModal"
      title="新增资金条目"
      preset="dialog"
      :destroy-on-close="true"
      :width="auto"
      :min-width="400"
      :max-width="600"
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
      :width="auto"
      :min-width="400"
      :max-width="600"
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
      :width="auto"
      :min-width="400"
      :max-width="600"
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
      :width="auto"
      :min-width="300"
      :max-width="400"
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
      :width="auto"
      :min-width="600"
      :max-width="800"
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
import { ref, onMounted, computed, watch, h } from 'vue'
import { supabase } from '../supabase'
import { useMessage, NIcon } from 'naive-ui'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
])
import {
  AddOutline,
  RefreshOutline,
  SearchOutline,
  EyeOutline,
  CreateOutline,
  TrashOutline,
  ListOutline,
  TrendingUpOutline,
  TrendingDownOutline,
  SettingsOutline,
  CashOutline
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
const selectedTimeRange = ref('all')

// 时间范围选项
const timeRangeOptions = [
  { label: '全部', value: 'all' },
  { label: '今年', value: 'this_year' },
  { label: '上一年', value: 'last_year' },
  { label: '近一年', value: 'last_12_months' },
  { label: '上三年', value: 'last_3_years' },
  { label: '近三年', value: 'last_36_months' }
]

// 弹窗状态
const showAddItemModal = ref(false)
const showEditItemModal = ref(false)
const showViewItemModal = ref(false)
const showDeleteConfirm = ref(false)
const showCategoryManagerModal = ref(false)

// 图表状态
const chartHeight = ref('400px')
const customChartMin = ref(null)
const customChartMax = ref(null)
const showCustomLimitsForm = ref(false)

// 按时间范围筛选后的月度数据
const timeFilteredMonthlyStats = computed(() => {
  // 先根据时间范围筛选原始条目
  const filtered = filterByTimeRange(items.value, selectedTimeRange.value)
  
  // 然后重新按月份分组
  const monthlyData = new Map()
  
  filtered.forEach(item => {
    const recordDate = new Date(item.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    const key = `${year}-${month}`
    
    if (!monthlyData.has(key)) {
      monthlyData.set(key, { amount: 0, count: 0, items: [] })
    }
    
    const monthData = monthlyData.get(key)
    monthData.amount += item.amount
    monthData.count += 1
    monthData.items.push(item)
    monthData.year = year
    monthData.month = month
  })
  
  // 转换为数组并按日期排序
  return Array.from(monthlyData.entries())
    .map(([key, data]) => ({ ...data, key }))
    .sort((a, b) => {
      const [yearA, monthA] = a.key.split('-').map(Number)
      const [yearB, monthB] = b.key.split('-').map(Number)
      if (yearA !== yearB) return yearA - yearB
      return monthA - monthB
    })
})

// 折线图数据
const lineChartOption = computed(() => {
  const stats = timeFilteredMonthlyStats.value
  const xAxisData = stats.map(stat => `${stat.year}-${(stat.month + 1).toString().padStart(2, '0')}`)
  const amountData = stats.map(stat => stat.amount)
  
  // 计算环比和同比数据
  const growthRateData = stats.map((stat, index) => {
    if (index === 0) return 0
    const previousStat = stats[index - 1]
    const growth = stat.amount - previousStat.amount
    return previousStat.amount === 0 ? 0 : parseFloat(((growth / previousStat.amount) * 100).toFixed(2))
  })
  
  const yoyGrowthRateData = stats.map((stat, index) => {
    const [currentYear, currentMonth] = stat.key.split('-').map(Number)
    const sameMonthLastYearKey = `${currentYear - 1}-${currentMonth}`
    const sameMonthLastYearStat = stats.find(s => s.key === sameMonthLastYearKey)
    if (!sameMonthLastYearStat) return 0
    const growth = stat.amount - sameMonthLastYearStat.amount
    return sameMonthLastYearStat.amount === 0 ? 0 : parseFloat(((growth / sameMonthLastYearStat.amount) * 100).toFixed(2))
  })
  
  return {
    title: {
      text: '资金变化趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      triggerOn: 'mousemove'
    },
    legend: {
      data: ['金额', '环比', '同比'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: xAxisData
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '金额(元)',
        min: customChartMin.value !== null ? customChartMin.value : 'dataMin',
        max: customChartMax.value !== null ? customChartMax.value : 'dataMax'
      },
      {
        type: 'value',
        name: '增长率(%)',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [
      {
        name: '金额',
        type: 'line',
        data: amountData,
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 160, 88, 0.3)' },
              { offset: 1, color: 'rgba(24, 160, 88, 0.05)' }
            ]
          }
        }
      },
      {
        name: '环比',
        type: 'line',
        yAxisIndex: 1,
        data: growthRateData,
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#f53f3f'
        }
      },
      {
        name: '同比',
        type: 'line',
        yAxisIndex: 1,
        data: yoyGrowthRateData,
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#3b82f6'
        }
      }
    ]
  }
})

// 面积图数据
const areaChartOption = computed(() => {
  const stats = timeFilteredMonthlyStats.value
  const xAxisData = stats.map(stat => `${stat.year}-${(stat.month + 1).toString().padStart(2, '0')}`)
  
  // 计算累计金额
  let cumulativeTotal = 0
  const cumulativeData = stats.map(stat => {
    cumulativeTotal += stat.amount
    return cumulativeTotal
  })
  
  // 计算年度累计金额
  let currentYear = null
  let annualCumulative = 0
  const annualCumulativeData = stats.map(stat => {
    if (currentYear !== stat.year) {
      currentYear = stat.year
      annualCumulative = 0
    }
    annualCumulative += stat.amount
    return annualCumulative
  })
  
  return {
    title: {
      text: '累计金额变化',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      triggerOn: 'mousemove'
    },
    legend: {
      data: ['累计总金额', '年度累计金额'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      name: '金额(元)',
      min: customChartMin.value !== null ? customChartMin.value : 'dataMin',
      max: customChartMax.value !== null ? customChartMax.value : 'dataMax'
    },
    series: [
      {
        name: '累计总金额',
        type: 'line',
        data: cumulativeData,
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        }
      },
      {
        name: '年度累计金额',
        type: 'line',
        data: annualCumulativeData,
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 63, 63, 0.3)' },
              { offset: 1, color: 'rgba(245, 63, 63, 0.05)' }
            ]
          }
        }
      }
    ]
  }
})

// 年度汇总数据
const annualSummary = computed(() => {
  const annualData = new Map()
  
  items.value.forEach(item => {
    const recordDate = new Date(item.record_date)
    const year = recordDate.getFullYear()
    
    if (!annualData.has(year)) {
      annualData.set(year, 0)
    }
    
    annualData.set(year, annualData.get(year) + item.amount)
  })
  
  // 转换为数组并按年份排序
  return Array.from(annualData.entries())
    .map(([year, amount]) => ({ year, amount }))
    .sort((a, b) => a.year - b.year)
})

// 年度汇总柱状图数据
const annualBarChartOption = computed(() => {
  const data = annualSummary.value
  const xAxisData = data.map(item => item.year)
  const amountData = data.map(item => item.amount)
  
  return {
    title: {
      text: '年度资金汇总',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      triggerOn: 'mousemove'
    },
    legend: {
      data: ['金额', '趋势'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      name: '金额(元)'
    },
    series: [
      {
        name: '金额',
        type: 'bar',
        data: amountData,
        itemStyle: {
          color: '#18a058'
        }
      },
      {
        name: '趋势',
        type: 'line',
        data: amountData,
        smooth: true,
        itemStyle: {
          color: '#f53f3f'
        },
        emphasis: {
          focus: 'series'
        }
      }
    ]
  }
})

// 图表点击事件
const handleChartClick = (params) => {
  message.info(`点击了: ${params.name} - ${params.value}`)
}

// 自定义图表上下限
const applyCustomLimits = () => {
  showCustomLimitsForm.value = false
}

const resetCustomLimits = () => {
  customChartMin.value = null
  customChartMax.value = null
}

// 监听筛选条件变化，重置自定义上下限
watch(
  [selectedCategory, selectedSubcategory, selectedDate, selectedTimeRange],
  () => {
    resetCustomLimits()
  }
)

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

// 按月份分组计算
const monthlyStats = computed(() => {
  const monthlyData = new Map()
  
  items.value.forEach(item => {
    const recordDate = new Date(item.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    const key = `${year}-${month}`
    
    if (!monthlyData.has(key)) {
      monthlyData.set(key, { amount: 0, count: 0, items: [] })
    }
    
    const monthData = monthlyData.get(key)
    monthData.amount += item.amount
    monthData.count += 1
    monthData.items.push(item)
    monthData.year = year
    monthData.month = month
  })
  
  // 转换为数组并按日期排序
  return Array.from(monthlyData.entries())
    .map(([key, data]) => ({ ...data, key }))
    .sort((a, b) => {
      const [yearA, monthA] = a.key.split('-').map(Number)
      const [yearB, monthB] = b.key.split('-').map(Number)
      if (yearA !== yearB) return yearA - yearB
      return monthA - monthB
    })
})

// 计算增长、同比、环比
const calculateGrowthStats = (currentAmount, currentKey, monthlyStats) => {
  const [currentYear, currentMonth] = currentKey.split('-').map(Number)
  
  // 计算环比：与上月比较
  const previousMonthKey = currentMonth === 0 
    ? `${currentYear - 1}-${11}` 
    : `${currentYear}-${currentMonth - 1}`
  const previousMonthData = monthlyStats.find(stat => stat.key === previousMonthKey)
  const previousAmount = previousMonthData?.amount || 0
  
  const growth = currentAmount - previousAmount
  const growthRate = previousAmount === 0 ? 0 : ((growth / previousAmount) * 100).toFixed(2)
  
  // 计算同比：与去年同月比较
  const sameMonthLastYearKey = `${currentYear - 1}-${currentMonth}`
  const sameMonthLastYearData = monthlyStats.find(stat => stat.key === sameMonthLastYearKey)
  const sameMonthLastYearAmount = sameMonthLastYearData?.amount || 0
  
  const yoyGrowth = currentAmount - sameMonthLastYearAmount
  const yoyGrowthRate = sameMonthLastYearAmount === 0 ? 0 : ((yoyGrowth / sameMonthLastYearAmount) * 100).toFixed(2)
  
  return {
    growth: parseFloat(growth.toFixed(2)),
    growthRate: parseFloat(growthRate),
    yoyGrowth: parseFloat(yoyGrowth.toFixed(2)),
    yoyGrowthRate: parseFloat(yoyGrowthRate)
  }
}

// 统计信息
const totalAmount = computed(() => {
  return filteredItems.value.reduce((sum, item) => sum + item.amount, 0).toFixed(2)
})

const latestMonthStats = computed(() => {
  if (monthlyStats.value.length === 0) {
    return {
      currentAmount: 0,
      growth: 0,
      growthRate: 0,
      yoyGrowth: 0,
      yoyGrowthRate: 0
    }
  }
  
  // 获取最新月份数据
  const latestStat = monthlyStats.value[monthlyStats.value.length - 1]
  const currentAmount = latestStat.amount
  
  return {
    currentAmount,
    ...calculateGrowthStats(currentAmount, latestStat.key, monthlyStats.value)
  }
})

// 根据时间范围筛选
const filterByTimeRange = (items, timeRange) => {
  const now = new Date()
  const currentYear = now.getFullYear()
  
  return items.filter(item => {
    const itemDate = new Date(item.record_date)
    const itemYear = itemDate.getFullYear()
    
    switch (timeRange) {
      case 'this_year':
        return itemYear === currentYear
      case 'last_year':
        return itemYear === currentYear - 1
      case 'last_12_months':
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(now.getFullYear() - 1)
        return itemDate >= oneYearAgo
      case 'last_3_years':
        return itemYear >= currentYear - 3 && itemYear < currentYear
      case 'last_36_months':
        const threeYearsAgo = new Date()
        threeYearsAgo.setFullYear(now.getFullYear() - 3)
        return itemDate >= threeYearsAgo
      case 'all':
      default:
        return true
    }
  })
}

// 筛选后的条目
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
  
  // 按时间范围筛选
  result = filterByTimeRange(result, selectedTimeRange.value)
  
  // 按日期降序排序
  return result.sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
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
    width: 140,
    render(row) {
      const isPositive = row.amount >= 0
      return h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          color: isPositive ? '#18a058' : '#f53f3f'
        }
      }, [
        h(NIcon, null, {
          default: () => isPositive ? h(CashOutline) : h(CashOutline)
        }),
        `${isPositive ? '+' : ''}${row.amount.toFixed(2)}元`
      ])
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

const resetFilters = () => {
  selectedCategory.value = null
  selectedSubcategory.value = null
  selectedDate.value = null
  selectedTimeRange.value = 'all'
}

// 实时筛选：当筛选条件变化时，自动应用筛选
watch(
  [selectedCategory, selectedSubcategory, selectedDate, selectedTimeRange],
  () => {
    // 筛选逻辑已在computed属性中实现，这里可以添加额外的逻辑
  }
)

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

/* 图表相关样式 */
.chart-section {
  margin-bottom: 30px;
}

.chart-section :deep(.n-card) {
  border-radius: var(--custom-border-radius);
  box-shadow: var(--custom-box-shadow);
  border: var(--custom-border);
  overflow: hidden;
}

.charts-config-section {
  margin-bottom: 30px;
}

.charts-config-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.custom-limits-form {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--custom-border-radius);
  border: var(--custom-border);
}

.custom-limits-form h4 {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  color: var(--custom-color);
}

.form-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.form-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
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
  
  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-actions {
    margin-left: 0;
    margin-top: 15px;
    align-self: flex-end;
  }
  
  .chart-section :deep(.n-card) {
    padding: 10px;
  }
}
</style>