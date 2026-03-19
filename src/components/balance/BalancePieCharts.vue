<template>
  <div class="pie-charts-grid">
    <Card title="资产占比">
      <v-chart
        :option="assetPieOption"
        :style="{ height: '350px', width: '100%' }"
      />
    </Card>
    <Card title="负债占比">
      <v-chart
        :option="liabilityPieOption"
        :style="{ height: '350px', width: '100%' }"
      />
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import Card from '../base/Card.vue'
import { pieChartCommonConfig } from '../../utils/ChartConfig.js'

const props = defineProps({
  assetData: {
    type: Object,
    required: true,
    default: () => ({ primary: [], secondary: [] })
  },
  liabilityData: {
    type: Object,
    required: true,
    default: () => ({ primary: [], secondary: [] })
  }
})

const assetPieOption = computed(() => {
  return {
    title: {
      ...pieChartCommonConfig.title,
      text: '资产'
    },
    tooltip: pieChartCommonConfig.tooltip,
    legend: pieChartCommonConfig.legend,
    series: [
      {
        ...pieChartCommonConfig.series[0],
        data: props.assetData.primary,
      },
      {
        ...pieChartCommonConfig.series[1],
        data: props.assetData.secondary,
      }
    ]
  }
})

const liabilityPieOption = computed(() => {
  return {
    title: {
      ...pieChartCommonConfig.title,
      text: '负债'
    },
    tooltip: pieChartCommonConfig.tooltip,
    legend: pieChartCommonConfig.legend,
    series: [
      {
        ...pieChartCommonConfig.series[0],
        data: props.liabilityData.primary,
      },
      {
        ...pieChartCommonConfig.series[1],
        data: props.liabilityData.secondary,
      }
    ]
  }
})
</script>

<style scoped>
.pie-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

@media (max-width: 768px) {
  .pie-charts-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>
