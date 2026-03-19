<template>
  <div class="plan-list">
    <Loading v-if="loading" text="加载中..." />

    <Empty v-else-if="!loading && plans.length === 0" description="暂无定投计划" />

    <div v-else class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        @click="handleViewDetail(plan)"
      >
        <div class="plan-header">
          <div class="plan-title">
            <h4>{{ plan.plan_name }}</h4>
            <n-tag :type="getStatusType(plan.status)" size="small">
              {{ getStatusText(plan.status) }}
            </n-tag>
          </div>
          <div class="plan-actions" @click.stop>
            <n-dropdown :options="getActionOptions(plan)" @select="(key) => handleAction(key, plan)">
              <n-button text>
                <n-icon :component="EllipsisVerticalOutline" />
              </n-button>
            </n-dropdown>
          </div>
        </div>

        <div class="plan-info">
          <div class="info-item">
            <span class="label">基金</span>
            <span class="value">{{ plan.fund_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">代码</span>
            <span class="value code">{{ plan.fund_code }}</span>
          </div>
        </div>

        <div class="plan-stats">
          <div class="stat-item">
            <span class="stat-label">定投金额</span>
            <span class="stat-value primary">¥{{ formatMoney(plan.amount) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">频率</span>
            <span class="stat-value">{{ getFrequencyText(plan.frequency) }}</span>
          </div>
        </div>

        <div class="plan-progress">
          <div class="progress-item">
            <span class="progress-label">累计投入</span>
            <span class="progress-value">¥{{ formatMoney(plan.total_invested || 0) }}</span>
          </div>
          <div class="progress-item">
            <span class="progress-label">累计份额</span>
            <span class="progress-value">{{ formatShares(plan.total_shares || 0) }}</span>
          </div>
        </div>

        <div class="plan-footer">
          <span class="next-execute">
            下次执行: {{ formatDate(plan.next_execute_date) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import { NTag, NButton, NIcon, NDropdown, useDialog, useMessage } from 'naive-ui'
import { EllipsisVerticalOutline, PlayOutline, PauseOutline, TrashOutline, CreateOutline } from '@vicons/ionicons5'
import Loading from '../base/Loading.vue'
import Empty from '../base/Empty.vue'

const props = defineProps({
  plans: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view-detail', 'edit', 'pause', 'resume', 'execute', 'delete'])
const dialog = useDialog()
const message = useMessage()

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    paused: 'warning',
    completed: 'default'
  }
  return typeMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    active: '进行中',
    paused: '已暂停',
    completed: '已完成'
  }
  return textMap[status] || status
}

// 获取频率文本
const getFrequencyText = (frequency) => {
  const textMap = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月'
  }
  return textMap[frequency] || frequency
}

// 格式化金额
const formatMoney = (value) => {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化份额
const formatShares = (value) => {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 获取操作选项
const getActionOptions = (plan) => {
  const options = [
    {
      label: '查看详情',
      key: 'view',
      icon: () => h(NIcon, { component: CreateOutline })
    }
  ]

  if (plan.status === 'active') {
    options.push({
      label: '暂停计划',
      key: 'pause',
      icon: () => h(NIcon, { component: PauseOutline })
    })
    options.push({
      label: '手动执行',
      key: 'execute',
      icon: () => h(NIcon, { component: PlayOutline })
    })
  } else if (plan.status === 'paused') {
    options.push({
      label: '恢复计划',
      key: 'resume',
      icon: () => h(NIcon, { component: PlayOutline })
    })
  }

  options.push({
    label: '删除计划',
    key: 'delete',
    icon: () => h(NIcon, { component: TrashOutline })
  })

  return options
}

// 处理操作
const handleAction = (key, plan) => {
  switch (key) {
    case 'view':
      handleViewDetail(plan)
      break
    case 'pause':
      handlePause(plan)
      break
    case 'resume':
      handleResume(plan)
      break
    case 'execute':
      handleExecute(plan)
      break
    case 'delete':
      handleDelete(plan)
      break
  }
}

// 查看详情
const handleViewDetail = (plan) => {
  emit('view-detail', plan)
}

// 暂停计划
const handlePause = (plan) => {
  dialog.warning({
    title: '暂停计划',
    content: `确定要暂停定投计划"${plan.plan_name}"吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      emit('pause', plan)
    }
  })
}

// 恢复计划
const handleResume = (plan) => {
  emit('resume', plan)
  message.success('计划已恢复')
}

// 手动执行
const handleExecute = (plan) => {
  dialog.info({
    title: '手动执行',
    content: `确定要立即执行定投计划"${plan.plan_name}"吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      emit('execute', plan)
    }
  })
}

// 删除计划
const handleDelete = (plan) => {
  dialog.error({
    title: '删除计划',
    content: `确定要删除定投计划"${plan.plan_name}"吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      emit('delete', plan)
    }
  })
}
</script>

<style scoped>
.plan-list {
  width: 100%;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.plan-card {
  background: var(--color-bg-base);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-base);
}

.plan-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.plan-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.plan-title h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.plan-actions {
  display: flex;
  align-items: center;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.info-item .value {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: 500;
}

.info-item .value.code {
  font-family: monospace;
}

.plan-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-value.primary {
  color: var(--color-primary);
}

.plan-progress {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.progress-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.progress-value {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
}

.plan-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.next-execute {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
