<template>
  <div class="transaction-list">
    <Empty v-if="!transactions || transactions.length === 0" description="暂无交易记录">
      <template #action>
        <n-button type="primary" @click="$emit('add')">
          添加交易记录
        </n-button>
      </template>
    </Empty>

    <n-timeline v-else>
      <n-timeline-item
        v-for="transaction in transactions"
        :key="transaction.id"
        :type="transaction.transaction_type === 'buy' ? 'success' : 'error'"
        :title="formatDate(transaction.transaction_date)"
      >
        <div class="transaction-item">
          <div class="transaction-header">
            <div class="transaction-info">
              <n-icon
                :component="transaction.transaction_type === 'buy' ? TrendingUpOutline : TrendingDownOutline"
                :color="transaction.transaction_type === 'buy' ? 'var(--color-success)' : 'var(--color-danger)'"
                size="20"
              />
              <span class="fund-name">{{ transaction.fund_name }}</span>
              <n-tag
                :type="transaction.transaction_type === 'buy' ? 'success' : 'error'"
                size="small"
              >
                {{ transaction.transaction_type === 'buy' ? '买入' : '卖出' }}
              </n-tag>
            </div>
            <div class="transaction-actions">
              <n-button text @click="handleEdit(transaction)">
                <template #icon>
                  <n-icon :component="CreateOutline" />
                </template>
              </n-button>
              <n-button text @click="handleDelete(transaction)">
                <template #icon>
                  <n-icon :component="TrashOutline" />
                </template>
              </n-button>
            </div>
          </div>

          <div class="transaction-details">
            <div class="detail-item">
              <span class="label">基金代码</span>
              <span class="value">{{ transaction.fund_code }}</span>
            </div>
            <div class="detail-item">
              <span class="label">交易份额</span>
              <span class="value">{{ formatNumber(transaction.shares) }} 份</span>
            </div>
            <div class="detail-item">
              <span class="label">交易价格</span>
              <span class="value">¥{{ formatNumber(transaction.price, 4) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">交易金额</span>
              <span class="value amount" :class="transaction.transaction_type">
                {{ transaction.transaction_type === 'buy' ? '-' : '+' }}¥{{ formatNumber(transaction.shares * transaction.price) }}
              </span>
            </div>
            <div v-if="transaction.fee > 0" class="detail-item">
              <span class="label">手续费</span>
              <span class="value">¥{{ formatNumber(transaction.fee) }}</span>
            </div>
            <div v-if="transaction.notes" class="detail-item full-width">
              <span class="label">备注</span>
              <span class="value">{{ transaction.notes }}</span>
            </div>
          </div>
        </div>
      </n-timeline-item>
    </n-timeline>
  </div>
</template>

<script setup>
import { NTimeline, NTimelineItem, NIcon, NTag, NButton, useDialog, useMessage } from 'naive-ui'
import { TrendingUpOutline, TrendingDownOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import Empty from '../base/Empty.vue'
import { useFund } from '../../composables/useFund.js'

defineProps({
  transactions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete', 'add'])

const dialog = useDialog()
const message = useMessage()
const { deleteTransaction } = useFund()

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化数字
const formatNumber = (num, precision = 2) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(precision)
}

// 编辑交易
const handleEdit = (transaction) => {
  emit('edit', transaction)
}

// 删除交易
const handleDelete = (transaction) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除这条交易记录吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const result = await deleteTransaction(transaction.id)
      if (result.success) {
        message.success('删除成功')
        emit('delete', transaction.id)
      } else {
        message.error(result.error || '删除失败')
      }
    }
  })
}
</script>

<style scoped>
.transaction-list {
  padding: var(--spacing-md) 0;
}

.transaction-item {
  background: var(--color-bg-base);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-sm);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.transaction-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.fund-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.transaction-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.transaction-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item .label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.detail-item .value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.detail-item .value.amount {
  font-weight: 600;
  font-size: var(--font-size-base);
}

.detail-item .value.amount.buy {
  color: var(--color-danger);
}

.detail-item .value.amount.sell {
  color: var(--color-success);
}

@media (max-width: 768px) {
  .transaction-details {
    grid-template-columns: 1fr;
  }
}
</style>
