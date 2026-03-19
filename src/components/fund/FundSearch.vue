<template>
  <div class="fund-search">
    <!-- 搜索框 -->
    <div class="search-box">
      <n-input
        v-model:value="keyword"
        placeholder="输入基金名称或代码搜索"
        clearable
        size="large"
        @input="handleSearch"
      >
        <template #prefix>
          <n-icon :component="SearchOutline" />
        </template>
      </n-input>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results">
      <Loading v-if="loading" text="搜索中..." />

      <Empty v-else-if="!loading && searched && results.length === 0" description="未找到相关基金" />

      <div v-else-if="results.length > 0" class="results-list">
        <div
          v-for="fund in results"
          :key="fund.fcode"
          class="result-item"
        >
          <div class="fund-info" @click="handleViewDetail(fund)">
            <div class="fund-header">
              <span class="fund-code">{{ fund.fcode }}</span>
              <span class="fund-name">{{ fund.shortname }}</span>
            </div>
            <div class="fund-meta">
              <span class="fund-type">{{ fund.ftype || '其他' }}</span>
            </div>
          </div>

          <div class="fund-actions">
            <n-button
              size="small"
              @click="handleAddToHolding(fund)"
            >
              添加持仓
            </n-button>
            <n-button
              size="small"
              secondary
              @click="handleAddToWatchlist(fund)"
            >
              关注
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NInput, NIcon, NButton, useMessage } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import { useFund } from '../../composables/useFund.js'
import Loading from '../base/Loading.vue'
import Empty from '../base/Empty.vue'

const emit = defineEmits(['view-detail', 'add-holding', 'add-watchlist'])
const message = useMessage()

const { searchFund, addToWatchlist } = useFund()

const keyword = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)

let searchTimer = null

// 防抖搜索
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!keyword.value || keyword.value.trim().length === 0) {
    results.value = []
    searched.value = false
    return
  }

  searchTimer = setTimeout(async () => {
    await performSearch()
  }, 500)
}

// 执行搜索
const performSearch = async () => {
  loading.value = true
  searched.value = true

  try {
    const result = await searchFund(keyword.value.trim())

    if (result?.data?.data?.length > 0) {
      results.value = result.data.data
    } else {
      results.value = []
    }
  } catch (error) {
    console.error('搜索失败:', error)
    message.error('搜索失败,请稍后重试')
    results.value = []
  } finally {
    loading.value = false
  }
}

// 查看详情
const handleViewDetail = (fund) => {
  emit('view-detail', fund)
}

// 添加到持仓
const handleAddToHolding = (fund) => {
  emit('add-holding', fund)
}

// 添加到关注
const handleAddToWatchlist = async (fund) => {
  try {
    const result = await addToWatchlist(fund.fcode, fund.shortname)
    if (result.success) {
      message.success('已添加到关注列表')
    } else {
      message.error(result.error || '添加失败')
    }
  } catch (error) {
    message.error('添加失败')
  }
}

</script>

<style scoped>
.fund-search {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.search-box {
  width: 100%;
}

.search-results {
  min-height: 200px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-bg-base);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.result-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.fund-info {
  flex: 1;
  cursor: pointer;
}

.fund-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.fund-code {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-family: monospace;
}

.fund-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
}

.fund-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
}

.fund-type {
  color: var(--color-text-secondary);
}

.fund-nav {
  color: var(--color-text-primary);
}

.fund-change {
  font-weight: 500;
}

.fund-change.positive {
  color: var(--color-primary);
}

.fund-change.negative {
  color: var(--color-danger);
}

.fund-actions {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .fund-actions {
    width: 100%;
  }

  .fund-actions button {
    flex: 1;
  }
}
</style>
