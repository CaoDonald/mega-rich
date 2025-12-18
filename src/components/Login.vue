<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2>登录</h2>
      <n-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
          class="login-form"
      >
        <n-form-item label="邮箱" path="email">
          <n-input
              v-model:value="formData.email"
              type="email"
              placeholder="请输入邮箱"
              :disabled="loading"

          />
        </n-form-item>

        <n-form-item label="密码" path="password">
          <n-input
              v-model:value="formData.password"
              :type="showPassword ? 'text' : 'password'"
              :disabled="loading"
              placeholder="请输入密码"
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
                      <svg v-if="showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    </template>
                  </n-icon>
                </template>
              </n-button>
            </template>
          </n-input>
        </n-form-item>

        <n-form-item>
          <n-button
              type="primary"
              block

              :loading="loading"
              @click="handleLogin"
          >
            登录
          </n-button>
        </n-form-item>
      </n-form>

      <div class="form-links">
        <n-button
            text
            type="primary"
            :disabled="loading"
            @click="navigateToForgotPassword"
        >
          忘记密码
        </n-button>
        <n-button
            text
            type="primary"
            :disabled="loading"
            @click="navigateToRegister"
        >
          注册
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, inject, onMounted} from 'vue'
import {supabase} from '../supabase'
import { useMessage } from 'naive-ui'

// 使用 App.vue 提供的页面切换方法
const navigateTo = inject('navigateTo')
const updateUser = inject('updateUser')
const message = useMessage()
const formRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)

const formData = reactive({
  email: '',
  password: ''
})

const formRules = {
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能少于6个字符', trigger: 'blur'}
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const {error} = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    })

    if (error) {
      throw error
    }

    // 更新全局用户状态
    await updateUser()

    message.success('登录成功')
    navigateTo('home')
  } catch (error) {
    if (error.name === 'ValidateError') {
      // 表单验证错误，已由组件处理
      return
    }
    message.error(error.message || '登录失败，请检查邮箱和密码')
  } finally {
    loading.value = false
  }
}

const navigateToForgotPassword = () => {
  navigateTo('forgot-password')
}

const navigateToRegister = () => {
  navigateTo('register')
}

// 页面加载时检查是否有密码重置会话
onMounted(async () => {
  const { data, error } = await supabase.auth.getSession()
  if (data.session && data.session.provider_token) {
    navigateTo('password-reset')
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  padding: 20px;
}

.login-form-wrapper {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  color: #333 !important;
}

.login-form-wrapper h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.login-form {
  margin-bottom: 20px;
  color: #333;
}

/* 确保所有表单元素都有正确的颜色 */
.login-form :deep(.n-form-item-label) {
  color: #333 !important;
}

.login-form :deep(.n-input) {
  background-color: white !important;
  color: #333 !important;
}

.login-form :deep(.n-input__input-el) {
  color: #333 !important;
}

.login-form :deep(.n-checkbox) {
  color: #333 !important;
}

.login-form :deep(.n-checkbox__label) {
  color: #333 !important;
}

.password-toggle {
  display: flex;
  justify-content: flex-start;
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.form-links :deep(.n-button) {
  color: #2080f0 !important;
}

@media (max-width: 768px) {
  .login-form-wrapper {
    padding: 20px;
  }
}
</style>