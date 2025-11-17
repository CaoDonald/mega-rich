<template>
  <view class="container">
    <!-- 顶部统计 -->
    <view class="stats-header">
      <view class="total-assets">
        <text class="label">总资产</text>
        <text class="amount">¥{{ formatNumber(totalAssets) }}</text>
      </view>
      <view class="add-button" @click="navigateTo('/pages/add-asset/add-asset')">
        <text class="add-icon">+</text>
        <text>添加资产</text>
      </view>
    </view>

    <!-- 资产列表 -->
    <view class="assets-list">
      <view v-if="assets.length === 0" class="empty-state">
        <text class="empty-text">暂无资产记录</text>
        <text class="empty-desc">点击上方按钮添加您的第一笔资产</text>
      </view>
      
      <view 
        v-for="asset in assets" 
        :key="asset.id" 
        class="asset-item"
        @click="editAsset(asset)"
      >
        <view class="asset-icon" :style="{ backgroundColor: getTypeColor(asset.type) }">
          {{ getTypeIcon(asset.type) }}
        </view>
        <view class="asset-info">
          <text class="asset-name">{{ asset.name }}</text>
          <text class="asset-type">{{ getTypeName(asset.type) }}</text>
          <text class="asset-time">{{ formatTime(asset.updateTime) }}</text>
        </view>
        <view class="asset-amount">
          <text class="amount">¥{{ formatNumber(asset.amount) }}</text>
          <text class="currency">{{ asset.currency }}</text>
        </view>
        <view class="asset-actions">
          <view class="action-btn" @click.stop="editAsset(asset)">编辑</view>
          <view class="action-btn delete" @click.stop="deleteAsset(asset.id)">删除</view>
        </view>
      </view>
    </view>

    <!-- 分类统计 -->
    <view class="category-stats">
      <view class="section-title">分类统计</view>
      <view class="stats-grid">
        <view 
          v-for="(amount, type) in assetsByType" 
          :key="type" 
          class="stat-item"
          v-if="amount > 0"
        >
          <view class="stat-icon" :style="{ backgroundColor: getTypeColor(type) }">
            {{ getTypeIcon(type) }}
          </view>
          <text class="stat-name">{{ getTypeName(type) }}</text>
          <text class="stat-amount">¥{{ formatNumber(amount) }}</text>
          <text class="stat-percentage">{{ calculatePercentage(amount, totalAssets) }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      assets: [],
      totalAssets: 0,
      assetsByType: {}
    }
  },
  onLoad() {
    this.loadAssets()
  },
  onShow() {
    this.loadAssets()
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
      return date.toLocaleDateString('zh-CN')
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
    
    // 获取类型图标
    getTypeIcon(type) {
      const icons = {
        'cash': '💰',
        'bank': '🏦',
        'investment': '📈',
        'real_estate': '🏠',
        'vehicle': '🚗',
        'other': '📦'
      }
      return icons[type] || '💼'
    },
    
    // 计算百分比
    calculatePercentage(amount, total) {
      if (total === 0) return 0
      return ((amount / total) * 100).toFixed(1)
    },
    
    // 导航到页面
    navigateTo(url) {
      uni.navigateTo({ url })
    },
    
    // 编辑资产
    editAsset(asset) {
      uni.navigateTo({
        url: `/pages/add-asset/add-asset?id=${asset.id}`
      })
    },
    
    // 删除资产
    deleteAsset(assetId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条资产记录吗？',
        success: (res) => {
          if (res.confirm) {
            // 这里暂时模拟删除操作
            this.assets = this.assets.filter(asset => asset.id !== assetId)
            this.calculateStatistics()
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 加载资产数据
    loadAssets() {
      // 模拟数据
      this.assets = [
        {
          id: '1',
          name: '现金钱包',
          type: 'cash',
          amount: 15000.00,
          currency: 'CNY',
          description: '日常现金',
          createTime: '2024-01-15T10:00:00Z',
          updateTime: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: '工商银行储蓄卡',
          type: 'bank',
          amount: 65800.50,
          currency: 'CNY',
          description: '主要储蓄账户',
          createTime: '2024-01-10T14:30:00Z',
          updateTime: '2024-01-20T09:15:00Z'
        },
        {
          id: '3',
          name: '股票投资',
          type: 'investment',
          amount: 45000.00,
          currency: 'CNY',
          description: 'A股市场投资',
          createTime: '2024-01-05T16:45:00Z',
          updateTime: '2024-01-18T11:20:00Z'
        }
      ]
      
      this.calculateStatistics()
    },
    
    // 计算统计信息
    calculateStatistics() {
      this.totalAssets = this.assets.reduce((sum, asset) => sum + asset.amount, 0)
      
      this.assetsByType = {}
      this.assets.forEach(asset => {
        if (!this.assetsByType[asset.type]) {
          this.assetsByType[asset.type] = 0
        }
        this.assetsByType[asset.type] += asset.amount
      })
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-assets .label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.total-assets .amount {
  font-size: 40rpx;
  font-weight: bold;
  color: #007AFF;
}

.add-button {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #007AFF;
  color: white;
  border-radius: 50rpx;
  font-size: 28rpx;
}

.add-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
  font-weight: bold;
}

.assets-list {
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

.asset-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.asset-item:last-child {
  border-bottom: none;
}

.asset-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
}

.asset-info {
  flex: 1;
}

.asset-name {
  font-size: 32rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  font-weight: 600;
}

.asset-type {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.asset-time {
  font-size: 24rpx;
  color: #999;
}

.asset-amount {
  text-align: right;
  margin-right: 20rpx;
}

.asset-amount .amount {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 5rpx;
}

.asset-amount .currency {
  font-size: 24rpx;
  color: #999;
}

.asset-actions {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.action-btn {
  padding: 12rpx 20rpx;
  background: #f8f9fa;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.action-btn.delete {
  color: #F44336;
  background: #ffebee;
}

.category-stats {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
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
  width: 60rpx;
  height: 60rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin: 0 auto 15rpx;
}

.stat-name {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.stat-amount {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 5rpx;
}

.stat-percentage {
  font-size: 24rpx;
  color: #999;
}
</style>