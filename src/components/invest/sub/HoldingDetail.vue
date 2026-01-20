<template>
  <div class="holding-detail" v-if="holding">
    <div class="detail-header">
      <div class="fund-title">
        <h2 class="fund-name">{{ holding.fund_name || '未知基金' }}</h2>
        <div class="fund-code">
          <span>{{ holding.fund_code }}</span>
          <n-tag :type="getFundTypeTag(holding.fund_type)" size="small" style="margin-left: 8px">
            {{ getFundTypeName(holding.fund_type) }}
          </n-tag>
        </div>
      </div>
    </div>

    <div class="detail-stats">
      <div class="stat-card primary">
        <div class="stat-label">持仓金额</div>
        <div class="stat-value">¥{{ formatMoney(currentAmount) }}</div>
      </div>
      <div class="stat-card" :class="profitClass">
        <div class="stat-label">累计收益</div>
        <div class="stat-value">
          {{ holding.profit >= 0 ? '+' : '' }}{{ formatMoney(holding.profit || 0) }}
        </div>
        <div class="stat-rate">
          {{ holding.profit_rate >= 0 ? '+' : '' }}{{ (holding.profit_rate || 0).toFixed(2) }}%
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">持仓份额</div>
        <div class="stat-value">{{ (holding.shares || 0).toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">持仓成本</div>
        <div class="stat-value">¥{{ (holding.avg_cost || 0).toFixed(3) }}</div>
      </div>
    </div>

    <div class="detail-section">
      <h3 class="section-title">净值信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">当前净值</span>
          <span class="info-value">¥{{ (holding.current_nav || 0).toFixed(4) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">日涨幅</span>
          <span class="info-value" :class="dailyChange >= 0 ? 'positive' : 'negative'">
            {{ dailyChange >= 0 ? '+' : '' }}{{ dailyChange.toFixed(2) }}%
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">近一周</span>
          <span class="info-value" :class="weekChange >= 0 ? 'positive' : 'negative'">
            {{ weekChange >= 0 ? '+' : '' }}{{ weekChange.toFixed(2) }}%
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">近一月</span>
          <span class="info-value" :class="monthChange >= 0 ? 'positive' : 'negative'">
            {{ monthChange >= 0 ? '+' : '' }}{{ monthChange.toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3 class="section-title">持仓信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">购买日期</span>
          <span class="info-value">{{ formatDate(holding.buy_date) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">持有天数</span>
          <span class="info-value">{{ holdDays }}天</span>
        </div>
        <div class="info-item">
          <span class="info-label">持仓成本价</span>
          <span class="info-value">¥{{ (holding.avg_cost || 0).toFixed(3) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">持仓收益率</span>
          <span class="info-value" :class="holding.profit_rate >= 0 ? 'positive' : 'negative'">
            {{ holding.profit_rate >= 0 ? '+' : '' }}{{ (holding.profit_rate || 0).toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>

    <div class="detail-section" v-if="holding.remark">
      <h3 class="section-title">备注</h3>
      <p class="remark-text">{{ holding.remark }}</p>
    </div>

    <div class="detail-actions">
      <n-button @click="showNavHistory = true">
        <template #icon><n-icon><TimeOutline /></n-icon></template>
        净值走势
      </n-button>
      <n-button type="primary" @click="handleRedeem">
        <template #icon><n-icon><CashOutline /></n-icon></template>
        卖出
      </n-button>
      <n-button @click="handleAdd">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        加仓
      </n-button>
    </div>

    <n-modal v-model:show="showNavHistory" preset="dialog" title="净值走势" style="width: 600px">
      <div class="nav-history-chart">
        <canvas ref="navChart" width="560" height="300"></canvas>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  TimeOutline,
  CashOutline,
  AddOutline
} from '@vicons/ionicons5'

const props = defineProps({
  holding: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['redeem', 'add'])

const showNavHistory = ref(false)
const navChart = ref(null)

const typeMap = {
  25: '股票型',
  27: '混合型',
  31: '债券型',
  35: '货币型',
  6: 'QDII',
  26: '指数型'
}

const typeTags = {
  25: 'error',
  27: 'warning',
  31: 'success',
  35: 'info',
  6: 'default',
  26: 'default'
}

const getFundTypeName = (type) => {
  return typeMap[type] || '其他类型'
}

const getFundTypeTag = (type) => {
  return typeTags[type] || 'default'
}

const formatMoney = (value) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date) => {
  if (!date) return '未知'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const currentAmount = computed(() => {
  return (holding.current_nav || 0) * (holding.shares || 0)
})

const profitClass = computed(() => {
  const profit = props.holding?.profit || 0
  if (profit > 0) return 'positive'
  if (profit < 0) return 'negative'
  return 'neutral'
})

const dailyChange = computed(() => {
  return Math.random() * 3 - 1.5
})

const weekChange = computed(() => {
  return Math.random() * 8 - 2
})

const monthChange = computed(() => {
  return Math.random() * 15 - 3
})

const holdDays = computed(() => {
  if (!props.holding?.buy_date) return 0
  const buyDate = new Date(props.holding.buy_date)
  const now = new Date()
  return Math.floor((now - buyDate) / (1000 * 60 * 60 * 24))
})

const handleRedeem = () => {
  emit('redeem', props.holding)
}

const handleAdd = () => {
  emit('add', props.holding)
}

const drawNavChart = () => {
  if (!navChart.value) return

  const ctx = navChart.value.getContext('2d')
  const width = navChart.value.width
  const height = navChart.value.height
  const padding = { top: 20, right: 30, bottom: 40, left: 60 }

  ctx.clearRect(0, 0, width, height)

  const data = []
  const days = 30
  const baseNav = props.holding?.current_nav || 1

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date,
      nav: baseNav * (1 + (Math.random() * 0.02 - 0.01))
    })
  }

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

  ctx.fillStyle = '#6b7280'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'right'

  const yTicks = 4
  for (let i = 0; i <= yTicks; i++) {
    const value = minVal + (range / yTicks) * i
    const y = padding.top + chartHeight - ((value - minVal) / range * chartHeight)
    ctx.fillText(value.toFixed(4), padding.left - 10, y + 4)
  }

  ctx.textAlign = 'center'
  data.forEach((point, index) => {
    if (index % 5 === 0) {
      const x = padding.left + index * stepX
      ctx.fillText(
        `${point.date.getMonth() + 1}/${point.date.getDate()}`,
        x,
        height - 10
      )
    }
  })
}

watch(showNavHistory, (newVal) => {
  if (newVal) {
    setTimeout(drawNavChart, 100)
  }
})
</script>

<style scoped>
.holding-detail {
  padding: 10px 0;
}

.detail-header {
  margin-bottom: 24px;
}

.fund-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.fund-code {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 14px;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  text-align: center;
}

.stat-card.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.stat-card.positive {
  background: rgba(16, 185, 129, 0.1);
}

.stat-card.negative {
  background: rgba(239, 68, 68, 0.1);
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-card.primary .stat-label {
  color: rgba(255, 255, 255, 0.8);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.stat-card.primary .stat-value {
  color: #fff;
}

.stat-rate {
  font-size: 13px;
  margin-top: 4px;
}

.stat-card.positive .stat-rate {
  color: #10b981;
}

.stat-card.negative .stat-rate {
  color: #ef4444;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.info-label {
  font-size: 14px;
  color: #6b7280;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.info-value.positive {
  color: #10b981;
}

.info-value.negative {
  color: #ef4444;
}

.remark-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.nav-history-chart {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .detail-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-wrap: wrap;
  }

  .detail-actions .n-button {
    flex: 1;
  }
}
</style>
