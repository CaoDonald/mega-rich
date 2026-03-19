<template>
  <Card title="资金趋势">
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
      dates: [],
      broadAmounts: [],
      disposableAmounts: []
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
      data: ['广义金额', '可支配金额']
    },
    xAxis: {
      ...commonChartConfig.xAxis,
      type: 'category',
      data: props.chartData.dates,
      boundaryGap: false
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
        name: '广义金额',
        type: 'line',
        data: props.chartData.broadAmounts,
        smooth: true,
        itemStyle: {
          color: 'var(--color-primary)'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'var(--color-primary)40' },
              { offset: 1, color: 'var(--color-primary)10' }
            ]
          }
        }
      },
      {
        name: '可支配金额',
        type: 'line',
        data: props.chartData.disposableAmounts,
        smooth: true,
        itemStyle: {
          color: 'var(--color-info)'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'var(--color-info)40' },
              { offset: 1, color: 'var(--color-info)10' }
            ]
          }
        }
      }
    ]
  }
})
</script>

<style scoped>
/* 样式已通过 Card 组件处理 */
</style>
