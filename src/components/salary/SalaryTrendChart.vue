<template>
  <Card title="收入趋势">
    <v-chart
      :option="trendChartOption"
      :style="{ height: '400px', width: '100%' }"
    />
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import Card from '../base/Card.vue'
import { commonChartConfig } from '../../utils/ChartConfig.js'

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    default: () => ({
      months: [],
      salaries: [],
      bonuses: [],
      totals: []
    })
  }
})

const trendChartOption = computed(() => {
  return {
    ...commonChartConfig,
    title: {
      ...commonChartConfig.title,
      text: ''
    },
    tooltip: {
      ...commonChartConfig.tooltip,
      trigger: 'axis'
    },
    legend: {
      ...commonChartConfig.legend,
      data: ['基本月薪', '年终奖', '总收入']
    },
    xAxis: {
      ...commonChartConfig.xAxis,
      type: 'category',
      data: props.chartData.months
    },
    yAxis: {
      ...commonChartConfig.yAxis,
      type: 'value',
      axisLabel: {
        ...commonChartConfig.yAxis.axisLabel,
        show: true,
        formatter: (value) => {
          if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万'
          }
          return value.toFixed(0)
        }
      }
    },
    series: [
      {
        name: '基本月薪',
        type: 'bar',
        data: props.chartData.salaries,
        itemStyle: {
          color: 'var(--color-primary)'
        }
      },
      {
        name: '年终奖',
        type: 'bar',
        data: props.chartData.bonuses,
        itemStyle: {
          color: 'var(--color-warning)'
        }
      },
      {
        name: '总收入',
        type: 'line',
        data: props.chartData.totals,
        smooth: true,
        itemStyle: {
          color: 'var(--color-info)'
        },
        lineStyle: {
          width: 3
        }
      }
    ]
  }
})
</script>

<style scoped>
/* 样式已通过 Card 组件处理 */
</style>
