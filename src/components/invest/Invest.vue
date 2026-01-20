<template>
  <div class="invest-container">
    <n-tabs v-model:value="activeTab" type="card" animated class="invest-tabs">
      <n-tab-pane name="overview" tab="资产总览">
        <AssetOverview />
      </n-tab-pane>
      <n-tab-pane name="holdings" tab="投资明细">
        <InvestmentDetail />
      </n-tab-pane>
      <n-tab-pane name="profit" tab="收益分析">
        <ProfitAnalysis />
      </n-tab-pane>
      <n-tab-pane name="history" tab="历史趋势">
        <HistoricalTrends />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import AssetOverview from './sub/AssetOverview.vue'
import InvestmentDetail from './sub/InvestmentDetail.vue'
import ProfitAnalysis from './sub/ProfitAnalysis.vue'
import HistoricalTrends from './sub/HistoricalTrends.vue'
import { supabase } from '../../supabase'

const activeTab = ref('overview')
const userHoldings = ref([])
const userProfitData = ref({
  totalAssets: 0,
  totalProfit: 0,
  todayProfit: 0,
  totalProfitRate: 0
})
const loading = ref(false)

provide('userHoldings', userHoldings)
provide('userProfitData', userProfitData)
provide('loading', loading)

const fetchUserHoldings = async () => {
  loading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('fund_holdings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取持仓数据失败:', error)
      return
    }

    userHoldings.value = data || []
    calculateProfitData()
  } catch (err) {
    console.error('获取持仓数据错误:', err)
  } finally {
    loading.value = false
  }
}

const calculateProfitData = () => {
  let totalAssets = 0
  let totalCost = 0
  let todayProfit = 0

  userHoldings.value.forEach(holding => {
    totalAssets += (holding.current_nav || 0) * (holding.shares || 0)
    totalCost += (holding.avg_cost || 0) * (holding.shares || 0)
    todayProfit += (holding.today_change || 0) * (holding.shares || 0)
  })

  userProfitData.value = {
    totalAssets,
    totalProfit: totalAssets - totalCost,
    todayProfit,
    totalProfitRate: totalCost > 0 ? ((totalAssets - totalCost) / totalCost * 100) : 0
  }
}

onMounted(() => {
  fetchUserHoldings()
})
</script>

<style scoped>
.invest-container {
  padding: 20px;
  min-height: 100%;
}

.invest-tabs {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .invest-container {
    padding: 10px;
  }
}
</style>
