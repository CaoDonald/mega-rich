<template>
  <n-layout>
    <n-layout-header bordered>
      <div class="header-content">
        <div class="logo" @click="goHome" style="cursor: pointer;">
          <h1>Mega Rich</h1>
        </div>

        <div class="user-info">
          <!-- 已登录 -->
          <n-dropdown
            v-if="session"
            trigger="click"
            placement="bottom-end"
            :options="dropdownOptions"
            @select="handleDropdownSelect"
          >
            <n-avatar
              :size="40"
              :src="avatarSrc"
              fallback-src=""
              class="avatar"
            />
          </n-dropdown>

          <!-- 未登录 -->
          <n-button
            v-else
            type="primary"
            @click="goLogin"
          >
            登录
          </n-button>
        </div>
      </div>
    </n-layout-header>

    <n-layout-content :class="{ 'mobile-content-wrapper': isMobile }">
      <slot />
    </n-layout-content>

    <!-- 桌面端 Footer -->
    <n-layout-footer v-if="!isMobile" bordered>
      <div class="footer-content">
        <p>© 2025 Mega Rich. All rights reserved.</p>
      </div>
    </n-layout-footer>

    <!-- 移动端底部 Tab 导航 -->
    <MobileTabBar v-if="isMobile" />
  </n-layout>
</template>

<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import { isMobile } from '../utils/device.js'
import MobileTabBar from './MobileTabBar.vue'

const router = useRouter()
const user = inject('user')
const session = inject('session')
const loadUser = inject('loadUser')
const avatarSrc = ref('')

/** 下拉菜单选项 */
const dropdownOptions = [
  { label: '设置', key: 'settings' },
  { label: '退出', key: 'logout' }
]

const loadAvatar = async () => {
  if (user.value?.avatar_url) {
    try {
      const path = user.value.avatar_url.split('/avatars/')[1]
      if (path) {
        const { data, error } = await supabase.storage.from('avatars').download(path)
        if (error) throw error
        avatarSrc.value = URL.createObjectURL(data)
      }
    } catch (error) {
      console.error('加载头像失败:', error)
    }
  } else {
    avatarSrc.value = ''
  }
}

// 监听用户信息变化
watch(user, (newUser) => {
  if (newUser) {
    loadAvatar()
  } else {
    avatarSrc.value = ''
  }
}, { immediate: true, deep: true })

const goHome = () => router.push('/')
const goLogin = () => router.push('/login')

const handleDropdownSelect = (key) => {
  if (key === 'settings') {
    router.push('/user-settings')
  } else if (key === 'logout') {
    handleLogout()
  }
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  avatarSrc.value = ''
  router.push('/')
}

onMounted(() => {
  loadAvatar()
})
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-menu {
  display: flex;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  cursor: pointer;
  border-radius: 8px;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  text-align: center;
}

/* 移动端内容区底部留白 */
.mobile-content-wrapper {
  padding-bottom: calc(var(--tab-bar-height, 56px) + env(safe-area-inset-bottom, 0px) + 10px);
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .header-content {
    gap: 10px;
    padding: 10px;
    flex-direction: row;
  }

  .logo h1 {
    font-size: 20px;
    flex: 1;
    text-align: left;
  }

  .user-info {
    flex: 0 0 auto;
  }

  .nav-menu {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 8px;
  }

  .logo h1 {
    font-size: 18px;
  }

  .footer-content {
    padding: 15px 10px;
    font-size: 14px;
  }
}
</style>