<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <h2>注册</h2>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
        class="register-form"
      >
        <n-form-item label="邮箱" path="email">
          <n-input
            v-model:value="formData.email"
            type="email"
            placeholder="请输入邮箱"
            :disabled="loading"
            size="large"
          />
        </n-form-item>

        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="formData.password"
            :type="showPassword ? 'text' : 'password'"
            :disabled="loading"
            placeholder="请输入密码（至少6个字符）"
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

        <n-form-item label="确认密码" path="confirmPassword">
          <n-input
            v-model:value="formData.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            :disabled="loading"
            placeholder="请再次输入密码"
            size="large"
          />
        </n-form-item>

        <n-form-item>
          <n-button
            type="primary"
            block
            size="large"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </n-button>
        </n-form-item>
      </n-form>

      <div class="form-links">
        <n-button
          text
          type="primary"
          :disabled="loading"
          @click="navigateToLogin"
        >
          已有账号？登录
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { supabase } from '../../supabase.js'
import { useMessage } from 'naive-ui'

// 使用 App.vue 提供的页面切换方法
const navigateTo = inject('navigateTo')
const message = useMessage()
const formRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const formRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator(rule, value) {
        if (!value || formData.password === value) {
          return true
        }
        return new Error('两次输入的密码不一致')
      },
      trigger: 'blur'
    }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 执行注册操作
    const res = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: window.location.origin + '/login'
      }
    })
    console.log('res',res);
    
    const { data, error } = res

    if (error) {
      throw error
    }

    message.success('注册成功！请检查邮箱确认注册')
    navigateTo('login')
  } catch (error) {
    if (error.name === 'ValidateError') {
      // 表单验证错误，已由组件处理
      return
    }
    message.error(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const navigateToLogin = () => {
  navigateTo('login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  padding: 20px;
}

.register-form-wrapper {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  color: #333 !important;
}

.register-form-wrapper h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.register-form {
  margin-bottom: 20px;
  color: #333;
}

/* 确保所有表单元素都有正确的颜色 */
.register-form :deep(.n-form-item-label) {
  color: #333 !important;
}

.register-form :deep(.n-input) {
  background-color: white !important;
  color: #333 !important;
}

.register-form :deep(.n-input__input-el) {
  color: #333 !important;
}

.register-form :deep(.n-checkbox) {
  color: #333 !important;
}

.register-form :deep(.n-checkbox__label) {
  color: #333 !important;
}

.password-toggle {
  display: flex;
  justify-content: flex-start;
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
  .register-form-wrapper {
    padding: 20px;
  }
}
</style>