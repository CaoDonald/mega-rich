<template>
  <view class="container">
    <!-- 顶部统计 -->
    <view class="stats-header">
      <view class="stats-item">
        <text class="label">本月收入</text>
        <text class="amount">¥{{ formatNumber(currentMonthIncome) }}</text>
      </view>
      <view class="stats-item">
        <text class="label">上月收入</text>
        <text class="amount">¥{{ formatNumber(lastMonthIncome) }}</text>
      </view>
      <view class="stats-item">
        <text class="label">年度收入</text>
        <text class="amount">¥{{ formatNumber(yearIncome) }}</text>
      </view>
      <view class="add-button" @click="navigateTo('/pages/add-income/add-income')">
        <text class="add-icon">+</text>
        <text>添加收入</text>
      </view>
    </view>

    <!-- 收入列表 -->
    <view class="income-list">
      <view class="section-title">收入记录</view>
      
      <view v-if="incomes.length === 0" class="empty-state">
        <text class="empty-text">暂无收入记录</text>
        <text class="empty-desc">点击上方按钮添加您的第一笔收入</text>
      </view>
      
      <view 
        v-for="income in incomes" 
        :key="income.id" 
        class="income-item"
        @click="editIncome(income)"
      >
        <view class="income-icon" :style="{ backgroundColor: getTypeColor(income.type) }">
          {{ getTypeIcon(income.type) }}
        </view>
        <view class="income-info">
          <text class="income-name">{{ income.name }}</text>
          <text class="income-type">{{ getTypeName(income.type) }}</text>
          <text class="income-time">{{ formatTime(income.date) }}</text>
        </view>
        <view class="income-amount">
          <text class="amount">¥{{ formatNumber(income.amount) }}</text>
          <text class="currency">{{ income.currency }}</text>
        </view>
        <view class="income-actions">
          <view class="action-btn" @click.stop="editIncome(income)">编辑</view>
          <view class="action-btn delete" @click.stop="deleteIncome(income.id)">删除</view>
        </view>
      </view>
    </view>

    <!-- 收入分类统计 -->
    <view class="category-stats">
      <view class="section-title">收入分类</view>
      <view class="stats-grid">
        <view 
          v-for="category in incomeCategories" 
          :key="category.type" 
          class="stat-item"
        >
          <view class="stat-icon" :style="{ backgroundColor: getTypeColor(category.type) }">
            {{ getTypeIcon(category.type) }}
          </view>
          <text class="stat-name">{{ category.name }}</text>
          <text class="stat-count">{{ category.count }}笔</text>
          <text class="stat-amount">¥{{ formatNumber(category.amount) }}</text>
          <text class="stat-percentage">{{ category.percentage }}%</text>
        </view>
      </view>
    </view>

    <!-- 月度收入趋势 -->
    <view class="monthly-trend">
      <view class="section-title">月度收入趋势</view>
      <view class="trend-container">
        <chart 
          canvas-id="incomeTrendChart"
          type="line"
          :categories="incomeCategoriesData"
          :series="incomeSeries"
          :opts="incomeChartOpts"
        />
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
      incomes: [],
      currentMonthIncome: 0,
      lastMonthIncome: 0,
      yearIncome: 0,
      incomeCategories: [],
      // 收入趋势图表数据
      incomeCategoriesData: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      incomeSeries: [
        { 
          name: '月度收入', 
          data: [15000, 18000, 22000, 25000, 28000, 30000, 32000, 34000, 35000, 33000, 29000, 25000] 
        }
      ],
      incomeChartOpts: {
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
    this.loadIncomes()
  },
  onShow() {
    this.loadIncomes()
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
        'salary': '工资',
        'bonus': '奖金',
        'investment': '投资收益',
        'freelance': '自由职业',
        'rental': '租金收入',
        'other': '其他收入'
      }
      return typeNames[type] || '未知'
    },
    
    // 获取类型颜色
    getTypeColor(type) {
      const colors = {
        'salary': '#4CAF50',
        'bonus': '#2196F3',
        'investment': '#FF9800',
        'freelance': '#9C27B0',
        'rental': '#607D8B',
        'other': '#795548'
      }
      return colors[type] || '#999'
    },
    
    // 获取类型图标
    getTypeIcon(type) {
      const icons = {
        'salary': '💰',
        'bonus': '🎁',
        'investment': '📈',
        'freelance': '💼',
        'rental': '🏠',
        'other': '📦'
      }
      return icons[type] || '💼'
    },
    
    // 导航到页面
    navigateTo(url) {
      uni.navigateTo({ url })
    },
    
    // 编辑收入
    editIncome(income) {
      uni.navigateTo({
        url: `/pages/add-income/add-income?id=${income.id}`
      })
    },
    
    // 删除收入
    deleteIncome(incomeId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条收入记录吗？',
        success: (res) => {
          if (res.confirm) {
            // 这里暂时模拟删除操作
            this.incomes = this.incomes.filter(income => income.id !== incomeId)
            this.calculateStatistics()
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 加载收入数据
    loadIncomes() {
      // 模拟数据
      this.incomes = [
        {
          id: '1',
          name: '1月工资',
          type: 'salary',
          amount: 15000.00,
          currency: 'CNY',
          date: '2024-01-15T10:00:00Z',
          description: '基本工资+绩效',
          createTime: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: '年终奖金',
          type: 'bonus',
          amount: 30000.00,
          currency: 'CNY',
          date: '2024-01-20T14:30:00Z',
          description: '年度绩效奖金',
          createTime: '2024-01-20T14:30:00Z'
        },
        {
          id: '3',
          name: '股票分红',
          type: 'investment',
          amount: 5000.00,
          currency: 'CNY',
          date: '2024-01-25T09:15:00Z',
          description: 'A股投资分红',
          createTime: '2024-01-25T09:15:00Z'
        },
        {
          id: '4',
          name: '自由职业收入',
          type: 'freelance',
          amount: 8000.00,
          currency: 'CNY',
          date: '2024-01-10T16:45:00Z',
          description: '项目开发收入',
          createTime: '2024-01-10T16:45:00Z'
        }
      ]
      
      this.calculateStatistics()
    },
    
    // 计算统计信息
    calculateStatistics() {
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      
      // 计算本月收入
      this.currentMonthIncome = this.incomes
        .filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate.getMonth() + 1 === currentMonth && 
                 incomeDate.getFullYear() === currentYear
        })
        .reduce((sum, income) => sum + income.amount, 0)
      
      // 计算上月收入
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear
      
      this.lastMonthIncome = this.incomes
        .filter(income => {
          const incomeDate = new Date(income.date)
          return incomeDate.getMonth() + 1 === lastMonth && 
                 incomeDate.getFullYear() === lastMonthYear
        })
        .reduce((sum, income) => sum + income.amount, 0)
      
      // 计算年度收入
      this.yearIncome = this.incomes
        .filter(income => new Date(income.date).getFullYear() === currentYear)
        .reduce((sum, income) => sum + income.amount, 0)
      
      // 分类统计
      const categories = {}
      this.incomes.forEach(income => {
        if (!categories[income.type]) {
          categories[income.type] = {
            count: 0,
            amount: 0
          }
        }
        categories[income.type].count++
        categories[income.type].amount += income.amount
      })
      
      this.incomeCategories = Object.keys(categories).map(type => {
        const categoryInfo = this.getCategoryInfo(type)
        const percentage = this.yearIncome > 0 ? 
          ((categories[type].amount / this.yearIncome) * 100).toFixed(1) : 0
        
        return {
          type,
          name: categoryInfo.name,
          count: categories[type].count,
          amount: categories[type].amount,
          percentage
        }
      })
    },
    
    // 获取分类信息
    getCategoryInfo(type) {
      const categories = {
        'salary': { name: '工资' },
        'bonus': { name: '奖金' },
        'investment': { name: '投资收益' },
        'freelance': { name: '自由职业' },
        'rental': { name: '租金收入' },
        'other': { name: '其他收入' }
      }
      return categories[type] || { name: '未知' }
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
  color: #007AFF;
  display: block;
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

.income-list, .category-stats, .monthly-trend {
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

.income-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.income-item:last-child {
  border-bottom: none;
}

.income-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
}

.income-info {
  flex: 1;
}

.income-name {
  font-size: 32rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  font-weight: 600;
}

.income-type {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.income-time {
  font-size: 24rpx;
  color: #999;
}

.income-amount {
  text-align: right;
  margin-right: 20rpx;
}

.income-amount .amount {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  display: block;
  margin-bottom: 5rpx;
}

.income-amount .currency {
  font-size: 24rpx;
  color: #999;
}

.income-actions {
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

.stat-count {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 5rpx;
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

.trend-container {
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