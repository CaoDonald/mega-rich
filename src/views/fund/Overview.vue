<template>
  <div class="fund-overview">
    <!-- 资产汇总 -->
    <section class="overview-section">
      <AssetSummary />
    </section>

    <!-- 收益曲线 -->
    <section class="overview-section">
      <ProfitChart />
    </section>

    <!-- 持仓概览 -->
    <section class="overview-section">
      <HoldingsOverview
        @navigate="handleNavigate"
        @add-holding="showAddHoldingModal = true"
      />
    </section>

    <!-- 快速操作 -->
    <section class="overview-section">
      <Card title="快速操作">
        <div class="quick-actions">
          <n-button
            type="primary"
            size="large"
            block
            @click="showAddHoldingModal = true"
          >
            <template #icon>
              <n-icon><Add /></n-icon>
            </template>
            添加持仓
          </n-button>
          <n-button
            type="default"
            size="large"
            block
            @click="showTransactionModal = true"
          >
            <template #icon>
              <n-icon><SwapHorizontal /></n-icon>
            </template>
            记录交易
          </n-button>
          <n-button
            type="default"
            size="large"
            block
            @click="handleNavigate('search')"
          >
            <template #icon>
              <n-icon><Search /></n-icon>
            </template>
            基金搜索
          </n-button>
        </div>
      </Card>
    </section>

    <!-- 添加持仓弹窗 -->
    <n-modal
      v-model:show="showAddHoldingModal"
      preset="card"
      title="添加持仓"
      :style="{ maxWidth: '600px' }"
    >
      <AddEditHoldingForm
        @success="handleAddSuccess"
        @cancel="showAddHoldingModal = false"
      />
    </n-modal>

    <!-- 记录交易弹窗 -->
    <n-modal
      v-model:show="showTransactionModal"
      preset="card"
      title="记录交易"
      :style="{ maxWidth: '600px' }"
    >
      <TransactionForm
        @success="handleTransactionSuccess"
        @cancel="showTransactionModal = false"
      />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFund } from '../../composables/useFund.js'
import AssetSummary from '../../components/fund/AssetSummary.vue'
import ProfitChart from '../../components/fund/ProfitChart.vue'
import HoldingsOverview from '../../components/fund/HoldingsOverview.vue'
import AddEditHoldingForm from '../../components/fund/AddEditHoldingForm.vue'
import TransactionForm from '../../components/fund/TransactionForm.vue'
import Card from '../../components/base/Card.vue'
import { Add, SwapHorizontal, Search } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'

const router = useRouter()
const message = useMessage()
const { loadHoldings } = useFund()

const showAddHoldingModal = ref(false)
const showTransactionModal = ref(false)

// 页面导航
const handleNavigate = (page) => {
  const routeMap = {
    'holdings': 'fund-holdings',
    'search': 'fund-market',
    'transactions': 'fund-transactions'
  }

  const routeName = routeMap[page] || page
  router.push({ name: routeName })
}

// 添加持仓成功
const handleAddSuccess = async () => {
  showAddHoldingModal.value = false
  message.success('添加持仓成功')
  await loadHoldings()
}

// 记录交易成功
const handleTransactionSuccess = async () => {
  showTransactionModal.value = false
  message.success('记录交易成功')
  await loadHoldings()
}

// 页面加载
onMounted(async () => {
  try {
    await loadHoldings()
  } catch (error) {
    message.error('加载数据失败')
  }
})
</script>

<style scoped>
.fund-overview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.overview-section {
  width: 100%;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .fund-overview {
    padding: var(--spacing-xl);
  }

  .quick-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
