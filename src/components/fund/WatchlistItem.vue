<template>
  <div class="watchlist-item">
    <div class="fund-main" @click="handleViewDetail">
      <div class="fund-header">
        <span class="fund-code">{{ item.fund_code }}</span>
        <span class="fund-name">{{ item.fund_name }}</span>
      </div>

      <div class="fund-data">
        <div class="nav-info">
          <span class="label">最新净值</span>
          <span class="value">{{ formatNav(item.current_nav) }}</span>
        </div>

        <div class="change-info">
          <span :class="['change-rate', getChangeClass(item.change_rate)]">
            {{ formatChangeRate(item.change_rate) }}
          </span>
          <span :class="['change-amount', getChangeClass(item.change_rate)]">
            {{ formatChangeAmount(item.change_amount) }}
          </span>
        </div>
      </div>
    </div>

    <div class="fund-actions">
      <n-button
        size="small"
        quaternary
        circle
        @click="handleSetAlert"
      >
        <template #icon>
          <n-icon :component="item.alert_enabled ? NotificationsOutline : NotificationsOffOutline" />
        </template>
      </n-button>

      <n-button
        size="small"
        quaternary
        circle
        @click="handleRemove"
      >
        <template #icon>
          <n-icon :component="CloseOutline" />
        </template>
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { NButton, NIcon } from 'naive-ui'
import { NotificationsOutline, NotificationsOffOutline, CloseOutline } from '@vicons/ionicons5'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view-detail', 'set-alert', 'remove'])

// 查看详情
const handleViewDetail = () => {
  emit('view-detail', props.item)
}

// 设置提醒
const handleSetAlert = () => {
  emit('set-alert', props.item)
}

// 取消关注
const handleRemove = () => {
  emit('remove', props.item)
}

// 格式化净值
const formatNav = (value) => {
  if (!value || value === '--') return '--'
  return parseFloat(value).toFixed(4)
}

// 格式化涨跌幅
const formatChangeRate = (value) => {
  if (!value && value !== 0) return '--'
  const num = parseFloat(value)
  if (isNaN(num)) return '--'
  return num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`
}

// 格式化涨跌额
const formatChangeAmount = (value) => {
  if (!value && value !== 0) return '--'
  const num = parseFloat(value)
  if (isNaN(num)) return '--'
  return num > 0 ? `+${num.toFixed(4)}` : `${num.toFixed(4)}`
}

// 获取涨跌样式类
const getChangeClass = (value) => {
  if (!value && value !== 0) return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return num > 0 ? 'positive' : num < 0 ? 'negative' : ''
}
</script>

<style scoped>
.watchlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-bg-base);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.watchlist-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.fund-main {
  flex: 1;
  cursor: pointer;
}

.fund-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.fund-code {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-family: monospace;
  font-weight: 500;
}

.fund-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
}

.fund-data {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.nav-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-info .label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.nav-info .value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: monospace;
}

.change-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  align-items: flex-end;
}

.change-rate {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.change-amount {
  font-size: var(--font-size-sm);
}

.change-rate.positive,
.change-amount.positive {
  color: var(--color-primary);
}

.change-rate.negative,
.change-amount.negative {
  color: var(--color-danger);
}

.fund-actions {
  display: flex;
  gap: var(--spacing-xs);
  margin-left: var(--spacing-md);
}

@media (max-width: 768px) {
  .watchlist-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .fund-data {
    width: 100%;
    justify-content: space-between;
  }

  .fund-actions {
    width: 100%;
    justify-content: flex-end;
    margin-left: 0;
  }
}
</style>
