<template>
  <div class="user-settings-container">
    <div class="settings-content">
      <!-- 基本信息 -->
      <div class="settings-section">
        <h3>基本信息</h3>
        <n-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          layout="vertical"
          class="settings-form"
        >
          <n-form-item label="头像">
            <div class="avatar-upload">
              <input
                type="file"
                id="avatar-upload-input"
                accept="image/jpeg, image/png"
                style="display: none"
                @change="handleAvatarUpload"
              />
              <div @click="triggerAvatarUpload">
                <n-avatar
                  :size="100"
                  :src="avatarPreview || storedAvatarSrc"
                  fallback-src="https://www.naiveui.com/assets/naivelogo-BdDVTUmz.svg"
                  class="avatar"
                />
                <div class="avatar-upload-text">点击上传头像</div>
              </div>
              <div v-if="avatarUploading" class="avatar-upload-status">
                <n-spin size="small" />
                <span>上传中...</span>
              </div>
            </div>
          </n-form-item>

          <n-form-item label="姓名" path="username">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入姓名"
              :disabled="loading"
            />
          </n-form-item>

          <n-form-item label="邮箱" path="email">
            <n-input
              v-model:value="formData.email"
              type="email"
              placeholder="请输入邮箱"
              :disabled="loading"
            />
          </n-form-item>

          <n-form-item label="手机号码" path="phone">
            <n-input
              v-model:value="formData.phone"
              placeholder="请输入手机号码"
              :disabled="loading"
            />
          </n-form-item>

          <n-form-item>
            <n-button
              type="primary"
              :loading="loading"
              @click="handleSave"
            >
              保存设置
            </n-button>
          </n-form-item>
        </n-form>
      </div>

      <!-- 密码设置 -->
      <div class="settings-section">
        <h3>密码设置</h3>
        <n-form
          ref="passwordFormRef"
          :model="passwordData"
          :rules="passwordRules"
          layout="vertical"
          class="settings-form"
        >
          <n-form-item label="当前密码" path="currentPassword">
            <n-input
              v-model:value="passwordData.currentPassword"
              type="password"
              placeholder="请输入当前密码"
              :disabled="loading"
            />
          </n-form-item>

          <n-form-item label="新密码" path="newPassword">
            <n-input
              v-model:value="passwordData.newPassword"
              type="password"
              placeholder="请输入新密码（至少8位，包含大小写字母、数字和特殊符号）"
              :disabled="loading"
            />
          </n-form-item>

          <n-form-item label="确认新密码" path="confirmPassword">
            <n-input
              v-model:value="passwordData.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              :disabled="loading"
            />
          </n-form-item>

          <n-form-item>
            <n-button
              type="primary"
              :loading="loading"
              @click="handleChangePassword"
            >
              修改密码
            </n-button>
          </n-form-item>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed, watch } from 'vue'
import { supabase } from '../supabase'
import { useMessage, NSpin } from 'naive-ui'

const navigateTo = inject('navigateTo')
const currentPage = inject('currentPage')
const updateUser = inject('updateUser')
const message = useMessage()
const formRef = ref(null)
const passwordFormRef = ref(null)
const loading = ref(false)
const avatarUploading = ref(false)
const avatarPreview = ref('')
const storedAvatarSrc = ref('')

// 加载头像方法
const loadStoredAvatar = async () => {
  if (formData.avatar_url) {
    try {
      // 从URL中提取文件路径（去掉存储桶名称）
      const path = formData.avatar_url.split('/avatars/')[1]
      if (path) {
        const { data, error } = await supabase.storage.from('avatars').download(path)
        if (error) throw error
        storedAvatarSrc.value = URL.createObjectURL(data)
      }
    } catch (error) {
      console.error('加载头像失败:', error)
      storedAvatarSrc.value = ''
    }
  } else {
    storedAvatarSrc.value = ''
  }
}

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  phone: '',
  avatar_url: ''
})

// 监听头像URL变化，重新加载头像
watch(() => formData.avatar_url, (newUrl) => {
  if (newUrl) {
    loadStoredAvatar()
  } else {
    storedAvatarSrc.value = ''
  }
})

// 密码表单数据
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ]
}

