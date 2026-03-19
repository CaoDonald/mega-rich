<template>
  <div class="home-page">
    <!-- 未登录状态 -->
    <div v-if="!authStore.isAuthenticated" class="welcome-guest">
      <div class="hero-section">
        <h1 class="hero-title">欢迎使用 Mega Rich</h1>
        <p class="hero-subtitle">个人资产管理应用，帮助您轻松跟踪和管理个人财务</p>
        <div class="hero-actions">
          <n-button type="primary" size="large" @click="router.push({ name: 'login' })">
            立即登录
          </n-button>
          <n-button size="large" @click="router.push({ name: 'register' })">
            注册账号
          </n-button>
        </div>
      </div>

      <div class="features">
        <div class="feature-item">
          <n-icon :component="TrendingUpOutline" size="48" color="var(--color-primary)" />
          <h3>基金投资管理</h3>
          <p>持仓管理、交易记录、基金搜索、定投计划</p>
        </div>
        <div class="feature-item">
          <n-icon :component="WalletOutline" size="48" color="var(--color-info)" />
          <h3>结余管理</h3>
          <p>分类管理、数据可视化、趋势分析</p>
        </div>
        <div class="feature-item">
          <n-icon :component="CashOutline" size="48" color="var(--color-warning)" />
          <h3>月薪管理</h3>
          <p>收入记录、统计分析、增长率计算</p>
        </div>
      </div>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="dashboard-content">
    <!-- 欢迎语 -->
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎回来，{{ userName }}</h1>
      <p class="welcome-subtitle">{{ currentDate }}</p>
    </div>

    <!-- 资产汇总卡片 -->
    <div class="asset-cards">
      <DashboardCard
        title="基金资产"
        :value="fundStore.totalAssets"
        :icon="WalletOutline"
        color="var(--color-primary)"
        :trend="fundTrend"
        :trendValue="fundTrendValue"
        :clickable="true"
        @click="navigateTo('fund')"
      />
      <DashboardCard
        title="结余总额"
        :value="balanceStore.totalBalance"
        :icon="CashOutline"
        color="var(--color-info)"
        :clickable="true"
        @click="navigateTo('balance')"
      />
      <DashboardCard
        title="年度收入"
        :value="currentYearIncome"
        :icon="TrendingUpOutline"
        color="var(--color-warning)"
        :clickable="true"
        @click="navigateTo('salary')"
      />
      <DashboardCard
        title="总资产"
        :value="totalAssets"
        :icon="PieChartOutline"
        color="var(--color-success)"
      />
    </div>

    <!-- 快速操作 -->
    <Card title="快速操作" class="quick-actions-card">
      <div class="quick-actions">
        <div class="action-item" @click="navigateTo('fund-holdings')">
          <div class="action-icon" style="background-color: #18A05815; color: #18A058;">
            <n-icon :component="AddCircleOutline" size="24" />
          </div>
          <span class="action-label">添加持仓</span>
        </div>
        <div class="action-item" @click="navigateTo('fund-transactions')">
          <div class="action-icon" style="background-color: #2080F015; color: #2080F0;">
            <n-icon :component="SwapHorizontalOutline" size="24" />
          </div>
          <span class="action-label">记录交易</span>
        </div>
        <div class="action-item" @click="navigateTo('balance')">
          <div class="action-icon" style="background-color: #F0A02015; color: #F0A020;">
            <n-icon :component="CreateOutline" size="24" />
          </div>
          <span class="action-label">添加结余</span>
        </div>
        <div class="action-item" @click="navigateTo('salary')">
          <div class="action-icon" style="background-color: #D0305015; color: #D03050;">
            <n-icon :component="CalendarOutline" size="24" />
          </div>
          <span class="action-label">记录月薪</span>
        </div>
      </div>
    </Card>

    <!-- 收益趋势图 -->
    <Card title="收益趋势" class="chart-card">
      <Chart :option="profitChartOption" height="300px" :loading="loading" />
    </Card>

    <!-- 最近交易记录 -->
    <Card title="最近交易" class="transactions-card">
      <template #extra>
        <n-button text type="primary" @click="navigateTo('fund-transactions')">
          查看全部
        </n-button>
      </template>

      <div v-if="recentTransactions.length > 0" class="transactions-list">
        <div
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="transaction-info">
            <div class="transaction-name">{{ transaction.fund_name }}</div>
            <div class="transaction-date">{{ formatDate(transaction.transaction_date) }}</div>
          </div>
          <div class="transaction-details">
            <div class="transaction-type" :class="getTransactionTypeClass(transaction.type)">
              {{ getTransactionTypeText(transaction.type) }}
            </div>
            <div class="transaction-amount" :class="getAmountClass(transaction.type)">
              {{ formatAmount(transaction.amount, transaction.type) }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <n-empty description="暂无交易记录" />
      </div>
    </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NButton, NEmpty } from 'naive-ui'
import {
  WalletOutline,
  CashOutline,
  TrendingUpOutline,
  PieChartOutline,
  AddCircleOutline,
  SwapHorizontalOutline,
  CreateOutline,
  CalendarOutline
} from '@vicons/ionicons5'
import { useFundStore } from '../stores/fund.js'
import { useBalanceStore } from '../stores/balance.js'
import { useSalaryStore } from '../stores/salary.js'
import { useAuthStore } from '../stores/auth.js'
import { useFund } from '../composables/useFund.js'
import { useBalance } from '../composables/useBalance.js'
import { useSalary } from '../composables/useSalary.js'
import { useChart } from '../composables/useChart.js'
import DashboardCard from '../components/dashboard/DashboardCard.vue'
import Card from '../components/base/Card.vue'
import Chart from '../components/base/Chart.vue'

