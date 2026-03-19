<template>
  <div class="plan-detail">
    <!-- 计划信息卡片 -->
    <Card title="计划信息" class="info-card">
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">计划名称</span>
          <span class="info-value">{{ plan.plan_name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">基金名称</span>
          <span class="info-value">{{ plan.fund_name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">基金代码</span>
          <span class="info-value code">{{ plan.fund_code }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">定投类型</span>
          <span class="info-value">{{ getPlanTypeText(plan.plan_type) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">定投金额</span>
          <span class="info-value primary">¥{{ formatMoney(plan.amount) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">定投频率</span>
          <span class="info-value">{{ getFrequencyText(plan.frequency) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">开始日期</span>
          <span class="info-value">{{ formatDate(plan.start_date) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">结束日期</span>
          <span class="info-value">{{ plan.end_date ? formatDate(plan.end_date) : '长期有效' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">下次执行</span>
          <span class="info-value">{{ formatDate(plan.next_execute_date) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">计划状态</span>
          <n-tag :type="getStatusType(plan.status)">
            {{ getStatusText(plan.status) }}
          </n-tag>
        </div>
      </div>
    </Card>

    <!-- 收益分析卡片 -->
    <Card title="收益分析" class="profit-card">
      <div class="profit-stats">
        <div class="profit-item">
          <span class="profit-label">累计投入</span>
          <span class="profit-value">¥{{ formatMoney(plan.total_invested || 0) }}</span>
        </div>
        <div class="profit-item">
          <span class="profit-label">累计份额</span>
          <span class="profit-value">{{ formatShares(plan.total_shares || 0) }}</span>
        </div>
        <div class="profit-item">
          <span class="profit-label">当前市值</span>
          <span class="profit-value">¥{{ formatMoney(currentValue) }}</span>
        </div>
        <div class="profit-item">
          <span class="profit-label">累计收益</span>
          <span :class="['profit-value', profitClass]">
            {{ profitSign }}¥{{ formatMoney(Math.abs(totalProfit)) }}
          </span>
        </div>
        <div class="profit-item">
          <span class="profit-label">收益率</span>
          <span :class="['profit-value', profitClass]">
            {{ profitSign }}{{ formatPercent(profitRate) }}
          </span>
        </div>
      </div>
    </Card>

    <!-- 定投成本曲线图 -->
    <Card title="定投成本曲线" class="chart-card">
      <Chart v-if="chartOption" :option="chartOption" height="300px" />
      <Empty v-else description="暂无数据" />
    </Card>

    <!-- 执行记录列表 -->
    <Card title="执行记录" class="records-card">
      <Loading v-if="recordsLoading" text="加载中..." />

      <Empty v-else-if="!recordsLoading && records.length === 0" description="暂无执行记录" />

      <div v-else class="records-list">
        <div
          v-for="record in records"
          :key="record.id"
          class="record-item"
        >
          <div class="record-date">
            {{ formatDateTime(record.transaction_date) }}
          </div>
          <div class="record-info">
            <div class="record-row">
              <span class="record-label">交易类型</span>
              <n-tag :type="record.transaction_type === 'buy' ? 'success' : 'error'" size="small">
                {{ record.transaction_type === 'buy' ? '买入' : '卖出' }}
              </n-tag>
            </div>
            <div class="record-row">
              <span class="record-label">交易金额</span>
              <span class="record-value">¥{{ formatMoney(record.amount) }}</span>
            </div>
            <div class="record-row">
              <span class="record-label">交易净值</span>
              <span class="record-value">{{ record.nav }}</span>
            </div>
            <div class="record-row">
              <span class="record-label">交易份额</span>
              <span class="record-value">{{ formatShares(record.shares) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NTag } from 'naive-ui'
import Card from '../base/Card.vue'
import Chart from '../base/Chart.vue'
import Loading from '../base/Loading.vue'
import Empty from '../base/Empty.vue'
import { useChart } from '../../composables/useChart.js'
import SupabaseService from '../../services/SupabaseService.js'

const props = defineProps({
  plan: {
    type: Object,
    required: true
  },
  currentNav: {
    type: Number,
    default: 0
  }
})

const { getLineChartConfig, colorSchemes, formatMoney: chartFormatMoney } = useChart()

const records = ref([])
const recordsLoading = ref(false)

// 计算当前市值
const currentValue = computed(() => {
  if (!props.currentNav || !props.plan.total_shares) return 0
  return props.currentNav * props.plan.total_shares
})

// 计算累计收益
const totalProfit = computed(() => {
  return currentValue.value - (props.plan.total_invested || 0)
})

// 计算收益率
const profitRate = computed(() => {
  if (!props.plan.total_invested) return 0
  return (totalProfit.value / props.plan.total_invested) * 100
})

// 收益样式类
const profitClass = computed(() => {
  return totalProfit.value >= 0 ? 'positive' : 'negative'
})

// 收益符号
const profitSign = computed(() => {
  return totalProfit.value >= 0 ? '+' : ''
})

// 图表配置
const chartOption = computed(() => {
  if (records.value.length === 0) return null

  const dates = []
  const costs = []
  const navs = []
  let totalAmount = 0
  let totalShares = 0

  records.value.slice().reverse().forEach(record => {
    if (record.transaction_type === 'buy') {
      totalAmount += record.amount
      totalShares += record.shares
      const avgCost = totalShares > 0 ? totalAmount / totalShares : 0

      dates.push(formatDate(record.transaction_date))
      costs.push(avgCost.toFixed(4))
      navs.push(record.nav)
    }
  })

  return getLineChartConfig({
    xAxis: {
      data: dates
    },
    yAxis: {
      name: '净值',
      axisLabel: {
        formatter: (value) => value.toFixed(2)
      }
    },
    tooltip: {
      formatter: (params) => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach(item => {
          result += `${item.marker}${item.seriesName}: ${parseFloat(item.value).toFixed(4)}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['平均成本', '买入净值']
    },
    series: [
      {
        name: '平均成本',
        data: costs,
        color: colorSchemes.profit[0],
        areaStyle: false
      },
      {
        name: '买入净值',
        data: navs,
        color: colorSchemes.profit[1],
        areaStyle: false
      }
    ]
  })
})

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    paused: 'warning',
    completed: 'default'
  }
  return typeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    active: '进行中',
    paused: '已暂停',
    completed: '已完成'
  }
  return textMap[status] || status
}

// 获取计划类型文本
const getPlanTypeText = (type) => {
  const textMap = {
    fixed: '定额定投',
    ratio: '定比定投'
  }
  return textMap[type] || type
}

// 获取频率文本
const getFrequencyText = (frequency) => {
  const textMap = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月'
  }
  return textMap[frequency] || frequency
}

// 格式化金额
const formatMoney = (value) => {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化份额
const formatShares = (value) => {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化百分比
const formatPercent = (value) => {
  return `${Math.abs(value).toFixed(2)}%`
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleString('zh-CN')
}

// 加载执行记录
const loadRecords = async () => {
  recordsLoading.value = true
  try {
    const data = await SupabaseService.fundTransactions.list(props.plan.user_id, {
      fundCode: props.plan.fund_code
    })
    // 过滤出属于该计划的交易记录
    records.value = data.filter(t => t.plan_id === props.plan.id)
  } catch (error) {
    console.error('加载执行记录失败:', error)
  } finally {
    recordsLoading.value = false
  }
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.plan-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: 500;
}

.info-value.code {
  font-family: monospace;
}

.info-value.primary {
  color: var(--color-primary);
  font-weight: 600;
}

.profit-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-xl);
}

.profit-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  text-align: center;
}

.profit-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.profit-value {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.profit-value.positive {
  color: var(--color-primary);
}

.profit-value.negative {
  color: var(--color-danger);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.record-item {
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-200);
}

.record-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.record-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.record-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.record-value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .profit-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .record-info {
    grid-template-columns: 1fr;
  }
}
</style>
