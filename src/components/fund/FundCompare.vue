<template>
  <div class="fund-compare">
    <div v-if="funds.length === 0" class="empty-state">
      <p>暂无对比基金</p>
      <p class="hint">请添加基金进行对比</p>
    </div>

    <div v-else class="compare-table-wrapper">
      <table class="compare-table">
        <thead>
          <tr>
            <th class="label-col">对比项</th>
            <th v-for="fund in funds" :key="fund.code" class="fund-col">
              <div class="fund-header">
                <div class="fund-info">
                  <div class="fund-code">{{ fund.code }}</div>
                  <div class="fund-name">{{ fund.name }}</div>
                </div>
                <n-button
                  text
                  size="small"
                  @click="handleRemove(fund.code)"
                >
                  <template #icon>
                    <n-icon :component="CloseOutline" />
                  </template>
                </n-button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-col">基金类型</td>
            <td v-for="fund in funds" :key="fund.code">
              {{ fund.type || '--' }}
            </td>
          </tr>
          <tr>
            <td class="label-col">基金规模</td>
            <td v-for="fund in funds" :key="fund.code">
              {{ formatScale(fund.scale) }}
            </td>
          </tr>
          <tr>
            <td class="label-col">成立日期</td>
            <td v-for="fund in funds" :key="fund.code">
              {{ fund.foundDate || '--' }}
            </td>
          </tr>
          <tr>
            <td class="label-col">单位净值</td>
            <td v-for="fund in funds" :key="fund.code">
              {{ fund.nav || '--' }}
            </td>
          </tr>
          <tr>
            <td class="label-col">累计净值</td>
            <td v-for="fund in funds" :key="fund.code">
              {{ fund.totalNav || '--' }}
            </td>
          </tr>
          <tr>
            <td class="label-col">近1月收益率</td>
            <td v-for="fund in funds" :key="fund.code">
              <span :class="getReturnClass(fund.return1m)">
                {{ formatReturn(fund.return1m) }}
              </span>
            </td>
          </tr>
          <tr>
            <td class="label-col">近3月收益率</td>
            <td v-for="fund in funds" :key="fund.code">
              <span :class="getReturnClass(fund.return3m)">
                {{ formatReturn(fund.return3m) }}
              </span>
            </td>
          </tr>
          <tr>
            <td class="label-col">近6月收益率</td>
            <td v-for="fund in funds" :key="fund.code">
              <span :class="getReturnClass(fund.return6m)">
                {{ formatReturn(fund.return6m) }}
              </span>
            </td>
          </tr>
          <tr>
            <td class="label-col">近1年收益率</td>
            <td v-for="fund in funds" :key="fund.code">
              <span :class="getReturnClass(fund.return1y)">
                {{ formatReturn(fund.return1y) }}
              </span>
            </td>
          </tr>
          <tr>
            <td class="label-col">基金经理</td>
            <td v-for="fund in funds" :key="fund.code">
              {{ fund.manager || '--' }}
            </td>
          </tr>
          <tr>
            <td class="label-col">管理费率</td>
            <td v-for="fund in funds" :key="fund.code">
              {{ formatRate(fund.managementFee) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { NButton, NIcon } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'

const props = defineProps({
  funds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['remove'])

const handleRemove = (code) => {
  emit('remove', code)
}

const formatScale = (scale) => {
  if (!scale) return '--'
  const num = parseFloat(scale)
  if (isNaN(num)) return '--'
  if (num >= 100) {
    return `${(num / 100).toFixed(2)}亿`
  }
  return `${num.toFixed(2)}亿`
}

const formatReturn = (value) => {
  if (value === null || value === undefined || value === '--') return '--'
  const num = parseFloat(value)
  if (isNaN(num)) return '--'
  return num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`
}

const formatRate = (rate) => {
  if (!rate) return '--'
  const num = parseFloat(rate)
  if (isNaN(num)) return '--'
  return `${num.toFixed(2)}%`
}

const getReturnClass = (value) => {
  if (value === null || value === undefined || value === '--') return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return num > 0 ? 'positive' : num < 0 ? 'negative' : ''
}
</script>

<style scoped>
.fund-compare {
  width: 100%;
}

.empty-state {
  padding: var(--spacing-3xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state p {
  margin: 0;
  font-size: var(--font-size-base);
}

.empty-state .hint {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.compare-table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-bg-base);
}

.compare-table th,
.compare-table td {
  padding: var(--spacing-lg);
  text-align: left;
  border-bottom: 1px solid var(--color-gray-200);
}

.compare-table thead th {
  background: var(--color-bg-secondary);
  font-weight: 600;
  color: var(--color-text-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.compare-table tbody tr:last-child td {
  border-bottom: none;
}

.compare-table tbody tr:hover {
  background: var(--color-bg-secondary);
}

.label-col {
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
  min-width: 120px;
}

.fund-col {
  min-width: 180px;
}

.fund-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.fund-info {
  flex: 1;
  min-width: 0;
}

.fund-code {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-family: monospace;
  margin-bottom: var(--spacing-xs);
}

.fund-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.positive {
  color: var(--color-primary);
  font-weight: 500;
}

.negative {
  color: var(--color-danger);
  font-weight: 500;
}

@media (max-width: 768px) {
  .compare-table th,
  .compare-table td {
    padding: var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .label-col {
    min-width: 100px;
  }

  .fund-col {
    min-width: 150px;
  }

  .fund-name {
    font-size: var(--font-size-xs);
  }
}
</style>
