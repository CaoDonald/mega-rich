<template>
  <Card title="持仓概览">
    <div v-if="topHoldings.length > 0" class="holdings-list">
      <div
        v-for="holding in topHoldings"
        :key="holding.id"
        class="holding-item"
      >
        <div class="holding-info">
          <div class="holding-name">{{ holding.fund_name }}</div>
          <div class="holding-code">{{ holding.fund_code }}</div>
        </div>
        <div class="holding-stats">
          <div class="holding-value">
            {{ formatMoney(holding.current_nav * holding.shares) }}
          </div>
          <div
            class="holding-rate"
            :style="{ color: getProfitColor(holding.profit_rate) }"
          >
            {{ formatPercent(holding.profit_rate) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>暂无持仓数据</p>
      <n-button type="primary" @click="handleAddHolding">
        添加持仓
      </n-button>
    </div>

    <template #footer>
      <div class="footer-actions">
        <n-button text type="primary" @click="handleViewAll">
          查看全部
          <template #icon>
            <n-icon>
              <ChevronForward />
            </n-icon>
          </template>
        </n-button>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useFundStore } from '../../stores/fund.js'
import Card from '../base/Card.vue'
import { designTokens } from '../../design/tokens.js'
import { ChevronForward } from '@vicons/ionicons5'

const emit = defineEmits(['navigate', 'add-holding'])

const fundStore = useFundStore()

// 前5个持仓
const topHoldings = computed(() => {
  return fundStore.holdings
    .map(h => ({
      ...h,
      profit_rate: h.avg_cost > 0
        ? ((h.current_nav - h.avg_cost) / h.avg_cost) * 100
        : 0
    }))
    .sort((a, b) => (b.current_nav * b.shares) - (a.current_nav * a.shares))
    .slice(0, 5)
})

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

// 查看全部
const handleViewAll = () => {
  emit('navigate', 'holdings')
}

// 添加持仓
const handleAddHolding = () => {
  emit('add-holding')
}
</script>

<style scoped>
.holdings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.holding-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  transition: background var(--transition-base);
}

.holding-item:hover {
  background: var(--color-bg-tertiary);
}

.holding-info {
  flex: 1;
  min-width: 0;
}

.holding-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.holding-code {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.holding-stats {
  text-align: right;
  margin-left: var(--spacing-md);
}

.holding-value {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.holding-rate {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl) 0;
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.footer-actions {
  display: flex;
  justify-content: center;
}
</style>
