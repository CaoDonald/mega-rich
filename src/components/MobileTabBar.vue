<template>
  <nav class="mobile-tab-bar" v-if="isMobile">
    <div
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-item"
      :class="{ active: isActive(tab.key) }"
      @click="navigate(tab.key)"
    >
      <div class="tab-icon">
        <n-icon :size="22">
          <component :is="tab.icon" />
        </n-icon>
      </div>
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </nav>
</template>

<script setup>
import { computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon } from 'naive-ui'
import { isMobile } from '../utils/device.js'
import {
  HomeOutline,
  WalletOutline,
  TrendingUpOutline,
  SettingsOutline
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()

const tabs = [
  { key: 'home', label: '首页', icon: HomeOutline },
  { key: 'salary', label: '月薪', icon: WalletOutline },
  { key: 'balance', label: '结余', icon: TrendingUpOutline },
  { key: 'user-settings', label: '设置', icon: SettingsOutline }
]

const isActive = (key) => {
  return route.name === key
}

const navigate = (key) => {
  router.push({ name: key })
}
</script>

<style scoped>
.mobile-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: var(--tab-bar-height, 56px);
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  color: #999;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.tab-item.active {
  color: #3b82f6;
}

.tab-item:active {
  opacity: 0.7;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.tab-label {
  font-size: 10px;
  line-height: 1;
  white-space: nowrap;
}
</style>