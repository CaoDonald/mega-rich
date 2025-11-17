<template>
  <view class="container">
    <!-- 顶部统计卡片 -->
    <view class="stats-card">
      <view class="total-assets">
        <text class="label">总资产</text>
        <text class="amount">¥{{ formatNumber(statistics.totalAssets) }}</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-label">总收入</text>
          <text class="stat-value">¥{{ formatNumber(statistics.totalIncome) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">基金收益</text>
          <text class="stat-value" :class="{ positive: statistics.fundStatistics.profit >= 0, negative: statistics.fundStatistics.profit < 0 }">
            {{ statistics.fundStatistics.profit >= 0 ? '+' : '' }}¥{{ formatNumber(statistics.fundStatistics.profit) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="section-title">快捷操作</view>
      <view class="actions-grid">
        <view class="action-item" @click="navigateTo('/pages/add-asset/add-asset')">
          <view class="action-icon">💰</view>
          <text class="action-text">添加资产</text>
        </view>
        <view class="action-item" @click="navigateTo('/pages/add-fund/add-fund')">
          <view class="action-icon">📈</view>
          <text class="action-text">添加基金</text>
        </view>
        <view class="action-item" @click="navigateTo('/pages/add-income/add-income')">
          <view class="action-icon">💵</view>
          <text class="action-text">记录收入</text>
        </view>
        <view class="action-item" @click="navigateTo('/pages/statistics/statistics')">
          <view class="action-icon">📊</view>
          <text class="action-text">查看统计</text>
        </view>
      </view>
    </view>

    <!-- 资产分布 -->
    <view class="asset-distribution">
      <view class="section-title">资产分布</view>
      
      <!-- 资产分布饼图 -->
      <view class="chart-container">
        <Chart 
          canvas-id="homeAssetChart" 
          type="pie" 
          :categories="assetCategories" 
          :series="assetSeries" 
          :opts="assetChartOpts"
        />
      </view>
      
      <view class="distribution-list">
        <view 
          v-for="(amount, type) in statistics.assetsByType" 
          :key="type" 
          class="distribution-item"
          v-if="amount > 0"
        >
          <view class="type-info">
            <view class="type-color" :style="{ backgroundColor: getTypeColor(type) }"></view>
            <text class="type-name">{{ getTypeName(type) }}</text>
          </view>
          <view class="type-amount">
            <text class="amount">¥{{ formatNumber(amount) }}</text>
            <text class="percentage">{{ calculatePercentage(amount, statistics.totalAssets) }}%</text>
          </view>
        </view>
        <view v-if="Object.values(statistics.assetsByType).every(amount => amount === 0)" class="empty-state">
          <text>暂无资产数据</text>
        </view>
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="recent-records">
      <view class="section-title">最近记录</view>
      <view class="records-list">
        <view v-if="recentRecords.length === 0" class="empty-state">
          <text>暂无记录</text>
        </view>
        <view 
          v-for="record in recentRecords" 
          :key="record.id" 
          class="record-item"
        >
          <view class="record-icon">{{ getRecordIcon(record.type) }}</view>
          <view class="record-info">
            <text class="record-title">{{ record.title }}</text>
            <text class="record-time">{{ formatTime(record.time) }}</text>
          </view>
          <view class="record-amount" :class="{ positive: record.amount >= 0, negative: record.amount < 0 }">
            {{ record.amount >= 0 ? '+' : '' }}¥{{ formatNumber(Math.abs(record.amount)) }}
          </view>
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
      statistics: {
        totalAssets: 0,
        totalIncome: 0,
        assetsByType: {},
        fundStatistics: {
          totalFunds: 0,
          totalInvestment: 0,
          currentValue: 0,
          profit: 0,
          profitRate: 0
        }
      },
      recentRecords: [],
      // 资产分布图表数据
      assetCategories: ['现金', '银行存款', '投资', '不动产', '车辆', '其他'],
      assetSeries: [
        { 
          data: [15000, 65800, 45000, 0, 0, 0] 
        }
      ],
      assetChartOpts: {
        extra: {
          pie: {
            offsetAngle: -45,
            labelWidth: 15
          }
        }
      }
    }
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
    this.loadData()
  },
  methods: {
    // 格式化数字
    formatNumber(num) {
      return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    // 格式化时间
    formatTime(time) {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60 * 1000) {
        return '刚刚'
      } else if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 1000)) + '分钟前'
      } else if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 60 * 1000)) + '小时前'
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    },
    
    // 计算百分比
    calculatePercentage(amount, total) {
      if (total === 0) return 0
      return ((amount / total) * 100).toFixed(1)
    },
    
    // 获取类型名称
    getTypeName(type) {
      const typeNames = {
        'cash': '现金',
        'bank': '银行存款',
        'investment': '投资',
        'real_estate': '不动产',
        'vehicle': '车辆',
        'other': '其他'
      }
      return typeNames[type] || '未知'
    },
    
    // 获取类型颜色
    getTypeColor(type) {
      const colors = {
        'cash': '#4CAF50',
        'bank': '#2196F3',
        'investment': '#FF9800',
        'real_estate': '#9C27B0',
        'vehicle': '#607D8B',
        'other': '#795548'
      }
      return colors[type] || '#999'
    },
    
    // 获取记录图标
    getRecordIcon(type) {
      const icons = {
        'asset': '💰',
        'fund': '📈',
        'income': '💵'
      }
      return icons[type] || '📝'
    },
    
    // 导航到页面
    navigateTo(url) {
      // 检查是否是tabBar页面
      const tabBarPages = ['/pages/index/index', '/pages/assets/assets', '/pages/funds/funds', '/pages/income/income', '/pages/statistics/statistics']
      
      if (tabBarPages.includes(url)) {
        uni.switchTab({ url })
      } else {
        uni.navigateTo({ url })
      }
    },
    
    // 加载数据
    loadData() {
      // 这里暂时使用模拟数据，后续会集成真实的数据管理
      this.statistics = {
        totalAssets: 125800.50,
        totalIncome: 85600.00,
        assetsByType: {
          'cash': 15000.00,
          'bank': 65800.50,
          'investment': 45000.00
        },
        fundStatistics: {
          totalFunds: 3,
          totalInvestment: 30000.00,
          currentValue: 32450.00,
          profit: 2450.00,
          profitRate: 8.17
        }
      }
      
      // 模拟最近记录
      this.recentRecords = [
        {
          id: '1',
          type: 'income',
          title: '工资收入',
          amount: 15000.00,
          time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'asset',
          title: '添加银行存款',
          amount: 5000.00,
          time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'fund',
          title: '添加基金持仓',
          amount: 10000.00,
          time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
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

.stats-card {
  background: linear-gradient(135deg, #007AFF, #0056CC);
  border-radius: 20rpx;
  padding: 40rpx;
  color: white;
  margin-bottom: 30rpx;
}

.total-assets {
  margin-bottom: 30rpx;
}

.total-assets .label {
  font-size: 28rpx;
  opacity: 0.9;
  display: block;
  margin-bottom: 10rpx;
}

.total-assets .amount {
  font-size: 48rpx;
  font-weight: bold;
}

.stats-grid {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 24rpx;
  opacity: 0.8;
  display: block;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
}

.stat-value.positive {
  color: #4CAF50;
}

.stat-value.negative {
  color: #F44336;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin: 30rpx 0 20rpx 0;
  color: #333;
}

.quick-actions {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 20rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  transition: all 0.3s;
}

.action-item:active {
  background: #e9ecef;
  transform: scale(0.95);
}

.action-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
}

.action-text {
  font-size: 26rpx;
  color: #666;
}

.asset-distribution {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.chart-container {
  height: 400rpx;
  margin-bottom: 30rpx;
}

.distribution-list {
  margin-top: 20rpx;
}

.distribution-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.distribution-item:last-child {
  border-bottom: none;
}

.type-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.type-color {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.type-name {
  font-size: 28rpx;
  color: #333;
}

.type-amount {
  text-align: right;
}

.type-amount .amount {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.type-amount .percentage {
  font-size: 24rpx;
  color: #999;
}

.recent-records {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.records-list {
  margin-top: 20rpx;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.record-info {
  flex: 1;
}

.record-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.record-time {
  font-size: 24rpx;
  color: #999;
}

.record-amount {
  font-size: 28rpx;
  font-weight: 600;
}

.record-amount.positive {
  color: #4CAF50;
}

.record-amount.negative {
  color: #F44336;
}

.empty-state {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
