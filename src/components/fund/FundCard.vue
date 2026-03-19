<template>
  <div class="fund-card" @click="handleClick">
    <!-- 卡片头部：基金代码 + 涨跌标签 -->
    <div class="fund-card__header">
      <div class="fund-card__code-wrap">
        <span class="fund-card__code">{{ holding.fund_code }}</span>
        <span class="fund-card__type" v-if="holding.fund_type">{{ holding.fund_type }}</span>
      </div>
      <span
        class="fund-card__change-badge"
        :class="changeClass"
      >
        {{ formatChange(holding.today_change_rate) }}
      </span>
    </div>

    <!-- 基金名称 -->
    <div class="fund-card__name">{{ holding.fund_name || '未知基金' }}</div>

    <!-- 主要数据 -->
    <div class="fund-card__main">
      <div class="fund-card__nav-section">
        <div class="fund-card__label">当前净值</div>
        <div class="fund-card__nav">{{ formatNav(holding.current_nav) }}</div>
        <div class="fund-card__change-amount" :class="changeClass">
          {{ formatChangeAmount(holding.today_change) }}
        </div>
      </div>
      <div class="fund-card__profit-section" :class="profitClass">
        <div class="fund-card__label">总收益</div>
        <div class="fund-card__profit">{{ formatMoney(totalProfit) }}</div>
        <div class="fund-card__profit-rate">{{ formatRate(profitRate) }}</div>
      </div>
    </div>

    <!-- 底部：份额和市值 -->
    <div class="fund-card__footer">
      <div class="fund-card__stat">
        <span class="fund-card__stat-label">持仓份额</span>
        <span class="fund-card__stat-value">{{ formatShares(holding.shares) }}</span>
      </div>
      <div class="fund-card__divider"></div>
      <div class="fund-card__stat">
        <span class="fund-card__stat-label">市值</span>
        <span class="fund-card__stat-value">{{ formatMoney(marketValue) }}</span>
      </div>
      <div class="fund-card__divider"></div>
      <div class="fund-card__stat">
        <span class="fund-card__stat-label">成本</span>
        <span class="fund-card__stat-value">{{ formatMoney(totalCost) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  holding: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

// 计算市值
const marketValue = computed(() => {
  return (props.holding.current_nav || 0) * (props.holding.shares || 0)
})

// 计算总成本
const totalCost = computed(() => {
  return (props.holding.avg_cost || 0) * (props.holding.shares || 0)
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

// 涨跌样式
const changeClass = computed(() => {
  const change = props.holding.today_change_rate || 0
  if (change > 0) return 'is-up'
  if (change < 0) return 'is-down'
  return 'is-flat'
})

// 收益样式
const profitClass = computed(() => {
  if (totalProfit.value > 0) return 'is-up'
  if (totalProfit.value < 0) return 'is-down'
  return 'is-flat'
})

// 格式化方法
const formatNav = (val) => {
  if (val == null) return '--'
  return Number(val).toFixed(4)
}

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

const formatChange = (val) => {
  if (val == null) return '--'
  const prefix = val > 0 ? '+' : ''
  return prefix + Number(val).toFixed(2) + '%'
}

const formatChangeAmount = (val) => {
  if (val == null) return '--'
  const prefix = val > 0 ? '+' : ''
  return prefix + Number(val).toFixed(4)
}

const formatShares = (val) => {
  if (val == null) return '--'
  return Number(val).toFixed(2)
}

const handleClick = () => {
  emit('click', props.holding)
}
</script>

<style scoped>
.fund-card {
  background: var(--color-bg-base);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.fund-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--color-gray-300);
}

.fund-card:active {
  transform: translateY(0);
}

/* 头部 */
.fund-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.fund-card__code-wrap {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.fund-card__code {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  font-family: 'SFMono-Regular', Consolas, monospace;
  letter-spacing: 0.5px;
}

.fund-card__type {
  font-size: var(--font-size-xs);
  color: var(--color-info);
  background: rgba(32, 128, 240, 0.08);
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.fund-card__change-badge {
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.fund-card__change-badge.is-up {
  color: var(--color-primary);
  background: rgba(24, 160, 88, 0.1);
}

.fund-card__change-badge.is-down {
  color: var(--color-danger);
  background: rgba(208, 48, 80, 0.1);
}

.fund-card__change-badge.is-flat {
  color: var(--color-text-secondary);
  background: var(--color-gray-100);
}

/* 基金名称 */
.fund-card__name {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 主要数据区 */
.fund-card__main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-100);
}

.fund-card__nav-section,
.fund-card__profit-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fund-card__profit-section {
  text-align: right;
}

.fund-card__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-bottom: 2px;
}

.fund-card__nav {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.fund-card__change-amount {
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}

.fund-card__profit {
  font-size: var(--font-size-lg);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.fund-card__profit-rate {
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}

/* 颜色 */
.is-up .fund-card__profit,
.is-up .fund-card__profit-rate,
.fund-card__change-amount.is-up {
  color: var(--color-primary);
}

.is-down .fund-card__profit,
.is-down .fund-card__profit-rate,
.fund-card__change-amount.is-down {
  color: var(--color-danger);
}

.is-flat .fund-card__profit,
.is-flat .fund-card__profit-rate,
.fund-card__change-amount.is-flat {
  color: var(--color-text-secondary);
}

/* 底部统计 */
.fund-card__footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.fund-card__stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fund-card__stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.fund-card__stat-value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.fund-card__divider {
  width: 1px;
  height: 28px;
  background: var(--color-gray-200);
}
</style>
