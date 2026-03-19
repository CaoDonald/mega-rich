<template>
  <div class="base-empty">
    <div class="empty-icon">
      <slot name="icon">
        <n-icon :component="icon" size="64" />
      </slot>
    </div>
    <div class="empty-description">
      <slot>
        {{ description }}
      </slot>
    </div>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup>
import { NIcon } from 'naive-ui'
import { FolderOpenOutline } from '@vicons/ionicons5'

defineProps({
  description: {
    type: String,
    default: '暂无数据'
  },
  icon: {
    type: Object,
    default: () => FolderOpenOutline
  }
})
</script>

<style scoped>
.base-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;
}

.empty-icon {
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-lg);
}

.empty-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.empty-action {
  margin-top: var(--spacing-md);
}
</style>
