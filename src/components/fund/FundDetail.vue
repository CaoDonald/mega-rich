<template>
  <div class="fund-detail">
    <Loading v-if="loading" text="加载基金详情..." />

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="fundInfo" class="fund-detail__content">
      <!-- 基本信息卡片 -->
      <Card class="info-card">
        <div class="info-header">
          <div>
            <h2 class="fund-name">{{ fundInfo.SHORTNAME }}</h2>
            <div class="fund-meta">
              <span class="fund-code">{{ fundInfo.FCODE }}</span>
              <span class="fund-type">{{ fundInfo.FTYPE }}</span>
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">基金公司</span>
            <span class="info-value">{{ fundInfo.JJGS }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">基金规模</span>
            <span class="info-value">{{ formatScale(fundInfo.ENDNAV) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">成立日期</span>
            <span class="info-value">{{ fundInfo.ESTABDATE }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">托管人</span>
            <span class="info-value">{{ fundInfo.TGRGLDM || '--' }}</span>
          </div>
        </div>
      </Card>

      <!-- 最新净值卡片 -->
      <Card class="nav-card">
        <template #header>
          <h3>最新净值</h3>
        </template>

        <div class="nav-main">
          <div class="nav-item">
            <span class="nav-label">单位净值</span>
            <span class="nav-value">{{ formatNav(fundInfo.DWJZ) }}</span>
            <span class="nav-date">{{ fundInfo.FSRQ }}</span>
          </div>
          <div class="nav-divider"></div>
          <div class="nav-item">
            <span class="nav-label">累计净值</span>
            <span class="nav-value">{{ formatNav(fundInfo.LJJZ) }}</span>
          </div>
          <div class="nav-divider"></div>
          <div class="nav-item">
            <span class="nav-label">日涨跌幅</span>
            <span class="nav-value" :class="getChangeClass(fundInfo.RZDF)">
              {{ formatPercent(fundInfo.RZDF) }}
            </span>
          </div>
        </div>

        <div v-if="valuation" class="valuation-section">
          <div class="valuation-item">
            <span class="valuation-label">实时估值</span>
            <span class="valuation-value" :class="getChangeClass(valuation.gszzl)">
              {{ formatNav(valuation.gsz) }}
            </span>
          </div>
          <div class="valuation-item">
            <span class="valuation-label">估值涨幅</span>
            <span class="valuation-value" :class="getChangeClass(valuation.gszzl)">
              {{ formatPercent(valuation.gszzl) }}
            </span>
          </div>
          <div class="valuation-time">
            更新时间: {{ valuation.gztime }}
          </div>
        </div>
      </Card>

      <!-- 阶段涨幅卡片 -->
      <Card v-if="periodIncrease" class="period-card">
        <template #header>
          <h3>阶段涨幅</h3>
        </template>

        <div class="period-grid">
          <div v-for="item in periodData" :key="item.label" class="period-item">
            <span class="period-label">{{ item.label }}</span>
            <span class="period-value" :class="getChangeClass(item.value)">
              {{ formatPercent(item.value) }}
            </span>
          </div>
        </div>
      </Card>

      <!-- 基金经理信息 -->
      <Card v-if="managers && managers.length > 0" class="manager-card">
        <template #header>
          <h3>基金经理</h3>
        </template>

        <div class="manager-list">
          <div v-for="manager in managers" :key="manager.MGRID" class="manager-item">
            <div class="manager-info">
              <span class="manager-name">{{ manager.MGRNAME }}</span>
              <span class="manager-tenure">从业 {{ manager.WORKTIME }} 年</span>
            </div>
            <div class="manager-stats">
              <span class="manager-stat">
                <span class="stat-label">管理规模</span>
                <span class="stat-value">{{ formatScale(manager.TOTALMONEY) }}</span>
              </span>
              <span class="manager-stat">
                <span class="stat-label">任职回报</span>
                <span class="stat-value" :class="getChangeClass(manager.PENAVGROWTH)">
                  {{ formatPercent(manager.PENAVGROWTH) }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      <!-- 基金评级 -->
      <Card v-if="rating" class="rating-card">
        <template #header>
          <h3>基金评级</h3>
        </template>

        <div class="rating-content">
          <div class="rating-item">
            <span class="rating-label">三年评级</span>
            <div class="rating-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= rating.three_year }">★</span>
            </div>
          </div>
          <div class="rating-item">
            <span class="rating-label">五年评级</span>
            <div class="rating-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= rating.five_year }">★</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <n-button type="primary" size="large" @click="handleAddHolding">
          添加持仓
        </n-button>
        <n-button size="large" @click="handleAddWatchlist">
          {{ isInWatchlist ? '取消关注' : '添加关注' }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NButton } from 'naive-ui'
import Card from '../base/Card.vue'
import Loading from '../base/Loading.vue'
import FundApi from '../../utils/FundApi.js'

const props = defineProps({
  fundCode: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['add-holding', 'add-watchlist', 'remove-watchlist'])

// 状态
const loading = ref(true)
const error = ref(null)
const fundInfo = ref(null)
const valuation = ref(null)
const periodIncrease = ref(null)
const managers = ref([])
const rating = ref(null)
const isInWatchlist = ref(false)

// 阶段涨幅数据
const periodData = computed(() => {
  if (!periodIncrease.value) return []

  const data = periodIncrease.value
  return [
    { label: '近1周', value: data.Z },
    { label: '近1月', value: data.Y },
    { label: '近3月', value: data['3Y'] },
    { label: '近6月', value: data['6Y'] },
    { label: '近1年', value: data['1N'] },
    { label: '今年来', value: data.JN },
    { label: '成立来', value: data.LN }
  ]
})

// 加载基金详情
const loadFundDetail = async () => {
  loading.value = true
  error.value = null

  try {
    // 并行加载多个接口
    const [detailRes, valuationRes, periodRes, managerRes, ratingRes] = await Promise.allSettled([
      FundApi.fundMNDetailInformation(props.fundCode),
      FundApi.fundVarietieValuationDetail(props.fundCode),
      FundApi.fundMNPeriodIncrease(props.fundCode),
      FundApi.fundMNMangerList(props.fundCode),
      FundApi.fundGradeDetail(props.fundCode)
    ])

    // 处理基金详情
    if (detailRes.status === 'fulfilled' && detailRes.value?.data) {
      fundInfo.value = detailRes.value.data
    } else {
      throw new Error('获取基金详情失败')
    }

    // 处理估值
    if (valuationRes.status === 'fulfilled' && valuationRes.value?.data) {
      valuation.value = valuationRes.value.data
    }

    // 处理阶段涨幅
    if (periodRes.status === 'fulfilled' && periodRes.value?.data) {
      periodIncrease.value = periodRes.value.data
    }

    // 处理基金经理
    if (managerRes.status === 'fulfilled' && managerRes.value?.data) {
      managers.value = Array.isArray(managerRes.value.data)
        ? managerRes.value.data
        : [managerRes.value.data]
    }

    // 处理评级
    if (ratingRes.status === 'fulfilled' && ratingRes.value?.data) {
      const ratingData = ratingRes.value.data
      rating.value = {
        three_year: parseInt(ratingData.three_year) || 0,
        five_year: parseInt(ratingData.five_year) || 0
      }
    }

  } catch (err) {
    console.error('加载基金详情失败:', err)
    error.value = err.message || '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

// 格式化方法
const formatNav = (val) => {
  if (val == null || val === '') return '--'
  return Number(val).toFixed(4)
}

const formatPercent = (val) => {
  if (val == null || val === '') return '--'
  const num = Number(val)
  const prefix = num > 0 ? '+' : ''
  return prefix + num.toFixed(2) + '%'
}

const formatScale = (val) => {
  if (val == null || val === '') return '--'
  const num = Number(val)
  if (num >= 100) {
    return (num / 100).toFixed(2) + '亿'
  }
  return num.toFixed(2) + '万'
}

const getChangeClass = (val) => {
  const num = Number(val)
  if (num > 0) return 'is-up'
  if (num < 0) return 'is-down'
  return 'is-flat'
}

// 操作方法
const handleAddHolding = () => {
  emit('add-holding', {
    fund_code: props.fundCode,
    fund_name: fundInfo.value?.SHORTNAME
  })
}

const handleAddWatchlist = () => {
  if (isInWatchlist.value) {
    emit('remove-watchlist', props.fundCode)
  } else {
    emit('add-watchlist', {
      fund_code: props.fundCode,
      fund_name: fundInfo.value?.SHORTNAME
    })
  }
  isInWatchlist.value = !isInWatchlist.value
}

// 生命周期
onMounted(() => {
  loadFundDetail()
})

// 暴露刷新方法
defineExpose({
  refresh: loadFundDetail
})
</script>

<style scoped>
.fund-detail {
  width: 100%;
}

.fund-detail__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.error-state {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-danger);
}

/* 基本信息卡片 */
.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.info-card :deep(.card-body) {
  padding: var(--spacing-xl);
}

.info-header {
  margin-bottom: var(--spacing-lg);
}

.fund-name {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
  color: white;
}

.fund-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.fund-code {
  font-size: var(--font-size-sm);
  font-family: 'SFMono-Regular', Consolas, monospace;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.fund-type {
  font-size: var(--font-size-xs);
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-label {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

.info-value {
  font-size: var(--font-size-base);
  font-weight: 600;
}

/* 净值卡片 */
.nav-main {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.nav-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.nav-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.nav-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.nav-divider {
  width: 1px;
  height: 40px;
  background: var(--color-gray-200);
}

.valuation-section {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: var(--spacing-lg) 0;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
}

.valuation-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.valuation-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.valuation-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.valuation-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-align: center;
  margin-top: var(--spacing-sm);
}

/* 阶段涨幅 */
.period-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.period-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.period-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.period-value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* 基金经理 */
.manager-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.manager-item {
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.manager-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.manager-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.manager-tenure {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.manager-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.manager-stat {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.stat-value {
  font-size: var(--font-size-base);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* 评级 */
.rating-content {
  display: flex;
  gap: var(--spacing-2xl);
}

.rating-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.rating-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: var(--font-size-xl);
  color: var(--color-gray-300);
  transition: color var(--transition-fast);
}

.star.active {
  color: var(--color-warning);
}

/* 颜色状态 */
.is-up {
  color: var(--color-primary);
}

.is-down {
  color: var(--color-danger);
}

.is-flat {
  color: var(--color-text-secondary);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) 0;
}

.action-buttons .n-button {
  flex: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .period-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .nav-main {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .nav-divider {
    display: none;
  }

  .valuation-section {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .rating-content {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .manager-stats {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>
