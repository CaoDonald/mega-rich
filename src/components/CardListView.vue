<template>
  <div class="card-list-view">
    <!-- 桌面端：使用 NDataTable -->
    <div v-if="!isMobile" class="desktop-table">
      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :row-key="rowKey"
        :pagination="pagination"
        v-bind="$attrs"
      />
    </div>

    <!-- 手机端：卡片布局 -->
    <div v-else class="mobile-cards">
      <n-spin :show="loading">
        <div
          v-for="(row, index) in displayData"
          :key="getRowKey(row, index)"
          class="data-card"
          @click="$emit('cardClick', row)"
        >
          <div class="card-body">
            <div
              v-for="col in mobileColumns"
              :key="col.key"
              class="card-field"
            >
              <span class="card-field-label">{{ col.title }}</span>
              <span class="card-field-value">
                <slot
                  :name="`cell-${col.key}`"
                  :row="row"
                  :column="col"
                >
                  {{ getCellText(row, col) }}
                </slot>
              </span>
            </div>
          </div>

          <!-- 操作按钮区域 -->
          <div v-if="hasActions" class="card-actions">
            <slot name="actions" :row="row" />
          </div>
        </div>

        <!-- 空状态 -->
        <n-empty
          v-if="!loading && (!data || data.length === 0)"
          description="暂无数据"
          class="empty-state"
        />
      </n-spin>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NDataTable, NSpin, NEmpty } from 'naive-ui'
import { isMobile } from '../utils/device.js'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  rowKey: {
    type: [String, Function],
    default: (row) => row.id
  },
  pagination: {
    type: [Object, Boolean],
    default: false
  },
  // 移动端卡片中显示哪些列（排除 actions 列）
  visibleColumns: {
    type: Array,
    default: null
  },
  // 自定义单元格文本提取函数 (row, column) => string
  getCellText: {
    type: Function,
    default: (row, col) => {
      const val = row[col.key]
      if (val === undefined || val === null) return ''
      return String(val)
    }
  }
})

defineEmits(['cardClick'])

// 手机端排除 actions 列
const mobileColumns = computed(() => {
  if (props.visibleColumns) return props.visibleColumns
  return props.columns.filter(col => col.key !== 'actions')
})

// 是否有 actions 列
const hasActions = computed(() => {
  return props.columns.some(col => col.key === 'actions')
})

// 手机端显示的数据（取前 50 条避免性能问题，配合分页使用）
const displayData = computed(() => {
  if (!props.data) return []
  return props.data.slice(0, 50)
})

// 获取 row key
const getRowKey = (row, index) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return row[props.rowKey] || index
}
</script>

<style scoped>
.card-list-view {
  width: 100%;
}

.desktop-table {
  width: 100%;
}

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 8px;
}

.data-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.data-card:active {
  transform: scale(0.98);
}

.card-body {
  padding: 14px 16px;
}

.card-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-field:last-child {
  border-bottom: none;
}

.card-field-label {
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
  margin-right: 12px;
  min-width: 60px;
}

.card-field-value {
  font-size: 14px;
  color: #333;
  text-align: right;
  word-break: break-all;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

/* 卡片中的图标按钮（与桌面端表格保持一致） */
.card-actions :deep(.icon-btn) {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.card-actions :deep(.icon-btn-primary) {
  color: #aaa;
}
.card-actions :deep(.icon-btn-primary:active) {
  color: #18a058;
  background-color: rgba(24, 160, 88, 0.1);
}

.card-actions :deep(.icon-btn-info) {
  color: #aaa;
}
.card-actions :deep(.icon-btn-info:active) {
  color: #2080f0;
  background-color: rgba(32, 128, 240, 0.1);
}

.card-actions :deep(.icon-btn-error) {
  color: #aaa;
}
.card-actions :deep(.icon-btn-error:active) {
  color: #f53f3f;
  background-color: rgba(245, 63, 63, 0.1);
}

.empty-state {
  padding: 40px 0;
}
</style>