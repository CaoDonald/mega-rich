<template>
  <n-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-placement="top"
    require-mark-placement="right-hanging"
  >
    <n-form-item label="基金代码" path="fund_code">
      <n-auto-complete
        v-model:value="formData.fund_code"
        :options="fundOptions"
        :loading="searching"
        placeholder="输入基金代码或名称搜索"
        clearable
        @update:value="handleSearch"
        @select="handleSelectFund"
      />
    </n-form-item>

    <n-form-item label="基金名称" path="fund_name">
      <n-input
        v-model:value="formData.fund_name"
        placeholder="选择基金后自动填充"
        :disabled="true"
      />
    </n-form-item>

    <n-form-item label="交易类型" path="transaction_type">
      <n-radio-group v-model:value="formData.transaction_type">
        <n-radio value="buy">买入</n-radio>
        <n-radio value="sell">卖出</n-radio>
      </n-radio-group>
    </n-form-item>

    <n-form-item label="交易份额" path="shares">
      <n-input-number
        v-model:value="formData.shares"
        placeholder="请输入交易份额"
        :min="0"
        :precision="2"
        style="width: 100%"
      >
        <template #suffix>份</template>
      </n-input-number>
    </n-form-item>

    <n-form-item label="交易价格" path="price">
      <n-input-number
        v-model:value="formData.price"
        placeholder="请输入交易价格"
        :min="0"
        :precision="4"
        style="width: 100%"
      >
        <template #suffix>元</template>
      </n-input-number>
    </n-form-item>

    <n-form-item label="交易日期" path="transaction_date">
      <n-date-picker
        v-model:value="formData.transaction_date"
        type="date"
        placeholder="请选择交易日期"
        style="width: 100%"
      />
    </n-form-item>

    <n-form-item label="手续费" path="fee">
      <n-input-number
        v-model:value="formData.fee"
        placeholder="可选，输入手续费"
        :min="0"
        :precision="2"
        style="width: 100%"
      >
        <template #suffix>元</template>
      </n-input-number>
    </n-form-item>

    <n-form-item label="备注" path="notes">
      <n-input
        v-model:value="formData.notes"
        type="textarea"
        placeholder="可选，添加备注信息"
        :rows="3"
      />
    </n-form-item>

    <div class="form-actions">
      <n-button @click="handleCancel">取消</n-button>
      <n-button
        :type="formData.transaction_type === 'buy' ? 'success' : 'error'"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ isEdit ? '保存' : (formData.transaction_type === 'buy' ? '买入' : '卖出') }}
      </n-button>
    </div>
  </n-form>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { NForm, NFormItem, NInput, NInputNumber, NDatePicker, NAutoComplete, NRadioGroup, NRadio, NButton, useMessage } from 'naive-ui'
import { useFund } from '../../composables/useFund.js'

const props = defineProps({
  transaction: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success', 'cancel'])

const message = useMessage()
const { searchFund, createTransaction, updateTransaction } = useFund()

const formRef = ref(null)
const searching = ref(false)
const submitting = ref(false)
const fundOptions = ref([])

const isEdit = computed(() => !!props.transaction)

// 表单数据
const formData = reactive({
  fund_code: '',
  fund_name: '',
  transaction_type: 'buy',
  shares: null,
  price: null,
  transaction_date: null,
  fee: 0,
  notes: ''
})

// 表单验证规则
const rules = {
  fund_code: [
    { required: true, message: '请输入基金代码', trigger: 'blur' }
  ],
  fund_name: [
    { required: true, message: '请选择基金', trigger: 'blur' }
  ],
  transaction_type: [
    { required: true, message: '请选择交易类型', trigger: 'change' }
  ],
  shares: [
    { required: true, type: 'number', message: '请输入交易份额', trigger: 'blur' }
  ],
  price: [
    { required: true, type: 'number', message: '请输入交易价格', trigger: 'blur' }
  ],
  transaction_date: [
    { required: true, type: 'number', message: '请选择交易日期', trigger: 'blur' }
  ]
}

// 初始化表单数据
if (props.transaction) {
  Object.assign(formData, {
    fund_code: props.transaction.fund_code,
    fund_name: props.transaction.fund_name,
    transaction_type: props.transaction.transaction_type,
    shares: props.transaction.shares,
    price: props.transaction.price,
    transaction_date: props.transaction.transaction_date ? new Date(props.transaction.transaction_date).getTime() : null,
    fee: props.transaction.fee || 0,
    notes: props.transaction.notes || ''
  })
}

// 搜索基金
let searchTimer = null
const handleSearch = async (value) => {
  if (!value || value.length < 2) {
    fundOptions.value = []
    return
  }

  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      const result = await searchFund(value)
      if (result && result.data && result.data.length > 0) {
        fundOptions.value = result.data.map(fund => ({
          label: `${fund.FCODE} - ${fund.SHORTNAME}`,
          value: fund.FCODE,
          fund: fund
        }))
      } else {
        fundOptions.value = []
      }
    } catch (error) {
      console.error('搜索基金失败:', error)
      message.error('搜索基金失败')
      fundOptions.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

// 选择基金
const handleSelectFund = (value, option) => {
  if (option && option.fund) {
    const fund = option.fund
    formData.fund_code = fund.FCODE
    formData.fund_name = fund.SHORTNAME
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    submitting.value = true

    const submitData = {
      fund_code: formData.fund_code,
      fund_name: formData.fund_name,
      transaction_type: formData.transaction_type,
      shares: formData.shares,
      price: formData.price,
      transaction_date: formData.transaction_date ? new Date(formData.transaction_date).toISOString().split('T')[0] : null,
      fee: formData.fee || 0,
      notes: formData.notes || null
    }

    let result
    if (isEdit.value) {
      result = await updateTransaction(props.transaction.id, submitData)
    } else {
      result = await createTransaction(submitData)
    }

    if (result.success) {
      message.success(isEdit.value ? '更新成功' : '添加成功')
      emit('success', result.data)
    } else {
      message.error(result.error || '操作失败')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
}
</style>
