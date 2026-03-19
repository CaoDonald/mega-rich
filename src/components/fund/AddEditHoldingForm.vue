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

    <n-form-item label="基金类型" path="fund_type">
      <n-select
        v-model:value="formData.fund_type"
        :options="fundTypeOptions"
        placeholder="请选择基金类型"
      />
    </n-form-item>

    <n-form-item label="持仓份额" path="shares">
      <n-input-number
        v-model:value="formData.shares"
        placeholder="请输入持仓份额"
        :min="0"
        :precision="2"
        style="width: 100%"
      >
        <template #suffix>份</template>
      </n-input-number>
    </n-form-item>

    <n-form-item label="平均成本" path="avg_cost">
      <n-input-number
        v-model:value="formData.avg_cost"
        placeholder="请输入平均成本"
        :min="0"
        :precision="4"
        style="width: 100%"
      >
        <template #suffix>元</template>
      </n-input-number>
    </n-form-item>

    <n-form-item label="购买日期" path="purchase_date">
      <n-date-picker
        v-model:value="formData.purchase_date"
        type="date"
        placeholder="请选择购买日期"
        style="width: 100%"
      />
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
      <n-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存' : '添加' }}
      </n-button>
    </div>
  </n-form>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { NForm, NFormItem, NInput, NInputNumber, NDatePicker, NSelect, NAutoComplete, NButton, useMessage } from 'naive-ui'
import { useFund } from '../../composables/useFund.js'

const props = defineProps({
  holding: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success', 'cancel'])

const message = useMessage()
const { searchFund, createHolding, updateHolding } = useFund()

const formRef = ref(null)
const searching = ref(false)
const submitting = ref(false)
const fundOptions = ref([])
const searchResults = ref([])

const isEdit = computed(() => !!props.holding)

// 基金类型选项
const fundTypeOptions = [
  { label: '股票型', value: '股票型' },
  { label: '混合型', value: '混合型' },
  { label: '债券型', value: '债券型' },
  { label: '指数型', value: '指数型' },
  { label: 'QDII', value: 'QDII' },
  { label: '货币型', value: '货币型' },
  { label: 'FOF', value: 'FOF' },
  { label: '其他', value: '其他' }
]

// 表单数据
const formData = reactive({
  fund_code: '',
  fund_name: '',
  fund_type: '',
  shares: null,
  avg_cost: null,
  purchase_date: null,
  notes: '',
  current_nav: null
})

// 表单验证规则
const rules = {
  fund_code: [
    { required: true, message: '请输入基金代码', trigger: 'blur' }
  ],
  fund_name: [
    { required: true, message: '请选择基金', trigger: 'blur' }
  ],
  shares: [
    { required: true, type: 'number', message: '请输入持仓份额', trigger: 'blur' }
  ],
  avg_cost: [
    { required: true, type: 'number', message: '请输入平均成本', trigger: 'blur' }
  ],
  purchase_date: [
    { required: true, type: 'number', message: '请选择购买日期', trigger: 'blur' }
  ]
}

// 初始化表单数据
if (props.holding) {
  Object.assign(formData, {
    fund_code: props.holding.fund_code,
    fund_name: props.holding.fund_name,
    fund_type: props.holding.fund_type,
    shares: props.holding.shares,
    avg_cost: props.holding.avg_cost,
    purchase_date: props.holding.purchase_date ? new Date(props.holding.purchase_date).getTime() : null,
    notes: props.holding.notes || '',
    current_nav: props.holding.current_nav
  })
}

// 搜索基金
let searchTimer = null
const handleSearch = async (value) => {
  if (!value || value.length < 2) {
    fundOptions.value = []
    return
  }

  // 防抖
  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      const result = await searchFund(value)
      if (result && result.data && result.data.length > 0) {
        searchResults.value = result.data
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
    // 尝试从搜索结果中获取净值
    if (fund.NAV) {
      formData.current_nav = parseFloat(fund.NAV)
    }
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
      fund_type: formData.fund_type || null,
      shares: formData.shares,
      avg_cost: formData.avg_cost,
      purchase_date: formData.purchase_date ? new Date(formData.purchase_date).toISOString().split('T')[0] : null,
      notes: formData.notes || null,
      current_nav: formData.current_nav || null
    }

    let result
    if (isEdit.value) {
      result = await updateHolding(props.holding.id, submitData)
    } else {
      result = await createHolding(submitData)
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
