<template>
  <div class="asset-summary">
    <Card
      v-for="item in summaryItems"
      :key="item.key"
      :padding="'md'"
      class="summary-card"
    >
      <div class="summary-content">
        <div class="summary-label">{{ item.label }}</div>
        <div class="summary-value" :style="{ color: item.color }">
          {{ item.value }}
        </div>
        <div v-if="item.rate" class="summary-rate" :style="{ color: item.rateColor }">
          {{ item.rate }}
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFundStore } from '../../stores/fund.js'
import Card from '../base/Card.vue'
import { designTokens } from '../../design/tokens.js'

const fundStore = useFundStore()

// 格式化金额
const formatMoney = (value) => {
  return '¥' + value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化百分比
const formatPercent = (value) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

// 获取收益颜色
const getProfitColor = (value) => {
  if (value > 0) return designTokens.colors.primary
  if (value < 0) return designTokens.colors.danger
  return designTokens.colors.text.secondary
}

// 汇总数据
const summaryItems = computed(() => [
  {
    key: 'totalAssets',
    label: '总资产',
    value: formatMoney(fundStore.totalAssets),
    color: designTokens.colors.text.primary
  },
  {
    key: 'totalCost',
    label: '总成本',
    value: formatMoney(fundStore.totalCost),
    color: designTokens.colors.text.primary
  },
  {
    key: 'totalProfit',
    label: '累计收益',
    value: formatMoney(fundStore.totalProfit),
    rate: formatPercent(fundStore.totalProfitRate),
    color: getProfitColor(fundStore.totalProfit),
    rateColor: getProfitColor(fundStore.totalProfit)
  },
  {
    key: 'todayProfit',
    label: '今日收益',
    value: formatMoney(fundStore.todayProfit),
    color: getProfitColor(fundStore.todayProfit)
  }
])
</script>

<style scoped>
.asset-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

@media (min-width: 768px) {
  .asset-summary {
    grid-template-columns: repeat(4, 1fr);
  }
}

.summary-card {
  transition: transform var(--transition-base);
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.summary-value {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  line-height: 1.2;
}

.summary-rate {
  font-size: var(--font-size-sm);
  font-weight: 500;
}
</style>
