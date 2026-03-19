<template>
  <div class="transactions-page">
    <div class="page-header">
      <h1 class="page-title">交易记录</h1>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <n-icon :component="AddOutline" />
        </template>
        添加交易
      </n-button>
    </div>

    <TransactionStats :transactions="filteredTransactions" />

    <Card title="交易记录" :padding="'lg'">
      <template #extra>
        <div class="filters">
          <n-select
            v-model:value="filterFundCode"
            :options="fundCodeOptions"
            placeholder="筛选基金"
            clearable
            style="width: 200px"
          />
          <n-select
            v-model:value="filterType"
            :options="typeOptions"
            placeholder="交易类型"
            clearable
            style="width: 120px"
          />
        </div>
      </template>

      <n-spin :show="loading">
        <TransactionList
          :transactions="filteredTransactions"
          @edit="handleEdit"
          @delete="handleDeleteSuccess"
          @add="showAddModal = true"
        />
      </n-spin>
    </Card>

    <n-modal
      v-model:show="showAddModal"
      preset="card"
      title="添加交易记录"
      style="max-width: 600px"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <TransactionForm
        @success="handleAddSuccess"
        @cancel="showAddModal = false"
      />
    </n-modal>

    <n-modal
      v-model:show="showEditModal"
      preset="card"
      title="编辑交易记录"
      style="max-width: 600px"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <TransactionForm
        :transaction="editingTransaction"
        @success="handleEditSuccess"
        @cancel="showEditModal = false"
      />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NButton, NIcon, NModal, NSpin, NSelect, useMessage } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import Card from '../../components/base/Card.vue'
import TransactionStats from '../../components/fund/TransactionStats.vue'
import TransactionList from '../../components/fund/TransactionList.vue'
import TransactionForm from '../../components/fund/TransactionForm.vue'
import { useFund } from '../../composables/useFund.js'

const message = useMessage()
const { transactions, loadTransactions } = useFund()

const loading = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingTransaction = ref(null)
const filterFundCode = ref(null)
const filterType = ref(null)

// 交易类型选项
const typeOptions = [
  { label: '买入', value: 'buy' },
  { label: '卖出', value: 'sell' }
]

// 基金代码选项（从交易记录中提取）
const fundCodeOptions = computed(() => {
  const codes = new Set()
  transactions.value.forEach(t => {
    codes.add(t.fund_code)
  })
  return Array.from(codes).map(code => {
    const transaction = transactions.value.find(t => t.fund_code === code)
    return {
      label: `${code} - ${transaction.fund_name}`,
      value: code
    }
  })
})

// 筛选后的交易记录
const filteredTransactions = computed(() => {
  let result = transactions.value

  if (filterFundCode.value) {
    result = result.filter(t => t.fund_code === filterFundCode.value)
  }

  if (filterType.value) {
    result = result.filter(t => t.transaction_type === filterType.value)
  }

  return result
})

// 加载交易记录
const loadData = async () => {
  loading.value = true
  try {
    await loadTransactions()
  } catch (error) {
    console.error('加载交易记录失败:', error)
    message.error('加载交易记录失败')
  } finally {
    loading.value = false
  }
}

// 添加成功
const handleAddSuccess = () => {
  showAddModal.value = false
  loadData()
}

// 编辑
const handleEdit = (transaction) => {
  editingTransaction.value = transaction
  showEditModal.value = true
}

// 编辑成功
const handleEditSuccess = () => {
  showEditModal.value = false
  editingTransaction.value = null
  loadData()
}

// 删除成功
const handleDeleteSuccess = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.transactions-page {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.filters {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .transactions-page {
    padding: var(--spacing-lg);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .filters {
    flex-direction: column;
    width: 100%;
  }

  .filters :deep(.n-select) {
    width: 100% !important;
  }
}
</style>
