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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuth } from '../../composables/useAuth.js'

const router = useRouter()
const message = useMessage()
const { register, loading } = useAuth()

const formRef = ref(null)
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

    const result = await register(formData.email, formData.password, {
      emailRedirectTo: window.location.origin + '/login'
    })

    if (result.success) {
      message.success('注册成功！请检查邮箱确认注册')
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push({ name: 'login' })
      }, 2000)
    } else {
      message.error(result.error || '注册失败')
    }
  } catch (error) {
    if (error.name === 'ValidateError') {
      return
    }
    message.error(error.message || '注册失败')
  }
}

const navigateToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  padding: var(--spacing-xl);
}

.register-form-wrapper {
  background: var(--color-bg-base);
  padding: var(--spacing-3xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
}

.register-form-wrapper h2 {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
}

.register-form {
  margin-bottom: var(--spacing-xl);
}

.form-links {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .register-container {
    padding: var(--spacing-lg);
  }

  .register-form-wrapper {
    padding: var(--spacing-xl);
  }
}
</style>