const router = useRouter()
const fundStore = useFundStore()
const balanceStore = useBalanceStore()
const salaryStore = useSalaryStore()
const authStore = useAuthStore()

const { loadHoldings, loadTransactions } = useFund()
const { loadAll: loadBalanceData } = useBalance()
const { loadRecords: loadSalaryRecords } = useSalary()
const { getLineChartConfig, formatMoney, colorSchemes } = useChart()

const loading = ref(false)

// 用户名
const userName = computed(() => {
  return authStore.user?.user_metadata?.name || authStore.user?.email?.split('@')[0] || '用户'
})

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  return now.toLocaleDateString('zh-CN', options)
})

// 当前年度收入
const currentYearIncome = computed(() => {
  const currentYear = new Date().getFullYear().toString()
  const yearData = salaryStore.incomeByYear.find(y => y.year === currentYear)
  return yearData?.total || 0
})

// 总资产
const totalAssets = computed(() => {
  return fundStore.totalAssets + balanceStore.totalBalance
})

// 基金趋势
const fundTrend = computed(() => {
  if (fundStore.todayProfit > 0) return 'up'
  if (fundStore.todayProfit < 0) return 'down'
  return null
})

const fundTrendValue = computed(() => {
  const profit = fundStore.todayProfit
  const rate = fundStore.totalAssets > 0 ? (profit / fundStore.totalAssets) * 100 : 0
  return `今日 ${profit >= 0 ? '+' : ''}${formatMoney(profit)} (${rate.toFixed(2)}%)`
})

// 最近交易记录
const recentTransactions = computed(() => {
  return fundStore.transactions.slice(0, 5)
})

// 收益趋势图配置
const profitChartOption = computed(() => {
  // 生成近30天数据
  const days = 30
  const dates = []
  const profits = []

  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)

    // 模拟数据 - 实际应该从交易记录计算
    const baseProfit = fundStore.totalProfit / days
    const randomVariation = (Math.random() - 0.5) * baseProfit * 0.3
    profits.push(baseProfit + randomVariation)
  }

  return getLineChartConfig({
    xAxis: {
      data: dates
    },
    yAxis: {
      axisLabel: {
        formatter: (value) => formatMoney(value)
      }
    },
    series: [
      {
        name: '累计收益',
        data: profits,
        itemStyle: {
          color: colorSchemes.profit[0]
        },
        areaStyle: {
          color: colorSchemes.gradient.profit
        }
      }
    ],
    tooltip: {
      formatter: (params) => {
        const value = params[0].value
        return `${params[0].name}<br/>累计收益: ¥${formatMoney(value)}`
      }
    }
  })
})

// 导航方法
const navigateTo = (name) => {
  router.push({ name })
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化金额
const formatAmount = (amount, type) => {
  const prefix = type === 'buy' ? '-' : '+'
  return `${prefix}¥${formatMoney(amount)}`
}

// 获取交易类型文本
const getTransactionTypeText = (type) => {
  const typeMap = {
    buy: '买入',
    sell: '卖出',
    dividend: '分红'
  }
  return typeMap[type] || type
}

// 获取交易类型样式
const getTransactionTypeClass = (type) => {
  return `type-${type}`
}

// 获取金额样式
const getAmountClass = (type) => {
  return type === 'buy' ? 'amount-negative' : 'amount-positive'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadHoldings(),
      loadTransactions(),
      loadBalanceData(),
      loadSalaryRecords()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-page {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

/* 未登录状态样式 */
.welcome-guest {
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-section {
  text-align: center;
  margin-bottom: var(--spacing-4xl);
  max-width: 600px;
}

.hero-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-2xl);
  max-width: 1000px;
  width: 100%;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-2xl);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-item h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: var(--spacing-lg) 0 var(--spacing-sm);
}

.feature-item p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* 已登录状态样式 */
.dashboard-content {
  width: 100%;
}

.welcome-section {
  margin-bottom: var(--spacing-2xl);
}

.welcome-title {
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.welcome-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.asset-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.quick-actions-card,
.chart-card,
.transactions-card {
  margin-bottom: var(--spacing-2xl);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-lg);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-item:hover {
  background: var(--color-bg-tertiary);
  transform: translateY(-2px);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
}

.action-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: 500;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  transition: background var(--transition-base);
}

.transaction-item:hover {
  background: var(--color-bg-tertiary);
}

.transaction-info {
  flex: 1;
}

.transaction-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.transaction-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.transaction-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.transaction-type {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.transaction-type.type-buy {
  background: var(--color-danger)15;
  color: var(--color-danger);
}

.transaction-type.type-sell {
  background: var(--color-success)15;
  color: var(--color-success);
}

.transaction-type.type-dividend {
  background: var(--color-warning)15;
  color: var(--color-warning);
}

.transaction-amount {
  font-size: var(--font-size-base);
  font-weight: 600;
}

.transaction-amount.amount-negative {
  color: var(--color-danger);
}

.transaction-amount.amount-positive {
  color: var(--color-success);
}

.empty-state {
  padding: var(--spacing-2xl) 0;
  text-align: center;
}

@media (max-width: 768px) {
  .home-page {
    padding: var(--spacing-lg);
  }

  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-base);
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-actions .n-button {
    width: 100%;
  }

  .features {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .feature-item {
    padding: var(--spacing-xl);
  }

  .welcome-title {
    font-size: var(--font-size-2xl);
  }

  .asset-cards {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .action-item {
    padding: var(--spacing-lg);
  }

  .action-icon {
    width: 48px;
    height: 48px;
  }

  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .transaction-details {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
