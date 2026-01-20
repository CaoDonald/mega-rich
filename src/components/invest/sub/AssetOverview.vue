<template>
  <div class="asset-overview">
    <n-card class="summary-card">
      <div class="summary-header">
        <div class="summary-title">
          <n-icon size="24" color="#3b82f6">
            <WalletOutline />
          </n-icon>
          <span>资产总览</span>
        </div>
        <n-tag :type="userProfitData.totalProfit >= 0 ? 'success' : 'error'" size="small">
          {{ userProfitData.totalProfit >= 0 ? '盈利' : '亏损' }}
        </n-tag>
      </div>
      
      <div class="total-assets">
        <div class="assets-label">总资产（元）</div>
        <div class="assets-value">
          <n-spin v-if="loading" size="small" />
          <template v-else>
            <span class="currency">¥</span>
            <span>{{ formatMoney(userProfitData.totalAssets) }}</span>
          </template>
        </div>
      </div>

      <div class="profit-stats">
        <div class="profit-item">
          <div class="profit-label">累计收益</div>
          <div class="profit-value" :class="userProfitData.totalProfit >= 0 ? 'positive' : 'negative'">
            <n-icon v-if="userProfitData.totalProfit >= 0">
              <TrendingUpOutline />
            </n-icon>
            <n-icon v-else>
              <TrendingDownOutline />
            </n-icon>
            <span>{{ userProfitData.totalProfit >= 0 ? '+' : '' }}{{ formatMoney(userProfitData.totalProfit) }}</span>
          </div>
          <div class="profit-rate">
            收益率: {{ userProfitData.totalProfitRate >= 0 ? '+' : '' }}{{ userProfitData.totalProfitRate.toFixed(2) }}%
          </div>
        </div>
        
        <div class="profit-item">
          <div class="profit-label">今日收益</div>
          <div class="profit-value" :class="userProfitData.todayProfit >= 0 ? 'positive' : 'negative'">
            <n-icon v-if="userProfitData.todayProfit >= 0">
              <TrendingUpOutline />
            </n-icon>
            <n-icon v-else>
              <TrendingDownOutline />
            </n-icon>
            <span>{{ userProfitData.todayProfit >= 0 ? '+' : '' }}{{ formatMoney(userProfitData.todayProfit) }}</span>
          </div>
        </div>
      </div>
    </n-card>

    <div class="assets-grid">
      <n-card class="stat-card" v-for="stat in assetStats" :key="stat.label">
        <div class="stat-icon" :style="{ backgroundColor: stat.color }">
          <n-icon size="20" :color="stat.iconColor">
            <component :is="stat.icon" />
          </n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </n-card>
    </div>

    <n-card class="holdings-summary">
      <template #header>
        <div class="card-header">
          <span>持仓分布</span>
          <n-button text type="primary" @click="$emit('viewAll')">查看全部</n-button>
        </div>
      </template>
      <div class="holdings-chart">
        <div class="pie-chart-container">
          <canvas ref="pieCanvas" width="200" height="200"></canvas>
          <div class="pie-center">
            <div class="pie-center-value">{{ userHoldings.length }}</div>
            <div class="pie-center-label">只基金</div>
          </div>
        </div>
        <div class="holdings-legend">
          <div class="legend-item" v-for="(item, index) in holdingsByType" :key="item.type">
            <span class="legend-color" :style="{ backgroundColor: chartColors[index % chartColors.length] }"></span>
            <span class="legend-label">{{ item.typeName }}</span>
            <span class="legend-value">{{ item.percentage }}%</span>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, h } from 'vue'
import {
  WalletOutline,
  TrendingUpOutline,
  TrendingDownOutline,
  PieChartOutline,
  PeopleOutline,
  TimeOutline,
  StarOutline
} from '@vicons/ionicons5'

const userHoldings = inject('userHoldings')
const userProfitData = inject('userProfitData')
const loading = inject('loading')
const pieCanvas = ref(null)

