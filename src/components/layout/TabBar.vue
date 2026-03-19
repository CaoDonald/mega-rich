<template>
  <div class="tab-bar" v-if="authStore.isAuthenticated">
    <router-link
      v-for="item in tabItems"
      :key="item.name"
      :to="{ name: item.route }"
      class="tab-item"
      exact-active-class="active"
    >
      <n-icon :component="item.icon" size="24" />
      <span class="tab-label">{{ item.label }}</span>
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { NIcon } from 'naive-ui'
import {
  HomeOutline,
  TrendingUpOutline,
  WalletOutline,
  CashOutline,
  PersonOutline
} from '@vicons/ionicons5'

const authStore = useAuthStore()

// Tab 项
const tabItems = [
  { name: 'home', route: 'home', label: '首页', icon: HomeOutline },
  { name: 'fund', route: 'fund', label: '基金', icon: TrendingUpOutline },
  { name: 'balance', route: 'balance', label: '结余', icon: WalletOutline },
  { name: 'salary', route: 'salary', label: '月薪', icon: CashOutline },
  { name: 'settings', route: 'settings', label: '我的', icon: PersonOutline }
]
</script>

<style scoped>
.tab-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-base);
  border-top: 1px solid var(--color-gray-200);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  padding: var(--spacing-xs) 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--spacing-xs) 0;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-base);
  min-height: 56px;
}

.tab-item:active {
  background: var(--color-bg-secondary);
}

.tab-item.active {
  color: var(--color-primary);
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
}

/* 移动端显示 Tab Bar */
@media (max-width: 768px) {
  .tab-bar {
    display: flex;
  }
}
</style>
