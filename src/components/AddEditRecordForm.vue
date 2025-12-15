<template>
  <div class="form-container">
    <n-form label-placement="top">
      <n-form-item label="记录类型">
        <n-select
          v-model:value="formData.type"
          :options="typeOptions"
          placeholder="选择记录类型"
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
          {{ record ? '更新' : '保存' }}
        </n-button>
      </div>
    </n-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

// 获取消息实例
const message = useMessage()

const props = defineProps({
  record: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const typeOptions = [
  { label: '月薪', value: 'salary' },
  { label: '年终奖', value: 'bonus' }
]

const formData = ref({
  amount: props.record?.amount || 0,
  type: props.record?.type || 'salary',
  record_date: props.record?.record_date ? new Date(props.record.record_date) : new Date(),
  description: props.record?.description || ''
})

const handleSubmit = async () => {
  if (formData.value.amount <= 0) {
    message.error('请填写有效的金额')
    return
  }
  
  emit('submit', {
    ...formData.value,
    id: props.record?.id
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