<template>
  <div class="base-chart" :style="chartStyle">
    <v-chart
      v-if="option"
      :option="option"
      :autoresize="true"
      :loading="loading"
      :loading-options="loadingOptions"
      @click="handleClick"
    />
    <div v-else-if="!loading" class="chart-empty">
      <slot name="empty">
        <p>暂无数据</p>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
])

const props = defineProps({
  option: {
    type: Object,
    default: null
  },
  height: {
    type: String,
    default: '300px'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const chartStyle = computed(() => ({
  height: props.height
}))

const loadingOptions = {
  text: '加载中...',
  color: '#18A058',
  textColor: '#000',
  maskColor: 'rgba(255, 255, 255, 0.8)',
  zlevel: 0
}

const handleClick = (params) => {
  emit('click', params)
}
</script>

<style scoped>
.base-chart {
  width: 100%;
  position: relative;
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
