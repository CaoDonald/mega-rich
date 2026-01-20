<template>
  <div class="profit-analysis">
    <div class="analysis-header">
      <div class="time-selector">
        <n-radio-group v-model:value="timeRange" name="timeRange">
          <n-radio-button v-for="option in timeRangeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </n-radio-button>
        </n-radio-group>
      </div>
    </div>

    <div class="profit-summary">
      <n-card class="summary-card main-card">
        <div class="summary-main">
          <div class="summary-label">区间收益</div>
          <div class="summary-value" :class="profitTrend >= 0 ? 'positive' : 'negative'">
            <n-icon size="24">
              <TrendingUpOutline v-if="profitTrend >= 0" />
              <TrendingDownOutline v-else />
            </n-icon>
            <span>{{ profitTrend >= 0 ? '+' : '' }}{{ formatMoney(currentPeriodProfit) }}</span>
          </div>
          <div class="summary-rate" :class="profitTrend >= 0 ? 'positive' : 'negative'">
            {{ profitTrend >= 0 ? '+' : '' }}{{ profitTrend.toFixed(2) }}%
          </div>
        </div>
        <div class="summary-chart">
          <canvas ref="profitChart" width="300" height="120"></canvas>
        </div>
      </n-card>

      <div class="summary-cards">
        <n-card class="summary-card">
          <div class="card-label">期间买入</div>
          <div class="card-value">¥{{ formatMoney(periodBuy) }}</div>
        </n-card>
        <n-card class="summary-card">
          <div class="card-label">期间卖出</div>
          <div class="card-value">¥{{ formatMoney(periodSell) }}</div>
        </n-card>
        <n-card class="summary-card">
          <div class="card-label">分红收益</div>
          <div class="card-value positive">+{{ formatMoney(dividendProfit) }}</div>
        </n-card>
      </div>
    </div>

    <div class="analysis-content">
      <n-card class="analysis-card">
        <template #header>
          <div class="card-header">
            <span>收益分布</span>
          </div>
        </template>
        <div class="distribution-section">
          <div class="distribution-chart">
            <canvas ref="distributionChart" width="280" height="280"></canvas>
          </div>
          <div class="distribution-list">
            <div class="dist-item" v-for="(item, index) in profitDistribution" :key="item.label">
              <div class="dist-left">
                <span class="dist-color" :style="{ backgroundColor: distColors[index] }"></span>
                <span class="dist-label">{{ item.label }}</span>
              </div>
              <div class="dist-right">
                <span class="dist-value">{{ formatMoney(item.value) }}</span>
                <span class="dist-percent">{{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </n-card>

      <n-card class="analysis-card">
        <template #header>
          <div class="card-header">
            <span>收益排行</span>
            <n-tag :type="sortType === 'profit' ? 'primary' : 'default'" size="small" checkable @click="sortType = 'profit'">
              按收益
            </n-tag>
            <n-tag :type="sortType === 'rate' ? 'primary' : 'default'" size="small" checkable @click="sortType = 'rate'">
              按收益率
            </n-tag>
          </div>
        </template>
        <div class="ranking-list">
          <div class="ranking-item" v-for="(item, index) in profitRanking" :key="item.fundCode">
            <div class="ranking-index" :class="'rank-' + (index + 1)">
              {{ index + 1 }}
            </div>
            <div class="ranking-info">
              <div class="fund-name">{{ item.fundName }}</div>
              <div class="fund-code">{{ item.fundCode }}</div>
            </div>
            <div class="ranking-stats">
              <div class="ranking-profit" :class="item.profit >= 0 ? 'positive' : 'negative'">
                {{ item.profit >= 0 ? '+' : '' }}{{ formatMoney(item.profit) }}
              </div>
              <div class="ranking-rate" :class="item.rate >= 0 ? 'positive' : 'negative'">
                {{ item.rate >= 0 ? '+' : '' }}{{ item.rate.toFixed(2) }}%
              </div>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <n-card class="analysis-card monthly-stats">
      <template #header>
        <div class="card-header">
          <span>月度收益统计</span>
        </div>
      </template>
      <div class="monthly-grid">
        <div class="month-item" v-for="month in monthlyStats" :key="month.month">
          <div class="month-label">{{ month.label }}</div>
          <div class="month-value" :class="month.profit >= 0 ? 'positive' : 'negative'">
            {{ month.profit >= 0 ? '+' : '' }}{{ formatMoney(month.profit) }}
          </div>
          <div class="month-chart">
            <div class="chart-bar" :style="{ height: getBarHeight(month.profit) + '%' }"></div>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import {
  TrendingUpOutline,
  TrendingDownOutline
} from '@vicons/ionicons5'

const userHoldings = inject('userHoldings')
const userProfitData = inject('userProfitData')

const timeRange = ref('month')
const sortType = ref('profit')
const profitChart = ref(null)
const distributionChart = ref(null)

const timeRangeOptions = [
  { label: '近一周', value: 'week' },
  { label: '近一月', value: 'month' },
  { label: '近三月', value: 'quarter' },
  { label: '近一年', value: 'year' },
  { label: '全部', value: 'all' }
]

const distColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const formatMoney = (value) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const profitTrend = computed(() => {
  return userProfitData.value.totalProfitRate || 0
})

const currentPeriodProfit = computed(() => {
  return userProfitData.value.totalProfit || 0
})

const periodBuy = computed(() => {
  return userHoldings.value.reduce((sum, h) => sum + (h.total_invest || 0), 0)
})

const periodSell = computed(() => {
  return userHoldings.value.reduce((sum, h) => sum + (h.total_redeem || 0), 0)
})

const dividendProfit = computed(() => {
  return userHoldings.value.reduce((sum, h) => sum + (h.dividend || 0), 0)
})

const profitDistribution = computed(() => {
  const totalProfit = userProfitData.value.totalProfit || 1
  
  const types = {
    '持仓收益': userHoldings.value.reduce((sum, h) => sum + (h.profit || 0), 0),
    '分红收益': dividendProfit.value,
    '申购费优惠': periodBuy.value * 0.01,
    '赎回费节省': periodSell.value * 0.005,
    '其他收益': 0
  }
  
  return Object.entries(types).map(([label, value]) => ({
    label,
    value: Math.max(0, value),
    percent: totalProfit > 0 ? ((value / totalProfit) * 100).toFixed(1) : 0
  })).filter(item => item.value > 0)
})

const profitRanking = computed(() => {
  return userHoldings.value
    .map(h => ({
      fundName: h.fund_name || '未知基金',
      fundCode: h.fund_code || '',
      profit: h.profit || 0,
      rate: h.profit_rate || 0
    }))
    .sort((a, b) => {
      if (sortType.value === 'profit') {
        return b.profit - a.profit
      }
      return b.rate - a.rate
    })
    .slice(0, 10)
})

const monthlyStats = computed(() => {
  const months = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    
    months.push({
      month: `${year}-${String(month).padStart(2, '0')}`,
      label: `${month}月`,
      profit: Math.random() * 10000 - 2000,
      maxProfit: 10000
    })
  }
  
  return months
})

const getBarHeight = (profit) => {
  const max = 10000
  return Math.abs(profit) / max * 100
}

const drawProfitChart = () => {
  if (!profitChart.value) return
  
  const ctx = profitChart.value.getContext('2d')
  const width = 300
  const height = 120
  const padding = 20
  
  ctx.clearRect(0, 0, width, height)
  
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date,
      value: Math.random() * 1000 - 200
    })
  }
  
  const minValue = Math.min(...data.map(d => d.value))
  const maxValue = Math.max(...data.map(d => d.value))
  const range = maxValue - minValue || 1
  
  const stepX = (width - padding * 2) / (data.length - 1)
  const chartHeight = height - padding * 2
  
  ctx.beginPath()
  ctx.moveTo(padding, padding + chartHeight / 2)
  
  data.forEach((point, index) => {
    const x = padding + index * stepX
    const y = padding + chartHeight - ((point.value - minValue) / range * chartHeight)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.strokeStyle = userProfitData.value.totalProfit >= 0 ? '#10b981' : '#ef4444'
  ctx.lineWidth = 2
  ctx.stroke()
  
  ctx.beginPath()
  data.forEach((point, index) => {
    const x = padding + index * stepX
    const y = padding + chartHeight - ((point.value - minValue) / range * chartHeight)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
  ctx.lineWidth = 4
  ctx.stroke()
}

const drawDistributionChart = () => {
  if (!distributionChart.value || profitDistribution.value.length === 0) return
  
  const ctx = distributionChart.value.getContext('2d')
  const centerX = 140
  const centerY = 140
  const radius = 100
  
  ctx.clearRect(0, 0, 280, 280)
  
  const total = profitDistribution.value.reduce((sum, item) => sum + item.value, 0)
  let startAngle = -Math.PI / 2
  
  profitDistribution.value.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI
    
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = distColors[index % distColors.length]
    ctx.fill()
    
    startAngle += sliceAngle
  })
  
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI)
  ctx.fillStyle = '#fff'
  ctx.fill()
}

