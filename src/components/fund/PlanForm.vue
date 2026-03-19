<template>
  <div class="plan-form">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
      require-mark-placement="right-hanging"
    >
      <!-- 基金搜索 -->
      <n-form-item label="选择基金" path="fund_code">
        <div class="fund-search-wrapper">
          <n-input
            v-model:value="fundKeyword"
            placeholder="输入基金代码或名称搜索"
            clearable
            @input="handleFundSearch"
          >
            <template #prefix>
              <n-icon :component="SearchOutline" />
            </template>
          </n-input>

          <!-- 搜索结果下拉 -->
          <div v-if="fundSearchResults.length > 0" class="search-dropdown">
            <div
              v-for="fund in fundSearchResults"
              :key="fund.FCODE"
              class="search-item"
              @click="selectFund(fund)"
            >
              <span class="fund-code">{{ fund.FCODE }}</span>
              <span class="fund-name">{{ fund.SHORTNAME }}</span>
            </div>
          </div>
        </div>
      </n-form-item>

      <!-- 已选基金显示 -->
      <div v-if="formData.fund_code" class="selected-fund">
        <n-tag type="success" closable @close="clearFund">
          {{ formData.fund_code }} - {{ formData.fund_name }}
        </n-tag>
      </div>

      <!-- 计划名称 -->
      <n-form-item label="计划名称" path="plan_name">
        <n-input
          v-model:value="formData.plan_name"
          placeholder="例如：沪深300定投"
          maxlength="50"
          show-count
        />
      </n-form-item>

      <!-- 定投类型 -->
      <n-form-item label="定投类型" path="plan_type">
        <n-radio-group v-model:value="formData.plan_type">
          <n-radio value="fixed">定额定投</n-radio>
          <n-radio value="ratio">定比定投</n-radio>
        </n-radio-group>
      </n-form-item>

      <!-- 定投金额 -->
      <n-form-item label="定投金额（元）" path="amount">
        <n-input-number
          v-model:value="formData.amount"
          :min="100"
          :max="1000000"
          :step="100"
          placeholder="请输入定投金额"
          style="width: 100%"
        >
          <template #prefix>¥</template>
        </n-input-number>
      </n-form-item>

      <!-- 定投频率 -->
      <n-form-item label="定投频率" path="frequency">
        <n-select
          v-model:value="formData.frequency"
          :options="frequencyOptions"
          placeholder="请选择定投频率"
        />
      </n-form-item>

      <!-- 开始日期 -->
      <n-form-item label="开始日期" path="start_date">
        <n-date-picker
          v-model:value="formData.start_date"
          type="date"
          placeholder="选择开始日期"
          style="width: 100%"
          :is-date-disabled="(ts) => ts < Date.now() - 86400000"
        />
      </n-form-item>

      <!-- 结束日期 -->
      <n-form-item label="结束日期（可选）" path="end_date">
        <n-date-picker
          v-model:value="formData.end_date"
          type="date"
          placeholder="不设置则长期有效"
          style="width: 100%"
          clearable
          :is-date-disabled="(ts) => ts < formData.start_date"
        />
      </n-form-item>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '保存' : '创建计划' }}
        </n-button>
      </div>
    </n-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { NForm, NFormItem, NInput, NInputNumber, NSelect, NRadioGroup, NRadio, NDatePicker, NButton, NTag, NIcon, useMessage } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import { useFund } from '../../composables/useFund.js'

const props = defineProps({
  plan: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success', 'cancel'])
const message = useMessage()

const { searchFund } = useFund()

const formRef = ref(null)
const loading = ref(false)
const isEdit = ref(!!props.plan)

// 基金搜索
const fundKeyword = ref('')
const fundSearchResults = ref([])
let searchTimer = null

// 表单数据
const formData = reactive({
  fund_code: '',
  fund_name: '',
  plan_name: '',
  plan_type: 'fixed',
  amount: null,
  frequency: 'monthly',
  start_date: Date.now(),
  end_date: null
})

// 如果是编辑模式，填充数据
if (props.plan) {
  Object.assign(formData, {
    fund_code: props.plan.fund_code,
    fund_name: props.plan.fund_name,
    plan_name: props.plan.plan_name,
    plan_type: props.plan.plan_type,
    amount: props.plan.amount,
    frequency: props.plan.frequency,
    start_date: new Date(props.plan.start_date).getTime(),
    end_date: props.plan.end_date ? new Date(props.plan.end_date).getTime() : null
  })
}

// 定投频率选项
const frequencyOptions = [
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' }
]

// 表单验证规则
const rules = {
  fund_code: {
    required: true,
    message: '请选择基金',
    trigger: 'change'
  },
  plan_name: {
    required: true,
    message: '请输入计划名称',
    trigger: 'blur'
  },
  plan_type: {
    required: true,
    message: '请选择定投类型',
    trigger: 'change'
  },
  amount: {
    required: true,
    type: 'number',
    message: '请输入定投金额',
    trigger: 'blur'
  },
  frequency: {
    required: true,
    message: '请选择定投频率',
    trigger: 'change'
  },
  start_date: {
    required: true,
    type: 'number',
    message: '请选择开始日期',
    trigger: 'change'
  }
}

// 基金搜索防抖
const handleFundSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!fundKeyword.value || fundKeyword.value.trim().length === 0) {
    fundSearchResults.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    try {
      const result = await searchFund(fundKeyword.value.trim())
      if (result && result.data && result.data.datas) {
        fundSearchResults.value = result.data.datas.slice(0, 10)
      }
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }, 500)
}

// 选择基金
const selectFund = (fund) => {
  formData.fund_code = fund.FCODE
  formData.fund_name = fund.SHORTNAME
  fundKeyword.value = ''
  fundSearchResults.value = []
}

// 清除基金选择
const clearFund = () => {
  formData.fund_code = ''
  formData.fund_name = ''
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    loading.value = true

    const planData = {
      fund_code: formData.fund_code,
      fund_name: formData.fund_name,
      plan_name: formData.plan_name,
      plan_type: formData.plan_type,
      amount: formData.amount,
      frequency: formData.frequency,
      start_date: new Date(formData.start_date).toISOString().split('T')[0],
      end_date: formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : null,
      status: 'active',
      total_invested: 0,
      total_shares: 0
    }

    emit('success', planData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.plan-form {
  padding: var(--spacing-md);
}

.fund-search-wrapper {
  position: relative;
  width: 100%;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: var(--color-bg-base);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  margin-top: var(--spacing-xs);
}

.search-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: background var(--transition-base);
}

.search-item:hover {
  background: var(--color-bg-secondary);
}

.search-item .fund-code {
  font-family: monospace;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  min-width: 80px;
}

.search-item .fund-name {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.selected-fund {
  margin-bottom: var(--spacing-lg);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
