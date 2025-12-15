<template>
  <div class="record-detail">
    <div class="detail-row">
      <span class="detail-label">记录类型：</span>
      <span class="detail-value">{{ recordTypeLabel }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">金额：</span>
      <span class="detail-value">{{ item.amount }}元</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">记录日期：</span>
      <span class="detail-value">{{ formattedRecordDate }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">同比增长率：</span>
      <span class="detail-value">{{ item.yoy_growth_rate || 0 }}%</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">环比增长率：</span>
      <span class="detail-value">{{ item.mom_growth_rate || 0 }}%</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">描述：</span>
      <span class="detail-value">{{ item.description || '无' }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">创建时间：</span>
      <span class="detail-value">{{ formattedCreatedAt }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">更新时间：</span>
      <span class="detail-value">{{ formattedUpdatedAt }}</span>
    </div>
    <div class="form-actions">
      <n-button type="primary" @click="handleClose">关闭</n-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const recordTypeLabel = computed(() => {
  return props.item.type === 'salary' ? '月薪' : '年终奖'
})

const formattedRecordDate = computed(() => {
  return new Date(props.item.record_date).toLocaleDateString()
})

const formattedCreatedAt = computed(() => {
  return new Date(props.item.created_at).toLocaleString()
})

const formattedUpdatedAt = computed(() => {
  return new Date(props.item.updated_at).toLocaleString()
})

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.record-detail {
  max-width: 500px;
}

.detail-row {
  margin-bottom: 15px;
}

.detail-label {
  display: inline-block;
  width: 120px;
  font-weight: bold;
}

.detail-value {
  display: inline-block;
  vertical-align: top;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>