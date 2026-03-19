<template>
  <div class="fund-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <n-button text @click="handleBack">
        <template #icon>
          <n-icon><ArrowBack /></n-icon>
        </template>
        返回
      </n-button>
      <h1 class="page-title">基金详情</h1>
    </div>

    <!-- 加载状态 -->
    <Loading v-if="loading" text="加载中..." />

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <n-button @click="loadData">重试</n-button>
    </div>

    <!-- 内容区域 -->
    <div v-else class="page-content">
      <!-- Tab 切换 -->
      <n-tabs v-model:value="activeTab" type="line" animated>
        <!-- 基本信息 -->
        <n-tab-pane name="info" tab="基本信息">
          <FundDetail
            ref="fundDetailRef"
            :fund-code="fundCode"
            @add-holding="handleAddHolding"
            @add-watchlist="handleAddWatchlist"
            @remove-watchlist="handleRemoveWatchlist"
          />
        </n-tab-pane>

        <!-- 净值走势 -->
        <n-tab-pane name="nav" tab="净值走势">
          <Card>
            <template #header>
              <div class="chart-header">
                <h3>净值走势</h3>
                <n-radio-group v-model:value="navRange" size="small" @update:value="loadNavData">
                  <n-radio-button value="">全部</n-radio-button>
                  <n-radio-button value="y">近1月</n-radio-button>
                  <n-radio-button value="3y">近3月</n-radio-button>
                  <n-radio-button value="6y">近6月</n-radio-button>
                  <n-radio-button value="n">近1年</n-radio-button>
                </n-radio-group>
              </div>
            </template>

            <Loading v-if="navLoading" text="加载净值数据..." />
            <div v-else-if="navData && navData.length > 0" class="chart-container">
              <Chart :option="navChartOption" height="400px" />
            </div>
            <div v-else class="empty-state">
              <p>暂无净值数据</p>
            </div>
          </Card>
        </n-tab-pane>

        <!-- 基金经理 -->
        <n-tab-pane name="manager" tab="基金经理">
          <Card v-if="managerDetail">
            <div class="manager-detail">
              <div class="manager-header">
                <h3>{{ managerDetail.name }}</h3>
                <span class="manager-company">{{ managerDetail.company }}</span>
              </div>
              <div class="manager-info-grid">
                <div class="info-item">
                  <span class="label">从业年限</span>
                  <span class="value">{{ managerDetail.workTime }} 年</span>
                </div>
                <div class="info-item">
                  <span class="label">管理规模</span>
                  <span class="value">{{ managerDetail.scale }}</span>
                </div>
                <div class="info-item">
                  <span class="label">管理基金数</span>
                  <span class="value">{{ managerDetail.fundCount }} 只</span>
                </div>
                <div class="info-item">
                  <span class="label">任职回报</span>
                  <span class="value">{{ managerDetail.return }}</span>
                </div>
              </div>
              <div class="manager-desc">
                <h4>简介</h4>
                <p>{{ managerDetail.description || '暂无简介' }}</p>
              </div>
            </div>
          </Card>
          <div v-else class="empty-state">
            <p>暂无基金经理信息</p>
          </div>
        </n-tab-pane>

        <!-- 持仓明细 -->
        <n-tab-pane name="holdings" tab="持仓明细">
          <Card>
            <template #header>
              <h3>十大重仓股</h3>
            </template>

            <div v-if="holdingsData && holdingsData.length > 0" class="holdings-table">
              <div class="table-header">
                <span class="col-name">股票名称</span>
                <span class="col-code">代码</span>
                <span class="col-ratio">占比</span>
              </div>
              <div v-for="(item, index) in holdingsData" :key="index" class="table-row">
                <span class="col-name">{{ item.name }}</span>
                <span class="col-code">{{ item.code }}</span>
                <span class="col-ratio">{{ item.ratio }}%</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>暂无持仓数据</p>
            </div>
          </Card>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 添加持仓对话框 -->
    <n-modal v-model:show="showAddHoldingModal" preset="card" title="添加持仓" style="max-width: 500px">
      <n-form ref="holdingFormRef" :model="holdingForm" :rules="holdingRules">
        <n-form-item label="基金代码" path="fund_code">
          <n-input v-model:value="holdingForm.fund_code" disabled />
        </n-form-item>
        <n-form-item label="基金名称" path="fund_name">
          <n-input v-model:value="holdingForm.fund_name" disabled />
        </n-form-item>
        <n-form-item label="持仓份额" path="shares">
          <n-input-number v-model:value="holdingForm.shares" :min="0" :precision="2" style="width: 100%" />
        </n-form-item>
        <n-form-item label="平均成本" path="avg_cost">
          <n-input-number v-model:value="holdingForm.avg_cost" :min="0" :precision="4" style="width: 100%" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="showAddHoldingModal = false">取消</n-button>
          <n-button type="primary" @click="submitHolding">确定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { NButton, NIcon, NTabs, NTabPane, NRadioGroup, NRadioButton, NModal, NForm, NFormItem, NInput, NInputNumber } from 'naive-ui'
import { ArrowBack } from '@vicons/ionicons5'
import FundDetail from '../../components/fund/FundDetail.vue'
import Card from '../../components/base/Card.vue'
import Chart from '../../components/base/Chart.vue'
import Loading from '../../components/base/Loading.vue'
import { useFund } from '../../composables/useFund.js'
import { useChart } from '../../composables/useChart.js'
import FundApi from '../../utils/FundApi.js'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { createHolding, addToWatchlist, removeFromWatchlist } = useFund()
const { getLineChartConfig, colorSchemes } = useChart()

// 基金代码
const fundCode = computed(() => route.params.code)

