<template>
  <div class="stats-cards">
    <DashboardCard
      title="总收入"
      :value="stats.totalIncome"
      :icon="CashOutline"
      color="var(--color-primary)"
      :clickable="false"
    />
    <DashboardCard
      title="平均月薪"
      :value="stats.averageSalary"
      :icon="WalletOutline"
      color="var(--color-info)"
      :clickable="false"
    />
    <DashboardCard
      title="环比增长"
      :value="stats.momGrowth"
      :icon="TrendingUpOutline"
      color="var(--color-warning)"
      :trend="stats.momGrowth >= 0 ? 'up' : 'down'"
      :trendValue="`${stats.momGrowthRate.toFixed(2)}%`"
      :clickable="false"
    />
    <DashboardCard
      title="同比增长"
      :value="stats.yoyGrowth"
      :icon="StatsChartOutline"
      color="var(--color-success)"
      :trend="stats.yoyGrowth >= 0 ? 'up' : 'down'"
      :trendValue="`${stats.yoyGrowthRate.toFixed(2)}%`"
      :clickable="false"
    />
  </div>
</template>

<script setup>
import DashboardCard from '../dashboard/DashboardCard.vue'
import {
  CashOutline,
  WalletOutline,
  TrendingUpOutline,
  StatsChartOutline
} from '@vicons/ionicons5'

defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      totalIncome: 0,
      averageSalary: 0,
      momGrowth: 0,
      momGrowthRate: 0,
      yoyGrowth: 0,
      yoyGrowthRate: 0
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
