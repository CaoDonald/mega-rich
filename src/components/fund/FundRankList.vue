<template>
  <div class="fund-rank-list">
    <Loading v-if="loading" text="加载中..." />

    <Empty v-else-if="!loading && rankList.length === 0" description="暂无排行数据" />

    <div v-else class="rank-list">
      <div
        v-for="(fund, index) in rankList"
        :key="fund.FCODE"
        class="rank-item"
        @click="handleViewDetail(fund)"
      >
        <div class="rank-number">
          <span :class="['rank-badge', getRankClass(index + 1)]">
            {{ index + 1 }}
          </span>
        </div>

        <div class="fund-info">
          <div class="fund-header">
            <span class="fund-name">{{ fund.SHORTNAME }}</span>
            <span class="fund-code">{{ fund.FCODE }}</span>
          </div>
          <div class="fund-type">{{ fund.FTYPE || '其他' }}</div>
        </div>

        <div class="fund-performance">
          <div class="performance-item">
            <span class="label">近1月</span>
            <span :class="['value', getChangeClass(fund.SYL_Y)]">
              {{ formatReturn(fund.SYL_Y) }}
            </span>
          </div>
          <div class="performance-item">
            <span class="label">近3月</span>
            <span :class="['value', getChangeClass(fund.SYL_3Y)]">
              {{ formatReturn(fund.SYL_3Y) }}
            </span>
          </div>
          <div class="performance-item">
            <span class="label">近6月</span>
            <span :class="['value', getChangeClass(fund.SYL_6Y)]">
              {{ formatReturn(fund.SYL_6Y) }}
            </span>
          </div>
          <div class="performance-item">
            <span class="label">近1年</span>
            <span :class="['value', getChangeClass(fund.SYL_1N)]">
              {{ formatReturn(fund.SYL_1N) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination">
      <n-pagination
        v-model:page="currentPage"
        :page-count="Math.ceil(total / pageSize)"
        :page-size="pageSize"
        show-size-picker
        :page-sizes="[10, 20, 30, 50]"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { NPagination, useMessage } from 'naive-ui'
import FundApi from '../../utils/FundApi.js'
import Loading from '../base/Loading.vue'
import Empty from '../base/Empty.vue'

const props = defineProps({
  fundType: {
    type: Number,
    default: 0
  },
  sortColumn: {
    type: String,
    default: 'SYL_Y'
  },
  sortOrder: {
    type: String,
    default: 'desc'
  }
})

const emit = defineEmits(['view-detail'])
const message = useMessage()

const rankList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 加载排行榜
const loadRankList = async () => {
  loading.value = true

  try {
    const result = await FundApi.fundMNRank(
      props.fundType,
      props.sortColumn,
      props.sortOrder,
      currentPage.value,
      pageSize.value
    )

    if (result && result.data && result.data.datas) {
      rankList.value = result.data.datas
      total.value = result.data.allRecords || 0
    } else {
      rankList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载排行榜失败:', error)
    message.error('加载失败,请稍后重试')
    rankList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 查看详情
const handleViewDetail = (fund) => {
  emit('view-detail', fund)
}

// 页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadRankList()
}

// 每页条数变化
const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadRankList()
}

// 格式化收益率
const formatReturn = (value) => {
  if (!value || value === '--' || value === '') return '--'
  const num = parseFloat(value)
  if (isNaN(num)) return '--'
  return num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`
}

// 获取涨跌幅样式类
const getChangeClass = (value) => {
  if (!value || value === '--' || value === '') return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return num > 0 ? 'positive' : num < 0 ? 'negative' : ''
}

// 获取排名样式类
const getRankClass = (rank) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

// 监听筛选条件变化
watch(
  () => [props.fundType, props.sortColumn, props.sortOrder],
  () => {
    currentPage.value = 1
    loadRankList()
  }
)

// 初始加载
loadRankList()
</script>

<style scoped>
.fund-rank-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.rank-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-bg-base);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.rank-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.rank-number {
  flex-shrink: 0;
  width: 40px;
  text-align: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  background: var(--color-gray-100);
  color: var(--color-text-secondary);
}

.rank-badge.gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: white;
}

.rank-badge.silver {
  background: linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%);
  color: white;
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #CD7F32 0%, #B8733C 100%);
  color: white;
}

.fund-info {
  flex: 1;
  min-width: 0;
}

.fund-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.fund-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fund-code {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-family: monospace;
  flex-shrink: 0;
}

.fund-type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.fund-performance {
  display: flex;
  gap: var(--spacing-xl);
  flex-shrink: 0;
}

.performance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.performance-item .label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.performance-item .value {
  font-size: var(--font-size-base);
  font-weight: 600;
  font-family: monospace;
}

.performance-item .value.positive {
  color: var(--color-primary);
}

.performance-item .value.negative {
  color: var(--color-danger);
}

.pagination {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg) 0;
}

@media (max-width: 768px) {
  .rank-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .rank-number {
    width: auto;
  }

  .fund-info {
    width: 100%;
  }

  .fund-performance {
    width: 100%;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .performance-item {
    flex: 1;
  }
}
</style>