// 状态
const loading = ref(false)
const error = ref(null)
const activeTab = ref('info')
const fundDetailRef = ref(null)

// 净值数据
const navLoading = ref(false)
const navRange = ref('')
const navData = ref([])

// 基金经理详情
const managerDetail = ref(null)

// 持仓明细
const holdingsData = ref([])

// 添加持仓表单
const showAddHoldingModal = ref(false)
const holdingFormRef = ref(null)
const holdingForm = ref({
  fund_code: '',
  fund_name: '',
  shares: null,
  avg_cost: null
})

const holdingRules = {
  shares: [
    { required: true, type: 'number', message: '请输入持仓份额', trigger: 'blur' }
  ],
  avg_cost: [
    { required: true, type: 'number', message: '请输入平均成本', trigger: 'blur' }
  ]
}

// 净值图表配置
const navChartOption = computed(() => {
  if (!navData.value || navData.value.length === 0) return {}

  const dates = navData.value.map(item => item.FSRQ).reverse()
  const navValues = navData.value.map(item => parseFloat(item.DWJZ)).reverse()

  return getLineChartConfig({
    xAxis: {
      data: dates
    },
    yAxis: {
      name: '单位净值'
    },
    series: [
      {
        name: '单位净值',
        data: navValues,
        itemStyle: {
          color: colorSchemes.profit[0]
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 160, 88, 0.3)' },
              { offset: 1, color: 'rgba(24, 160, 88, 0.05)' }
            ]
          }
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const param = params[0]
        return `${param.axisValue}<br/>${param.marker}${param.seriesName}: ${param.value.toFixed(4)}`
      }
    }
  })
})

// 加载净值数据
const loadNavData = async () => {
  navLoading.value = true
  try {
    const result = await FundApi.fundMNHisNetList(fundCode.value, 1, 100)
    if (result?.data?.Data) {
      navData.value = result.data.Data
    }
  } catch (err) {
    console.error('加载净值数据失败:', err)
    message.error('加载净值数据失败')
  } finally {
    navLoading.value = false
  }
}

// 加载基金经理详情
const loadManagerDetail = async () => {
  try {
    const result = await FundApi.fundMNMangerList(fundCode.value)
    if (result?.data && result.data.length > 0) {
      const manager = result.data[0]
      managerDetail.value = {
        name: manager.MGRNAME,
        company: manager.JJGS,
        workTime: manager.WORKTIME,
        scale: manager.TOTALMONEY,
        fundCount: manager.FUNDCOUNT,
        return: manager.PENAVGROWTH,
        description: manager.DESCRIPTION
      }
    }
  } catch (err) {
    console.error('加载基金经理详情失败:', err)
  }
}

// 加载持仓明细
const loadHoldingsData = async () => {
  try {
    // 这里使用模拟数据，实际应该调用相应的 API
    holdingsData.value = []
  } catch (err) {
    console.error('加载持仓明细失败:', err)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    await Promise.all([
      loadNavData(),
      loadManagerDetail(),
      loadHoldingsData()
    ])
  } catch (err) {
    console.error('加载数据失败:', err)
    error.value = '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 添加持仓
const handleAddHolding = (data) => {
  holdingForm.value = {
    fund_code: data.fund_code,
    fund_name: data.fund_name,
    shares: null,
    avg_cost: null
  }
  showAddHoldingModal.value = true
}

// 提交持仓
const submitHolding = async () => {
  try {
    await holdingFormRef.value?.validate()
    const result = await createHolding(holdingForm.value)
    if (result.success) {
      message.success('添加持仓成功')
      showAddHoldingModal.value = false
    } else {
      message.error(result.error || '添加持仓失败')
    }
  } catch (err) {
    console.error('添加持仓失败:', err)
  }
}

// 添加关注
const handleAddWatchlist = async (data) => {
  const result = await addToWatchlist(data.fund_code, data.fund_name)
  if (result.success) {
    message.success('添加关注成功')
  } else {
    message.error(result.error || '添加关注失败')
  }
}

// 取消关注
const handleRemoveWatchlist = async (fundCode) => {
  const result = await removeFromWatchlist(fundCode)
  if (result.success) {
    message.success('取消关注成功')
  } else {
    message.error(result.error || '取消关注失败')
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.fund-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.page-content {
  background: var(--color-bg-base);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: var(--spacing-xl);
  text-align: center;
}

.error-state p {
  color: var(--color-danger);
  margin-bottom: var(--spacing-lg);
}

.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-text-tertiary);
}

/* 图表头部 */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chart-header h3 {
  margin: 0;
}

.chart-container {
  margin-top: var(--spacing-lg);
}

/* 基金经理详情 */
.manager-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.manager-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.manager-header h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin: 0;
}

.manager-company {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.manager-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item .label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.info-item .value {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.manager-desc h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
}

.manager-desc p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* 持仓表格 */
.holdings-table {
  display: flex;
  flex-direction: column;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  align-items: center;
}

.table-header {
  background: var(--color-bg-secondary);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
}

.table-row {
  border-bottom: 1px solid var(--color-gray-200);
}

.table-row:last-child {
  border-bottom: none;
}

.col-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.col-code {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-family: 'SFMono-Regular', Consolas, monospace;
}

.col-ratio {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: right;
}

/* 响应式 */
@media (max-width: 768px) {
  .fund-detail-page {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .manager-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .holdings-table .table-header,
  .holdings-table .table-row {
    grid-template-columns: 1.5fr 1fr 0.8fr;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
  }

  .col-name,
  .col-code,
  .col-ratio {
    font-size: var(--font-size-xs);
  }
}
</style>
