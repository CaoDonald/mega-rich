<template>
  <div class="holdings-list">
    <!-- 筛选和排序 -->
    <div class="holdings-list__toolbar">
      <n-select
        v-model:value="filterType"
        :options="typeFilterOptions"
        placeholder="基金类型"
        clearable
        style="width: 140px"
      />
      <n-select
        v-model:value="sortBy"
        :options="sortOptions"
        placeholder="排序方式"
        style="width: 140px"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="holdings-list__loading">
      <n-spin size="large" />
    </div>

    <!-- 空状态 -->
    <Empty
      v-else-if="filteredHoldings.length === 0"
      description="暂无持仓数据"
    >
      <template #action>
        <n-button type="primary" @click="$emit('add')">
          添加持仓
        </n-button>
      </template>
    </Empty>

    <!-- 持仓列表 -->
    <div v-else class="holdings-list__grid">
      <FundCard
        v-for="holding in filteredHoldings"
        :key="holding.id"
        :holding="holding"
        @click="handleCardClick(holding)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NSelect, NSpin, NButton } from 'naive-ui'
import FundCard from './FundCard.vue'
import Empty from '../base/Empty.vue'

const props = defineProps({
  holdings: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'add'])

// 筛选和排序状态
const filterType = ref(null)
const sortBy = ref('profit_rate_desc')

// 基金类型筛选选项
const typeFilterOptions = [
  { label: '全部类型', value: null },
  { label: '股票型', value: '股票型' },
  { label: '混合型', value: '混合型' },
  { label: '债券型', value: '债券型' },
  { label: '指数型', value: '指数型' },
  { label: 'QDII', value: 'QDII' },
  { label: '货币型', value: '货币型' },
  { label: 'FOF', value: 'FOF' },
  { label: '其他', value: '其他' }
]

// 排序选项
const sortOptions = [
  { label: '收益率从高到低', value: 'profit_rate_desc' },
  { label: '收益率从低到高', value: 'profit_rate_asc' },
  { label: '市值从高到低', value: 'market_value_desc' },
  { label: '市值从低到高', value: 'market_value_asc' },
  { label: '名称 A-Z', value: 'name_asc' },
  { label: '名称 Z-A', value: 'name_desc' },
  { label: '添加时间最新', value: 'time_desc' },
  { label: '添加时间最早', value: 'time_asc' }
]

// 筛选和排序后的持仓列表
const filteredHoldings = computed(() => {
  let result = [...props.holdings]

  // 筛选
  if (filterType.value) {
    result = result.filter(h => h.fund_type === filterType.value)
  }

  // 排序
  result.sort((a, b) => {
    const aMarketValue = (a.current_nav || 0) * (a.shares || 0)
    const bMarketValue = (b.current_nav || 0) * (b.shares || 0)
    const aCost = (a.avg_cost || 0) * (a.shares || 0)
    const bCost = (b.avg_cost || 0) * (b.shares || 0)
    const aProfit = aMarketValue - aCost
    const bProfit = bMarketValue - bCost
    const aProfitRate = aCost > 0 ? (aProfit / aCost) * 100 : 0
    const bProfitRate = bCost > 0 ? (bProfit / bCost) * 100 : 0

    switch (sortBy.value) {
      case 'profit_rate_desc':
        return bProfitRate - aProfitRate
      case 'profit_rate_asc':
        return aProfitRate - bProfitRate
      case 'market_value_desc':
        return bMarketValue - aMarketValue
      case 'market_value_asc':
        return aMarketValue - bMarketValue
      case 'name_asc':
        return (a.fund_name || '').localeCompare(b.fund_name || '', 'zh-CN')
      case 'name_desc':
        return (b.fund_name || '').localeCompare(a.fund_name || '', 'zh-CN')
      case 'time_desc':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      case 'time_asc':
        return new Date(a.created_at || 0) - new Date(b.created_at || 0)
      default:
        return 0
    }
  })

  return result
})

// 点击卡片
const handleCardClick = (holding) => {
  emit('click', holding)
}
</script>

<style scoped>
.holdings-list {
  width: 100%;
}

.holdings-list__toolbar {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.holdings-list__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.holdings-list__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

/* 移动端单列 */
@media (max-width: 768px) {
  .holdings-list__grid {
    grid-template-columns: 1fr;
  }

  .holdings-list__toolbar {
    gap: var(--spacing-sm);
  }
}

/* 平板端单列 */
@media (max-width: 1024px) {
  .holdings-list__grid {
    grid-template-columns: 1fr;
  }
}

/* 大屏幕三列 */
@media (min-width: 1440px) {
  .holdings-list__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
