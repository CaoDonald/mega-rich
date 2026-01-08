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
      <n-button type="primary" @click="showBatchImportModal = true">
        <template #icon>
          <n-icon><CloudUploadOutline /></n-icon>
        </template>
        批量导入
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
      <n-button @click="resetFilters">
        <template #icon>
          <n-icon><RefreshOutline /></n-icon>
        </template>
        重置
      </n-button>
    </div>
    
    <!-- 资金条目列表 -->
    <div class="items-list">
      <n-card size="small">
        <n-data-table
          :columns="columns"
          :data="itemsWithGrowthStats"
          :pagination="{ pageSize: 20 }"
          :loading="loading"
           :row-key="row => row.id"
        />
      </n-card>
    </div>
    
    <!-- 统计信息 -->
    <div class="statistics-section">
      <n-card size="small">
        <h3>统计信息</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <n-statistic label="广义金额" :value="latestMonthStats.broadAmount" suffix="元" />
          </div>
          <div class="stat-item">
            <n-statistic label="可支配金额" :value="latestMonthStats.disposableAmount" suffix="元" />
          </div>
          <div class="stat-item">
            <n-statistic 
              label="广义金额增长" 
              :value="latestMonthStats.broadGrowth" 
              suffix="元"
              :value-style="{ color: latestMonthStats.broadGrowth >= 0 ? '#f53f3f' : '#18a058' }"
            >
              <template #prefix>
                <n-icon v-if="latestMonthStats.broadGrowth > 0"><TrendingUpOutline /></n-icon>
                <n-icon v-else-if="latestMonthStats.broadGrowth < 0"><TrendingDownOutline /></n-icon>
              </template>
            </n-statistic>
          </div>
          <div class="stat-item">
            <n-statistic 
              label="广义金额环比" 
              :value="latestMonthStats.broadGrowthRate" 
              suffix="%"
              :value-style="{ color: latestMonthStats.broadGrowthRate >= 0 ? '#f53f3f' : '#18a058' }"
            >
              <template #prefix>
                <n-icon v-if="latestMonthStats.broadGrowthRate > 0"><TrendingUpOutline /></n-icon>
                <n-icon v-else-if="latestMonthStats.broadGrowthRate < 0"><TrendingDownOutline /></n-icon>
              </template>
            </n-statistic>
          </div>
          <div class="stat-item">
            <n-statistic 
              label="广义金额同比" 
              :value="latestMonthStats.broadYoyGrowthRate" 
              suffix="%"
              :value-style="{ color: latestMonthStats.broadYoyGrowthRate >= 0 ? '#f53f3f' : '#18a058' }"
            >
              <template #prefix>
                <n-icon v-if="latestMonthStats.broadYoyGrowthRate > 0"><TrendingUpOutline /></n-icon>
                <n-icon v-else-if="latestMonthStats.broadYoyGrowthRate < 0"><TrendingDownOutline /></n-icon>
              </template>
            </n-statistic>
          </div>
          <div class="stat-item">
            <n-statistic 
              label="可支配金额增长" 
              :value="latestMonthStats.disposableGrowth" 
              suffix="元"
              :value-style="{ color: latestMonthStats.disposableGrowth >= 0 ? '#f53f3f' : '#18a058' }"
            >
              <template #prefix>
                <n-icon v-if="latestMonthStats.disposableGrowth > 0"><TrendingUpOutline /></n-icon>
                <n-icon v-else-if="latestMonthStats.disposableGrowth < 0"><TrendingDownOutline /></n-icon>
              </template>
            </n-statistic>
          </div>
          <div class="stat-item">
            <n-statistic 
              label="可支配金额环比" 
              :value="latestMonthStats.disposableGrowthRate" 
              suffix="%"
              :value-style="{ color: latestMonthStats.disposableGrowthRate >= 0 ? '#f53f3f' : '#18a058' }"
            >
              <template #prefix>
                <n-icon v-if="latestMonthStats.disposableGrowthRate > 0"><TrendingUpOutline /></n-icon>
                <n-icon v-else-if="latestMonthStats.disposableGrowthRate < 0"><TrendingDownOutline /></n-icon>
              </template>
            </n-statistic>
          </div>
          <div class="stat-item">
            <n-statistic 
              label="可支配金额同比" 
              :value="latestMonthStats.disposableYoyGrowthRate" 
              suffix="%"
              :value-style="{ color: latestMonthStats.disposableYoyGrowthRate >= 0 ? '#f53f3f' : '#18a058' }"
            >
              <template #prefix>
                <n-icon v-if="latestMonthStats.disposableYoyGrowthRate > 0"><TrendingUpOutline /></n-icon>
                <n-icon v-else-if="latestMonthStats.disposableYoyGrowthRate < 0"><TrendingDownOutline /></n-icon>
              </template>
            </n-statistic>
          </div>
        </div>
      </n-card>
    </div>
    
    <!-- 广义金额和可支配金额表格 -->
    <div class="amounts-table-section">
      <n-card size="small">
        <h3>广义金额与可支配金额统计</h3>
        <n-data-table
          :columns="statsColumns"
          :data="dateGroupedStats"
          :pagination="{ pageSize: 10 }"
          :row-key="row => row.date"
          :loading="loading"
        />
      </n-card>
    </div>
    
    <!-- 折线图 -->
    <div class="chart-section">
      <n-card size="small">
        <v-chart
          :option="lineChartOption"
          :style="{ height: chartHeight, width: '100%' }"
          @click="handleChartClick"
        />
      </n-card>
    </div>
    
    <!-- 一级分类资金变化趋势 -->
    <div class="chart-section">
      <n-card size="small">
        <v-chart
          :option="lineChartCategoryOption"
          :style="{ height: chartHeight, width: '100%' }"
          @click="handleChartClick"
        />
      </n-card>
    </div>
    
    <!-- 面积图 -->
    <div class="chart-section">
      <n-card size="small">
        <v-chart
          :option="areaChartOption"
          :style="{ height: chartHeight, width: '100%' }"
          @click="handleChartClick"
        />
      </n-card>
    </div>

    <!-- 年度汇总柱状图 -->
    <div class="chart-section">
      <n-card size="small">
        <v-chart
          :option="annualBarChartOption"
          :style="{ height: chartHeight, width: '100%' }"
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
      width="auto"
      :min-width="300"
      max-width="95vw"
      :style="{ maxHeight: '90vh', overflow: 'auto' }"
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
      width="auto"
      :min-width="300"
      max-width="95vw"
      :style="{ maxHeight: '90vh', overflow: 'auto' }"
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
      width="auto"
      :min-width="300"
      max-width="95vw"
      :style="{ maxHeight: '90vh', overflow: 'auto' }"
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
      width="auto"
      :min-width="280"
      max-width="90vw"
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
      width="auto"
      :min-width="300"
      max-width="95vw"
      :style="{ maxHeight: '90vh', overflow: 'auto' }"
    >
      <CategoryManagerModal
        :primary-categories="categories"
        :secondary-categories="subcategories"
        @update:primary-categories="handlePrimaryCategoriesUpdate"
        @update:secondary-categories="handleSecondaryCategoriesUpdate"
      />
    </n-modal>
    
    <!-- 批量导入弹窗 -->
    <n-modal
      v-model:show="showBatchImportModal"
      title="批量导入资金记录"
      preset="dialog"
      :destroy-on-close="true"
      width="auto"
      :min-width="300"
      max-width="95vw"
      :style="{ maxHeight: '90vh', overflow: 'auto' }"
    >
      <div class="batch-import-container">
        <div class="import-info">
          <h4>导入说明</h4>
          <ul>
            <li>支持 CSV、Excel (XLSX/XLS) 格式文件</li>
            <li>文件第一行必须包含标题行，支持的标题：金额、类型、记录日期、描述</li>
            <li>金额必须为数字，支持负数</li>
            <li>类型可选值：收入、支出</li>
            <li>记录日期格式：YYYY-MM-DD</li>
          </ul>
        </div>
        <div class="import-actions">
          <input
            ref="fileInputRef"
            type="file"
            accept=".csv,.xlsx,.xls"
            style="display: none"
            @change="handleFileChange"
          />
          <n-button
            type="primary"
            size="large"
            block
            @click="triggerFileInput"
            :loading="importing"
          >
            <template #icon>
              <n-icon><CloudUploadOutline /></n-icon>
            </template>
            {{ importing ? '解析中...' : '选择CSV/Excel文件' }}
          </n-button>
          <n-button
            type="default"
            size="large"
            block
            @click="downloadTemplate"
            style="margin-top: 12px"
          >
            <template #icon>
              <n-icon><CloudDownloadOutline /></n-icon>
            </template>
            下载Excel模板
          </n-button>
          <div class="file-format-tips">
            支持格式：CSV, Excel (XLSX, XLS)
          </div>
        </div>
        <div v-if="importResult" class="import-result">
          <n-alert
            :type="importResult.success ? 'success' : 'error'"
            :title="importResult.success ? '导入成功' : '导入失败'"
            :description="importResult.message"
            show-icon
            class="alert-with-icon"
          />
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, h } from 'vue'
import { supabase } from '../supabase'
import { useMessage, NIcon, NButton } from 'naive-ui'
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
import * as XLSX from 'xlsx'

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
  CashOutline,
  CaretUpOutline,
  CaretDownOutline,
  CloudUploadOutline,
  CloudDownloadOutline
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
const showBatchImportModal = ref(false)

