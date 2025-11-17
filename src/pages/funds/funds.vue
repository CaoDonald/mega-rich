<template>
  <view class="container">
    <!-- 顶部统计 -->
    <view class="stats-header">
      <view class="stats-item">
        <text class="label">基金总市值</text>
        <text class="amount">¥{{ formatNumber(totalValue) }}</text>
      </view>
      <view class="stats-item">
        <text class="label">总收益</text>
        <text class="amount" :class="{ positive: totalProfit >= 0, negative: totalProfit < 0 }">
          {{ totalProfit >= 0 ? '+' : '' }}¥{{ formatNumber(Math.abs(totalProfit)) }}
        </text>
      </view>
      <view class="stats-item">
        <text class="label">收益率</text>
        <text class="amount" :class="{ positive: profitRate >= 0, negative: profitRate < 0 }">
          {{ profitRate >= 0 ? '+' : '' }}{{ profitRate.toFixed(2) }}%
        </text>
      </view>
      <view class="add-button" @click="navigateTo('/pages/add-fund/add-fund')">
        <text class="add-icon">+</text>
        <text>添加基金</text>
      </view>
    </view>

    <!-- 基金列表 -->
    <view class="funds-list">
      <view v-if="funds.length === 0" class="empty-state">
        <text class="empty-text">暂无基金记录</text>
        <text class="empty-desc">点击上方按钮添加您的第一支基金</text>
      </view>
      
      <view 
        v-for="fund in funds" 
        :key="fund.id" 
        class="fund-item"
        @click="viewFundDetail(fund)"
      >
        <view class="fund-icon">📈</view>
        <view class="fund-info">
          <text class="fund-name">{{ fund.name }}</text>
          <text class="fund-code">{{ fund.code }}</text>
          <view class="fund-stats">
            <text class="stat">持仓: {{ fund.shares }}份</text>
            <text class="stat">成本: ¥{{ formatNumber(fund.costPrice) }}</text>
          </view>
        </view>
        <view class="fund-value">
          <text class="current-price">¥{{ formatNumber(fund.currentPrice) }}</text>
          <view class="profit-info" :class="{ positive: fund.profit >= 0, negative: fund.profit < 0 }">
            <text class="profit-amount">
              {{ fund.profit >= 0 ? '+' : '' }}¥{{ formatNumber(Math.abs(fund.profit)) }}
            </text>
            <text class="profit-rate">
              {{ fund.profitRate >= 0 ? '+' : '' }}{{ fund.profitRate.toFixed(2) }}%
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 收益走势图表 -->
    <view class="chart-section">
      <view class="section-title">收益走势</view>
      <view class="chart-container">
        <chart 
          canvas-id="fundProfitChart"
          type="line"
          :categories="profitCategories"
          :series="profitSeries"
          :opts="profitChartOpts"
        />
      </view>
    </view>

    <!-- 基金分类统计 -->
    <view class="category-stats">
      <view class="section-title">基金分类</view>
      <view class="stats-grid">
        <view 
          v-for="category in fundCategories" 
          :key="category.type" 
          class="stat-item"
        >
          <view class="stat-icon">{{ category.icon }}</view>
          <text class="stat-name">{{ category.name }}</text>
          <text class="stat-count">{{ category.count }}支</text>
          <text class="stat-value">¥{{ formatNumber(category.value) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Chart from '@/components/chart/chart.vue'

export default {
  components: {
    Chart
  },
  data() {
    return {
      funds: [],
      totalValue: 0,
      totalProfit: 0,
      profitRate: 0,
      fundCategories: [],
      // 收益走势图表数据
      profitCategories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      profitSeries: [
        { 
          name: '基金收益', 
          data: [1500, 2800, 3500, 4200, 3800, 5200, 6500, 7200, 6800, 7500, 8200, 8900] 
        }
      ],
      profitChartOpts: {
        extra: {
          line: {
            type: 'curve',
            width: 3,
            area: true,
            gradient: true
          }
        }
      }
    }
  },
  onLoad() {
    this.loadFunds()
  },
  onShow() {
    this.loadFunds()
  },
  methods: {
    // 格式化数字
    formatNumber(num) {
      return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    // 导航到页面
    navigateTo(url) {
      uni.navigateTo({ url })
    },
    
    // 查看基金详情
    viewFundDetail(fund) {
      uni.navigateTo({
        url: `/pages/add-fund/add-fund?id=${fund.id}`
      })
    },
    
    // 加载基金数据
    loadFunds() {
      // 模拟数据
      this.funds = [
        {
          id: '1',
          name: '易方达蓝筹精选',
          code: '110011',
          type: 'stock',
          shares: 5000,
          costPrice: 2.50,
          currentPrice: 3.20,
          profit: (3.20 - 2.50) * 5000,
          profitRate: ((3.20 - 2.50) / 2.50) * 100,
          purchaseDate: '2023-06-15',
          description: '蓝筹股基金'
        },
        {
          id: '2',
          name: '华夏成长混合',
          code: '000001',
          type: 'mixed',
          shares: 3000,
          costPrice: 1.80,
          currentPrice: 1.65,
          profit: (1.65 - 1.80) * 3000,
          profitRate: ((1.65 - 1.80) / 1.80) * 100,
          purchaseDate: '2023-08-20',
          description: '成长型混合基金'
        },
        {
          id: '3',
          name: '招商中证白酒',
          code: '161725',
          type: 'index',
          shares: 2000,
          costPrice: 1.20,
          currentPrice: 1.45,
          profit: (1.45 - 1.20) * 2000,
          profitRate: ((1.45 - 1.20) / 1.20) * 100,
          purchaseDate: '2023-10-10',
          description: '白酒指数基金'
        }
      ]
      
      this.calculateStatistics()
    },
    
    // 计算统计信息
    calculateStatistics() {
      this.totalValue = this.funds.reduce((sum, fund) => sum + (fund.currentPrice * fund.shares), 0)
      this.totalProfit = this.funds.reduce((sum, fund) => sum + fund.profit, 0)
      
      const totalCost = this.funds.reduce((sum, fund) => sum + (fund.costPrice * fund.shares), 0)
      this.profitRate = totalCost > 0 ? (this.totalProfit / totalCost) * 100 : 0
      
      // 分类统计
      const categories = {}
      this.funds.forEach(fund => {
        if (!categories[fund.type]) {
          categories[fund.type] = {
            count: 0,
            value: 0
          }
        }
        categories[fund.type].count++
        categories[fund.type].value += fund.currentPrice * fund.shares
      })
      
      this.fundCategories = Object.keys(categories).map(type => {
        const categoryInfo = this.getCategoryInfo(type)
        return {
          type,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          count: categories[type].count,
          value: categories[type].value
        }
      })
    },
    
    // 获取分类信息
    getCategoryInfo(type) {
      const categories = {
        'stock': { name: '股票型', icon: '📈' },
        'mixed': { name: '混合型', icon: '📊' },
        'index': { name: '指数型', icon: '📋' },
        'bond': { name: '债券型', icon: '📉' },
        'monetary': { name: '货币型', icon: '💰' }
      }
      return categories[type] || { name: '其他', icon: '📦' }
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.stats-header {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20rpx;
}

.stats-item {
  text-align: center;
}

.stats-item .label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.stats-item .amount {
  font-size: 28rpx;
  font-weight: bold;
  display: block;
}

.stats-item .amount.positive {
  color: #F44336;
}

.stats-item .amount.negative {
  color: #4CAF50;
}

.add-button {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background: #007AFF;
  color: white;
  border-radius: 50rpx;
  font-size: 28rpx;
  margin-top: 10rpx;
}

.add-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
  font-weight: bold;
}

.funds-list {
  background: white;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.empty-state {
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  display: block;
  margin-bottom: 20rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #ccc;
}

.fund-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.fund-item:last-child {
  border-bottom: none;
}

.fund-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
  background: #f0f8ff;
}

.fund-info {
  flex: 1;
}

.fund-name {
  font-size: 32rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  font-weight: 600;
}

.fund-code {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.fund-stats {
  display: flex;
  gap: 20rpx;
}

.fund-stats .stat {
  font-size: 24rpx;
  color: #999;
}

.fund-value {
  text-align: right;
}

.current-price {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.profit-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.profit-amount {
  font-size: 26rpx;
  font-weight: 600;
  margin-bottom: 4rpx;
}

.profit-rate {
  font-size: 22rpx;
}

.profit-info.positive {
  color: #F44336;
}

.profit-info.negative {
  color: #4CAF50;
}

.chart-section, .category-stats {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.chart-container {
  height: 300rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
}

.chart-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.chart-desc {
  font-size: 24rpx;
  color: #999;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.stat-item {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 25rpx;
  text-align: center;
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: 15rpx;
  display: block;
}

.stat-name {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.stat-count {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 5rpx;
}

.stat-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .stats-header {
    grid-template-columns: 1fr 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>