const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const formatMoney = (value) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const assetStats = computed(() => {
  const totalShares = userHoldings.value.reduce((sum, h) => sum + (h.shares || 0), 0)
  const totalCost = userHoldings.value.reduce((sum, h) => sum + ((h.avg_cost || 0) * (h.shares || 0)), 0)
  const avgCost = totalShares > 0 ? totalCost / totalShares : 0
  
  return [
    {
      label: '持仓基金数',
      value: `${userHoldings.value.length}只`,
      icon: PieChartOutline,
      color: 'rgba(59, 130, 246, 0.1)',
      iconColor: '#3b82f6'
    },
    {
      label: '持仓份额',
      value: totalShares.toFixed(2),
      icon: PeopleOutline,
      color: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#10b981'
    },
    {
      label: '持仓天数',
      value: calculateHoldDays(),
      icon: TimeOutline,
      color: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#f59e0b'
    },
    {
      label: '平均持仓成本',
      value: `¥${avgCost.toFixed(3)}`,
      icon: StarOutline,
      color: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#8b5cf6'
    }
  ]
})

const calculateHoldDays = () => {
  if (userHoldings.value.length === 0) return '0天'
  const earliestDate = new Date(Math.min(...userHoldings.value.map(h => new Date(h.created_at || Date.now()))))
  const now = new Date()
  const diffDays = Math.floor((now - earliestDate) / (1000 * 60 * 60 * 24))
  return `${diffDays}天`
}

const holdingsByType = computed(() => {
  const typeMap = {
    25: '股票型',
    27: '混合型',
    31: '债券型',
    35: '货币型',
    6: 'QDII',
    26: '指数型'
  }
  
  const totalAssets = userHoldings.value.reduce((sum, h) => {
    return sum + ((h.current_nav || 0) * (h.shares || 0))
  }, 0)
  
  const typeStats = {}
  
  userHoldings.value.forEach(holding => {
    const type = typeMap[holding.fund_type] || '其他'
    const assets = (holding.current_nav || 0) * (holding.shares || 0)
    if (!typeStats[type]) {
      typeStats[type] = { type, typeName: type, assets: 0, percentage: 0 }
    }
    typeStats[type].assets += assets
  })
  
  Object.values(typeStats).forEach(item => {
    item.percentage = totalAssets > 0 ? ((item.assets / totalAssets) * 100).toFixed(1) : 0
  })
  
  return Object.values(typeStats).sort((a, b) => b.assets - a.assets)
})

const drawPieChart = () => {
  if (!pieCanvas.value || holdingsByType.value.length === 0) return
  
  const ctx = pieCanvas.value.getContext('2d')
  const centerX = 100
  const centerY = 100
  const radius = 80
  
  ctx.clearRect(0, 0, 200, 200)
  
  const totalAssets = holdingsByType.value.reduce((sum, item) => sum + item.assets, 0)
  
  if (totalAssets === 0) {
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#e5e7eb'
    ctx.fill()
    return
  }
  
  let startAngle = -Math.PI / 2
  
  holdingsByType.value.forEach((item, index) => {
    const sliceAngle = (item.assets / totalAssets) * 2 * Math.PI
    
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = chartColors[index % chartColors.length]
    ctx.fill()
    
    startAngle += sliceAngle
  })
}

onMounted(() => {
  setTimeout(drawPieChart, 100)
})
</script>

<style scoped>
.asset-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-card {
  border-radius: 12px;
  overflow: hidden;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.total-assets {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 20px;
}

.assets-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.assets-value {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
}

.currency {
  font-size: 24px;
  margin-right: 4px;
}

.profit-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.profit-item {
  text-align: center;
}

.profit-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.profit-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 20px;
  font-weight: 600;
}

.profit-value.positive {
  color: #10b981;
}

.profit-value.negative {
  color: #ef4444;
}

.profit-rate {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-card :deep(.n-card__content) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.holdings-summary {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.holdings-chart {
  display: flex;
  align-items: center;
  gap: 30px;
}

.pie-chart-container {
  position: relative;
  width: 200px;
  height: 200px;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-center-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.pie-center-label {
  font-size: 12px;
  color: #6b7280;
}

.holdings-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

@media (max-width: 768px) {
  .assets-value {
    font-size: 28px;
  }
  
  .profit-value {
    font-size: 18px;
  }
  
  .holdings-chart {
    flex-direction: column;
  }
  
  .pie-chart-container {
    width: 160px;
    height: 160px;
  }
  
  .assets-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .asset-overview {
    gap: 12px;
  }
  
  .total-assets {
    padding: 15px 0;
  }
  
  .assets-value {
    font-size: 24px;
  }
  
  .profit-stats {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .stat-card :deep(.n-card__content) {
    padding: 12px;
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
