<template>
  <n-layout>
    <n-layout-header bordered>
      <div class="header-content">
        <div class="logo">
          <h1>Mega Rich</h1>
        </div>
        <div class="user-info">
          <n-avatar
            v-if="user"
            :size="40"
            :src="user.avatar_url"
            :fallback="user.email.charAt(0).toUpperCase()"
          />
          <n-button
            v-else
            type="primary"
            @click="handleLoginClick"
          >
            登录
          </n-button>
        </div>
      </div>
    </n-layout-header>

    <n-layout-content>
      <slot></slot>
    </n-layout-content>

    <n-layout-footer bordered>
      <div class="footer-content">
        <p>© 2025 Mega Rich. All rights reserved.</p>
      </div>
    </n-layout-footer>
  </n-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { NLayout, NLayoutHeader, NLayoutContent, NLayoutFooter, NAvatar, NButton } from 'naive-ui'

const router = useRouter()
const user = ref(null)

onMounted(async () => {
  // 检查用户登录状态
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    user.value = data.session.user
  }

  // 监听认证状态变化
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      user.value = session.user
    } else {
      user.value = null
    }
  })
})

const handleLoginClick = () => {
  router.push('/login')
}
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  height: 100%;
}

.footer-content p {
  margin: 0;
  color: #666;
}
</style>