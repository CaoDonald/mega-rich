<template>
  <div class="holding-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="holding-detail__loading">
      <n-spin size="large" />
    </div>

    <template v-else-if="holding">
      <!-- 头部信息 -->
      <div class="holding-detail__header">
        <div class="holding-detail__title-section">
          <h2 class="holding-detail__name">{{ holding.fund_name }}</h2>
          <span class="holding-detail__code">{{ holding.fund_code }}</span>
        </div>
        <div class="holding-detail__actions">
          <n-button @click="handleEdit">编辑</n-button>
          <n-button type="error" @click="handleDelete">删除</n-button>
        </div>
      </div>

      <!-- 收益分析卡片 -->
      <Card class="holding-detail__profit-card">
        <div class="profit-analysis">
          <div class="profit-analysis__item">
            <div class="profit-analysis__label">持仓成本</div>
            <div class="profit-analysis__value">{{ formatMoney(totalCost) }}</div>
            <div class="profit-analysis__sub">{{ formatShares(holding.shares) }} 份 × {{ formatNav(holding.avg_cost) }}</div>
          </div>
          <div class="profit-analysis__divider"></div>
          <div class="profit-analysis__item">
            <div class="profit-analysis__label">当前市值</div>
            <div class="profit-analysis__value">{{ formatMoney(marketValue) }}</div>
            <div class="profit-analysis__sub">{{ formatShares(holding.shares) }} 份 × {{ formatNav(holding.current_nav) }}</div>
          </div>
          <div class="profit-analysis__divider"></div>
          <div class="profit-analysis__item" :class="profitClass">
            <div class="profit-analysis__label">累计收益</div>
            <div class="profit-analysis__value profit-value">{{ formatMoney(totalProfit) }}</div>
            <div class="profit-analysis__sub profit-rate">{{ formatRate(profitRate) }}</div>
          </div>
        </div>
      </Card>

      <!-- 净值走势图 -->
      <Card title="净值走势" class="holding-detail__chart-card">
        <template #extra>
          <n-button-group size="small">
            <n-button
              v-for="period in periods"
              :key="period.value"
              :type="selectedPeriod === period.value ? 'primary' : 'default'"
              @click="selectedPeriod = period.value"
            >
              {{ period.label }}
            </n-button>
          </n-button-group>
        </template>
        <Chart
          :option="chartOption"
          :loading="chartLoading"
          height="300px"
        />
      </Card>

      <!-- 交易记录 -->
      <Card title="交易记录" class="holding-detail__transactions-card">
        <template #extra>
          <n-button size="small" @click="handleAddTransaction">
            添加交易
          </n-button>
        </template>
        <div v-if="transactionsLoading" class="transactions-loading">
          <n-spin />
        </div>
        <Empty v-else-if="transactions.length === 0" description="暂无交易记录" />
        <div v-else class="transactions-list">
          <div
            v-for="transaction in transactions"
            :key="transaction.id"
            class="transaction-item"
          >
            <div class="transaction-item__main">
              <span
                class="transaction-item__type"
                :class="transaction.transaction_type === 'buy' ? 'is-buy' : 'is-sell'"
              >
                {{ transaction.transaction_type === 'buy' ? '买入' : '卖出' }}
              </span>
              <span class="transaction-item__date">{{ formatDate(transaction.transaction_date) }}</span>
            </div>
            <div class="transaction-item__details">
              <div class="transaction-item__detail">
                <span class="label">份额</span>
                <span class="value">{{ formatShares(transaction.shares) }}</span>
              </div>
              <div class="transaction-item__detail">
                <span class="label">净值</span>
                <span class="value">{{ formatNav(transaction.nav) }}</span>
              </div>
              <div class="transaction-item__detail">
                <span class="label">金额</span>
                <span class="value">{{ formatMoney(transaction.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { NButton, NButtonGroup, NSpin, useMessage, useDialog } from 'naive-ui'
import Card from '../base/Card.vue'
import Chart from '../base/Chart.vue'
import Empty from '../base/Empty.vue'
import { useFund } from '../../composables/useFund.js'

const props = defineProps({
  holdingId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'add-transaction'])

const message = useMessage()
const dialog = useDialog()
const { holdings, loadTransactions, deleteHolding, getFundNav } = useFund()

const loading = ref(false)
const chartLoading = ref(false)
const transactionsLoading = ref(false)
const selectedPeriod = ref('1m')
const navHistory = ref([])
const transactions = ref([])

// 时间周期选项
const periods = [
  { label: '1月', value: '1m' },
  { label: '3月', value: '3m' },
  { label: '6月', value: '6m' },
  { label: '1年', value: '1y' },
  { label: '全部', value: 'all' }
]

// 当前持仓
const holding = computed(() => {
  return holdings.value.find(h => h.id === props.holdingId)
})

// 计算市值
const marketValue = computed(() => {
  if (!holding.value) return 0
  return (holding.value.current_nav || 0) * (holding.value.shares || 0)
})

// 计算总成本
const totalCost = computed(() => {
  if (!holding.value) return 0
  return (holding.value.avg_cost || 0) * (holding.value.shares || 0)
})

// 计算总收益
const totalProfit = computed(() => {
  return marketValue.value - totalCost.value
})

// 收益率
const profitRate = computed(() => {
  if (totalCost.value <= 0) return 0
  return (totalProfit.value / totalCost.value) * 100
})

// 收益样式
const profitClass = computed(() => {
  if (totalProfit.value > 0) return 'is-profit'
  if (totalProfit.value < 0) return 'is-loss'
  return ''
})

// 图表配置
const chartOption = computed(() => {
  if (!navHistory.value || navHistory.value.length === 0) {
    return null
  }

  // 根据选择的周期过滤数据
  let filteredData = [...navHistory.value]
  const now = new Date()

  if (selectedPeriod.value !== 'all') {
    const monthsMap = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }
    const months = monthsMap[selectedPeriod.value]
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
    filteredData = filteredData.filter(item => new Date(item.date) >= startDate)
  }

  const dates = filteredData.map(item => item.date)
  const navs = filteredData.map(item => item.nav)

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const param = params[0]
        return `${param.axisValue}<br/>净值: ${param.value}`
      }
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        formatter: (value) => {
          const date = new Date(value)
          return `${date.getMonth() + 1}/${date.getDate()}`
        }
      }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        type: 'line',
        data: navs,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#18A058',
          width: 2
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
      }
    ]
  }
})

