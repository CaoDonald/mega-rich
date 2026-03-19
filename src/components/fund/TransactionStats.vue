<template>
  <div class="transaction-stats">
    <Card title="交易统计" :padding="'lg'">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon buy">
            <n-icon :component="TrendingUpOutline" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总买入金额</div>
            <div class="stat-value buy">¥{{ formatNumber(stats.totalBuyAmount) }}</div>
            <div class="stat-extra">{{ stats.buyCount }} 笔</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon sell">
            <n-icon :component="TrendingDownOutline" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总卖出金额</div>
            <div class="stat-value sell">¥{{ formatNumber(stats.totalSellAmount) }}</div>
            <div class="stat-extra">{{ stats.sellCount }} 笔</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <n-icon :component="SwapHorizontalOutline" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">交易次数</div>
            <div class="stat-value">{{ stats.totalCount }}</div>
            <div class="stat-extra">累计手续费 ¥{{ formatNumber(stats.totalFee) }}</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <n-icon :component="CalculatorOutline" size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">平均成本</div>
            <div class="stat-value">¥{{ formatNumber(stats.avgCost, 4) }}</div>
            <div class="stat-extra">基于买入记录</div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { TrendingUpOutline, TrendingDownOutline, SwapHorizontalOutline, CalculatorOutline } from '@vicons/ionicons5'
import Card from '../base/Card.vue'

const props = defineProps({
  transactions: {
    type: Array,
    default: () => []
  }
})

// 计算统计数据
const stats = computed(() => {
  const buyTransactions = props.transactions.filter(t => t.transaction_type === 'buy')
  const sellTransactions = props.transactions.filter(t => t.transaction_type === 'sell')

  const totalBuyAmount = buyTransactions.reduce((sum, t) => sum + (t.shares * t.price), 0)
  const totalSellAmount = sellTransactions.reduce((sum, t) => sum + (t.shares * t.price), 0)
  const totalFee = props.transactions.reduce((sum, t) => sum + (t.fee || 0), 0)

  // 计算平均成本（加权平均）
  let totalBuyShares = 0
  let totalBuyCost = 0
  buyTransactions.forEach(t => {
    totalBuyShares += t.shares
    totalBuyCost += t.shares * t.price
  })
  const avgCost = totalBuyShares > 0 ? totalBuyCost / totalBuyShares : 0

  return {
    totalBuyAmount,
    totalSellAmount,
    totalFee,
    buyCount: buyTransactions.length,
    sellCount: sellTransactions.length,
    totalCount: props.transactions.length,
    avgCost
  }
})

// 格式化数字
const formatNumber = (num, precision = 2) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(precision)
}
</script>

<style scoped>
.transaction-stats {
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-item {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.stat-icon.buy {
  background: rgba(24, 160, 88, 0.1);
  color: var(--color-success);
}

.stat-icon.sell {
  background: rgba(208, 48, 80, 0.1);
  color: var(--color-danger);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-value.buy {
  color: var(--color-success);
}

.stat-value.sell {
  color: var(--color-danger);
}

.stat-extra {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .stat-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
