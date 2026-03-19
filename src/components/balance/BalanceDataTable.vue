<template>
  <Card title="资金条目列表">
    <template #extra>
      <n-button text type="primary" @click="$emit('add-item')">
        <template #icon>
          <n-icon><AddOutline /></n-icon>
        </template>
        新增条目
      </n-button>
    </template>

    <n-data-table
      :columns="columns"
      :data="data"
      :pagination="pagination"
      :loading="loading"
      :row-key="row => row.id"
      size="small"
    />
  </Card>
</template>

<script setup>
import { h } from 'vue'
import { NButton, NIcon, NDataTable, NTag } from 'naive-ui'
import { EyeOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { AddOutline } from '@vicons/ionicons5'
import Card from '../base/Card.vue'

defineProps({
  data: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({
      pageSize: 20
    })
  }
})

const emit = defineEmits(['add-item', 'view', 'edit', 'delete'])

const columns = [
  {
    title: '记录日期',
    key: 'record_date',
    width: 120,
    render: (row) => {
      const date = new Date(row.record_date)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
  },
  {
    title: '一级分类',
    key: 'category_name',
    width: 120
  },
  {
    title: '二级分类',
    key: 'subcategory_name',
    width: 120
  },
  {
    title: '金额',
    key: 'amount',
    width: 120,
    render: (row) => {
      const isPositive = row.amount >= 0
      return h(
        'span',
        {
          style: {
            color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
            fontWeight: '600'
          }
        },
        `${isPositive ? '+' : ''}${row.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      )
    }
  },
  {
    title: '环比',
    key: 'mom_growth_rate',
    width: 100,
    render: (row) => {
      if (row.mom_growth_rate === null || row.mom_growth_rate === undefined) return '-'
      const isPositive = row.mom_growth_rate >= 0
      return h(
        'span',
        {
          style: {
            color: isPositive ? 'var(--color-success)' : 'var(--color-danger)'
          }
        },
        `${isPositive ? '+' : ''}${row.mom_growth_rate.toFixed(2)}%`
      )
    }
  },
  {
    title: '同比',
    key: 'yoy_growth_rate',
    width: 100,
    render: (row) => {
      if (row.yoy_growth_rate === null || row.yoy_growth_rate === undefined) return '-'
      const isPositive = row.yoy_growth_rate >= 0
      return h(
        'span',
        {
          style: {
            color: isPositive ? 'var(--color-success)' : 'var(--color-danger)'
          }
        },
        `${isPositive ? '+' : ''}${row.yoy_growth_rate.toFixed(2)}%`
      )
    }
  },
  {
    title: '备注',
    key: 'description',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (row) => {
      return h(
        'div',
        {
          style: {
            display: 'flex',
            gap: 'var(--spacing-xs)'
          }
        },
        [
          h(
            NButton,
            {
              size: 'small',
              onClick: () => emit('view', row)
            },
            {
              icon: () => h(NIcon, null, { default: () => h(EyeOutline) })
            }
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => emit('edit', row)
            },
            {
              icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
            }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              onClick: () => emit('delete', row)
            },
            {
              icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
            }
          )
        ]
      )
    }
  }
]
</script>

<style scoped>
/* 样式已通过 Card 组件处理 */
</style>
