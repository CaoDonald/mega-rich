<template>
  <div class="stats-cards">
    <DashboardCard
      title="广义金额"
      :value="stats.broadAmount"
      :icon="WalletOutline"
      color="var(--color-primary)"
      :clickable="false"
    />
    <DashboardCard
      title="可支配金额"
      :value="stats.disposableAmount"
      :icon="CashOutline"
      color="var(--color-info)"
      :clickable="false"
    />
    <DashboardCard
      title="环比增长"
      :value="stats.broadGrowth"
      :icon="TrendingUpOutline"
      color="var(--color-warning)"
      :trend="stats.broadGrowth >= 0 ? 'up' : 'down'"
      :trendValue="`${stats.broadGrowthRate.toFixed(2)}%`"
      :clickable="false"
    />
    <DashboardCard
      title="同比增长"
      :value="stats.broadYoyGrowth"
      :icon="StatsChartOutline"
      color="var(--color-success)"
      :trend="stats.broadYoyGrowth >= 0 ? 'up' : 'down'"
      :trendValue="`${stats.broadYoyGrowthRate.toFixed(2)}%`"
      :clickable="false"
    />
  </div>
</template>

<script setup>
import DashboardCard from '../dashboard/DashboardCard.vue'
import {
  WalletOutline,
  CashOutline,
  TrendingUpOutline,
  StatsChartOutline
} from '@vicons/ionicons5'

defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      broadAmount: 0,
      disposableAmount: 0,
      broadGrowth: 0,
      broadGrowthRate: 0,
      broadYoyGrowth: 0,
      broadYoyGrowthRate: 0
    })
  }
})
</script>

<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
