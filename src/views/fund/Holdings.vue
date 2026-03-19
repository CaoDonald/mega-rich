<template>
  <div class="holdings-page">
    <!-- 页面标题 -->
    <div class="holdings-page__header">
      <h1 class="holdings-page__title">持仓管理</h1>
      <n-button type="primary" @click="showAddModal = true">
        <template #icon>
          <n-icon :component="AddOutline" />
        </template>
        添加持仓
      </n-button>
    </div>

    <!-- 汇总统计 -->
    <div class="holdings-page__summary">
      <Card class="summary-card">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-item__label">总资产</div>
            <div class="summary-item__value">{{ formatMoney(totalAssets) }}</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <div class="summary-item__label">总成本</div>
            <div class="summary-item__value">{{ formatMoney(totalCost) }}</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item" :class="profitClass">
            <div class="summary-item__label">累计收益</div>
            <div class="summary-item__value profit-value">{{ formatMoney(totalProfit) }}</div>
            <div class="summary-item__rate profit-rate">{{ formatRate(totalProfitRate) }}</div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item" :class="todayProfitClass">
            <div class="summary-item__label">今日收益</div>
            <div class="summary-item__value profit-value">{{ formatMoney(todayProfit) }}</div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 持仓列表 -->
    <HoldingsList
      :holdings="holdings"
      :loading="holdingsLoading"
      @click="handleViewDetail"
      @add="showAddModal = true"
    />

    <!-- 添加/编辑持仓 Modal -->
    <n-modal
      v-model:show="showAddModal"
      preset="card"
      :title="editingHolding ? '编辑持仓' : '添加持仓'"
      style="width: 600px; max-width: 90vw"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <AddEditHoldingForm
        :holding="editingHolding"
        @success="handleFormSuccess"
        @cancel="handleFormCancel"
      />
    </n-modal>

    <!-- 持仓详情 Modal -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="持仓详情"
      style="width: 900px; max-width: 95vw"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <HoldingDetail
        v-if="selectedHolding"
        :holding-id="selectedHolding.id"
        @edit="handleEdit"
        @delete="handleDeleteSuccess"
        @add-transaction="handleAddTransaction"
      />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NButton, NModal, NIcon, useMessage } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import Card from '../../components/base/Card.vue'
import HoldingsList from '../../components/fund/HoldingsList.vue'
import AddEditHoldingForm from '../../components/fund/AddEditHoldingForm.vue'
import HoldingDetail from '../../components/fund/HoldingDetail.vue'
import { useFund } from '../../composables/useFund.js'

const message = useMessage()
const {
  holdings,
  loadHoldings,
  totalAssets,
  totalCost,
  totalProfit,
  totalProfitRate,
  todayProfit
} = useFund()

const holdingsLoading = ref(false)
const showAddModal = ref(false)
const showDetailModal = ref(false)
const editingHolding = ref(null)
const selectedHolding = ref(null)

// 收益样式
const profitClass = computed(() => {
  if (totalProfit.value > 0) return 'is-profit'
  if (totalProfit.value < 0) return 'is-loss'
  return ''
})

const todayProfitClass = computed(() => {
  if (todayProfit.value > 0) return 'is-profit'
  if (todayProfit.value < 0) return 'is-loss'
  return ''
})

// 格式化方法
const formatMoney = (val) => {
  if (val == null) return '--'
  const abs = Math.abs(val)
  const prefix = val < 0 ? '-' : (val > 0 ? '+' : '')
  if (abs >= 10000) {
    return prefix + (abs / 10000).toFixed(2) + '万'
  }
  return prefix + abs.toFixed(2)
}

const formatRate = (val) => {
  if (val == null) return '--'
  const prefix = val > 0 ? '+' : ''
  return prefix + Number(val).toFixed(2) + '%'
}

// 查看详情
const handleViewDetail = (holding) => {
  selectedHolding.value = holding
  showDetailModal.value = true
}

// 编辑
const handleEdit = (holding) => {
  editingHolding.value = holding
  showDetailModal.value = false
  showAddModal.value = true
}

// 表单成功
const handleFormSuccess = async () => {
  showAddModal.value = false
  editingHolding.value = null
  await loadHoldingsData()
}

// 表单取消
const handleFormCancel = () => {
  showAddModal.value = false
  editingHolding.value = null
}

// 删除成功
const handleDeleteSuccess = () => {
  showDetailModal.value = false
  selectedHolding.value = null
  loadHoldingsData()
}

// 添加交易
const handleAddTransaction = (holding) => {
  // TODO: 实现添加交易功能
  message.info('添加交易功能开发中')
}

// 加载持仓数据
const loadHoldingsData = async () => {
  holdingsLoading.value = true
  try {
    await loadHoldings()
  } catch (error) {
    console.error('加载持仓失败:', error)
    message.error('加载持仓失败')
  } finally {
    holdingsLoading.value = false
  }
}

onMounted(() => {
  loadHoldingsData()
})
</script>

<style scoped>
.holdings-page {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.holdings-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.holdings-page__title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.holdings-page__summary {
  margin-bottom: var(--spacing-xl);
}

/* 汇总统计 */
.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.summary-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-lg) 0;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.summary-item__label {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.summary-item__value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: white;
  font-variant-numeric: tabular-nums;
}

.summary-item__rate {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.9);
  font-variant-numeric: tabular-nums;
}

.summary-item.is-profit .profit-value,
.summary-item.is-profit .profit-rate {
  color: #4ade80;
}

.summary-item.is-loss .profit-value,
.summary-item.is-loss .profit-rate {
  color: #f87171;
}

.summary-divider {
  width: 1px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .holdings-page {
    padding: var(--spacing-lg);
  }

  .holdings-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .holdings-page__header button {
    width: 100%;
  }

  .holdings-page__title {
    font-size: var(--font-size-2xl);
  }

  .summary-grid {
    flex-direction: column;
    gap: var(--spacing-lg);
    padding: var(--spacing-md) 0;
  }

  .summary-item {
    width: 100%;
  }

  .summary-divider {
    width: 100%;
    height: 1px;
  }

  .summary-item__value {
    font-size: var(--font-size-xl);
  }
}

/* 平板端适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .summary-grid {
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }

  .summary-item {
    flex: 0 0 calc(50% - var(--spacing-lg));
  }

  .summary-divider:nth-child(2),
  .summary-divider:nth-child(6) {
    display: none;
  }

  .summary-divider:nth-child(4) {
    width: 100%;
    height: 1px;
    flex: 0 0 100%;
  }
}
</style>
