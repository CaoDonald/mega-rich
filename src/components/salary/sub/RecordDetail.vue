<template>
  <div>
    <div v-for="(value, key) in item" :key="key" style="margin:10px 0;">
      <span style="font-weight:bold;margin-right:10px;">{{ key }}:</span>
      <span>{{ formatValue(key, value) }}</span>
    </div>
    <n-button style="margin-top:20px;" @click="$emit('close')">关闭</n-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['item'])
defineEmits(['close'])

const formatValue = (key, value) => {
  if (key === 'amount') {
    return `${value}元`
  } else if (key === 'type') {
    return value === 'salary' ? '月薪' : '年终奖'
  } else if (key === 'record_date') {
    return new Date(value).toLocaleDateString()
  } else if (key === 'created_at' || key === 'updated_at') {
    return new Date(value).toLocaleString()
  }
  return value
}
</script>