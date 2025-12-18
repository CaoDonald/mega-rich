<template>
  <div class="password-reset-container">
    <div class="password-reset-form-wrapper">
      <h2>重置密码</h2>

      <!-- 验证会话 -->
      <div v-if="validatingSession" class="validating-session">
        <n-spin>
          <div class="spin-content">正在验证重置链接...</div>
        </n-spin>
      </div>

      <!-- 会话无效 -->
      <div v-else-if="!sessionValid" class="session-invalid">
        <n-result
          status="error"
          title="重置链接无效或已过期"
          description="请重新请求密码重置链接"
        >
          <template #footer>
            <n-button type="primary" @click="navigateToForgotPassword">
              重新请求
            </n-button>
          </template>
        </n-result>
      </div>

      <!-- 重置密码表单 -->
      <n-form
        v-else
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
        class="password-reset-form"
      >
        <n-form-item label="新密码" path="newPassword">
          <n-input
            v-model:value="formData.newPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入新密码（至少6个字符）"
            :disabled="loading"
            size="large"
          >
            <template #suffix>
              <n-button
                text
                type="primary"
                :disabled="loading"
                @click="showPassword = !showPassword"
                size="small"
              >
                <template #icon>
                  <n-icon>
                    <template #default>
                      <svg v-if="showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    </template>
                  </n-icon>
                </template>
              </n-button>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item label="确认新密码" path="confirmPassword">
          <n-input
            v-model:value="formData.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请再次输入新密码"
            :disabled="loading"
            size="large"
          />
        </n-form-item>

        <n-form-item>
          <n-button
            type="primary"
            block
            size="large"
            :loading="loading"
            @click="handleResetPassword"
          >
            重置密码
          </n-button>
        </n-form-item>
      </n-form>

      <!-- 返回登录 -->
      <div class="form-links">
        <n-button
          text
          type="primary"
          :disabled="loading"
          @click="navigateToLogin"
        >
          返回登录
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed } from 'vue'
import { supabase } from '../supabase'
import { useMessage } from 'naive-ui'

const navigateTo = inject('navigateTo')
const message = useMessage()
const formRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const validatingSession = ref(true)
const sessionValid = ref(false)

// 表单数据
const formData = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 确认密码验证
const validateConfirmPassword = (rule, value) => {
  if (value !== formData.newPassword) {
    return false
  }
  return true
}

// 表单验证规则
const formRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, message: '两次输入的密码不一致', trigger: 'blur' }
  ]
}

// 检查URL中的错误参数
const checkUrlErrors = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.has('error')
}

// 验证会话
const validateSession = async () => {
  try {
    // 先检查URL中是否有错误参数
    if (checkUrlErrors()) {
      sessionValid.value = false
      return
    }
    
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    
    sessionValid.value = !!data.session
  } catch (error) {
    console.error('验证会话失败:', error)
    sessionValid.value = false
  } finally {
    validatingSession.value = false
  }
}

// 处理密码重置
const handleResetPassword = async () => {
  console.log('handleResetPassword called')
  if (!formRef.value) {
    console.log('formRef.value is null')
    return
  }

  try {
    console.log('before validate')
    const validateResult = await formRef.value.validate()
    console.log('validateResult:', validateResult)
    loading.value = true
    console.log('loading set to true')

    // 设置请求超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 10000)
    })

    // 尝试使用updateUser方法重置密码
    const res = await Promise.race([
      supabase.auth.updateUser({
        password: formData.newPassword
      }),
      timeoutPromise
    ])
    
    console.log('res:', res)
    const {data,error} = res
    console.log('data:', data)
    console.log('error:', error)

    if (error) {
      console.error('supabase error:', error)
      throw error
    }

    console.log('before success message')
    message.success('密码重置成功，请使用新密码登录')
    
    // 先重置loading状态，再跳转页面
    loading.value = false
    console.log('loading set to false')
    navigateTo('login')
    console.log('navigate to login')
  } catch (error) {
    console.error('密码重置失败:', error)
    console.error('error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    })
    message.error(error.message || '密码重置失败，请稍后重试')
    loading.value = false
    console.log('loading set to false in catch')
  }
}

// 导航到忘记密码页面
const navigateToForgotPassword = () => {
  navigateTo('forgot-password')
}

// 导航到登录页面
const navigateToLogin = () => {
  navigateTo('login')
}

// 页面加载时验证会话
onMounted(() => {
  validateSession()
})
</script>

<style scoped>
.password-reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  padding: 20px;
}

.password-reset-form-wrapper {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  color: #333 !important;
}

.password-reset-form-wrapper h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.validating-session,
.session-invalid {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.spin-content {
  width: 200px;
  height: 100px;
}

.password-reset-form {
  margin-bottom: 20px;
  color: #333;
}

/* 确保所有表单元素都有正确的颜色 */
.password-reset-form :deep(.n-form-item-label) {
  color: #333 !important;
}

.password-reset-form :deep(.n-input) {
  background-color: white !important;
  color: #333 !important;
}

.password-reset-form :deep(.n-input__input-el) {
  color: #333 !important;
}

.form-links {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.form-links :deep(.n-button) {
  color: #2080f0 !important;
}

@media (max-width: 768px) {
  .password-reset-form-wrapper {
    padding: 20px;
  }
}
</style>