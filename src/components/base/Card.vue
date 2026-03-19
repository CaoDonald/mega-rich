<template>
  <div :class="['base-card', { hoverable, bordered, shadow }]" :style="cardStyle">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
      <div v-if="$slots.extra" class="card-extra">
        <slot name="extra"></slot>
      </div>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  bordered: {
    type: Boolean,
    default: true
  },
  shadow: {
    type: Boolean,
    default: true
  },
  padding: {
    type: String,
    default: 'md' // xs, sm, md, lg, xl
  }
})

const cardStyle = computed(() => {
  const paddingMap = {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-lg)',
    lg: 'var(--spacing-xl)',
    xl: 'var(--spacing-2xl)'
  }

  return {
    '--card-padding': paddingMap[props.padding] || paddingMap.md
  }
})
</script>

<style scoped>
.base-card {
  background: var(--color-bg-base);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

.base-card.bordered {
  border: 1px solid var(--color-gray-200);
}

.base-card.shadow {
  box-shadow: var(--shadow-sm);
}

.base-card.hoverable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--card-padding);
  border-bottom: 1px solid var(--color-gray-200);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-extra {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.card-body {
  padding: var(--card-padding);
}

.card-footer {
  padding: var(--card-padding);
  border-top: 1px solid var(--color-gray-200);
  background: var(--color-bg-secondary);
}
</style>
