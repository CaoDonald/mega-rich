<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo -->
      <div class="logo" @click="router.push({ name: 'home' })">
        <span class="logo-text">Mega Rich</span>
      </div>

      <!-- 桌面端导航 -->
      <nav class="desktop-nav">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.route }"
          class="nav-item"
          exact-active-class="active"
        >
          <n-icon :component="item.icon" size="20" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- 用户菜单 -->
      <div class="user-menu">
        <template v-if="authStore.isAuthenticated">
          <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
            <div class="user-avatar">
              <n-avatar round size="small">
                {{ authStore.user?.email?.charAt(0).toUpperCase() }}
              </n-avatar>
            </div>
          </n-dropdown>
        </template>
        <template v-else>
          <n-button text @click="router.push({ name: 'login' })">
            登录
          </n-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { NIcon, NAvatar, NDropdown, NButton } from 'naive-ui'
import {
  HomeOutline,
  TrendingUpOutline,
  WalletOutline,
  CashOutline,
  SettingsOutline,
  LogOutOutline
} from '@vicons/ionicons5'

const router = useRouter()
const authStore = useAuthStore()

// 导航项
const navItems = computed(() => {
  const items = [
    { name: 'home', route: 'home', label: '首页', icon: HomeOutline }
  ]

  if (authStore.isAuthenticated) {
    items.push(
      { name: 'fund', route: 'fund', label: '基金投资', icon: TrendingUpOutline },
      { name: 'balance', route: 'balance', label: '结余管理', icon: WalletOutline },
      { name: 'salary', route: 'salary', label: '月薪管理', icon: CashOutline }
    )
  }

  return items
})

// 用户菜单选项
const userMenuOptions = computed(() => [
  {
    label: '个人设置',
    key: 'settings',
    icon: renderIcon(SettingsOutline)
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: renderIcon(LogOutOutline)
  }
])

// 渲染图标的辅助函数
function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// 处理用户菜单选择
const handleUserMenuSelect = async (key) => {
  if (key === 'settings') {
    router.push({ name: 'settings' })
  } else if (key === 'logout') {
    await authStore.logout()
    router.push({ name: 'home' })
  }
}
</script>

<style scoped>
.app-header {
  background: var(--color-bg-base);
  border-bottom: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.desktop-nav {
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-base);
  font-size: var(--font-size-sm);
}

.nav-item:hover {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
}

.nav-item.active {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
  font-weight: 600;
}

.user-menu {
  display: flex;
  align-items: center;
}

.user-avatar {
  cursor: pointer;
}

/* 移动端隐藏桌面导航 */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .header-container {
    padding: 0 var(--spacing-md);
  }

  .logo-text {
    font-size: var(--font-size-lg);
  }
}
</style>
