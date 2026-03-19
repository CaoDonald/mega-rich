<template>
  <div class="fund-market">
    <Card title="基金市场" :padding="'md'">
      <!-- Tab 切换 -->
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="search" tab="搜索">
          <div class="tab-content">
            <FundSearch
              @view-detail="handleViewDetail"
              @add-holding="handleAddHolding"
              @add-watchlist="handleAddWatchlist"
            />
          </div>
        </n-tab-pane>

        <n-tab-pane name="rank" tab="排行榜">
          <div class="tab-content">
            <!-- 筛选器 -->
            <div class="filters">
              <div class="filter-group">
                <span class="filter-label">基金类型:</span>
                <n-select
                  v-model:value="fundType"
                  :options="fundTypeOptions"
                  style="width: 150px"
                />
              </div>

              <div class="filter-group">
                <span class="filter-label">排序:</span>
                <n-select
                  v-model:value="sortColumn"
                  :options="sortOptions"
                  style="width: 150px"
                />
              </div>

              <div class="filter-group">
                <span class="filter-label">顺序:</span>
                <n-select
                  v-model:value="sortOrder"
                  :options="sortOrderOptions"
                  style="width: 100px"
                />
              </div>
            </div>

            <!-- 排行榜列表 -->
            <FundRankList
              :fund-type="fundType"
              :sort-column="sortColumn"
              :sort-order="sortOrder"
              @view-detail="handleViewDetail"
            />
          </div>
        </n-tab-pane>
      </n-tabs>
    </Card>

    <!-- 添加持仓对话框 -->
    <n-modal
      v-model:show="showAddHoldingModal"
      preset="card"
      title="添加持仓"
      style="width: 90%; max-width: 600px"
    >
      <AddEditHoldingForm
        :initial-fund-code="selectedFund?.FCODE"
        :initial-fund-name="selectedFund?.SHORTNAME"
        @success="handleAddHoldingSuccess"
        @cancel="showAddHoldingModal = false"
      />
    </n-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NTabs, NTabPane, NSelect, NModal, useMessage } from 'naive-ui'
import Card from '../../components/base/Card.vue'
import FundSearch from '../../components/fund/FundSearch.vue'
import FundRankList from '../../components/fund/FundRankList.vue'
import AddEditHoldingForm from '../../components/fund/AddEditHoldingForm.vue'

const message = useMessage()

// Tab 状态
const activeTab = ref('search')

// 筛选条件
const fundType = ref(0)
const sortColumn = ref('SYL_Y')
const sortOrder = ref('desc')

// 基金类型选项
const fundTypeOptions = [
  { label: '全部', value: 0 },
  { label: '股票型', value: 25 },
  { label: '混合型', value: 27 },
  { label: '债券型', value: 31 },
  { label: '指数型', value: 26 },
  { label: 'QDII', value: 6 },
  { label: '货币型', value: 35 }
]

// 排序选项
const sortOptions = [
  { label: '近1月收益', value: 'SYL_Y' },
  { label: '近3月收益', value: 'SYL_3Y' },
  { label: '近6月收益', value: 'SYL_6Y' },
  { label: '近1年收益', value: 'SYL_1N' },
  { label: '最新净值', value: 'HLDWJZ' }
]

// 排序顺序选项
const sortOrderOptions = [
  { label: '降序', value: 'desc' },
  { label: '升序', value: 'asc' }
]

// 添加持仓对话框
const showAddHoldingModal = ref(false)
const selectedFund = ref(null)

// 查看详情
const handleViewDetail = (fund) => {
  // TODO: 跳转到基金详情页
  message.info(`查看基金详情: ${fund.SHORTNAME} (${fund.FCODE})`)
}

// 添加持仓
const handleAddHolding = (fund) => {
  selectedFund.value = fund
  showAddHoldingModal.value = true
}

// 添加持仓成功
const handleAddHoldingSuccess = () => {
  showAddHoldingModal.value = false
  message.success('添加持仓成功')
}

// 添加到关注列表
const handleAddWatchlist = () => {
  // 在 FundSearch 组件内部已处理
}
</script>

<style scoped>
.fund-market {
  width: 100%;
}

.tab-content {
  padding: var(--spacing-lg) 0;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-group :deep(.n-select) {
    width: 100% !important;
  }
}
</style>