// 格式化方法
const formatMoney = (val) => {
  if (val == null) return '--'
  const abs = Math.abs(val)
  const prefix = val < 0 ? '-' : (val > 0 ? '+' : '')
  if (abs >= 10000) {
    return prefix + (abs / 10000).toFixed(2) + '万'
  }
  return prefix + abs.toFixed(2)
}

const formatRate = (val) => {
  if (val == null) return '--'
  const prefix = val > 0 ? '+' : ''
  return prefix + Number(val).toFixed(2) + '%'
}

const formatNav = (val) => {
  if (val == null) return '--'
  return Number(val).toFixed(4)
}

const formatShares = (val) => {
  if (val == null) return '--'
  return Number(val).toFixed(2)
}

const formatDate = (val) => {
  if (!val) return '--'
  const date = new Date(val)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 加载净值历史
const loadNavHistory = async () => {
  if (!holding.value) return

  chartLoading.value = true
  try {
    const result = await getFundNav(holding.value.fund_code)
    if (result && result.data) {
      navHistory.value = result.data.map(item => ({
        date: item.FSRQ || item.date,
        nav: parseFloat(item.DWJZ || item.nav)
      })).reverse()
    }
  } catch (error) {
    console.error('加载净值历史失败:', error)
    message.error('加载净值历史失败')
  } finally {
    chartLoading.value = false
  }
}

// 加载交易记录
const loadTransactionsList = async () => {
  if (!holding.value) return

  transactionsLoading.value = true
  try {
    await loadTransactions({ fundCode: holding.value.fund_code })
    transactions.value = [...(await import('../../composables/useFund.js')).useFund().transactions.value]
  } catch (error) {
    console.error('加载交易记录失败:', error)
    message.error('加载交易记录失败')
  } finally {
    transactionsLoading.value = false
  }
}

// 编辑
const handleEdit = () => {
  emit('edit', holding.value)
}

// 删除
const handleDelete = () => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除持仓「${holding.value.fund_name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const result = await deleteHolding(holding.value.id)
      if (result.success) {
        message.success('删除成功')
        emit('delete')
      } else {
        message.error(result.error || '删除失败')
      }
    }
  })
}

// 添加交易
const handleAddTransaction = () => {
  emit('add-transaction', holding.value)
}

// 监听持仓变化
watch(() => props.holdingId, () => {
  loadNavHistory()
  loadTransactionsList()
}, { immediate: true })

onMounted(() => {
  loadNavHistory()
  loadTransactionsList()
})
</script>

<style scoped>
.holding-detail {
  width: 100%;
}

.holding-detail__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.holding-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
}

.holding-detail__title-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.holding-detail__name {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.holding-detail__code {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.holding-detail__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.holding-detail__profit-card,
.holding-detail__chart-card,
.holding-detail__transactions-card {
  margin-bottom: var(--spacing-lg);
}

/* 收益分析 */
.profit-analysis {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-lg) 0;
}

.profit-analysis__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.profit-analysis__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.profit-analysis__value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.profit-analysis__sub {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-variant-numeric: tabular-nums;
}

.profit-analysis__item.is-profit .profit-value,
.profit-analysis__item.is-profit .profit-rate {
  color: var(--color-primary);
}

.profit-analysis__item.is-loss .profit-value,
.profit-analysis__item.is-loss .profit-rate {
  color: var(--color-danger);
}

.profit-analysis__divider {
  width: 1px;
  height: 60px;
  background: var(--color-gray-200);
}

/* 交易记录 */
.transactions-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.transaction-item {
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-200);
}

.transaction-item__main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.transaction-item__type {
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.transaction-item__type.is-buy {
  color: var(--color-primary);
  background: rgba(24, 160, 88, 0.1);
}

.transaction-item__type.is-sell {
  color: var(--color-danger);
  background: rgba(208, 48, 80, 0.1);
}

.transaction-item__date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.transaction-item__details {
  display: flex;
  gap: var(--spacing-lg);
}

.transaction-item__detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transaction-item__detail .label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.transaction-item__detail .value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .holding-detail__header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .holding-detail__actions {
    width: 100%;
  }

  .holding-detail__actions button {
    flex: 1;
  }

  .profit-analysis {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .profit-analysis__divider {
    width: 100%;
    height: 1px;
  }

  .transaction-item__details {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }
}
</style>
