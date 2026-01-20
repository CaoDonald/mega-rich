<template>
  <div class="historical-trends">
    <div class="trends-header">
      <div class="header-left">
        <div class="asset-tabs">
          <n-radio-group v-model:value="assetType" name="assetType">
            <n-radio-button v-for="tab in assetTabs" :key="tab.value" :value="tab.value">
              {{ tab.label }}
            </n-radio-button>
          </n-radio-group>
        </div>
      </div>
      <div class="header-right">
        <n-select
          v-model:value="selectedFund"
          :options="fundOptions"
          placeholder="选择基金"
          filterable
          clearable
          style="width: 200px"
        />
        <n-select
          v-model:value="chartType"
          :options="chartTypeOptions"
          style="width: 120px"
        />
      </div>
    </div>

    <n-card class="main-chart-card">
      <template #header>
        <div class="chart-header">
          <span>{{ chartTitle }}</span>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot" style="background: #3b82f6"></span>
              持仓收益
            </span>
            <span class="legend-item">
              <span class="legend-dot" style="background: #10b981"></span>
              同类平均
            </span>
            <span class="legend-item">
              <span class="legend-dot" style="background: #f59e0b"></span>
              沪深300
            </span>
          </div>
        </div>
      </template>
      <div class="chart-container">
        <canvas ref="mainChart" width="800" height="350"></canvas>
        <div class="chart-tooltip" ref="tooltipRef" v-show="tooltipVisible">
          <div class="tooltip-date">{{ tooltipData.date }}</div>
          <div class="tooltip-item">
            <span class="dot" style="background: #3b82f6"></span>
            <span>持仓收益:</span>
            <span class="value" :class="tooltipData.profit >= 0 ? 'positive' : 'negative'">
              {{ tooltipData.profit >= 0 ? '+' : '' }}{{ tooltipData.profit }}%
            </span>
          </div>
          <div class="tooltip-item">
            <span class="dot" style="background: #10b981"></span>
            <span>同类平均:</span>
            <span class="value">{{ tooltipData.avg }}%</span>
          </div>
          <div class="tooltip-item">
            <span class="dot" style="background: #f59e0b"></span>
            <span>沪深300:</span>
            <span class="value">{{ tooltipData.hs300 }}%</span>
          </div>
        </div>
      </div>
      <div class="chart-stats">
        <div class="stat-item">
          <span class="stat-label">最高收益</span>
          <span class="stat-value positive">+{{ maxProfit.toFixed(2) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最低收益</span>
          <span class="stat-value negative">{{ minProfit.toFixed(2) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均收益</span>
          <span class="stat-value">{{ avgProfit.toFixed(2) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">胜率</span>
          <span class="stat-value">{{ winRate.toFixed(1) }}%</span>
        </div>
      </div>
    </n-card>

    <div class="trends-content">
      <n-card class="nav-trend-card">
        <template #header>
          <div class="card-header">
            <span>净值走势</span>
          </div>
        </template>
        <div class="nav-chart-container">
          <canvas ref="navChart" width="400" height="200"></canvas>
        </div>
        <div class="nav-legend">
          <span class="legend-item">
            <span class="legend-line" style="background: #3b82f6"></span>
            单位净值
          </span>
          <span class="legend-item">
            <span class="legend-line" style="background: #10b981"></span>
            累计净值
          </span>
        </div>
      </n-card>

      <n-card class="comparison-card">
        <template #header>
          <div class="card-header">
            <span>收益对比</span>
          </div>
        </template>
        <div class="comparison-list">
          <div class="comparison-item" v-for="item in comparisonData" :key="item.label">
            <div class="comparison-label">{{ item.label }}</div>
            <div class="comparison-bar">
              <div class="bar-bg">
                <div class="bar-fill" :style="{ width: item.width + '%', background: item.color }"></div>
              </div>
              <div class="bar-value" :class="item.profit >= 0 ? 'positive' : 'negative'">
                {{ item.profit >= 0 ? '+' : '' }}{{ item.profit.toFixed(2) }}%
              </div>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <n-card class="history-table-card">
      <template #header>
        <div class="card-header">
          <span>历史记录</span>
          <n-button text type="primary" @click="exportData">
            <template #icon><n-icon><DownloadOutline /></n-icon></template>
            导出
          </n-button>
        </div>
      </template>
      <n-data-table
        :columns="tableColumns"
        :data="historyData"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
      />
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, h } from 'vue'
import {
  DownloadOutline
} from '@vicons/ionicons5'

const userHoldings = inject('userHoldings')
const userProfitData = inject('userProfitData')

const assetType = ref('total')
const selectedFund = ref(null)
const chartType = ref('line')
const mainChart = ref(null)
const navChart = ref(null)
const tooltipRef = ref(null)
const tooltipVisible = ref(false)
const tooltipData = ref({
  date: '',
  profit: 0,
  avg: 0,
  hs300: 0
})

const assetTabs = [
  { label: '总资产', value: 'total' },
  { label: '持仓收益', value: 'holding' },
  { label: '组合收益', value: 'portfolio' }
]

const chartTypeOptions = [
  { label: '折线图', value: 'line' },
  { label: '面积图', value: 'area' }
]

const fundOptions = computed(() => {
  return userHoldings.value.map(h => ({
    label: `${h.fund_name || '未知基金'} (${h.fund_code})`,
    value: h.fund_code
  }))
})

const chartTitle = computed(() => {
  const titles = {
    total: '资产收益走势',
    holding: '持仓收益走势',
    portfolio: '组合收益走势'
  }
  return titles[assetType.value]
})

const chartData = computed(() => {
  const days = 30
  const data = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: `${date.getMonth() + 1}-${date.getDate()}`,
      profit: Math.random() * 20 - 5,
      avg: Math.random() * 15 - 3,
      hs300: Math.random() * 12 - 4,
      nav: 1 + Math.random() * 0.5,
      accNav: 1 + Math.random() * 0.6
    })
  }
  
  return data
})

const maxProfit = computed(() => {
  return Math.max(...chartData.value.map(d => d.profit))
})

const minProfit = computed(() => {
  return Math.min(...chartData.value.map(d => d.profit))
})

const avgProfit = computed(() => {
  return chartData.value.reduce((sum, d) => sum + d.profit, 0) / chartData.value.length
})

const winRate = computed(() => {
  const positiveDays = chartData.value.filter(d => d.profit >= 0).length
  return (positiveDays / chartData.value.length) * 100
})

const comparisonData = computed(() => {
  const totalProfit = userProfitData.value.totalProfitRate || 0
  return [
    { label: '我的收益', profit: totalProfit, width: Math.min(Math.abs(totalProfit) * 3, 100), color: '#3b82f6' },
    { label: '同类平均', profit: 8.5, width: Math.min(8.5 * 3, 100), color: '#10b981' },
    { label: '沪深300', profit: 5.2, width: Math.min(5.2 * 3, 100), color: '#f59e0b' },
    { label: '金牛奖平均', profit: 12.3, width: Math.min(12.3 * 3, 100), color: '#8b5cf6' }
  ]
})

const historyData = computed(() => {
  return chartData.value.map((d, index) => ({
    key: index,
    date: `2024-${d.date}`,
    nav: d.nav.toFixed(4),
    profit: d.profit.toFixed(2) + '%',
    avg: d.avg.toFixed(2) + '%',
    hs300: d.hs300.toFixed(2) + '%'
  }))
})

const pagination = {
  pageSize: 10
}

const tableColumns = [
  { title: '日期', key: 'date' },
  { title: '单位净值', key: 'nav' },
  {
    title: '持仓收益',
    key: 'profit',
    render(row) {
      const value = parseFloat(row.profit)
      return h('span', { style: { color: value >= 0 ? '#10b981' : '#ef4444' } }, row.profit)
    }
  },
  { title: '同类平均', key: 'avg' },
  { title: '沪深300', key: 'hs300' }
]

const formatMoney = (value) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const drawMainChart = () => {
  if (!mainChart.value) return
  
  const ctx = mainChart.value.getContext('2d')
  const width = mainChart.value.width
  const height = mainChart.value.height
  const padding = { top: 20, right: 30, bottom: 40, left: 60 }
  
  ctx.clearRect(0, 0, width, height)
  
  const data = chartData.value
  const profitValues = data.map(d => d.profit)
  const allValues = [...profitValues, ...data.map(d => d.avg), ...data.map(d => d.hs300)]
  const minVal = Math.min(...allValues) - 5
  const maxVal = Math.max(...allValues) + 5
  const range = maxVal - minVal || 1
  
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const stepX = chartWidth / (data.length - 1)
  
  const drawLine = (getValue, color, lineWidth = 2) => {
    ctx.beginPath()
    data.forEach((point, index) => {
      const x = padding.left + index * stepX
      const y = padding.top + chartHeight - ((getValue(point) - minVal) / range * chartHeight)
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
  
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  const zeroY = padding.top + chartHeight - ((0 - minVal) / range * chartHeight)
  ctx.beginPath()
  ctx.moveTo(padding.left, zeroY)
  ctx.lineTo(width - padding.right, zeroY)
  ctx.stroke()
  
  drawLine(d => d.hs300, '#f59e0b', 1.5)
  drawLine(d => d.avg, '#10b981', 1.5)
  drawLine(d => d.profit, '#3b82f6', 2)
  
  ctx.fillStyle = '#6b7280'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'right'
  
  const yTicks = 5
  for (let i = 0; i <= yTicks; i++) {
    const value = minVal + (range / yTicks) * i
    const y = padding.top + chartHeight - ((value - minVal) / range * chartHeight)
    ctx.fillText(value.toFixed(0) + '%', padding.left - 10, y + 4)
  }
  
  ctx.textAlign = 'center'
  data.forEach((point, index) => {
    if (index % 5 === 0) {
      const x = padding.left + index * stepX
      ctx.fillText(point.date, x, height - 10)
    }
  })
}

const drawNavChart = () => {
  if (!navChart.value) return
  
  const ctx = navChart.value.getContext('2d')
  const width = navChart.value.width
  const height = navChart.value.height
  const padding = { top: 20, right: 20, bottom: 30, left: 50 }
  
  ctx.clearRect(0, 0, width, height)
  
  const data = chartData.value
  const navValues = data.map(d => d.nav)
  const minVal = Math.min(...navValues) * 0.99
  const maxVal = Math.max(...navValues) * 1.01
  const range = maxVal - minVal || 1
  
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const stepX = chartWidth / (data.length - 1)
  
  ctx.beginPath()
  data.forEach((point, index) => {
    const x = padding.left + index * stepX
    const y = padding.top + chartHeight - ((point.nav - minVal) / range * chartHeight)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.stroke()
  
  ctx.beginPath()
  data.forEach((point, index) => {
    const x = padding.left + index * stepX
    const y = padding.top + chartHeight - ((point.accNav - minVal) / range * chartHeight)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 2
  ctx.stroke()
}

const exportData = () => {
  message.info('正在导出数据...')
}

onMounted(() => {
  setTimeout(() => {
    drawMainChart()
    drawNavChart()
  }, 100)
})
</script>

<style scoped>
.historical-trends {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.trends-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.asset-tabs {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.asset-tabs :deep(.n-radio-button) {
  border: none;
  border-radius: 6px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.main-chart-card {
  border-radius: 12px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-line {
  width: 16px;
  height: 3px;
  border-radius: 2px;
}

.chart-container {
  position: relative;
  overflow: hidden;
}

.chart-tooltip {
  position: absolute;
  background: rgba(31, 41, 55, 0.95);
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  pointer-events: none;
  z-index: 100;
  min-width: 160px;
}

.tooltip-date {
  font-weight: 600;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.tooltip-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tooltip-item .value {
  font-weight: 600;
  margin-left: auto;
}

.tooltip-item .value.positive {
  color: #10b981;
}

.tooltip-item .value.negative {
  color: #ef4444;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
}

.stat-value.positive {
  color: #10b981;
}

.stat-value.negative {
  color: #ef4444;
}

.trends-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.nav-trend-card,
.comparison-card {
  border-radius: 12px;
  overflow: hidden;
}

.nav-chart-container {
  display: flex;
  justify-content: center;
}

.nav-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
}

.comparison-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comparison-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comparison-label {
  width: 80px;
  font-size: 14px;
  color: #374151;
}

.comparison-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-bg {
  flex: 1;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-value {
  width: 70px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
}

.bar-value.positive {
  color: #10b981;
}

.bar-value.negative {
  color: #ef4444;
}

.history-table-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .trends-content {
    grid-template-columns: 1fr;
  }
  
  .chart-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .trends-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-right {
    flex-direction: column;
  }
  
  .header-right .n-select {
    width: 100% !important;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .chart-legend {
    flex-wrap: wrap;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .chart-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-value {
    font-size: 16px;
  }
  
  .comparison-label {
    width: 60px;
    font-size: 12px;
  }
}
</style>
