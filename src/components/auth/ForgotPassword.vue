<template>
  <div class="forgot-password-container">
    <div class="forgot-password-form-wrapper">
      <h2>忘记密码</h2>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
        class="forgot-password-form"
      >
        <n-form-item label="邮箱" path="email">
          <n-input
            v-model:value="formData.email"
            type="email"
            placeholder="请输入注册邮箱"
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
            @click="handleSendResetLink"
          >
            发送重置链接
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
          返回登录
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { supabase } from '../../supabase.js'
import { useMessage } from 'naive-ui'


// 使用 App.vue 提供的页面切换方法
const navigateTo = inject('navigateTo')
const message = useMessage()
const formRef = ref(null)
const loading = ref(false)

const formData = reactive({
  email: ''
})

const formRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const handleSendResetLink = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: window.location.origin + '/password-reset'
    })

    if (error) {
      throw error
    }

    message.success('重置链接已发送，请检查邮箱')
    navigateTo('login')
  } catch (error) {
    if (error.name === 'ValidateError') {
      // 表单验证错误，已由组件处理
      return
    }
    message.error(error.message || '发送失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const navigateToLogin = () => {
  navigateTo('login')
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  padding: 20px;
}

.forgot-password-form-wrapper {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  color: #333 !important;
}

.forgot-password-form-wrapper h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.forgot-password-form {
  margin-bottom: 20px;
  color: #333;
}

/* 确保所有表单元素都有正确的颜色 */
.forgot-password-form :deep(.n-form-item-label) {
  color: #333 !important;
}

.forgot-password-form :deep(.n-input) {
  background-color: white !important;
  color: #333 !important;
}

.forgot-password-form :deep(.n-input__input-el) {
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
  .forgot-password-form-wrapper {
    padding: 20px;
  }
}
</style>