// 批量导入状态
const fileInputRef = ref(null)
const importing = ref(false)
const importResult = ref(null)

// 图表状态
const chartHeight = ref('350px')
const customChartMin = ref(null)
const customChartMax = ref(null)
const showCustomLimitsForm = ref(false)

// 根据屏幕宽度动态调整图表高度
const updateChartHeight = () => {
  if (window.innerWidth < 768) {
    chartHeight.value = '300px'
  }
  if (window.innerWidth < 480) {
    chartHeight.value = '250px'
  }
  if (window.innerWidth < 360) {
    chartHeight.value = '220px'
  }
}

// 监听窗口大小变化，动态调整图表高度
window.addEventListener('resize', updateChartHeight)

// 初始化图表高度
updateChartHeight()

// 图表公共配置
const commonChartConfig = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
        fontSize: '11px',
        padding: [5, 8],
        // 给坐标轴指示器标签也提升层级
        zlevel: 200,
        // 确保标签不被裁剪
        overflow: 'none'
      },
      // 提升坐标轴指示器本身的层级
      zlevel: 200
    },
    triggerOn: 'click',
    padding: 10,
    // 进一步提高 zlevel 数值（避开其他元素的层级冲突）
    zlevel: 200,
    confine: false,
    // 关键：强制 tooltip 渲染到 body 下（脱离图表容器的层级限制）
    appendToBody: true,
    // 可选：增加 tooltip 内边距，避免内容边缘被遮挡
    textStyle: {
      fontSize: '11px',
      zlevel: 200
    }
  },
  legend: {
    top: 30,
    left: 'center',
    type: 'scroll',
    orient: 'horizontal',
    textStyle: {
      fontSize: '8px'
    },
    itemWidth: 8,
    itemHeight: 8,
    pageIconSize: 8,
    pageTextStyle: {
      fontSize: '9px'
    },
    pageButtonGap: 5,
    // 降低图例层级，避免遮挡 tooltip
    zlevel: 10
  },
  grid: {
    left: '8%',
    right: '8%',
    bottom: '10%',
    top: '30%',
    containLabel: true,
    // 降低网格层级
    zlevel: 10
  },
  dataZoom: {
    type: 'inside',
    start: 0,
    end: 100,
    // 降低数据缩放组件层级
    zlevel: 10
  },
  xAxis: {
    axisLabel: {
      fontSize: '10px',
      margin: 8
    },
    axisTick: {
      show: false,
      zlevel: 10
    },
    zlevel: 10
  },
  yAxis: {
    axisLabel: {
      fontSize: '8px',
      margin: 4,
      show: false
    },
    axisTick: {
      show: false,
      zlevel: 10
    },
    zlevel: 10
  },
  // 全局层级控制：确保 tooltip 所在画布层级最高
  zlevel: 1
}

// 按时间范围筛选后的月度数据
const timeFilteredMonthlyStats = computed(() => {
  // 先根据时间范围筛选原始条目
  const filtered = filterByTimeRange(items.value, selectedTimeRange.value)
  
  // 按月份和二级分类分组，每个分组只保留最新的一条记录
  const monthlySubcategoryData = new Map()
  
  // 遍历所有条目，按月份和二级分类分组
  filtered.forEach(item => {
    const recordDate = new Date(item.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    const subcategoryId = item.subcategory_id
    const key = `${year}-${month}-${subcategoryId}`
    
    // 检查是否已有该月份该二级分类的数据
    if (!monthlySubcategoryData.has(key)) {
      monthlySubcategoryData.set(key, item)
    } else {
      // 如果已有数据，比较日期，只保留最新的
      const existingItem = monthlySubcategoryData.get(key)
      const existingDate = new Date(existingItem.record_date)
      if (recordDate > existingDate) {
        monthlySubcategoryData.set(key, item)
      }
    }
  })
  
  // 将筛选后的条目重新按月份分组
  const monthlyData = new Map()
  
  Array.from(monthlySubcategoryData.values()).forEach(item => {
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
  
  // 按二级分类分组，计算每个分类在每个月的金额
  const subcategoryAmounts = new Map()
  
  // 遍历所有月度数据
  stats.forEach(stat => {
    const monthKey = stat.key
    
    // 遍历当月所有条目
    stat.items.forEach(item => {
      const subcategoryId = item.subcategory_id
      
      // 查找二级分类
      const subcategory = subcategories.value.find(s => s.id === subcategoryId)
      if (!subcategory) return
      
      // 检查是否需要根据一级分类过滤
      if (selectedCategory.value) {
        // 查找二级分类所属的一级分类
        const category = categories.value.find(c => c.id === subcategory.category_id)
        if (!category || category.id !== selectedCategory.value) {
          return // 不符合选中的一级分类，跳过
        }
      }
      
      // 检查是否需要根据二级分类过滤
      if (selectedSubcategory.value && subcategoryId !== selectedSubcategory.value) {
        return // 不符合选中的二级分类，跳过
      }
      
      const subcategoryName = subcategory.name
      
      // 初始化二级分类数据
      if (!subcategoryAmounts.has(subcategoryName)) {
        subcategoryAmounts.set(subcategoryName, new Map())
      }
      
      const subcategoryMap = subcategoryAmounts.get(subcategoryName)
      // 累加当月金额
      const currentAmount = subcategoryMap.get(monthKey) || 0
      subcategoryMap.set(monthKey, currentAmount + item.amount)
    })
  })
  
  // 准备系列数据
  const series = []
  const legendData = []
  
  // 定义颜色数组，用于不同的二级分类
  const colors = ['#18a058', '#f53f3f', '#3b82f6', '#e2c044', '#8c52ff', '#ff7875', '#5cdbd3', '#ffa940', '#95de64', '#f7b801', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911']
  let colorIndex = 0
  
  // 为每个二级分类创建系列
  subcategoryAmounts.forEach((amountMap, subcategoryName) => {
    // 准备该分类在所有月份的数据
    const data = stats.map(stat => {
      return amountMap.get(stat.key) || 0
    })
    
    series.push({
      name: subcategoryName,
      type: 'line',
      data: data,
      smooth: true,
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        color: colors[colorIndex % colors.length]
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `${colors[colorIndex % colors.length]}4d` }, // 4d 是透明度
            { offset: 1, color: `${colors[colorIndex % colors.length]}0d` } // 0d 是透明度
          ]
        }
      }
    })
    
    legendData.push(subcategoryName)
    colorIndex++
  })
  
  return {
    title: {
      text: '二级分类资金变化趋势',
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: '13px',
        fontWeight: '500'
      }
    },
    tooltip: commonChartConfig.tooltip,
    grid: commonChartConfig.grid,
    legend: {
      ...commonChartConfig.legend,
      data: legendData,
      itemWidth: 10,  // 统一图例项宽度
      itemHeight: 10, // 统一图例项高度
      textStyle: {
        fontSize: '11px'  // 统一图例文字大小
      }
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        ...commonChartConfig.xAxis
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: customChartMin.value !== null ? customChartMin.value : 'dataMin',
        max: customChartMax.value !== null ? customChartMax.value : 'dataMax',
        ...commonChartConfig.yAxis
      }
    ],
    series: series
  }
})

