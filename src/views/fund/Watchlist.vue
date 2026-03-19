<template>
  <div class="watchlist-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">自选基金</h2>
      <n-button
        type="primary"
        @click="showSearchModal = true"
      >
        <template #icon>
          <n-icon :component="AddOutline" />
        </template>
        添加自选
      </n-button>
    </div>

    <!-- 排序和筛选 -->
    <div v-if="sortedWatchlist.length > 0" class="toolbar">
      <n-select
        v-model:value="sortBy"
        :options="sortOptions"
        style="width: 160px"
      />
      <n-button
        quaternary
        circle
        @click="handleRefresh"
        :loading="refreshing"
      >
        <template #icon>
          <n-icon :component="RefreshOutline" />
        </template>
      </n-button>
    </div>

    <!-- 加载状态 -->
    <Loading v-if="loading" text="加载中..." />

    <!-- 空状态 -->
    <Empty
      v-else-if="!loading && sortedWatchlist.length === 0"
      description="还没有添加自选基金"
      :icon="StarOutline"
    >
      <template #action>
        <n-button type="primary" @click="showSearchModal = true">
          <template #icon>
            <n-icon :component="AddOutline" />
          </template>
          添加自选基金
        </n-button>
      </template>
    </Empty>

    <!-- 自选列表 -->
    <div v-else class="watchlist-container">
      <WatchlistItem
        v-for="item in sortedWatchlist"
        :key="item.id"
        :item="item"
        @view-detail="handleViewDetail"
        @set-alert="handleSetAlert"
        @remove="handleRemove"
      />
    </div>

    <!-- 搜索对话框 -->
    <n-modal
      v-model:show="showSearchModal"
      preset="card"
      title="添加自选基金"
      :style="{ maxWidth: '600px', width: '90%' }"
    >
      <FundSearch
        @add-watchlist="handleAddFromSearch"
        @view-detail="handleViewDetailFromSearch"
      />
    </n-modal>

    <!-- 提醒设置对话框 -->
    <WatchlistSettings
      v-model:show="showSettingsModal"
      :fund-item="selectedFund"
      @saved="handleSettingsSaved"
    />

    <!-- 基金详情对话框 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      :title="selectedFund?.fund_name || '基金详情'"
      :style="{ maxWidth: '800px', width: '90%' }"
    >
      <FundDetail v-if="selectedFund" :fund-code="selectedFund.fund_code" />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NButton, NIcon, NSelect, NModal, useMessage, useDialog } from 'naive-ui'
import { AddOutline, RefreshOutline, StarOutline } from '@vicons/ionicons5'
import { useFund } from '../../composables/useFund.js'
import { useFundStore } from '../../stores/fund.js'
import WatchlistItem from '../../components/fund/WatchlistItem.vue'
import WatchlistSettings from '../../components/fund/WatchlistSettings.vue'
import FundSearch from '../../components/fund/FundSearch.vue'
import FundDetail from '../../components/fund/FundDetail.vue'
import Loading from '../../components/base/Loading.vue'
import Empty from '../../components/base/Empty.vue'
import * as FundApi from '../../utils/FundApi.js'

const message = useMessage()
const dialog = useDialog()
const fundStore = useFundStore()
const { loadWatchlist, removeFromWatchlist } = useFund()

const loading = ref(false)
const refreshing = ref(false)
const sortBy = ref('add_time')
const showSearchModal = ref(false)
const showSettingsModal = ref(false)
const showDetailModal = ref(false)
const selectedFund = ref(null)

// 排序选项
const sortOptions = [
  { label: '按添加时间', value: 'add_time' },
  { label: '按涨跌幅 ↓', value: 'change_desc' },
  { label: '按涨跌幅 ↑', value: 'change_asc' },
  { label: '按名称', value: 'name' }
]

// 排序后的关注列表
const sortedWatchlist = computed(() => {
  const list = [...fundStore.watchlist]

  switch (sortBy.value) {
    case 'change_desc':
      return list.sort((a, b) => (b.change_rate || 0) - (a.change_rate || 0))
    case 'change_asc':
      return list.sort((a, b) => (a.change_rate || 0) - (b.change_rate || 0))
    case 'name':
      return list.sort((a, b) => a.fund_name.localeCompare(b.fund_name, 'zh-CN'))
    case 'add_time':
    default:
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    await loadWatchlist()
    // 加载完成后更新净值数据
    await updateNavData()
  } catch (error) {
    console.error('加载自选列表失败:', error)
    message.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 更新净值数据
const updateNavData = async () => {
  if (fundStore.watchlist.length === 0) return

  try {
    // 批量获取净值数据
    const promises = fundStore.watchlist.map(async (item) => {
      try {
        const result = await FundApi.fundVarietieValuationDetail(item.fund_code)
        if (result && result.data) {
          const navData = result.data
          // 更新 store 中的数据
          fundStore.watchlist = fundStore.watchlist.map(w => {
            if (w.fund_code === item.fund_code) {
              return {
                ...w,
                current_nav: navData.gsz || navData.dwjz,
                change_rate: navData.gszzl,
                change_amount: navData.gsz ? (navData.gsz - navData.dwjz) : 0,
                last_sync_at: new Date().toISOString()
              }
            }
            return w
          })
        }
      } catch (error) {
        console.error(`获取基金 ${item.fund_code} 净值失败:`, error)
      }
    })

    await Promise.all(promises)
  } catch (error) {
    console.error('更新净值数据失败:', error)
  }
}

// 刷新数据
const handleRefresh = async () => {
  refreshing.value = true
  try {
    await updateNavData()
    message.success('刷新成功')
  } catch (error) {
    message.error('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 从搜索添加
const handleAddFromSearch = async (fund) => {
  showSearchModal.value = false
  message.success('已添加到自选列表')
  // 重新加载列表
  await loadData()
}

// 查看详情
const handleViewDetail = (item) => {
  selectedFund.value = item
  showDetailModal.value = true
}

// 从搜索查看详情
const handleViewDetailFromSearch = (fund) => {
  selectedFund.value = {
    fund_code: fund.FCODE,
    fund_name: fund.SHORTNAME
  }
  showSearchModal.value = false
  showDetailModal.value = true
}

// 设置提醒
const handleSetAlert = (item) => {
  selectedFund.value = item
  showSettingsModal.value = true
}

// 提醒设置保存后
const handleSettingsSaved = (updatedItem) => {
  // 更新列表中的数据
  fundStore.watchlist = fundStore.watchlist.map(item => {
    if (item.id === updatedItem.id) {
      return updatedItem
    }
    return item
  })
}

// 取消关注
const handleRemove = (item) => {
  dialog.warning({
    title: '确认取消关注',
    content: `确定要取消关注 ${item.fund_name} 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const result = await removeFromWatchlist(item.fund_code)
        if (result.success) {
          message.success('已取消关注')
        } else {
          message.error(result.error || '取消关注失败')
        }
      } catch (error) {
        message.error('取消关注失败')
      }
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadData()

  // 设置定时刷新（每5分钟）
  const refreshInterval = setInterval(() => {
    if (!loading.value && !refreshing.value) {
      updateNavData()
    }
  }, 5 * 60 * 1000)

  // 组件卸载时清除定时器
  return () => {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.watchlist-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-bg-base);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
}

.watchlist-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .watchlist-page {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .page-header button {
    width: 100%;
  }
}
</style>
