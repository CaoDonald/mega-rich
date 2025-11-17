<template>
  <view class="container">
    <view class="form-container">
      <view class="form-title">
        <text>{{ isEdit ? '编辑基金' : '添加基金' }}</text>
      </view>
      
      <!-- 基金名称 -->
      <view class="form-group">
        <text class="label">基金名称</text>
        <input 
          v-model="form.name" 
          @blur="validateField('name')"
          class="input" 
          placeholder="请输入基金名称"
          maxlength="50"
          :class="{ 'input-error': validationErrors.name }"
        />
        <text v-if="validationErrors.name" class="error-text">{{ validationErrors.name }}</text>
      </view>
      
      <!-- 基金代码 -->
      <view class="form-group">
        <text class="label">基金代码</text>
        <input 
          v-model="form.code" 
          @blur="validateField('code')"
          class="input" 
          placeholder="请输入基金代码"
          maxlength="6"
          type="number"
          :class="{ 'input-error': validationErrors.code }"
        />
        <text v-if="validationErrors.code" class="error-text">{{ validationErrors.code }}</text>
      </view>
      
      <!-- 基金类型 -->
      <view class="form-group">
        <text class="label">基金类型</text>
        <picker 
          mode="selector" 
          :range="fundTypes" 
          range-key="name"
          @change="onTypeChange"
        >
          <view class="picker-input">
            <text>{{ selectedType.name }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      
      <!-- 持仓份额 -->
      <view class="form-group">
        <text class="label">持仓份额</text>
        <input 
          v-model="form.shares" 
          class="input" 
          placeholder="请输入持仓份额"
          type="number"
          @input="validateShares"
          @blur="validateField('shares')"
          :class="{ 'input-error': validationErrors.shares }"
        />
        <text v-if="validationErrors.shares" class="error-text">{{ validationErrors.shares }}</text>
      </view>
      
      <!-- 成本价格 -->
      <view class="form-group">
        <text class="label">成本价格</text>
        <view class="amount-input">
          <text class="currency-symbol">¥</text>
          <input 
            v-model="form.costPrice" 
            class="input amount" 
            placeholder="0.00"
            type="number"
            @input="validatePrice"
            @blur="validateField('costPrice')"
            :class="{ 'input-error': validationErrors.costPrice }"
          />
        </view>
        <text v-if="validationErrors.costPrice" class="error-text">{{ validationErrors.costPrice }}</text>
      </view>
      
      <!-- 当前价格 -->
      <view class="form-group">
        <text class="label">当前价格</text>
        <view class="amount-input">
          <text class="currency-symbol">¥</text>
          <input 
            v-model="form.currentPrice" 
            class="input amount" 
            placeholder="0.00"
            type="number"
            @input="validatePrice"
            @blur="validateField('currentPrice')"
            :class="{ 'input-error': validationErrors.currentPrice }"
          />
        </view>
        <text v-if="validationErrors.currentPrice" class="error-text">{{ validationErrors.currentPrice }}</text>
      </view>
      
      <!-- 购买日期 -->
      <view class="form-group">
        <text class="label">购买日期</text>
        <picker 
          mode="date" 
          :value="form.purchaseDate"
          @change="onDateChange"
        >
          <view class="picker-input" :class="{ 'input-error': validationErrors.purchaseDate }">
            <text>{{ form.purchaseDate || '请选择购买日期' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
        <text v-if="validationErrors.purchaseDate" class="error-text">{{ validationErrors.purchaseDate }}</text>
      </view>
      
      <!-- 基金描述 -->
      <view class="form-group">
        <text class="label">基金描述</text>
        <textarea 
          v-model="form.description" 
          class="textarea" 
          placeholder="请输入基金描述（可选）"
          maxlength="200"
        />
      </view>
      
      <!-- 收益计算 -->
      <view v-if="form.shares && form.costPrice && form.currentPrice" class="profit-calc">
        <view class="calc-item">
          <text class="calc-label">总成本:</text>
          <text class="calc-value">¥{{ formatNumber(totalCost) }}</text>
        </view>
        <view class="calc-item">
          <text class="calc-label">当前市值:</text>
          <text class="calc-value">¥{{ formatNumber(currentValue) }}</text>
        </view>
        <view class="calc-item">
          <text class="calc-label">总收益:</text>
          <text class="calc-value" :class="{ positive: totalProfit >= 0, negative: totalProfit < 0 }">
            {{ totalProfit >= 0 ? '+' : '' }}¥{{ formatNumber(Math.abs(totalProfit)) }}
          </text>
        </view>
        <view class="calc-item">
          <text class="calc-label">收益率:</text>
          <text class="calc-value" :class="{ positive: profitRate >= 0, negative: profitRate < 0 }">
            {{ profitRate >= 0 ? '+' : '' }}{{ profitRate.toFixed(2) }}%
          </text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="cancel-btn" @click="goBack">取消</view>
        <view class="submit-btn" @click="submitForm">保存</view>
      </view>
    </view>
  </view>
</template>

<script>
import { validator, validationSchemas, errorHandler } from '@/utils/validation.js'

export default {
  data() {
    return {
      isEdit: false,
      fundId: null,
      form: {
        name: '',
        code: '',
        type: 'stock',
        shares: '',
        costPrice: '',
        currentPrice: '',
        purchaseDate: '',
        description: ''
      },
      validationErrors: {},
      fundTypes: [
        { value: 'stock', name: '股票型' },
        { value: 'mixed', name: '混合型' },
        { value: 'index', name: '指数型' },
        { value: 'bond', name: '债券型' },
        { value: 'monetary', name: '货币型' }
      ]
    }
  },
  computed: {
    selectedType() {
      return this.fundTypes.find(t => t.value === this.form.type) || this.fundTypes[0]
    },
    
    totalCost() {
      return parseFloat(this.form.shares || 0) * parseFloat(this.form.costPrice || 0)
    },
    
    currentValue() {
      return parseFloat(this.form.shares || 0) * parseFloat(this.form.currentPrice || 0)
    },
    
    totalProfit() {
      return this.currentValue - this.totalCost
    },
    
    profitRate() {
      return this.totalCost > 0 ? (this.totalProfit / this.totalCost) * 100 : 0
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.fundId = options.id
      this.loadFundData()
    } else {
      // 设置默认日期为今天
      const today = new Date()
      this.form.purchaseDate = today.toISOString().split('T')[0]
    }
  },
  methods: {
    // 格式化数字
    formatNumber(num) {
      return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    // 加载基金数据（编辑模式）
    loadFundData() {
      // 模拟数据
      const mockFund = {
        id: '1',
        name: '易方达蓝筹精选',
        code: '110011',
        type: 'stock',
        shares: 5000,
        costPrice: 2.50,
        currentPrice: 3.20,
        purchaseDate: '2023-06-15',
        description: '蓝筹股基金'
      }
      
      if (this.fundId === '1') {
        this.form = {
          name: mockFund.name,
          code: mockFund.code,
          type: mockFund.type,
          shares: mockFund.shares.toString(),
          costPrice: mockFund.costPrice.toString(),
          currentPrice: mockFund.currentPrice.toString(),
          purchaseDate: mockFund.purchaseDate,
          description: mockFund.description
        }
      }
    },
    
    // 类型选择变化
    onTypeChange(e) {
      const index = e.detail.value
      this.form.type = this.fundTypes[index].value
    },
    
    // 日期选择变化
    onDateChange(e) {
      this.form.purchaseDate = e.detail.value
    },
    
    // 验证份额输入
    validateShares() {
      if (this.form.shares) {
        const shares = parseFloat(this.form.shares)
        if (shares < 0) {
          this.form.shares = ''
          uni.showToast({
            title: '份额不能为负数',
            icon: 'none'
          })
        }
      }
      // 实时验证
      this.validateField('shares')
    },
    
    // 验证价格输入
    validatePrice() {
      if (this.form.costPrice) {
        const price = parseFloat(this.form.costPrice)
        if (price < 0) {
          this.form.costPrice = ''
          uni.showToast({
            title: '价格不能为负数',
            icon: 'none'
          })
        }
      }
      
      if (this.form.currentPrice) {
        const price = parseFloat(this.form.currentPrice)
        if (price < 0) {
          this.form.currentPrice = ''
          uni.showToast({
            title: '价格不能为负数',
            icon: 'none'
          })
        }
      }
      // 实时验证
      this.validateField('costPrice')
      this.validateField('currentPrice')
    },
    
    // 验证单个字段
    validateField(fieldName) {
      const isValid = validator.validateField(fieldName, this.form[fieldName], validationSchemas.fund[fieldName])
      this.validationErrors = { ...validator.getErrors() }
      return isValid
    },
    
    // 表单验证
    validateForm() {
      const isValid = validator.validateForm(this.form, validationSchemas.fund)
      this.validationErrors = { ...validator.getErrors() }
      
      if (!isValid) {
        errorHandler.showValidationError(this.validationErrors)
        return false
      }
      
      return true
    },
    
    // 提交表单
    submitForm() {
      if (!this.validateForm()) return
      
      try {
        const fundData = {
          ...this.form,
          shares: parseFloat(this.form.shares),
          costPrice: parseFloat(this.form.costPrice),
          currentPrice: parseFloat(this.form.currentPrice),
          profit: this.totalProfit,
          profitRate: this.profitRate
        }
        
        if (this.isEdit) {
          // 编辑模式
          uni.showToast({
            title: '基金更新成功',
            icon: 'success',
            success: () => {
              setTimeout(() => {
                uni.navigateBack()
              }, 1500)
            }
          })
        } else {
          // 添加模式
          uni.showToast({
            title: '基金添加成功',
            icon: 'success',
            success: () => {
              setTimeout(() => {
                uni.navigateBack()
              }, 1500)
            }
          })
        }
      } catch (error) {
        console.error('表单提交错误:', error)
        errorHandler.handleUnknownError(error)
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
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

.form-container {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
}

.form-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
  color: #333;
}

.form-group {
  margin-bottom: 40rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
  font-weight: 600;
}

.input {
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 25rpx;
  font-size: 28rpx;
  background: #fafafa;
}

.input-error {
  border-color: #FF3B30 !important;
  background-color: #FFF5F5;
}

.error-text {
  display: block;
  font-size: 24rpx;
  color: #FF3B30;
  margin-top: 8rpx;
  margin-left: 4rpx;
}

.amount-input {
  display: flex;
  align-items: center;
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  background: #fafafa;
  overflow: hidden;
}

.currency-symbol {
  padding: 25rpx 20rpx;
  font-size: 28rpx;
  color: #666;
  background: #f0f0f0;
  min-width: 80rpx;
  text-align: center;
}

.amount-input .input {
  border: none;
  flex: 1;
  background: transparent;
}

.picker-input {
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 25rpx;
  font-size: 28rpx;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-arrow {
  color: #999;
  font-size: 24rpx;
}

.textarea {
  border: 1rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 25rpx;
  font-size: 28rpx;
  background: #fafafa;
  height: 200rpx;
  resize: none;
}

.profit-calc {
  background: #f8f9fa;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 40rpx;
}

.calc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.calc-item:last-child {
  margin-bottom: 0;
}

.calc-label {
  font-size: 26rpx;
  color: #666;
}

.calc-value {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.calc-value.positive {
  color: #F44336;
}

.calc-value.negative {
  color: #4CAF50;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 50rpx;
}

.cancel-btn, .submit-btn {
  flex: 1;
  padding: 25rpx;
  border-radius: 50rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
  border: 1rpx solid #e0e0e0;
}

.submit-btn {
  background: #007AFF;
  color: white;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .form-container {
    padding: 20rpx;
  }
  
  .form-group {
    margin-bottom: 30rpx;
  }
}
</style>