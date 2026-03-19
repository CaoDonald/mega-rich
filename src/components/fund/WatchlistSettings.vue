<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="净值提醒设置"
    :style="{ maxWidth: '500px' }"
    @after-leave="handleClose"
  >
    <div class="settings-content">
      <div class="fund-info">
        <span class="fund-code">{{ fundItem?.fund_code }}</span>
        <span class="fund-name">{{ fundItem?.fund_name }}</span>
      </div>

      <n-form
        ref="formRef"
        :model="formData"
        label-placement="left"
        label-width="120"
      >
        <n-form-item label="启用提醒">
          <n-switch v-model:value="formData.alert_enabled" />
        </n-form-item>

        <n-form-item label="涨幅提醒 (%)">
          <n-input-number
            v-model:value="formData.alert_rise_threshold"
            :disabled="!formData.alert_enabled"
            :min="0"
            :max="100"
            :step="0.5"
            placeholder="例如: 3"
          >
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="跌幅提醒 (%)">
          <n-input-number
            v-model:value="formData.alert_fall_threshold"
            :disabled="!formData.alert_enabled"
            :min="0"
            :max="100"
            :step="0.5"
            placeholder="例如: 3"
          >
            <template #suffix>%</template>
          </n-input-number>
        </n-form-item>
      </n-form>

      <div class="settings-tip">
        <n-icon :component="InformationCircleOutline" />
        <span>当基金涨跌幅达到设定阈值时，系统将发送提醒通知</span>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" :loading="saving" @click="handleSave">保存</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { NModal, NForm, NFormItem, NSwitch, NInputNumber, NButton, NIcon, useMessage } from 'naive-ui'
import { InformationCircleOutline } from '@vicons/ionicons5'
import SupabaseService from '../../services/SupabaseService.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  fundItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'saved'])
const message = useMessage()

const visible = ref(false)
const saving = ref(false)
const formRef = ref(null)

const formData = ref({
  alert_enabled: false,
  alert_rise_threshold: 3,
  alert_fall_threshold: 3
})

// 监听 show 变化
watch(() => props.show, (newVal) => {
  visible.value = newVal
  if (newVal && props.fundItem) {
    // 初始化表单数据
    formData.value = {
      alert_enabled: props.fundItem.alert_enabled || false,
      alert_rise_threshold: props.fundItem.alert_rise_threshold || 3,
      alert_fall_threshold: props.fundItem.alert_fall_threshold || 3
    }
  }
})

// 监听 visible 变化
watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:show', false)
  }
})

// 保存设置
const handleSave = async () => {
  if (!props.fundItem) return

  saving.value = true
  try {
    await SupabaseService.fundWatchlist.updateAlert(props.fundItem.id, {
      alert_enabled: formData.value.alert_enabled,
      alert_rise_threshold: formData.value.alert_rise_threshold,
      alert_fall_threshold: formData.value.alert_fall_threshold
    })

    message.success('提醒设置已保存')
    emit('saved', {
      ...props.fundItem,
      ...formData.value
    })
    visible.value = false
  } catch (error) {
    console.error('保存提醒设置失败:', error)
    message.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 关闭后重置
const handleClose = () => {
  formData.value = {
    alert_enabled: false,
    alert_rise_threshold: 3,
    alert_fall_threshold: 3
  }
}
</script>

<style scoped>
.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.fund-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.fund-code {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-family: monospace;
  font-weight: 500;
}

.fund-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
}

.settings-tip {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.settings-tip .n-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