// 一级分类资金变化趋势数据
const lineChartCategoryOption = computed(() => {
  const stats = timeFilteredMonthlyStats.value
  const xAxisData = stats.map(stat => `${stat.year}-${(stat.month + 1).toString().padStart(2, '0')}`)
  
  // 按一级分类分组，计算每个分类在每个月的金额
  const categoryAmounts = new Map()
  
  // 遍历所有月度数据
  stats.forEach(stat => {
    const monthKey = stat.key
    
    // 遍历当月所有条目
    stat.items.forEach(item => {
      const subcategoryId = item.subcategory_id
      
      // 查找二级分类
      const subcategory = subcategories.value.find(s => s.id === subcategoryId)
      if (!subcategory) return
      
      // 查找一级分类
      const category = categories.value.find(c => c.id === subcategory.category_id)
      if (!category) return
      
      // 检查是否需要根据一级分类过滤
      if (selectedCategory.value && category.id !== selectedCategory.value) {
        return // 不符合选中的一级分类，跳过
      }
      
      const categoryName = category.name
      
      // 初始化一级分类数据
      if (!categoryAmounts.has(categoryName)) {
        categoryAmounts.set(categoryName, new Map())
      }
      
      const categoryMap = categoryAmounts.get(categoryName)
      // 累加当月金额
      const currentAmount = categoryMap.get(monthKey) || 0
      categoryMap.set(monthKey, currentAmount + item.amount)
    })
  })
  
  // 准备系列数据
  const series = []
  const legendData = []
  
  // 定义颜色数组，用于不同的一级分类
  const colors = ['#18a058', '#f53f3f', '#3b82f6', '#e2c044', '#8c52ff', '#ff7875', '#5cdbd3', '#ffa940', '#95de64', '#f7b801', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911']
  let colorIndex = 0
  
  // 为每个一级分类创建系列
  categoryAmounts.forEach((amountMap, categoryName) => {
    // 准备该分类在所有月份的数据
    const data = stats.map(stat => {
      return amountMap.get(stat.key) || 0
    })
    
    series.push({
      name: categoryName,
      type: 'line',
      data: data,
      smooth: true,
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        color: colors[colorIndex % colors.length]
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `${colors[colorIndex % colors.length]}4d` }, // 4d 是透明度
            { offset: 1, color: `${colors[colorIndex % colors.length]}0d` } // 0d 是透明度
          ]
        }
      }
    })
    
    legendData.push(categoryName)
    colorIndex++
  })
  
  return {
    title: {
      text: '一级分类资金变化趋势',
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: '13px',
        fontWeight: '500'
      }
    },
    tooltip: commonChartConfig.tooltip,
    legend: {
      ...commonChartConfig.legend,
      data: legendData,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: '11px'
      }
    },
    grid: commonChartConfig.grid,
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        ...commonChartConfig.xAxis
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: customChartMin.value !== null ? customChartMin.value : 'dataMin',
        max: customChartMax.value !== null ? customChartMax.value : 'dataMax',
        ...commonChartConfig.yAxis
      }
    ],
    series: series
  }
})

