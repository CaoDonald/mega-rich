<template>
  <div
    :class="['dashboard-card', { clickable }]"
    :style="cardStyle"
    @click="handleClick"
  >
    <div class="card-icon" :style="iconStyle">
      <component :is="icon" />
    </div>

    <div class="card-content">
      <div class="card-title">{{ title }}</div>
      <div class="card-value">{{ formattedValue }}</div>

      <div v-if="trend" class="card-trend" :class="trendClass">
        <n-icon :component="trendIcon" size="14" />
        <span>{{ trendValue }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { TrendingUpOutline, TrendingDownOutline } from '@vicons/ionicons5'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: 'var(--color-primary)'
  },
  trend: {
    type: String, // 'up' | 'down' | null
    default: null
  },
  trendValue: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const cardStyle = computed(() => ({
  cursor: props.clickable ? 'pointer' : 'default'
}))

const iconStyle = computed(() => ({
  backgroundColor: `${props.color}15`,
  color: props.color
}))

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  return props.value
})

const trendClass = computed(() => {
  if (props.trend === 'up') return 'trend-up'
  if (props.trend === 'down') return 'trend-down'
  return ''
})

const trendIcon = computed(() => {
  return props.trend === 'up' ? TrendingUpOutline : TrendingDownOutline
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.dashboard-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--color-bg-base);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.dashboard-card.clickable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  font-size: 28px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.card-value {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.card-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

.card-trend.trend-up {
  color: var(--color-success);
}

.card-trend.trend-down {
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .dashboard-card {
    padding: var(--spacing-lg);
    gap: var(--spacing-md);
  }

  .card-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .card-value {
    font-size: var(--font-size-xl);
  }
}
</style>
