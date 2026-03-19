<template>
  <div class="compare-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <h2 class="page-title">基金对比</h2>
      <n-button
        type="primary"
        :disabled="compareFunds.length >= 4"
        @click="showSearchDialog = true"
      >
        <template #icon>
          <n-icon :component="AddOutline" />
        </template>
        添加基金
      </n-button>
    </div>

    <div v-if="compareFunds.length >= 4" class="tip-message">
      <n-alert type="info" :show-icon="false">
        最多可对比4只基金
      </n-alert>
    </div>

    <!-- 空状态 -->
    <div v-if="compareFunds.length === 0" class="empty-container">
      <Empty description="暂无对比基金">
        <template #action>
          <n-button type="primary" @click="showSearchDialog = true">
            添加基金开始对比
          </n-button>
        </template>
      </Empty>
    </div>

    <!-- 对比内容 -->
    <div v-else class="compare-content">
      <!-- 对比表格 -->
      <Card title="基金对比" :padding="'md'">
        <FundCompare :funds="compareFunds" @remove="handleRemoveFund" />
      </Card>

      <!-- 净值走势对比图 -->
      <Card title="净值走势对比" :padding="'md'">
        <Chart
          :option="navChartOption"
          :loading="navLoading"
          height="400px"
        />
      </Card>
    </div>

    <!-- 搜索对话框 -->
    <n-modal
      v-model:show="showSearchDialog"
      preset="card"
      title="搜索基金"
      :style="{ maxWidth: '600px' }"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <FundSearch @view-detail="handleSelectFund" />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { NButton, NIcon, NModal, NAlert, useMessage } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useFund } from '../../composables/useFund.js'
import { useChart } from '../../composables/useChart.js'
import FundApi from '../../utils/FundApi.js'
import Card from '../../components/base/Card.vue'
import Chart from '../../components/base/Chart.vue'
import Empty from '../../components/base/Empty.vue'
import FundCompare from '../../components/fund/FundCompare.vue'
import FundSearch from '../../components/fund/FundSearch.vue'

const message = useMessage()
const { getFundDetail, getFundNav } = useFund()
const { getLineChartConfig, colorSchemes } = useChart()

const STORAGE_KEY = 'fund_compare_list'

const showSearchDialog = ref(false)
const compareFunds = ref([])
const navLoading = ref(false)
const navData = ref({})

// 从 localStorage 加载对比列表
const loadCompareList = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const codes = JSON.parse(saved)
      codes.forEach(code => loadFundData(code))
    }
  } catch (error) {
    console.error('加载对比列表失败:', error)
  }
}

// 保存对比列表到 localStorage
const saveCompareList = () => {
  try {
    const codes = compareFunds.value.map(f => f.code)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
  } catch (error) {
    console.error('保存对比列表失败:', error)
  }
}

// 加载基金数据
const loadFundData = async (fundCode) => {
  try {
    // 并行加载基金详情和阶段涨幅
    const [detailResult, periodResult] = await Promise.all([
      getFundDetail(fundCode),
      FundApi.fundMNPeriodIncrease(fundCode)
    ])

    if (detailResult && detailResult.data) {
      const data = detailResult.data
      const periodData = periodResult?.data || {}

      const fundInfo = {
        code: fundCode,
        name: data.SHORTNAME || data.FCODE,
        type: data.FTYPE || '--',
        scale: data.ENDNAV || '--',
        foundDate: data.ESTABDATE || '--',
        nav: data.DWJZ || '--',
        totalNav: data.LJJZ || '--',
        return1m: periodData.Y || '--',
        return3m: periodData['3Y'] || '--',
        return6m: periodData['6Y'] || '--',
        return1y: periodData['1N'] || '--',
        manager: data.JJJL || '--',
        managementFee: data.GLFL || '--'
      }

      const index = compareFunds.value.findIndex(f => f.code === fundCode)
      if (index >= 0) {
        compareFunds.value[index] = fundInfo
      } else {
        compareFunds.value.push(fundInfo)
      }

      // 加载净值数据
      await loadNavData(fundCode)
    }
  } catch (error) {
    console.error('加载基金数据失败:', error)
    message.error(`加载基金 ${fundCode} 数据失败`)
  }
}

// 加载净值数据
const loadNavData = async (fundCode) => {
  try {
    const result = await getFundNav(fundCode)
    if (result && result.data) {
      navData.value[fundCode] = result.data
    }
  } catch (error) {
    console.error('加载净值数据失败:', error)
  }
}

// 选择基金
const handleSelectFund = async (fund) => {
  if (compareFunds.value.length >= 4) {
    message.warning('最多可对比4只基金')
    return
  }

  const exists = compareFunds.value.some(f => f.code === fund.FCODE)
  if (exists) {
    message.warning('该基金已在对比列表中')
    return
  }

  showSearchDialog.value = false
  await loadFundData(fund.FCODE)
  saveCompareList()
  message.success('添加成功')
}

// 移除基金
const handleRemoveFund = (code) => {
  compareFunds.value = compareFunds.value.filter(f => f.code !== code)
  delete navData.value[code]
  saveCompareList()
  message.success('已移除')
}

// 净值走势图配置
const navChartOption = computed(() => {
  if (compareFunds.value.length === 0) return null

  // 获取所有日期并排序
  const allDates = new Set()
  Object.values(navData.value).forEach(data => {
    data.forEach(item => allDates.add(item.FSRQ))
  })
  const dates = Array.from(allDates).sort()

  // 构建系列数据
  const series = compareFunds.value.map((fund, index) => {
    const fundNavData = navData.value[fund.code] || []
    const dataMap = new Map(fundNavData.map(item => [item.FSRQ, item.DWJZ]))

    return {
      name: `${fund.name}(${fund.code})`,
      data: dates.map(date => dataMap.get(date) || null),
      color: colorSchemes.category[index % colorSchemes.category.length],
      areaStyle: false
    }
  })

  return getLineChartConfig({
    xAxis: {
      data: dates
    },
    yAxis: {
      name: '单位净值',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series,
    legend: {
      show: true,
      top: 0,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach(param => {
          if (param.value !== null) {
            result += `${param.marker}${param.seriesName}: ${param.value}<br/>`
          }
        })
        return result
      }
    }
  })
})

// 监听对比列表变化，加载净值数据
watch(compareFunds, async (newFunds) => {
  if (newFunds.length > 0) {
    navLoading.value = true
    try {
      await Promise.all(
        newFunds.map(fund => {
          if (!navData.value[fund.code]) {
            return loadNavData(fund.code)
          }
        })
      )
    } finally {
      navLoading.value = false
    }
  }
}, { deep: true })

onMounted(() => {
  loadCompareList()
})
</script>

<style scoped>
.compare-page {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.page-title {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.tip-message {
  margin-bottom: var(--spacing-lg);
}

.empty-container {
  padding: var(--spacing-3xl) 0;
}

.compare-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .compare-page {
    padding: var(--spacing-md);
  }

  .page-title {
    font-size: var(--font-size-xl);
  }
}
</style>
