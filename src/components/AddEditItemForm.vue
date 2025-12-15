<template>
  <div class="form-container">
    <n-form label-placement="top">
      <n-form-item label="一级分类">
        <n-select
          v-model:value="selectedCategory"
          placeholder="选择一级分类"
          :options="categoryOptions"
          @update:value="handleCategoryChange"
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
          :min="0.01"
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

const emit = defineEmits(['submit', 'cancel'])

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
  if (!formData.value.subcategory_id || formData.value.amount <= 0) {
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
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>