// 确认密码验证
const validateConfirmPassword = (rule, value) => {
  if (value !== passwordData.newPassword) {
    return false
  }
  return true
}

// 密码强度验证
const validatePasswordStrength = (rule, value) => {
  // 密码长度至少8位
  if (value.length < 8) {
    return new Error('密码长度不能少于8个字符')
  }
  // 包含至少一个大写字母
  if (!/[A-Z]/.test(value)) {
    return new Error('密码必须包含至少一个大写字母')
  }
  // 包含至少一个小写字母
  if (!/[a-z]/.test(value)) {
    return new Error('密码必须包含至少一个小写字母')
  }
  // 包含至少一个数字
  if (!/[0-9]/.test(value)) {
    return new Error('密码必须包含至少一个数字')
  }
  // 包含至少一个特殊符号
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    return new Error('密码必须包含至少一个特殊符号')
  }
  return true
}

// 密码表单验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: validatePasswordStrength, message: '密码强度不符合要求', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, message: '两次输入的密码不一致', trigger: 'blur' }
  ]
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigateTo('login')
      return
    }

    // 获取用户资料
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    // 更新表单数据
    formData.username = profile.username || ''
    formData.email = user.email || ''
    formData.phone = profile.phone || ''
    formData.avatar_url = profile.avatar_url || ''
  } catch (error) {
    console.error('加载用户信息失败:', error)
    message.error('加载用户信息失败')
  }
}

// 保存用户设置
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    // 检查邮箱是否有变化
    if (formData.email !== user.email) {
      // 更新邮箱，指定验证完成后的跳转地址
      const { error: emailError } = await supabase.auth.updateUser({
        email: formData.email
      })
      
      if (emailError) throw emailError
      
      message.info('邮箱修改请求已发送，请检查邮箱确认修改,注意需要同时确认新旧邮箱')
    }

    // 更新用户资料
    const { error } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        phone: formData.phone,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) throw error

    if (formData.email === user.email) {
      message.success('设置保存成功')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    message.error(error.message || '保存设置失败')
  } finally {
    loading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    loading.value = true

    // 获取当前用户信息
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    // 验证原密码
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passwordData.currentPassword
    })

    if (signInError) {
      throw new Error('原密码输入错误')
    }

    // 修改密码
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword
    })

    if (error) throw error

    message.success('密码修改成功')
    
    // 清空密码表单
    passwordData.currentPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''
  } catch (error) {
    console.error('修改密码失败:', error)
    message.error(error.message || '修改密码失败')
  } finally {
    loading.value = false
  }
}

// 触发头像上传
const triggerAvatarUpload = () => {
  document.getElementById('avatar-upload-input').click()
}

// 处理头像上传
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件大小（最大5MB）
  if (file.size > 5 * 1024 * 1024) {
    message.error('头像文件大小不能超过5MB')
    return
  }

  // 验证文件类型
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    message.error('只支持JPG和PNG格式的图片')
    return
  }

  try {
    avatarUploading.value = true

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)

    // 获取用户信息
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    // 生成唯一文件名
    const fileName = `${user.id}/${Date.now()}-${file.name}`

    // 上传文件到Supabase存储
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    // 获取文件URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName)

    // 更新用户头像URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    // 更新本地数据
    formData.avatar_url = publicUrl
    // 更新全局用户信息，确保右上角头像同步刷新
    await updateUser()
    message.success('头像上传成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    message.error('头像上传失败')
    // 清除预览
    avatarPreview.value = ''
  } finally {
    avatarUploading.value = false
    // 清空文件输入
    event.target.value = ''
  }
}

// 页面加载时获取用户信息
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-top: 20px;
}

.settings-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-section h3 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
}

.settings-form {
  max-width: 500px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.avatar {
  margin-bottom: 10px;
}

.avatar-upload-text {
  color: #2080f0;
  font-size: 14px;
}

.avatar-upload-status {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  color: #2080f0;
  font-size: 14px;
}

.avatar-upload-status span {
  margin-left: 5px;
}

@media (max-width: 768px) {
  .user-settings-container {
    padding: 10px;
  }

  .settings-section {
    padding: 15px;
  }
}
</style>