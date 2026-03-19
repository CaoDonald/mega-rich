<template>
  <Card title="快速操作与筛选">
    <!-- 操作按钮 -->
    <div class="actions-section">
      <div class="action-buttons">
        <n-button type="primary" @click="$emit('add-item')">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          新增资金条目
        </n-button>
        <n-button @click="$emit('batch-import')">
          <template #icon>
            <n-icon><CloudUploadOutline /></n-icon>
          </template>
          批量导入
        </n-button>
        <n-button @click="$emit('manage-categories')">
          <template #icon>
            <n-icon><ListOutline /></n-icon>
          </template>
          管理分类
        </n-button>
        <n-button @click="$emit('refresh')">
          <template #icon>
            <n-icon><RefreshOutline /></n-icon>
          </template>
          刷新数据
        </n-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-section">
      <n-select
        clearable
        :value="filters.category"
        @update:value="$emit('update:category', $event)"
        placeholder="选择一级分类"
        :options="categoryOptions"
        class="filter-item"
      />
      <n-select
        clearable
        :value="filters.subcategory"
        @update:value="$emit('update:subcategory', $event)"
        placeholder="选择二级分类"
        :options="subcategoryOptions"
        :disabled="!filters.category"
        class="filter-item"
      />
      <n-date-picker
        clearable
        :value="filters.date"
        @update:value="$emit('update:date', $event)"
        type="month"
        placeholder="选择月份"
        class="filter-item"
      />
    </div>
  </Card>
</template>

<script setup>
import { NButton, NIcon, NSelect, NDatePicker } from 'naive-ui'
import {
  AddOutline,
  CloudUploadOutline,
  ListOutline,
  RefreshOutline
} from '@vicons/ionicons5'
import Card from '../base/Card.vue'

defineProps({
  filters: {
    type: Object,
    required: true
  },
  categoryOptions: {
    type: Array,
    default: () => []
  },
  subcategoryOptions: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'add-item',
  'batch-import',
  'manage-categories',
  'refresh',
  'update:category',
  'update:subcategory',
  'update:date'
])
</script>

<style scoped>
.actions-section {
  margin-bottom: var(--spacing-xl);
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.filters-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-200);
}

.filter-item {
  min-width: 0;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .n-button {
    width: 100%;
  }

  .filters-section {
    grid-template-columns: 1fr;
  }
}
</style>