// 面积图数据
const areaChartOption = computed(() => {
  // 获取原始月度数据
  const originalStats = timeFilteredMonthlyStats.value
  
  // 筛选符合条件的月度数据
  const filteredStats = originalStats.filter(stat => {
    // 检查该月度数据中是否有符合条件的条目
    return stat.items.some(item => {
      const subcategoryId = item.subcategory_id
      
      // 查找二级分类
      const subcategory = subcategories.value.find(s => s.id === subcategoryId)
      if (!subcategory) return false
      
      // 检查是否需要根据一级分类过滤
      if (selectedCategory.value) {
        // 查找二级分类所属的一级分类
        const category = categories.value.find(c => c.id === subcategory.category_id)
        if (!category || category.id !== selectedCategory.value) {
          return false // 不符合选中的一级分类
        }
      }
      
      // 检查是否需要根据二级分类过滤
      if (selectedSubcategory.value && subcategoryId !== selectedSubcategory.value) {
        return false // 不符合选中的二级分类
      }
      
      return true
    })
  })
  
  // 使用过滤后的数据，如果过滤后为空则使用原始数据
  const stats = filteredStats.length > 0 ? filteredStats : originalStats
  const xAxisData = stats.map(stat => `${stat.year}-${(stat.month + 1).toString().padStart(2, '0')}`)
  
  // 计算广义金额和可支配金额的当月数据
  const broadAmountData = stats.map(stat => {
    // 筛选符合条件的条目
    const filteredItems = stat.items.filter(item => {
      const subcategoryId = item.subcategory_id
      
      // 查找二级分类
      const subcategory = subcategories.value.find(s => s.id === subcategoryId)
      if (!subcategory) return false
      
      // 检查是否需要根据一级分类过滤
      if (selectedCategory.value) {
        // 查找二级分类所属的一级分类
        const category = categories.value.find(c => c.id === subcategory.category_id)
        if (!category || category.id !== selectedCategory.value) {
          return false // 不符合选中的一级分类，跳过
        }
      }
      
      // 检查是否需要根据二级分类过滤
      if (selectedSubcategory.value && subcategoryId !== selectedSubcategory.value) {
        return false // 不符合选中的二级分类，跳过
      }
      
      return true
    })
    
    // 计算广义金额
    const { broadAmount } = calculateBroadAndDisposableAmount(filteredItems)
    
    return broadAmount
  })
  
  const disposableAmountData = stats.map(stat => {
    // 筛选符合条件的条目
    const filteredItems = stat.items.filter(item => {
      const subcategoryId = item.subcategory_id
      
      // 查找二级分类
      const subcategory = subcategories.value.find(s => s.id === subcategoryId)
      if (!subcategory) return false
      
      // 检查是否需要根据一级分类过滤
      if (selectedCategory.value) {
        // 查找二级分类所属的一级分类
        const category = categories.value.find(c => c.id === subcategory.category_id)
        if (!category || category.id !== selectedCategory.value) {
          return false // 不符合选中的一级分类，跳过
        }
      }
      
      // 检查是否需要根据二级分类过滤
      if (selectedSubcategory.value && subcategoryId !== selectedSubcategory.value) {
        return false // 不符合选中的二级分类，跳过
      }
      
      return true
    })
    
    // 计算可支配金额
    const { disposableAmount } = calculateBroadAndDisposableAmount(filteredItems)
    
    return disposableAmount
  })
  
  return {
    title: {
      text: '总金额变化',
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: '13px',
        fontWeight: '500'
      }
    },
    tooltip: commonChartConfig.tooltip,
    legend: {
      ...commonChartConfig.legend,
      data: ['广义金额', '可支配金额'],
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: '11px'
      }
    },
    grid: commonChartConfig.grid,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      ...commonChartConfig.xAxis
    },
    yAxis: {
      type: 'value',
      min: customChartMin.value !== null ? customChartMin.value : 'dataMin',
      max: customChartMax.value !== null ? customChartMax.value : 'dataMax',
      ...commonChartConfig.yAxis
    },
    series: [
      {
        name: '广义金额',
        type: 'line',
        data: broadAmountData,
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
        name: '可支配金额',
        type: 'line',
        data: disposableAmountData,
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

// 月度负债和资产数据
const monthlyAssetsAndLiabilities = computed(() => {
  // 先按月份和二级分类分组，每个分组只保留最新的一条记录
  const monthlySubcategoryData = new Map()
  
  // 遍历所有条目，按月份和二级分类分组，保留最新记录
  items.value.forEach(item => {
    const recordDate = new Date(item.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    const subcategoryId = item.subcategory_id
    const key = `${year}-${month}-${subcategoryId}`
    
    // 检查是否已有该月份该二级分类的数据
    if (!monthlySubcategoryData.has(key)) {
      monthlySubcategoryData.set(key, item)
    } else {
      // 如果已有数据，比较日期，只保留最新的
      const existingItem = monthlySubcategoryData.get(key)
      const existingDate = new Date(existingItem.record_date)
      if (recordDate > existingDate) {
        monthlySubcategoryData.set(key, item)
      }
    }
  })
  
  // 再按月份分组计算资产和负债
  const monthlyData = new Map()
  
  Array.from(monthlySubcategoryData.values()).forEach(item => {
    const subcategoryId = item.subcategory_id
    
    // 查找二级分类
    const subcategory = subcategories.value.find(s => s.id === subcategoryId)
    if (!subcategory) return
    
    // 检查是否需要根据一级分类过滤
    if (selectedCategory.value) {
      // 查找二级分类所属的一级分类
      const category = categories.value.find(c => c.id === subcategory.category_id)
      if (!category || category.id !== selectedCategory.value) {
        return // 不符合选中的一级分类，跳过
      }
    }
    
    // 检查是否需要根据二级分类过滤
    if (selectedSubcategory.value && subcategoryId !== selectedSubcategory.value) {
      return // 不符合选中的二级分类，跳过
    }
    
    const recordDate = new Date(item.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    const key = `${year}-${month}`
    
    if (!monthlyData.has(key)) {
      monthlyData.set(key, { positive: 0, negative: 0, year, month })
    }
    
    const monthData = monthlyData.get(key)
    if (item.amount > 0) {
      monthData.positive += item.amount
    } else {
      monthData.negative += item.amount
    }
  })
  
  // 转换为数组并按月份排序
  return Array.from(monthlyData.values())
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
})

// 月度资金汇总面积图数据
const annualBarChartOption = computed(() => {
  const data = monthlyAssetsAndLiabilities.value
  const xAxisData = data.map(item => `${item.year}-${(item.month + 1).toString().padStart(2, '0')}`)
  const positiveData = data.map(item => parseFloat(item.positive.toFixed(2)))
  const negativeData = data.map(item => Math.abs(parseFloat(item.negative.toFixed(2))))
  
  return {
    title: {
      text: '月度资金汇总',
      left: 'center',
      top: 5,
      textStyle: {
        fontSize: '13px',
        fontWeight: '500'
      }
    },
    tooltip: commonChartConfig.tooltip,
    legend: {
      ...commonChartConfig.legend,
      data: ['资产', '负债'],
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: '11px'
      }
    },
    grid: commonChartConfig.grid,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      ...commonChartConfig.yAxis
    },
    series: [
      {
        name: '资产',
        type: 'line',
        data: positiveData,
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
        name: '负债',
        type: 'line',
        data: negativeData,
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
  return categories.value.filter(c => c).map(c => ({ label: c.name, value: c.id }))
})

const subcategoryOptions = computed(() => {
  if (!selectedCategory.value) {
    return subcategories.value.filter(s => s).map(s => ({ label: s.name, value: s.id }))
  }
  return subcategories.value
    .filter(s => s && s.category_id === selectedCategory.value)
    .map(s => ({ label: s.name, value: s.id }))
})

// 按月份分组计算
const monthlyStats = computed(() => {
  const monthlyData = new Map()
  
  filteredItems.value.forEach(item => {
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
  const growthRate = previousAmount === 0 ? 0 : ((growth / Math.abs(previousAmount)) * 100).toFixed(2)
  
  // 计算同比：与去年同月比较
  const sameMonthLastYearKey = `${currentYear - 1}-${currentMonth}`
  const sameMonthLastYearData = monthlyStats.find(stat => stat.key === sameMonthLastYearKey)
  const sameMonthLastYearAmount = sameMonthLastYearData?.amount || 0
  
  const yoyGrowth = currentAmount - sameMonthLastYearAmount
  const yoyGrowthRate = sameMonthLastYearAmount === 0 ? 0 : ((yoyGrowth / Math.abs(sameMonthLastYearAmount)) * 100).toFixed(2)
  
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

// 计算广义金额和可支配金额
const calculateBroadAndDisposableAmount = (items) => {
  // 广义金额：所有金额之和
  const broadAmount = items.reduce((sum, item) => sum + item.amount, 0)
  
  // 计算可支配金额：广义金额减去一级分类为房贷和二级分类为蜻蜓点金的金额
  const nonDisposableAmount = items.reduce((sum, item) => {
    // 查找二级分类
    const subcategory = subcategories.value.find(s => s.id === item.subcategory_id)
    if (!subcategory) return sum
    
    // 查找一级分类
    const category = categories.value.find(c => c.id === subcategory.category_id)
    if (!category) return sum
    
    // 检查是否为房贷一级分类或蜻蜓点金二级分类
    if (category.name === '房贷' || subcategory.name === '蜻蜓点金') {
      return sum + item.amount
    }
    
    return sum
  }, 0)
  
  const disposableAmount = broadAmount - nonDisposableAmount
  
  return {
    broadAmount: parseFloat(broadAmount.toFixed(2)),
    disposableAmount: parseFloat(disposableAmount.toFixed(2))
  }
}

const latestMonthStats = computed(() => {
  if (monthlyStats.value.length === 0) {
    return {
      currentAmount: 0,
      broadAmount: 0,
      disposableAmount: 0,
      growth: 0,
      growthRate: 0,
      yoyGrowth: 0,
      yoyGrowthRate: 0,
      broadGrowth: 0,
      broadGrowthRate: 0,
      broadYoyGrowth: 0,
      broadYoyGrowthRate: 0,
      disposableGrowth: 0,
      disposableGrowthRate: 0,
      disposableYoyGrowth: 0,
      disposableYoyGrowthRate: 0
    }
  }
  
  // 获取最新月份数据（如果选择了月份，则为选择的月份）
  const latestStat = monthlyStats.value[monthlyStats.value.length - 1]
  const currentAmount = latestStat.amount
  
  // 计算广义金额和可支配金额
  const { broadAmount, disposableAmount } = calculateBroadAndDisposableAmount(latestStat.items)
  
  // 计算金额的增长统计
  const amountGrowthStats = calculateGrowthStats(currentAmount, latestStat.key, monthlyStats.value)
  
  // 计算广义金额的增长统计
  const broadGrowthStats = calculateGrowthStats(broadAmount, latestStat.key, 
    monthlyStats.value.map(stat => ({
      ...stat,
      amount: calculateBroadAndDisposableAmount(stat.items).broadAmount
    }))
  )
  
  // 计算可支配金额的增长统计
  const disposableGrowthStats = calculateGrowthStats(disposableAmount, latestStat.key, 
    monthlyStats.value.map(stat => ({
      ...stat,
      amount: calculateBroadAndDisposableAmount(stat.items).disposableAmount
    }))
  )
  
  return {
    currentAmount,
    broadAmount,
    disposableAmount,
    ...amountGrowthStats,
    broadGrowth: broadGrowthStats.growth,
    broadGrowthRate: broadGrowthStats.growthRate,
    broadYoyGrowth: broadGrowthStats.yoyGrowth,
    broadYoyGrowthRate: broadGrowthStats.yoyGrowthRate,
    disposableGrowth: disposableGrowthStats.growth,
    disposableGrowthRate: disposableGrowthStats.growthRate,
    disposableYoyGrowth: disposableGrowthStats.yoyGrowth,
    disposableYoyGrowthRate: disposableGrowthStats.yoyGrowthRate
  }
})

// 按日期分组的统计数据（广义金额和可支配金额）
const dateGroupedStats = computed(() => {
  // 按日期分组
  const dateMap = new Map()
  
  filteredItems.value.forEach(item => {
    const recordDate = new Date(item.record_date)
    const dateKey = recordDate.toISOString().split('T')[0] // YYYY-MM-DD
    
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: dateKey,
        items: []
      })
    }
    
    dateMap.get(dateKey).items.push(item)
  })
  
  // 计算基本统计数据
  const basicStats = Array.from(dateMap.values()).map(stat => {
    // 广义金额：当日所有金额之和
    const broadAmount = stat.items.reduce((sum, item) => sum + item.amount, 0)
    
    // 计算可支配金额：广义金额减去一级分类为房贷和二级分类为蜻蜓点金的金额
    const nonDisposableAmount = stat.items.reduce((sum, item) => {
      // 查找二级分类
      const subcategory = subcategories.value.find(s => s.id === item.subcategory_id)
      if (!subcategory) return sum
      
      // 查找一级分类
      const category = categories.value.find(c => c.id === subcategory.category_id)
      if (!category) return sum
      
      // 检查是否为房贷一级分类或蜻蜓点金二级分类
      if (category.name === '房贷' || subcategory.name === '蜻蜓点金') {
        return sum + item.amount
      }
      
      return sum
    }, 0)
    
    const disposableAmount = broadAmount - nonDisposableAmount
    
    return {
      date: stat.date,
      broadAmount: parseFloat(broadAmount.toFixed(2)),
      disposableAmount: parseFloat(disposableAmount.toFixed(2))
    }
  }).sort((a, b) => new Date(a.date) - new Date(b.date)) // 先按日期正序排列，方便计算指标
  
  // 计算增长、环比、同比指标
  return basicStats.map((stat, index) => {
    const currentDate = new Date(stat.date)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const day = currentDate.getDate()
    
    // 广义金额指标
    // 1. 增长（与前一天比较）
    const prevBroadAmount = index > 0 ? basicStats[index - 1].broadAmount : 0
    const broadGrowth = stat.broadAmount - prevBroadAmount
    const broadGrowthRate = prevBroadAmount === 0 ? 0 : ((broadGrowth / Math.abs(prevBroadAmount)) * 100)
    
    // 2. 同比（与去年同期比较）
    const sameDayLastYearDate = new Date(year - 1, month, day)
    const sameDayLastYearKey = sameDayLastYearDate.toISOString().split('T')[0]
    const sameDayLastYearStat = basicStats.find(s => s.date === sameDayLastYearKey)
    const sameDayLastYearBroadAmount = sameDayLastYearStat?.broadAmount || 0
    const broadYoyGrowth = stat.broadAmount - sameDayLastYearBroadAmount
    const broadYoyGrowthRate = sameDayLastYearBroadAmount === 0 ? 0 : ((broadYoyGrowth / Math.abs(sameDayLastYearBroadAmount)) * 100)
    
    // 可支配金额指标
    // 1. 增长（与前一天比较）
    const prevDisposableAmount = index > 0 ? basicStats[index - 1].disposableAmount : 0
    const disposableGrowth = stat.disposableAmount - prevDisposableAmount
    const disposableGrowthRate = prevDisposableAmount === 0 ? 0 : ((disposableGrowth / Math.abs(prevDisposableAmount)) * 100)
    
    // 2. 同比（与去年同期比较）
    const sameDayLastYearDisposableAmount = sameDayLastYearStat?.disposableAmount || 0
    const disposableYoyGrowth = stat.disposableAmount - sameDayLastYearDisposableAmount
    const disposableYoyGrowthRate = sameDayLastYearDisposableAmount === 0 ? 0 : ((disposableYoyGrowth / Math.abs(sameDayLastYearDisposableAmount)) * 100)
    
    return {
      ...stat,
      // 广义金额指标
      broadGrowth: parseFloat(broadGrowth.toFixed(2)),
      broadGrowthRate: parseFloat(broadGrowthRate.toFixed(2)),
      broadYoyGrowth: parseFloat(broadYoyGrowth.toFixed(2)),
      broadYoyGrowthRate: parseFloat(broadYoyGrowthRate.toFixed(2)),
      // 可支配金额指标
      disposableGrowth: parseFloat(disposableGrowth.toFixed(2)),
      disposableGrowthRate: parseFloat(disposableGrowthRate.toFixed(2)),
      disposableYoyGrowth: parseFloat(disposableYoyGrowth.toFixed(2)),
      disposableYoyGrowthRate: parseFloat(disposableYoyGrowthRate.toFixed(2))
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date)) // 最终按日期倒序排列
})

// 新增表格列配置
const statsColumns = [
  {
    title: '日期',
    key: 'date',
    width: 120,
    render(row) {
      return new Date(row.date).toLocaleDateString()
    }
  },
  {
    title: '广义金额',
    key: 'broadAmount',
    width: 120,
    render(row) {
      const isPositive = row.broadAmount >= 0
      return h('div', {
        style: {
          color: isPositive ? '#f53f3f' : '#18a058'
        }
      }, `${isPositive ? '+' : ''}${row.broadAmount.toFixed(2)}元`)
    }
  },
  {
    title: '增长',
    key: 'broadGrowth',
    width: 100,
    render(row) {
      const isPositive = row.broadGrowth >= 0
      return h('div', {
        style: {
          color: isPositive ? '#f53f3f' : '#18a058'
        }
      }, `${isPositive ? '+' : ''}${row.broadGrowth.toFixed(2)}元`)
    }
  },
  {
    title: '环比',
    key: 'broadGrowthRate',
    width: 100,
    render(row) {
      const isPositive = row.broadGrowthRate >= 0
      return h('div', {
        style: {
          color: isPositive ? '#f53f3f' : '#18a058'
        }
      }, `${isPositive ? '+' : ''}${row.broadGrowthRate.toFixed(2)}%`)
    }
  },
  {
    title: '同比',
    key: 'broadYoyGrowthRate',
    width: 100,
    render(row) {
      const isPositive = row.broadYoyGrowthRate >= 0
      return h('div', {
        style: {
          color: isPositive ? '#f53f3f' : '#18a058'
        }
      }, `${isPositive ? '+' : ''}${row.broadYoyGrowthRate.toFixed(2)}%`)
    }
  },
  {
    title: '可支配金额',
    key: 'disposableAmount',
    width: 140,
    render(row) {
      const isPositive = row.disposableAmount >= 0
      return h('div', {
        style: {
          color: isPositive ? '#f53f3f' : '#18a058'
        }
      }, `${isPositive ? '+' : ''}${row.disposableAmount.toFixed(2)}元`)
    }
  },
  {
    title: '增长',
    key: 'disposableGrowth',
    width: 100,
    render(row) {
      const isPositive = row.disposableGrowth >= 0
      return h('div', {
        style: {
          color: isPositive ? '#f53f3f' : '#18a058'
        }
      }, `${isPositive ? '+' : ''}${row.disposableGrowth.toFixed(2)}元`)
    }
  },
  {
    title: '环比',
    key: 'disposableGrowthRate',
    width: 100,
    render(row) {
      const isPositive = row.disposableGrowthRate >= 0
      return h('div', {
        style: {
          color: isPositive ? '#f53f3f' : '#18a058'
        }
      }, `${isPositive ? '+' : ''}${row.disposableGrowthRate.toFixed(2)}%`)
    }
  },
  {
    title: '同比',
    key: 'disposableYoyGrowthRate',
    width: 100,
    render(row) {
      const isPositive = row.disposableYoyGrowthRate >= 0
      return h('div', {
        style: {
          color: isPositive ? '#f53f3f' : '#18a058'
        }
      }, `${isPositive ? '+' : ''}${row.disposableYoyGrowthRate.toFixed(2)}%`)
    }
  }
]

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

// 计算带有增长统计的条目
const itemsWithGrowthStats = computed(() => {
  // 获取所有条目，按日期降序排序
  const allItems = [...items.value].sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
  
  // 创建一个映射，按二级分类分组所有条目
  const itemsBySubcategory = new Map()
  allItems.forEach(item => {
    if (!itemsBySubcategory.has(item.subcategory_id)) {
      itemsBySubcategory.set(item.subcategory_id, [])
    }
    itemsBySubcategory.get(item.subcategory_id).push(item)
  })
  
  // 创建一个映射，存储每个二级分类下每个月份的最新记录（用于同比计算）
  const monthlyLatestBySubcategory = new Map()
  allItems.forEach(item => {
    const recordDate = new Date(item.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    const subcategoryKey = item.subcategory_id
    const monthKey = `${year}-${month}`
    
    if (!monthlyLatestBySubcategory.has(subcategoryKey)) {
      monthlyLatestBySubcategory.set(subcategoryKey, new Map())
    }
    
    const subcategoryMonthlyMap = monthlyLatestBySubcategory.get(subcategoryKey)
    if (!subcategoryMonthlyMap.has(monthKey)) {
      subcategoryMonthlyMap.set(monthKey, item)
    }
  })
  
  return filteredItems.value.map(item => {
    const recordDate = new Date(item.record_date)
    const year = recordDate.getFullYear()
    const month = recordDate.getMonth()
    const subcategoryId = item.subcategory_id
    
    // 获取同一二级分类下的所有条目
    const sameSubcategoryItems = itemsBySubcategory.get(subcategoryId) || []
    
    // 查找当前条目的上一条记录（同一二级分类，按日期排序）
    const currentIndex = sameSubcategoryItems.findIndex(i => i.id === item.id)
    const previousItem = currentIndex < sameSubcategoryItems.length - 1 ? sameSubcategoryItems[currentIndex + 1] : null
    
    // 计算增长和环比（与上一条记录比较）
    let growth = 0
    let growthRate = 0
    
    if (previousItem) {
      growth = item.amount - previousItem.amount
      growthRate = previousItem.amount === 0 ? 0 : ((growth / Math.abs(previousItem.amount)) * 100).toFixed(2)
    }
    
    // 计算同比（与去年同月最新记录比较）
    let yoyGrowth = 0
    let yoyGrowthRate = 0
    
    const sameMonthLastYearKey = `${year - 1}-${month}`
    const subcategoryMonthlyMap = monthlyLatestBySubcategory.get(subcategoryId)
    const sameMonthLastYearItem = subcategoryMonthlyMap?.get(sameMonthLastYearKey)
    
    if (sameMonthLastYearItem) {
      yoyGrowth = item.amount - sameMonthLastYearItem.amount
      yoyGrowthRate = sameMonthLastYearItem.amount === 0 ? 0 : ((yoyGrowth / Math.abs(sameMonthLastYearItem.amount)) * 100).toFixed(2)
    }
    
    return {
      ...item,
      growth: parseFloat(growth.toFixed(2)),
      growthRate: parseFloat(growthRate),
      yoyGrowth: parseFloat(yoyGrowth.toFixed(2)),
      yoyGrowthRate: parseFloat(yoyGrowthRate)
    }
  })
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
    width: 120,
    render(row) {
      return new Date(row.record_date).toLocaleDateString()
    }
  },
  {
    title: '增长',
    key: 'growth',
    width: 120,
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
    key: 'growthRate',
    width: 120,
    render(row) {
      const value = parseFloat(row.growthRate || 0)
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
    key: 'yoyGrowthRate',
    width: 120,
    render(row) {
      const value = parseFloat(row.yoyGrowthRate || 0)
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
    width: 120,
    render(row) {
      return h('div', { class: 'actions-cell' }, [
        // 查看图标按钮
        h('div', {
          class: 'icon-btn icon-btn-primary',
          onClick: () => handleViewItem(row),
          title: '查看记录'
        }, [
          h(NIcon, { size: 18 }, { default: () => h(EyeOutline) })
        ]),
        // 编辑图标按钮
        h('div', {
          class: 'icon-btn icon-btn-info',
          onClick: () => handleEditItem(row),
          title: '编辑记录'
        }, [
          h(NIcon, { size: 18 }, { default: () => h(CreateOutline) })
        ]),
        // 删除图标按钮
        h('div', {
          class: 'icon-btn icon-btn-error',
          onClick: () => handleDeleteItem(row),
          title: '删除记录'
        }, [
          h(NIcon, { size: 18 }, { default: () => h(TrashOutline) })
        ])
      ])
    }
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

// 批量导入相关方法
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
    
    // 1. 提取所有分类，统一创建不存在的分类
    const { primaryCategoriesMap, secondaryCategoriesMap } = await extractAndCreateCategories(records)
    
    // 2. 验证记录，使用已创建的分类ID
    const validRecords = await validateRecordsWithCategories(records, primaryCategoriesMap, secondaryCategoriesMap)
    
    // 3. 批量插入记录
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
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map((line, i) => {
    const values = line.split(',').map(v => v.trim())
    const record = {}
    headers.forEach((h, j) => record[h] = values[j] || '')
    return record
  })
}

// 创建分类的辅助函数
const createPrimaryCategory = async (name) => {
  try {
    const { data, error } = await supabase
      .from('balance_categories')
      .insert({
        name: name,
        description: `${name}分类（自动创建）`
      })
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('创建一级分类失败:', error)
    throw error
  }
}

const createSecondaryCategory = async (name, categoryId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('请先登录')
    
    const { data, error } = await supabase
      .from('balance_subcategories')
      .insert({
        user_id: user.id,
        category_id: categoryId,
        name: name,
        description: `${name}子分类（自动创建）`
      })
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('创建二级分类失败:', error)
    throw error
  }
}

const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        resolve(json)
      } catch (error) {
        reject(new Error('Excel解析失败: ' + error.message))
      }
    }
    reader.onerror = () => reject(new Error('Excel读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

// 提取并创建分类的函数
const extractAndCreateCategories = async (records) => {
  // 使用Map存储分类，避免重复创建
  const primaryCategoriesSet = new Set()
  const secondaryCategoriesMap = new Map() // key: 一级分类名称|二级分类名称, value: 二级分类名称
  
  // 1. 提取所有分类组合
  for (const record of records) {
    const primaryCategoryName = (record['一级分类'] || '').toString().trim()
    const secondaryCategoryName = (record['二级分类'] || '').toString().trim()
    
    if (primaryCategoryName && secondaryCategoryName) {
      primaryCategoriesSet.add(primaryCategoryName)
      // 使用一级分类+二级分类作为唯一键，确保不同一级分类下的同名二级分类可以共存
      const comboKey = `${primaryCategoryName}|${secondaryCategoryName}`
      secondaryCategoriesMap.set(comboKey, { primaryCategoryName, secondaryCategoryName })
    }
  }
  
  // 2. 创建不存在的一级分类
  message.info(`开始处理一级分类，共 ${primaryCategoriesSet.size} 个...`)
  for (const name of primaryCategoriesSet) {
    // 检查是否已存在
    const exists = categories.value.filter(c => c).some(c => c.name === name)
    if (!exists) {
      try {
        // 自动创建一级分类
        await createPrimaryCategory(name)
        message.info(`自动创建了一级分类 "${name}"`)
      } catch (error) {
        console.error(`创建一级分类失败：${error.message}`)
        throw error
      }
    }
  }
  
  // 3. 重新查询所有一级分类
  message.info('重新加载一级分类数据...')
  const { data: categoriesData } = await supabase
    .from('balance_categories')
    .select('*')
    .order('created_at', { ascending: true })
  categories.value = categoriesData || []
  
  // 4. 创建不存在的二级分类
  message.info(`开始处理二级分类，共 ${secondaryCategoriesMap.size} 个...`)
  for (const [comboKey, { primaryCategoryName, secondaryCategoryName }] of secondaryCategoriesMap) {
    // 查找对应的一级分类ID
    const primaryCategory = categories.value.filter(c => c).find(c => c.name === primaryCategoryName)
    if (!primaryCategory || !primaryCategory.id) {
      throw new Error(`无法获取一级分类"${primaryCategoryName}"的ID`)
    }
    
    // 检查二级分类是否已存在
    const exists = subcategories.value.filter(s => s).some(s => 
      s.name === secondaryCategoryName && s.category_id === primaryCategory.id
    )
    
    if (!exists) {
      try {
        // 自动创建二级分类
        await createSecondaryCategory(secondaryCategoryName, primaryCategory.id)
        message.info(`自动创建了二级分类 "${secondaryCategoryName}"`)
      } catch (error) {
        console.error(`创建二级分类失败：${error.message}`)
        throw error
      }
    }
  }
  
  // 5. 重新查询所有二级分类
  message.info('重新加载二级分类数据...')
  const { data: subcategoriesData } = await supabase
    .from('balance_subcategories')
    .select('*')
    .order('created_at', { ascending: true })
  subcategories.value = subcategoriesData || []
  
  // 6. 构建分类映射
  const finalPrimaryCategoriesMap = new Map()
  for (const category of categories.value) {
    if (category && category.name && category.id) {
      finalPrimaryCategoriesMap.set(category.name, category.id)
    }
  }
  
  const finalSecondaryCategoriesMap = new Map()
  for (const subcategory of subcategories.value) {
    if (subcategory && subcategory.name && subcategory.id && subcategory.category_id) {
      // 找到对应的一级分类名称
      const primaryCategory = categories.value.find(c => c && c.id === subcategory.category_id)
      if (primaryCategory && primaryCategory.name) {
        const comboKey = `${primaryCategory.name}|${subcategory.name}`
        finalSecondaryCategoriesMap.set(comboKey, subcategory.id)
      }
    }
  }
  
  return { primaryCategoriesMap: finalPrimaryCategoriesMap, secondaryCategoriesMap: finalSecondaryCategoriesMap }
}

// 使用预创建的分类验证记录
const validateRecordsWithCategories = async (records, primaryCategoriesMap, secondaryCategoriesMap) => {
  const valid = []
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const errors = []
    const rowNum = i + 2

    // 1. 提取数据（只支持中文列名，参照月薪模块）
    let subcategoryId = null
    const amount = parseFloat(record['金额'].toString().trim())
    let recordDate = record['记录日期']
    const description = (record['描述'] || '').toString().trim()

    // 2. 验证金额
    if (isNaN(amount)) {
      errors.push(`金额必须是数字（第${rowNum}行）`)
    }

    // 3. 处理分类（只支持中文列名）
    // 提取一级分类和二级分类名称
    const primaryCategoryName = (record['一级分类'] || '').toString().trim()
    const secondaryCategoryName = (record['二级分类'] || '').toString().trim()
    
    if (!primaryCategoryName) {
      errors.push(`一级分类不能为空（第${rowNum}行）`)
    }
    if (!secondaryCategoryName) {
      errors.push(`二级分类不能为空（第${rowNum}行）`)
    }
    
    if (primaryCategoryName && secondaryCategoryName) {
      // 使用预创建的分类映射获取分类ID
      const comboKey = `${primaryCategoryName}|${secondaryCategoryName}`
      subcategoryId = secondaryCategoriesMap.get(comboKey)
      
      if (!subcategoryId) {
        errors.push(`分类映射失败，请检查分类数据（第${rowNum}行）`)
      }
    } else {
      errors.push(`一级分类和二级分类不能为空（第${rowNum}行）`)
    }

    // 4. 处理和验证日期
    // 先检查是否为数字日期（Excel日期格式）
    if (typeof recordDate === 'number') {
      try {
        recordDate = XLSX.SSF.format('yyyy-mm-dd', recordDate)
      } catch (error) {
        errors.push(`日期转换失败（第${rowNum}行）`)
      }
    } else {
      // 转换为字符串并去除空格
      recordDate = recordDate.toString().trim()
      // 尝试转换各种日期格式
      const parsedDate = new Date(recordDate)
      if (!isNaN(parsedDate.getTime())) {
        recordDate = parsedDate.toISOString().split('T')[0]
      }
    }
    
    // 验证最终日期格式
    if (!recordDate || isNaN(Date.parse(recordDate))) {
      errors.push(`日期格式无效，请使用 YYYY-MM-DD 格式（第${rowNum}行）`)
    }

    // 5. 验证必填字段 - 只有在没有其他错误的情况下才验证
    if (errors.length === 0) {
      if (!subcategoryId) {
        errors.push(`二级分类不能为空或无效（第${rowNum}行）`)
      }
    }

    if (errors.length === 0) {
      valid.push({
        amount,
        subcategory_id: subcategoryId,
        record_date: recordDate,
        description
      })
    } else {
      // 详细的错误提示
      const errorMsg = `第${rowNum}行导入失败：${errors.join('；')}`
      console.error(errorMsg)
      message.warning(errorMsg)
    }
  }

  if (valid.length === 0) {
    throw new Error('无有效记录，请检查导入数据格式和内容')
  }
  
  message.success(`成功验证 ${valid.length} 条记录，开始导入...`)
  return valid
}

// 保留原validateRecords函数，以便向后兼容
const validateRecords = validateRecordsWithCategories

const batchInsertRecords = async (records) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('请先登录')

  const recordsWithUserId = records.map(r => ({
    ...r,
    user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  const batchSize = 50
  for (let i = 0; i < recordsWithUserId.length; i += batchSize) {
    const batch = recordsWithUserId.slice(i, i + batchSize)
    const startRow = i + 2 // 记录从第2行开始（第1行是标题）
    const endRow = Math.min(i + batchSize + 1, records.length + 1)
    
    try {
      const { error } = await supabase.from('balance_items').insert(batch)
      if (error) {
        throw new Error(`第${startRow}行至第${endRow}行导入失败: ${error.message}`)
      }
    } catch (error) {
      // 增强错误信息，包含行号范围
      if (!error.message.includes('行')) {
        throw new Error(`第${startRow}行至第${endRow}行导入失败: ${error.message}`)
      }
      throw error
    }
  }
}

const downloadTemplate = () => {
  // 创建简洁的模板数据，参照月薪模块
  const templateData = [
    {
      "一级分类": "收入",
      "二级分类": "工资",
      "金额": 5000.00,
      "记录日期": "2025-12-01",
      "描述": "12月工资收入"
    },
    {
      "一级分类": "支出",
      "二级分类": "日常消费",
      "金额": -2000.00,
      "记录日期": "2025-12-05",
      "描述": "购买生活用品"
    }
  ]
  
  // 创建工作簿和单个工作表
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(templateData)
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '资金记录模板')
  
  // 下载文件
  XLSX.writeFile(wb, '资金记录导入模板.xlsx')
  
  // 显示成功消息
  message.success('模板下载成功')
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

/* 批量导入样式 */
.batch-import-container {
  max-width: 600px;
  margin: 0 auto;
}

.import-info {
  margin-bottom: 24px;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.import-info h4 {
  margin: 0 0 12px 0;
  color: var(--custom-color);
  font-size: 16px;
  font-weight: 600;
}

.import-info ul {
  margin: 0;
  padding-left: 20px;
  color: var(--custom-color-secondary);
  font-size: 14px;
}

.import-info li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.import-actions {
  margin-bottom: 24px;
  text-align: center;
}

.file-format-tips {
  margin-top: 12px;
  color: var(--custom-color-secondary);
  font-size: 12px;
  text-align: center;
}

.import-result {
  margin-top: 24px;
}

.alert-with-icon {
  margin-bottom: 0;
}

/* 图表相关样式 */
/* 图表容器样式优化 */
.chart-section {
  margin-bottom: 30px;
  width: 100%;          /* 强制容器宽度100% */
  box-sizing: border-box; /* 确保padding不影响宽度计算 */
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

/* 平板设备响应式设计 */
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
    align-items: stretch;
  }
  
  .action-buttons :deep(.n-button) {
    width: 100%;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }
  
  .filter-select {
    width: 100%;
    max-width: 100%;
    min-width: auto;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .statistics-section :deep(.n-card) {
    padding: 15px;
  }
  
  .stat-item {
    padding: 20px 15px;
  }
  
  .stat-item :deep(.n-statistic-value) {
    font-size: 1.5rem;
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
  
  /* 表格响应式设计 */
  .items-list :deep(.n-data-table) {
    font-size: 0.85rem;
  }
  
  .items-list :deep(.n-data-table-thead-th),
  .items-list :deep(.n-data-table-tbody-td) {
    padding: 8px 10px;
  }
  
  /* 统计表格响应式设计 */
  .amounts-table-section :deep(.n-data-table) {
    font-size: 0.85rem;
  }
  
  /* 图表高度响应式调整 */
  .chart-section :deep(.v-chart) {
    height: 300px !important;
  }
}

/* 手机设备响应式设计 */
@media (max-width: 480px) {
  .balance-container {
    padding: 15px 10px;
    min-height: calc(100vh - 100px);
  }
  
  .balance-container h2 {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  
  .action-buttons {
    margin-bottom: 20px;
  }
  
  .filter-section {
    margin-bottom: 20px;
    padding: 12px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-item {
    padding: 15px 12px;
  }
  
  .stat-item :deep(.n-statistic-value) {
    font-size: 1.3rem;
  }
  
  .stat-item :deep(.n-statistic-suffix) {
    font-size: 1rem;
  }
  
  .statistics-section {
    margin-bottom: 20px;
  }
  
  .items-list {
    margin-bottom: 20px;
  }
  
  .chart-section {
    margin-bottom: 20px;
  }
  
  /* 表格响应式设计 - 允许横向滚动 */
  .items-list :deep(.n-card) {
    overflow-x: auto;
  }
  
  .items-list :deep(.n-data-table-wrapper) {
    overflow-x: auto;
    width: 100%;
  }
  
  .amounts-table-section :deep(.n-card) {
    overflow-x: auto;
  }
  
  .amounts-table-section :deep(.n-data-table-wrapper) {
    overflow-x: auto;
    width: 100%;
  }
  
  /* 图表高度进一步调整 */
  .chart-section :deep(.v-chart) {
    height: 250px !important;
  }
  
  /* 批量导入样式调整 */
  .batch-import-container {
    padding: 0 10px;
  }
  
  /* 详情页样式调整 */
  .detail-row {
    padding: 8px;
  }
  
  .detail-label {
    font-size: 0.9rem;
  }
  
  .detail-value {
    font-size: 0.9rem;
  }
}

/* 超小屏幕设备响应式设计 */
@media (max-width: 360px) {
  .balance-container {
    padding: 10px 8px;
  }
  
  .action-buttons {
    gap: 8px;
  }
  
  .filter-section {
    gap: 8px;
    padding: 10px;
  }
  
  .stats-grid {
    gap: 10px;
  }
  
  .stat-item {
    padding: 12px 10px;
  }
  
  /* 图表高度最小调整 */
  .chart-section :deep(.v-chart) {
    height: 200px !important;
  }
}
</style>