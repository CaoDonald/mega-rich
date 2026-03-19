<template>
  <Card title="收益曲线">
    <template #extra>
      <n-space>
        <n-button
          v-for="period in periods"
          :key="period.value"
          :type="currentPeriod === period.value ? 'primary' : 'default'"
          size="small"
          @click="currentPeriod = period.value"
        >
          {{ period.label }}
        </n-button>
      </n-space>
    </template>

    <Chart :option="chartOption" :loading="loading" height="300px" />
  </Card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFundStore } from '../../stores/fund.js'
import { useChart } from '../../composables/useChart.js'
import Card from '../base/Card.vue'
import Chart from '../base/Chart.vue'
import { designTokens } from '../../design/tokens.js'

const fundStore = useFundStore()
const { getLineChartConfig, formatMoney, colorSchemes } = useChart()

const loading = ref(false)
const currentPeriod = ref(7)

// 周期选项
const periods = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
  { label: '全部', value: 0 }
]

// 生成模拟数据 (实际项目中应从 API 获取)
const generateChartData = (days) => {
  const data = []
  const today = new Date()
  const actualDays = days === 0 ? 180 : days // 全部显示180天

  for (let i = actualDays - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // 模拟收益数据 (基于总收益的波动)
    const baseProfit = fundStore.totalProfit
    const randomFactor = (Math.random() - 0.5) * 0.3
    const profit = baseProfit * (1 + randomFactor * (i / actualDays))

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      profit: profit
    })
  }

  return data
}

// 图表数据
const chartData = computed(() => {
  return generateChartData(currentPeriod.value)
})

// 图表配置
const chartOption = computed(() => {
  const dates = chartData.value.map(d => d.date)
  const profits = chartData.value.map(d => d.profit)

  // 判断是盈利还是亏损
  const isProfit = fundStore.totalProfit >= 0
  const lineColor = isProfit ? designTokens.colors.primary : designTokens.colors.danger
  const areaColor = isProfit ? colorSchemes.gradient.profit : colorSchemes.gradient.loss

  return getLineChartConfig({
    xAxis: {
      data: dates
    },
    yAxis: {
      axisLabel: {
        formatter: (value) => {
          return value >= 0 ? `+${value.toFixed(0)}` : value.toFixed(0)
        }
      }
    },
    tooltip: {
      formatter: (params) => {
        const value = params[0].value
        const sign = value >= 0 ? '+' : ''
        return `${params[0].name}<br/>收益: ${sign}${formatMoney(value)}`
      }
    },
    series: [
      {
        name: '收益',
        data: profits,
        lineStyle: {
          color: lineColor,
          width: 2
        },
        itemStyle: {
          color: lineColor
        },
        areaStyle: {
          color: areaColor
        }
      }
    ]
  })
})

// 监听周期变化
watch(currentPeriod, () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>

<style scoped>
/* 样式已在 Card 和 Chart 组件中定义 */
</style>
