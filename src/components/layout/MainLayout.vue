<template>
  <div class="app-layout">
    <AppHeader />

    <main class="main-content">
      <router-view />
    </main>

    <AppFooter />

    <TabBar />
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import TabBar from './TabBar.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
}

.main-content {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

/* 移动端样式 */
@media (max-width: 768px) {
  .main-content {
    padding: var(--spacing-lg) var(--spacing-md);
    padding-bottom: calc(56px + var(--spacing-lg) + env(safe-area-inset-bottom));
  }
}
</style>
