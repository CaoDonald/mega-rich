<template>
  <div class="add-edit-form">
    <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="top">
      <n-form-item label="基金代码" path="fund_code">
        <n-input
          v-model:value="formData.fund_code"
          placeholder="输入基金代码搜索"
          @blur="searchFund"
          @keyup.enter="searchFund"
        >
          <template #prefix>
            <n-icon><SearchOutline /></n-icon>
          </template>
        </n-input>
      </n-form-item>

      <n-form-item label="基金名称" path="fund_name" v-if="formData.fund_name">
        <n-input v-model:value="formData.fund_name" disabled />
      </n-form-item>

      <n-form-item label="基金类型" path="fund_type" v-if="formData.fund_type">
        <n-input :value="fundTypeName" disabled />
      </n-form-item>

      <n-form-item label="持仓份额" path="shares">
        <n-input-number
          v-model:value="formData.shares"
          :precision="2"
          :min="0"
          :step="0.01"
          style="width: 100%"
          placeholder="请输入持仓份额"
        />
      </n-form-item>

      <n-form-item label="平均成本" path="avg_cost">
        <n-input-number
          v-model:value="formData.avg_cost"
          :precision="4"
          :min="0"
          :step="0.0001"
          style="width: 100%"
          placeholder="请输入平均成本"
        >
          <template #prefix>¥</template>
        </n-input-number>
      </n-form-item>

      <n-form-item label="当前净值" path="current_nav">
        <n-input-number
          v-model:value="formData.current_nav"
          :precision="4"
          :min="0"
          :step="0.0001"
          style="width: 100%"
          placeholder="请输入当前净值"
        >
          <template #prefix>¥</template>
        </n-input-number>
      </n-form-item>

      <n-form-item label="购买日期" path="buy_date">
        <n-date-picker
          v-model:value="formData.buy_date"
          type="date"
          style="width: 100%"
          placeholder="选择购买日期"
        />
      </n-form-item>

      <n-form-item label="备注">
        <n-input
          v-model:value="formData.remark"
          type="textarea"
          placeholder="添加备注（可选）"
          :rows="3"
        />
      </n-form-item>

      <div class="form-actions">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存修改' : '添加持仓' }}
        </n-button>
      </div>
    </n-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { SearchOutline } from '@vicons/ionicons5'
import { supabase } from '../../../supabase.js'

const props = defineProps({
  holding: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)
const submitting = ref(false)

const isEdit = computed(() => !!props.holding)

const fundTypeMap = {
  25: '股票型',
  27: '混合型',
  31: '债券型',
  35: '货币型',
  6: 'QDII',
  26: '指数型'
}

const fundTypeName = computed(() => {
  return fundTypeMap[formData.value.fund_type] || '未知类型'
})

const formData = ref({
  fund_code: '',
  fund_name: '',
  fund_type: null,
  shares: null,
  avg_cost: null,
  current_nav: null,
  buy_date: null,
  remark: ''
})

const formRules = {
  fund_code: { required: true, message: '请输入基金代码' },
  shares: { required: true, type: 'number', message: '请输入持仓份额', trigger: 'blur' },
  avg_cost: { required: true, type: 'number', message: '请输入平均成本', trigger: 'blur' },
  current_nav: { required: true, type: 'number', message: '请输入当前净值', trigger: 'blur' }
}

watch(() => props.holding, (newHolding) => {
  if (newHolding) {
    formData.value = {
      fund_code: newHolding.fund_code || '',
      fund_name: newHolding.fund_name || '',
      fund_type: newHolding.fund_type || null,
      shares: newHolding.shares || null,
      avg_cost: newHolding.avg_cost || null,
      current_nav: newHolding.current_nav || null,
      buy_date: newHolding.buy_date ? new Date(newHolding.buy_date).getTime() : null,
      remark: newHolding.remark || ''
    }
  }
}, { immediate: true })

const searchFund = async () => {
  if (!formData.value.fund_code) return

  try {
    const { data, error } = await supabase.functions.invoke('fund-api', {
      body: {
        action_name: 'fundMNDetailInformation',
        FCODE: formData.value.fund_code
      }
    })

    if (error) {
      console.error('搜索基金失败:', error)
      return
    }

    if (data && data.Data) {
      const fundInfo = data.Data
      formData.value.fund_name = fundInfo.FSHORTNAME || ''
      formData.value.fund_type = fundInfo.FTYPE || null
      formData.value.current_nav = fundInfo.NAV || fundInfo.DWJZ || null
    }
  } catch (err) {
    console.error('搜索基金错误:', err)
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    submitting.value = true
    
    const submitData = {
      fund_code: formData.value.fund_code,
      fund_name: formData.value.fund_name,
      fund_type: formData.value.fund_type,
      shares: formData.value.shares,
      avg_cost: formData.value.avg_cost,
      current_nav: formData.value.current_nav,
      buy_date: formData.value.buy_date ? new Date(formData.value.buy_date).toISOString() : null,
      remark: formData.value.remark,
      profit: formData.value.current_nav && formData.value.avg_cost
        ? (formData.value.current_nav - formData.value.avg_cost) * formData.value.shares
        : 0,
      profit_rate: formData.value.current_nav && formData.value.avg_cost
        ? ((formData.value.current_nav - formData.value.avg_cost) / formData.value.avg_cost * 100)
        : 0
    }

    emit('submit', submitData)
  } catch (err) {
    console.error('验证失败:', err)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.add-edit-form {
  padding: 20px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}
</style>
