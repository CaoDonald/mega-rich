<template>
  <Card title="快速操作与筛选">
    <!-- 操作按钮 -->
    <div class="actions-section">
      <div class="action-buttons">
        <n-button type="primary" @click="$emit('add-record')">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          新增记录
        </n-button>
        <n-button @click="$emit('batch-import')">
          <template #icon>
            <n-icon><CloudUploadOutline /></n-icon>
          </template>
          批量导入
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
        :value="filters.type"
        @update:value="$emit('update:type', $event)"
        placeholder="选择记录类型"
        :options="typeOptions"
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
      <n-select
        clearable
        :value="filters.timeRange"
        @update:value="$emit('update:timeRange', $event)"
        placeholder="时间范围"
        :options="timeRangeOptions"
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
  RefreshOutline
} from '@vicons/ionicons5'
import Card from '../base/Card.vue'

defineProps({
  filters: {
    type: Object,
    required: true
  },
  typeOptions: {
    type: Array,
    default: () => [
      { label: '全部', value: null },
      { label: '基本月薪', value: 'salary' },
      { label: '年终奖', value: 'bonus' }
    ]
  },
  timeRangeOptions: {
    type: Array,
    default: () => [
      { label: '全部', value: 'all' },
      { label: '今年', value: 'this_year' },
      { label: '上一年', value: 'last_year' },
      { label: '近一年', value: 'last_12_months' },
      { label: '上三年', value: 'last_3_years' },
      { label: '近三年', value: 'last_36_months' }
    ]
  }
})

defineEmits([
  'add-record',
  'batch-import',
  'refresh',
  'update:type',
  'update:date',
  'update:timeRange'
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