watch(timeRange, () => {
  setTimeout(() => {
    drawProfitChart()
  }, 100)
})

onMounted(() => {
  setTimeout(() => {
    drawProfitChart()
    drawDistributionChart()
  }, 100)
})
</script>

<style scoped>
.profit-analysis {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-header {
  display: flex;
  justify-content: flex-end;
}

.time-selector {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.time-selector :deep(.n-radio-button) {
  border: none;
  border-radius: 6px;
}

.profit-summary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.summary-card {
  border-radius: 12px;
  overflow: hidden;
}

.main-card {
  grid-column: span 1;
}

.summary-main {
  text-align: center;
  padding: 20px 0;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.summary-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.summary-value.positive {
  color: #10b981;
}

.summary-value.negative {
  color: #ef4444;
}

.summary-rate {
  font-size: 16px;
  font-weight: 600;
}

.summary-rate.positive {
  color: #10b981;
}

.summary-rate.negative {
  color: #ef4444;
}

.summary-chart {
  margin-top: 16px;
}

.summary-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-cards .summary-card {
  flex: 1;
  border-radius: 12px;
}

.card-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.card-value {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.card-value.positive {
  color: #10b981;
}

.analysis-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.analysis-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.distribution-section {
  display: flex;
  gap: 30px;
  align-items: center;
}

.distribution-chart {
  flex-shrink: 0;
}

.distribution-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dist-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dist-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.dist-label {
  font-size: 14px;
  color: #374151;
}

.dist-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dist-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.dist-percent {
  font-size: 13px;
  color: #6b7280;
  width: 50px;
  text-align: right;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.ranking-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  background: #e5e7eb;
  color: #6b7280;
}

.ranking-index.rank-1 {
  background: #fef3c7;
  color: #d97706;
}

.ranking-index.rank-2 {
  background: #e5e7eb;
  color: #4b5563;
}

.ranking-index.rank-3 {
  background: #fed7aa;
  color: #c2410c;
}

.ranking-info {
  flex: 1;
}

.fund-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.fund-code {
  font-size: 12px;
  color: #6b7280;
}

.ranking-stats {
  text-align: right;
}

.ranking-profit {
  font-size: 14px;
  font-weight: 600;
}

.ranking-profit.positive {
  color: #10b981;
}

.ranking-profit.negative {
  color: #ef4444;
}

.ranking-rate {
  font-size: 12px;
}

.ranking-rate.positive {
  color: #10b981;
}

.ranking-rate.negative {
  color: #ef4444;
}

.monthly-stats {
  border-radius: 12px;
}

.monthly-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.month-item {
  text-align: center;
}

.month-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.month-value {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.month-value.positive {
  color: #10b981;
}

.month-value.negative {
  color: #ef4444;
}

.month-chart {
  height: 60px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bar {
  width: 24px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(to top, #10b981, #34d399);
  transition: height 0.3s ease;
}

.month-value.negative ~ .month-chart .chart-bar {
  background: linear-gradient(to top, #ef4444, #f87171);
}

@media (max-width: 1024px) {
  .profit-summary {
    grid-template-columns: 1fr;
  }
  
  .main-card {
    grid-column: span 1;
  }
  
  .analysis-content {
    grid-template-columns: 1fr;
  }
  
  .monthly-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .time-selector {
    width: 100%;
    overflow-x: auto;
  }
  
  .summary-cards {
    flex-direction: row;
  }
  
  .distribution-section {
    flex-direction: column;
  }
  
  .monthly-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .monthly-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ranking-stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
