<template>
  <view class="container">
    <view class="form-container">
      <view class="form-title">
        <text>{{ isEdit ? '编辑收入' : '添加收入' }}</text>
      </view>
      
      <!-- 收入名称 -->
      <view class="form-group">
        <text class="label">收入名称</text>
        <input 
          v-model="form.name" 
          @blur="validateField('name')"
          class="input" 
          placeholder="请输入收入名称"
          maxlength="50"
          :class="{ 'input-error': validationErrors.name }"
        />
        <text v-if="validationErrors.name" class="error-text">{{ validationErrors.name }}</text>
      </view>
      
      <!-- 收入类型 -->
      <view class="form-group">
        <text class="label">收入类型</text>
        <view class="type-selector">
          <view 
            v-for="type in incomeTypes" 
            :key="type.value"
            class="type-option"
            :class="{ active: form.type === type.value }"
            @click="form.type = type.value"
          >
            <view class="type-icon" :style="{ backgroundColor: type.color }">
              {{ type.icon }}
            </view>
            <text class="type-name">{{ type.name }}</text>
          </view>
        </view>
      </view>
      
      <!-- 收入金额 -->
      <view class="form-group">
        <text class="label">收入金额</text>
        <view class="amount-input">
          <text class="currency-symbol">¥</text>
          <input 
            v-model="form.amount" 
            class="input amount" 
            placeholder="0.00"
            type="number"
            @input="validateAmount"
            @blur="validateField('amount')"
            :class="{ 'input-error': validationErrors.amount }"
          />
        </view>
        <text v-if="validationErrors.amount" class="error-text">{{ validationErrors.amount }}</text>
      </view>
      
      <!-- 货币类型 -->
      <view class="form-group">
        <text class="label">货币类型</text>
        <picker 
          mode="selector" 
          :range="currencies" 
          range-key="name"
          @change="onCurrencyChange"
        >
          <view class="picker-input">
            <text>{{ selectedCurrency.name }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      
      <!-- 收入日期 -->
      <view class="form-group">
        <text class="label">收入日期</text>
        <picker 
          mode="date" 
          :value="form.date"
          @change="onDateChange"
        >
          <view class="picker-input" :class="{ 'input-error': validationErrors.date }">
            <text>{{ form.date || '请选择收入日期' }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
        <text v-if="validationErrors.date" class="error-text">{{ validationErrors.date }}</text>
      </view>
      
      <!-- 收入描述 -->
      <view class="form-group">
        <text class="label">收入描述</text>
        <textarea 
          v-model="form.description" 
          class="textarea" 
          placeholder="请输入收入描述（可选）"
          maxlength="200"
        />
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
      incomeId: null,
      form: {
        name: '',
        type: 'salary',
        amount: '',
        currency: 'CNY',
        date: '',
        description: ''
      },
      validationErrors: {},
      incomeTypes: [
        { value: 'salary', name: '工资', icon: '💰', color: '#4CAF50' },
        { value: 'bonus', name: '奖金', icon: '🎁', color: '#2196F3' },
        { value: 'investment', name: '投资收益', icon: '📈', color: '#FF9800' },
        { value: 'freelance', name: '自由职业', icon: '💼', color: '#9C27B0' },
        { value: 'rental', name: '租金收入', icon: '🏠', color: '#607D8B' },
        { value: 'other', name: '其他收入', icon: '📦', color: '#795548' }
      ],
      currencies: [
        { value: 'CNY', name: '人民币 (CNY)' },
        { value: 'USD', name: '美元 (USD)' },
        { value: 'EUR', name: '欧元 (EUR)' },
        { value: 'JPY', name: '日元 (JPY)' },
        { value: 'HKD', name: '港币 (HKD)' }
      ]
    }
  },
  computed: {
    selectedCurrency() {
      return this.currencies.find(c => c.value === this.form.currency) || this.currencies[0]
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.incomeId = options.id
      this.loadIncomeData()
    } else {
      // 设置默认日期为今天
      const today = new Date()
      this.form.date = today.toISOString().split('T')[0]
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
    
    // 加载收入数据（编辑模式）
    loadIncomeData() {
      // 模拟数据
      const mockIncome = {
        id: '1',
        name: '1月工资',
        type: 'salary',
        amount: 15000.00,
        currency: 'CNY',
        date: '2024-01-15',
        description: '基本工资+绩效'
      }
      
      if (this.incomeId === '1') {
        this.form = {
          name: mockIncome.name,
          type: mockIncome.type,
          amount: mockIncome.amount.toString(),
          currency: mockIncome.currency,
          date: mockIncome.date,
          description: mockIncome.description
        }
      }
    },
    
    // 货币选择变化
    onCurrencyChange(e) {
      const index = e.detail.value
      this.form.currency = this.currencies[index].value
    },
    
    // 日期选择变化
    onDateChange(e) {
      this.form.date = e.detail.value
    },
    
    // 验证金额输入
    validateAmount() {
      if (this.form.amount) {
        const amount = parseFloat(this.form.amount)
        if (amount < 0) {
          this.form.amount = ''
          uni.showToast({
            title: '金额不能为负数',
            icon: 'none'
          })
        }
      }
      // 实时验证
      this.validateField('amount')
    },
    
    // 验证单个字段
    validateField(fieldName) {
      const isValid = validator.validateField(fieldName, this.form[fieldName], validationSchemas.income[fieldName])
      this.validationErrors = { ...validator.getErrors() }
      return isValid
    },
    
    // 表单验证
    validateForm() {
      const isValid = validator.validateForm(this.form, validationSchemas.income)
      this.validationErrors = { ...validator.getErrors() }
      
      if (!isValid) {
        errorHandler.showValidationError(this.validationErrors)
        return false
      }
      
      // 验证日期不能是未来时间
      const selectedDate = new Date(this.form.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate > today) {
        uni.showToast({
          title: '收入日期不能是未来时间',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    // 提交表单
    submitForm() {
      if (!this.validateForm()) return
      
      try {
        const incomeData = {
          ...this.form,
          amount: parseFloat(this.form.amount),
          createTime: this.isEdit ? undefined : new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        
        if (this.isEdit) {
          // 编辑模式
          uni.showToast({
            title: '收入更新成功',
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
            title: '收入添加成功',
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

.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.type-option {
  border: 2rpx solid #e0e0e0;
  border-radius: 15rpx;
  padding: 25rpx 15rpx;
  text-align: center;
  transition: all 0.3s;
}

.type-option.active {
  border-color: #007AFF;
  background: #f0f8ff;
}

.type-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin: 0 auto 15rpx;
}

.type-name {
  font-size: 24rpx;
  color: #666;
}

.type-option.active .type-name {
  color: #007AFF;
  font-weight: 600;
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

  .input-error {
    border-color: #ff4757 !important;
    background-color: #fff5f5 !important;
  }

  .error-text {
    font-size: 24rpx;
    color: #ff4757;
    margin-top: 10rpx;
    display: block;
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
  .type-selector {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>