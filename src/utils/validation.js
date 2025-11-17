/**
 * 数据验证工具模块
 * 提供统一的表单验证和错误处理功能
 */

// 验证规则定义
const validationRules = {
  // 必填字段验证
  required: {
    validate: (value) => {
      if (value === null || value === undefined || value === '') {
        return false
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false
      }
      return true
    },
    message: '此字段为必填项'
  },
  
  // 数字验证
  number: {
    validate: (value) => {
      if (value === null || value === undefined || value === '') return false
      const num = parseFloat(value)
      return !isNaN(num) && isFinite(num)
    },
    message: '请输入有效的数字'
  },
  
  // 正数验证
  positive: {
    validate: (value) => {
      if (value === null || value === undefined || value === '') return false
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    },
    message: '请输入大于0的数字'
  },
  
  // 非负数验证
  nonNegative: {
    validate: (value) => {
      if (value === null || value === undefined || value === '') return false
      const num = parseFloat(value)
      return !isNaN(num) && num >= 0
    },
    message: '请输入非负数'
  },
  
  // 长度验证
  length: {
    validate: (value, min, max) => {
      if (value === null || value === undefined) return false
      const length = value.toString().length
      if (min !== undefined && length < min) return false
      if (max !== undefined && length > max) return false
      return true
    },
    message: (min, max) => {
      if (min !== undefined && max !== undefined) {
        return `长度必须在${min}-${max}个字符之间`
      } else if (min !== undefined) {
        return `长度不能少于${min}个字符`
      } else {
        return `长度不能超过${max}个字符`
      }
    }
  },
  
  // 邮箱验证
  email: {
    validate: (value) => {
      if (!value) return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message: '请输入有效的邮箱地址'
  },
  
  // 手机号验证
  phone: {
    validate: (value) => {
      if (!value) return false
      const phoneRegex = /^1[3-9]\d{9}$/
      return phoneRegex.test(value)
    },
    message: '请输入有效的手机号码'
  },
  
  // 日期验证
  date: {
    validate: (value) => {
      if (!value) return false
      const date = new Date(value)
      return !isNaN(date.getTime())
    },
    message: '请输入有效的日期'
  },
  
  // 过去日期验证
  pastDate: {
    validate: (value) => {
      if (!value) return false
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return !isNaN(date.getTime()) && date <= today
    },
    message: '日期不能在未来'
  },
  
  // 自定义正则验证
  regex: {
    validate: (value, pattern) => {
      if (!value) return false
      const regex = new RegExp(pattern)
      return regex.test(value)
    },
    message: (pattern) => '格式不符合要求'
  }
}

// 验证器类
class Validator {
  constructor() {
    this.errors = {}
    this.rules = validationRules
  }
  
  /**
   * 验证单个字段
   * @param {string} fieldName 字段名称
   * @param {any} value 字段值
   * @param {Array} rules 验证规则数组
   * @returns {boolean} 是否验证通过
   */
  validateField(fieldName, value, rules) {
    for (const rule of rules) {
      const ruleName = typeof rule === 'string' ? rule : rule.name
      const ruleParams = rule.params || []
      
      if (!this.rules[ruleName]) {
        console.warn(`验证规则 ${ruleName} 不存在`)
        continue
      }
      
      const isValid = this.rules[ruleName].validate(value, ...ruleParams)
      
      if (!isValid) {
        let message = this.rules[ruleName].message
        if (typeof message === 'function') {
          message = message(...ruleParams)
        }
        
        this.errors[fieldName] = {
          rule: ruleName,
          message: message,
          value: value
        }
        
        return false
      }
    }
    
    // 验证通过，清除错误
    delete this.errors[fieldName]
    return true
  }
  
  /**
   * 验证表单
   * @param {Object} formData 表单数据
   * @param {Object} validationSchema 验证模式
   * @returns {boolean} 是否验证通过
   */
  validateForm(formData, validationSchema) {
    this.errors = {}
    let isValid = true
    
    for (const [fieldName, rules] of Object.entries(validationSchema)) {
      const value = formData[fieldName]
      if (!this.validateField(fieldName, value, rules)) {
        isValid = false
      }
    }
    
    return isValid
  }
  
  /**
   * 获取验证错误
   * @returns {Object} 错误对象
   */
  getErrors() {
    return this.errors
  }
  
  /**
   * 获取特定字段的错误信息
   * @param {string} fieldName 字段名称
   * @returns {string|null} 错误信息
   */
  getFieldError(fieldName) {
    return this.errors[fieldName] ? this.errors[fieldName].message : null
  }
  
  /**
   * 清除所有错误
   */
  clearErrors() {
    this.errors = {}
  }
  
  /**
   * 清除特定字段的错误
   * @param {string} fieldName 字段名称
   */
  clearFieldError(fieldName) {
    delete this.errors[fieldName]
  }
}

// 表单验证模式定义
export const validationSchemas = {
  // 资产表单验证模式
  asset: {
    name: [
      { name: 'required' },
      { name: 'length', params: [1, 50] }
    ],
    type: [
      { name: 'required' }
    ],
    amount: [
      { name: 'required' },
      { name: 'number' },
      { name: 'positive' }
    ],
    currency: [
      { name: 'required' }
    ]
  },
  
  // 基金表单验证模式
  fund: {
    name: [
      { name: 'required' },
      { name: 'length', params: [1, 50] }
    ],
    code: [
      { name: 'required' },
      { name: 'length', params: [6, 6] },
      { name: 'regex', params: ['^\\d{6}$'] }
    ],
    type: [
      { name: 'required' }
    ],
    shares: [
      { name: 'required' },
      { name: 'number' },
      { name: 'positive' }
    ],
    costPrice: [
      { name: 'required' },
      { name: 'number' },
      { name: 'positive' }
    ],
    currentPrice: [
      { name: 'required' },
      { name: 'number' },
      { name: 'positive' }
    ],
    purchaseDate: [
      { name: 'required' },
      { name: 'date' },
      { name: 'pastDate' }
    ]
  },
  
  // 收入表单验证模式
  income: {
    name: [
      { name: 'required' },
      { name: 'length', params: [1, 50] }
    ],
    type: [
      { name: 'required' }
    ],
    amount: [
      { name: 'required' },
      { name: 'number' },
      { name: 'positive' }
    ],
    currency: [
      { name: 'required' }
    ],
    date: [
      { name: 'required' },
      { name: 'date' },
      { name: 'pastDate' }
    ]
  }
}

// 错误处理工具
export const errorHandler = {
  /**
   * 显示验证错误
   * @param {Object} errors 错误对象
   * @param {string} fieldName 字段名称
   */
  showValidationError(errors, fieldName = null) {
    if (fieldName && errors[fieldName]) {
      uni.showToast({
        title: errors[fieldName].message,
        icon: 'none',
        duration: 3000
      })
    } else if (Object.keys(errors).length > 0) {
      // 显示第一个错误
      const firstError = Object.values(errors)[0]
      uni.showToast({
        title: firstError.message,
        icon: 'none',
        duration: 3000
      })
    }
  },
  
  /**
   * 处理网络错误
   * @param {Error} error 错误对象
   */
  handleNetworkError(error) {
    console.error('网络错误:', error)
    uni.showToast({
      title: '网络连接失败，请检查网络设置',
      icon: 'none',
      duration: 3000
    })
  },
  
  /**
   * 处理数据存储错误
   * @param {Error} error 错误对象
   */
  handleStorageError(error) {
    console.error('数据存储错误:', error)
    uni.showToast({
      title: '数据保存失败，请重试',
      icon: 'none',
      duration: 3000
    })
  },
  
  /**
   * 处理未知错误
   * @param {Error} error 错误对象
   */
  handleUnknownError(error) {
    console.error('未知错误:', error)
    uni.showToast({
      title: '发生未知错误，请重试',
      icon: 'none',
      duration: 3000
    })
  }
}

// 创建验证器实例
export const validator = new Validator()

// 默认导出
export default {
  validator,
  validationSchemas,
  errorHandler
}