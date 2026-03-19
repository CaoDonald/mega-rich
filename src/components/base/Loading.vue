<template>
  <div :class="['base-loading', { fullscreen }]">
    <div class="loading-content">
      <n-spin :size="size" :stroke="stroke" />
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
import { NSpin } from 'naive-ui'

defineProps({
  text: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium' // small, medium, large
  },
  stroke: {
    type: String,
    default: '#18A058'
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.base-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.base-loading.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
