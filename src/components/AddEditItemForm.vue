<template>
  <div class="form-container">
    <n-form label-placement="top">
      <n-form-item label="一级分类">
        <n-select
          v-model:value="selectedCategory"
          placeholder="选择一级分类"
          :options="categoryOptions"
          @update:value="handleCategoryChange"
          style="width: 100%"
        />
      </n-form-item>
      
      <n-form-item label="二级分类">
        <n-select
          v-model:value="formData.subcategory_id"
          placeholder="选择二级分类"
          :options="subcategoryOptions"
          :disabled="!selectedCategory"
        />
      </n-form-item>
      
      <n-form-item label="金额（元）">
        <n-input-number
          v-model:value="formData.amount"
          placeholder="请输入金额"
          :step="0.01"
          :precision="2"
        />
      </n-form-item>
      
      <n-form-item label="记录日期">
        <n-date-picker
          v-model:value="formData.record_date"
          type="date"
          placeholder="选择记录日期"
        />
      </n-form-item>
      
      <n-form-item label="描述">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          placeholder="请输入描述信息"
          :autosize="{ minRows: 3, maxRows: 5 }"
        />
      </n-form-item>
      
      <div class="form-actions">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleSubmit">
          {{ item ? '更新' : '保存' }}
        </n-button>
      </div>
    </n-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'

// 获取消息实例
const message = useMessage()

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  subcategories: {
    type: Array,
    required: true
  },
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel', 'manage-categories'])

const formData = ref({
  subcategory_id: props.item?.subcategory_id || null,
  amount: props.item?.amount || 0,
  record_date: props.item?.record_date ? new Date(props.item.record_date) : new Date(),
  description: props.item?.description || ''
})

const selectedCategory = ref(null)

onMounted(() => {
  if (props.item) {
    const subcategory = props.subcategories.find(s => s.id === props.item.subcategory_id)
    if (subcategory) {
      selectedCategory.value = subcategory.category_id
    }
  }
})

const categoryOptions = computed(() => {
  return props.categories.map(c => ({ label: c.name, value: c.id }))
})

const subcategoryOptions = computed(() => {
  if (!selectedCategory.value) {
    return []
  }
  return props.subcategories
    .filter(s => s.category_id === selectedCategory.value)
    .map(s => ({ label: s.name, value: s.id }))
})

const handleCategoryChange = (value) => {
  selectedCategory.value = value
  formData.value.subcategory_id = null
}

const handleSubmit = async () => {
  if (!formData.value.subcategory_id || formData.value.amount === null || formData.value.amount === undefined) {
    message.error('请填写完整的表单信息')
    return
  }
  
  emit('submit', {
    ...formData.value,
    id: props.item?.id
  })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.form-container {
  max-width: 500px;
  margin: 0 auto;
}

:deep(.n-form-item) {
  margin-bottom: 20px;
}

:deep(.n-form-item-label) {
  font-weight: 600;
  color: var(--custom-color);
  font-size: 0.95rem;
}

:deep(.n-select),
:deep(.n-input-number),
:deep(.n-date-picker),
:deep(.n-input) {
  transition: all 0.3s ease;
  border-radius: var(--custom-border-radius);
  border: var(--custom-border);
}

:deep(.n-select:hover),
:deep(.n-input-number:hover),
:deep(.n-date-picker:hover),
:deep(.n-input:hover) {
  border-color: var(--custom-color-brand);
  box-shadow: 0 0 0 2px rgba(36, 180, 126, 0.1);
}

:deep(.n-select:focus),
:deep(.n-input-number:focus),
:deep(.n-date-picker:focus),
:deep(.n-input:focus) {
  border-color: var(--custom-color-brand);
  box-shadow: 0 0 0 2px rgba(36, 180, 126, 0.2);
}

:deep(.n-select-dropdown),
:deep(.n-date-picker-dropdown) {
  border-radius: var(--custom-border-radius);
  box-shadow: var(--custom-box-shadow);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.form-actions :deep(.n-button) {
  transition: all 0.3s ease;
  border-radius: var(--custom-border-radius);
  font-weight: 500;
  padding: 8px 16px;
}

.form-actions :deep(.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.form-actions :deep(.n-button:active) {
  transform: translateY(0);
}

.form-actions :deep(.n-button--primary) {
  background-color: var(--custom-color-brand);
  border-color: var(--custom-color-brand);
}

.form-actions :deep(.n-button--primary:hover) {
  background-color: var(--custom-color-brand-hover);
  border-color: var(--custom-color-brand-hover);
}

.category-select-container {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.category-select-container :deep(.n-button) {
  margin-top: 2px;
  white-space: nowrap;
}
</style>