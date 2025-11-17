<template>
  <view class="container">
    <!-- 顶部统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <text class="card-label">总资产</text>
        <text class="card-value">¥{{ formatNumber(totalAssets) }}</text>
        <text class="card-change" :class="{ positive: assetChange >= 0, negative: assetChange < 0 }">
          {{ assetChange >= 0 ? '↑' : '↓' }} {{ Math.abs(assetChange).toFixed(1) }}%
        </text>
      </view>
      <view class="stat-card">
        <text class="card-label">基金市值</text>
        <text class="card-value">¥{{ formatNumber(totalFunds) }}</text>
        <text class="card-change" :class="{ positive: fundChange >= 0, negative: fundChange < 0 }">
          {{ fundChange >= 0 ? '↑' : '↓' }} {{ Math.abs(fundChange).toFixed(1) }}%
        </text>
      </view>
      <view class="stat-card">
        <text class="card-label">年度收入</text>
        <text class="card-value">¥{{ formatNumber(yearIncome) }}</text>
        <text class="card-change" :class="{ positive: incomeChange >= 0, negative: incomeChange < 0 }">
          {{ incomeChange >= 0 ? '↑' : '↓' }} {{ Math.abs(incomeChange).toFixed(1) }}%
        </text>
      </view>
    </view>

    <!-- 资产分布图表 -->
    <view class="chart-section">
      <view class="section-header">
        <text class="section-title">资产分布</text>
        <picker 
          mode="selector" 
          :range="chartTypes" 
          range-key="name"
          @change="onChartTypeChange"
        >
          <view class="chart-type-selector">
            <text>{{ selectedChartType.name }}</text>
            <text class="selector-arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="chart-container">
        <!-- 饼图展示 -->
        <view v-if="selectedChartType.value === 'pie'" class="pie-chart">
          <chart 
            canvas-id="assetPieChart"
            type="pie"
            :categories="pieChartCategories"
            :series="pieChartSeries"
            :opts="pieChartOpts"
          />
        </view>
        
        <!-- 柱状图展示 -->
        <view v-else-if="selectedChartType.value === 'bar'" class="bar-chart">
          <chart 
            canvas-id="assetBarChart"
            type="column"
            :categories="barChartCategories"
            :series="barChartSeries"
            :opts="barChartOpts"
          />
        </view>
        
        <!-- 折线图展示 -->
        <view v-else class="line-chart">
          <chart 
            canvas-id="assetLineChart"
            type="line"
            :categories="lineChartCategories"
            :series="lineChartSeries"
            :opts="lineChartOpts"
          />
        </view>
      </view>
    </view>

    <!-- 月度趋势 -->
    <view class="trend-section">
      <view class="section-header">
        <text class="section-title">月度趋势</text>
        <picker 
          mode="date" 
          fields="year"
          :value="selectedYear"
          @change="onYearChange"
        >
          <view class="year-selector">
            <text>{{ selectedYear }}年</text>
            <text class="selector-arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="trend-container">
        <chart 
          canvas-id="monthlyTrendChart"
          type="line"
          :categories="monthlyCategories"
          :series="monthlySeries"
          :opts="trendChartOpts"
        />
        <view class="trend-stats">
          <view class="trend-stat">
            <text class="stat-label">最高月</text>
            <text class="stat-value">¥{{ formatNumber(maxMonthValue) }}</text>
            <text class="stat-month">{{ maxMonth }}</text>
          </view>
          <view class="trend-stat">
            <text class="stat-label">平均月</text>
            <text class="stat-value">¥{{ formatNumber(avgMonthValue) }}</text>
          </view>
          <view class="trend-stat">
            <text class="stat-label">增长率</text>
            <text class="stat-value" :class="{ positive: growthRate >= 0, negative: growthRate < 0 }">
              {{ growthRate >= 0 ? '+' : '' }}{{ growthRate.toFixed(1) }}%
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 收入支出对比 -->
    <view class="comparison-section">
      <view class="section-title">收入支出对比</view>
      <view class="comparison-container">
        <chart 
          canvas-id="incomeExpenseChart"
          type="column"
          :categories="comparisonCategories"
          :series="comparisonSeries"
          :opts="comparisonChartOpts"
        />
        <view class="comparison-stats">
          <view class="comparison-item income">
            <text class="item-label">总收入</text>
            <text class="item-value">¥{{ formatNumber(totalIncome) }}</text>
          </view>
          <view class="comparison-item expense">
            <text class="item-label">总支出</text>
            <text class="item-value">¥{{ formatNumber(totalExpense) }}</text>
          </view>
          <view class="comparison-item balance">
            <text class="item-label">结余</text>
            <text class="item-value" :class="{ positive: balance >= 0, negative: balance < 0 }">
              {{ balance >= 0 ? '+' : '' }}¥{{ formatNumber(Math.abs(balance)) }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 风险分析 -->
    <view class="risk-section">
      <view class="section-title">风险分析</view>
      <view class="risk-container">
        <view class="risk-item">
          <text class="risk-label">投资占比</text>
          <view class="risk-bar">
            <view class="risk-progress" :style="{ width: investmentRatio + '%' }"></view>
          </view>
          <text class="risk-value">{{ investmentRatio.toFixed(1) }}%</text>
        </view>
        <view class="risk-item">
          <text class="risk-label">现金流动性</text>
          <view class="risk-bar">
            <view class="risk-progress" :style="{ width: liquidityRatio + '%' }"></view>
          </view>
          <text class="risk-value">{{ liquidityRatio.toFixed(1) }}%</text>
        </view>
        <view class="risk-item">
          <text class="risk-label">债务比率</text>
          <view class="risk-bar">
            <view class="risk-progress" :style="{ width: debtRatio + '%' }"></view>
          </view>
          <text class="risk-value">{{ debtRatio.toFixed(1) }}%</text>
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
      totalAssets: 125800.50,
      totalFunds: 45000.00,
      yearIncome: 58000.00,
      assetChange: 8.5,
      fundChange: 12.3,
      incomeChange: 15.2,
      selectedChartType: { value: 'pie', name: '饼图' },
      chartTypes: [
        { value: 'pie', name: '饼图' },
        { value: 'bar', name: '柱状图' },
        { value: 'line', name: '折线图' }
      ],
      selectedYear: '2024',
      maxMonthValue: 135000.00,
      avgMonthValue: 125800.50,
      growthRate: 8.5,
      maxMonth: '12月',
      totalIncome: 58000.00,
      totalExpense: 42000.00,
      balance: 16000.00,
      investmentRatio: 35.7,
      liquidityRatio: 42.3,
      debtRatio: 22.0,
      assetDistribution: [
        { type: 'cash', amount: 15000.00, percentage: 11.9 },
        { type: 'bank', amount: 65800.50, percentage: 52.3 },
        { type: 'investment', amount: 45000.00, percentage: 35.8 }
      ],
      // 饼图数据
      pieChartCategories: ['现金', '银行存款', '投资'],
      pieChartSeries: [
        { 
          name: '资产分布', 
          data: [
            { name: '现金', value: 15000 },
            { name: '银行存款', value: 65800.50 },
            { name: '投资', value: 45000 }
          ],
          color: ['#4CAF50', '#2196F3', '#FF9800']
        }
      ],
      pieChartOpts: {
        extra: {
          pie: {
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: true,
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }
        }
      },
      // 柱状图数据
      barChartCategories: ['现金', '银行存款', '投资'],
      barChartSeries: [
        { name: '资产金额', data: [15000, 65800.50, 45000] }
      ],
      barChartOpts: {
        extra: {
          column: {
            type: 'group',
            width: 20,
            columnGap: 10
          }
        }
      },
      // 折线图数据
      lineChartCategories: ['现金', '银行存款', '投资'],
      lineChartSeries: [
        { name: '资产金额', data: [15000, 65800.50, 45000] }
      ],
      lineChartOpts: {
        extra: {
          line: {
            type: 'curve',
            width: 3,
            area: true,
            gradient: true
          }
        }
      },
      // 月度趋势数据
      monthlyCategories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      monthlySeries: [
        { 
          name: '资产总额', 
          data: [115000, 118000, 122000, 125000, 128000, 130000, 132000, 134000, 135000, 133000, 129000, 125800.50] 
        }
      ],
      trendChartOpts: {
        extra: {
          line: {
            type: 'curve',
            width: 3,
            area: true,
            gradient: true
          }
        }
      },
      // 收入支出对比数据
      comparisonCategories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      comparisonSeries: [
        { name: '收入', data: [4800, 5200, 4500, 5800, 6200, 5500, 6000, 6500, 5800, 6200, 5500, 6000] },
        { name: '支出', data: [3500, 3800, 3200, 4000, 4200, 3800, 4500, 4800, 4200, 4500, 3800, 4200] }
      ],
      comparisonChartOpts: {
        extra: {
          column: {
            type: 'group',
            width: 15,
            columnGap: 5
          }
        }
      }
    }
  },
  onLoad() {
    this.loadStatistics()
  },
  methods: {
    // 格式化数字
    formatNumber(num) {
      return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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
    
    // 图表类型变化
    onChartTypeChange(e) {
      const index = e.detail.value
      this.selectedChartType = this.chartTypes[index]
    },
    
    // 年份选择变化
    onYearChange(e) {
      this.selectedYear = e.detail.value.split('-')[0]
      this.loadYearData()
    },
    
    // 加载统计数据
    loadStatistics() {
      // 模拟数据加载
      console.log('加载统计数据...')
    },
    
    // 加载年度数据
    loadYearData() {
      // 模拟根据年份加载数据
      console.log(`加载${this.selectedYear}年数据...`)
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.stat-card {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  text-align: center;
}

.card-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.card-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #007AFF;
  display: block;
  margin-bottom: 8rpx;
}

.card-change {
  font-size: 22rpx;
  font-weight: 600;
}

.card-change.positive {
  color: #F44336;
}

.card-change.negative {
  color: #4CAF50;
}

.chart-section, .trend-section, .comparison-section, .risk-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.chart-type-selector, .year-selector {
  border: 1rpx solid #e0e0e0;
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
  font-size: 24rpx;
  color: #666;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.selector-arrow {
  color: #999;
  font-size: 20rpx;
}

.chart-container, .trend-container, .comparison-container {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 30rpx;
  min-height: 300rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-placeholder, .trend-placeholder, .comparison-placeholder {
  text-align: center;
  margin-bottom: 30rpx;
}

.chart-text, .trend-text, .comparison-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.chart-desc, .trend-desc, .comparison-desc {
  font-size: 24rpx;
  color: #999;
}

.pie-chart {
  width: 100%;
}

.chart-legend {
  margin-top: 30rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
  padding: 10rpx 0;
}

.legend-color {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 15rpx;
}

.legend-name {
  font-size: 24rpx;
  color: #666;
  flex: 1;
}

.legend-percentage {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
}

.trend-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  width: 100%;
}

.trend-stat {
  text-align: center;
  background: white;
  border-radius: 10rpx;
  padding: 20rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.stat-value {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 5rpx;
}

.stat-value.positive {
  color: #F44336;
}

.stat-value.negative {
  color: #4CAF50;
}

.stat-month {
  font-size: 20rpx;
  color: #999;
}

.comparison-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  width: 100%;
}

.comparison-item {
  text-align: center;
  background: white;
  border-radius: 10rpx;
  padding: 20rpx;
}

.comparison-item.income {
  border-left: 4rpx solid #4CAF50;
}

.comparison-item.expense {
  border-left: 4rpx solid #F44336;
}

.comparison-item.balance {
  border-left: 4rpx solid #2196F3;
}

.item-label {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.item-value {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.item-value.positive {
  color: #4CAF50;
}

.item-value.negative {
  color: #F44336;
}

.risk-container {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.risk-label {
  font-size: 26rpx;
  color: #333;
  min-width: 120rpx;
}

.risk-bar {
  flex: 1;
  height: 20rpx;
  background: #e0e0e0;
  border-radius: 10rpx;
  overflow: hidden;
}

.risk-progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #2196F3);
  transition: width 0.3s ease;
}

.risk-value {
  font-size: 24rpx;
  color: #666;
  min-width: 60rpx;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .trend-stats, .comparison-stats {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15rpx;
  }
  
  .chart-type-selector, .year-selector {
    align-self: flex-start;
  }
}
</style>