<template>
  <div class="item-detail">
    <div class="detail-row">
      <span class="detail-label">一级分类：</span>
      <span class="detail-value">{{ categoryName }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">二级分类：</span>
      <span class="detail-value">{{ subcategoryName }}</span>
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
      <span class="detail-label">金额变化：</span>
      <span class="detail-value">{{ item.amount_change || 0 }}元</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">百分比变化：</span>
      <span class="detail-value">{{ item.percent_change || 0 }}%</span>
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
  },
  categories: {
    type: Array,
    required: true
  },
  subcategories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close'])

const subcategory = computed(() => {
  return props.subcategories.find(s => s.id === props.item.subcategory_id)
})

const category = computed(() => {
  if (!subcategory.value) return null
  return props.categories.find(c => c.id === subcategory.value.category_id)
})

const categoryName = computed(() => {
  return category.value?.name || ''
})

const subcategoryName = computed(() => {
  return subcategory.value?.name || ''
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
.item-detail {
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