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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuth } from '../../composables/useAuth.js'

const router = useRouter()
const message = useMessage()
const { login, loading } = useAuth()

const formRef = ref(null)
const showPassword = ref(false)

const formData = reactive({
  email: '',
  password: ''
})

const formRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const result = await login(formData.email, formData.password)

    if (result.success) {
      message.success('登录成功')
    } else {
      message.error(result.error || '登录失败，请检查邮箱和密码')
    }
  } catch (error) {
    if (error.name === 'ValidateError') {
      return
    }
    message.error(error.message || '登录失败')
  }
}

const navigateToForgotPassword = () => {
  router.push({ name: 'forgot-password' })
}

const navigateToRegister = () => {
  router.push({ name: 'register' })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  padding: var(--spacing-xl);
}

.login-form-wrapper {
  background: var(--color-bg-base);
  padding: var(--spacing-3xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
}

.login-form-wrapper h2 {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
}

.login-form {
  margin-bottom: var(--spacing-xl);
}

.form-links {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .login-container {
    padding: var(--spacing-lg);
  }

  .login-form-wrapper {
    padding: var(--spacing-xl);
  }
}
</style>