<template>
  <div>
    <n-form label-width="80px">
      <n-form-item label="金额">
        <n-input v-model:value="form.amount" type="number" placeholder="请输入金额"/>
      </n-form-item>
      <n-form-item label="类型">
        <n-select v-model:value="form.type"
                  :options="typeOptions"/>
      </n-form-item>
      <n-form-item label="日期">
        <n-date-picker v-model:value="form.record_date"/>
      </n-form-item>
      <n-form-item label="描述">
        <n-input v-model:value="form.description" type="textarea"/>
      </n-form-item>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
        <n-button @click="$emit('cancel')">取消</n-button>
        <n-button type="primary" @click="handleSubmit">提交</n-button>
      </div>
    </n-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['record'])
const emit = defineEmits(['submit', 'cancel'])

const form = ref(props.record ? { ...props.record } : { 
  amount: '10000', 
  type: 'salary', 
  record_date: new Date(), 
  description: '' 
})

const typeOptions = [
  { label: '月薪', value: 'salary' },
  { label: '年终奖', value: 'bonus' }
]

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>