<template>
  <view class="container">
    <view class="form-container">
      <view class="form-title">
        <text>{{ isEdit ? '编辑资产' : '添加资产' }}</text>
      </view>
      
      <!-- 资产名称 -->
      <view class="form-group">
        <text class="label">资产名称</text>
        <input 
          v-model="form.name" 
          @blur="validateField('name')"
          class="input" 
          placeholder="请输入资产名称"
          maxlength="50"
          :class="{ 'input-error': validationErrors.name }"
        />
        <text v-if="validationErrors.name" class="error-text">{{ validationErrors.name }}</text>
      </view>
      
      <!-- 资产类型 -->
      <view class="form-group">
        <text class="label">资产类型</text>
        <view class="type-selector">
          <view 
            v-for="type in assetTypes" 
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
      
      <!-- 资产金额 -->
      <view class="form-group">
        <text class="label">资产金额</text>
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
      
      <!-- 资产描述 -->
      <view class="form-group">
        <text class="label">资产描述</text>
        <textarea 
          v-model="form.description" 
          class="textarea" 
          placeholder="请输入资产描述（可选）"
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
      assetId: null,
      form: {
        name: '',
        type: 'cash',
        amount: '',
        currency: 'CNY',
        description: ''
      },
      validationErrors: {},
      assetTypes: [
        { value: 'cash', name: '现金', icon: '💰', color: '#4CAF50' },
        { value: 'bank', name: '银行存款', icon: '🏦', color: '#2196F3' },
        { value: 'investment', name: '投资', icon: '📈', color: '#FF9800' },
        { value: 'real_estate', name: '不动产', icon: '🏠', color: '#9C27B0' },
        { value: 'vehicle', name: '车辆', icon: '🚗', color: '#607D8B' },
        { value: 'other', name: '其他', icon: '📦', color: '#795548' }
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
      this.assetId = options.id
      this.loadAssetData()
    }
  },
  methods: {
    // 加载资产数据（编辑模式）
    loadAssetData() {
      // 模拟数据
      const mockAsset = {
        id: '1',
        name: '工商银行储蓄卡',
        type: 'bank',
        amount: 65800.50,
        currency: 'CNY',
        description: '主要储蓄账户',
        createTime: '2024-01-10T14:30:00Z',
        updateTime: '2024-01-20T09:15:00Z'
      }
      
      if (this.assetId === '1') {
        this.form = {
          name: mockAsset.name,
          type: mockAsset.type,
          amount: mockAsset.amount.toString(),
          currency: mockAsset.currency,
          description: mockAsset.description
        }
      }
    },
    
    // 货币选择变化
    onCurrencyChange(e) {
      const index = e.detail.value
      this.form.currency = this.currencies[index].value
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
      const isValid = validator.validateField(fieldName, this.form[fieldName], validationSchemas.asset[fieldName])
      this.validationErrors = { ...validator.getErrors() }
      return isValid
    },
    
    // 表单验证
    validateForm() {
      const isValid = validator.validateForm(this.form, validationSchemas.asset)
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
        const assetData = {
          ...this.form,
          amount: parseFloat(this.form.amount),
          createTime: this.isEdit ? undefined : new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        
        if (this.isEdit) {
          // 编辑模式
          uni.showToast({
            title: '资产更新成功',
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
            title: '资产添加成功',
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