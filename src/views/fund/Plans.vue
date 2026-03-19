<template>
  <div class="plans-page">
    <!-- 顶部统计 -->
    <div class="stats-section">
      <Card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <n-icon :component="DocumentTextOutline" size="32" color="var(--color-primary)" />
          </div>
          <div class="stat-info">
            <span class="stat-label">计划总数</span>
            <span class="stat-value">{{ totalPlans }}</span>
          </div>
        </div>
      </Card>

      <Card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <n-icon :component="PlayCircleOutline" size="32" color="var(--color-success)" />
          </div>
          <div class="stat-info">
            <span class="stat-label">进行中</span>
            <span class="stat-value">{{ activePlans }}</span>
          </div>
        </div>
      </Card>

      <Card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon">
            <n-icon :component="CashOutline" size="32" color="var(--color-warning)" />
          </div>
          <div class="stat-info">
            <span class="stat-label">累计投入</span>
            <span class="stat-value">¥{{ formatMoney(totalInvested) }}</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- 操作栏 -->
    <div class="actions-bar">
      <h2>我的定投计划</h2>
      <n-button type="primary" @click="showCreateModal = true">
        <template #icon>
          <n-icon :component="AddOutline" />
        </template>
        创建计划
      </n-button>
    </div>

    <!-- 计划列表 -->
    <PlanList
      :plans="plans"
      :loading="loading"
      @view-detail="handleViewDetail"
      @pause="handlePause"
      @resume="handleResume"
      @execute="handleExecute"
      @delete="handleDelete"
    />

    <!-- 创建/编辑计划 Modal -->
    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      :title="editingPlan ? '编辑计划' : '创建定投计划'"
      style="max-width: 600px"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <PlanForm
        :plan="editingPlan"
        @success="handleFormSuccess"
        @cancel="showCreateModal = false"
      />
    </n-modal>

    <!-- 计划详情 Modal -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="计划详情"
      style="max-width: 900px"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <PlanDetail
        v-if="selectedPlan"
        :plan="selectedPlan"
        :current-nav="selectedPlanNav"
      />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NButton, NIcon, NModal, useMessage } from 'naive-ui'
import { AddOutline, DocumentTextOutline, PlayCircleOutline, CashOutline } from '@vicons/ionicons5'
import Card from '../../components/base/Card.vue'
import PlanList from '../../components/fund/PlanList.vue'
import PlanForm from '../../components/fund/PlanForm.vue'
import PlanDetail from '../../components/fund/PlanDetail.vue'
import { useFundStore } from '../../stores/fund.js'
import { useAuthStore } from '../../stores/auth.js'
import SupabaseService from '../../services/SupabaseService.js'
import FundApi from '../../utils/FundApi.js'

const message = useMessage()
const fundStore = useFundStore()
const authStore = useAuthStore()

const loading = ref(false)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const editingPlan = ref(null)
const selectedPlan = ref(null)
const selectedPlanNav = ref(0)

// 计算属性
const plans = computed(() => fundStore.plans)

const totalPlans = computed(() => plans.value.length)

const activePlans = computed(() => {
  return plans.value.filter(p => p.status === 'active').length
})

const totalInvested = computed(() => {
  return plans.value.reduce((sum, plan) => sum + (plan.total_invested || 0), 0)
})

// 格式化金额
const formatMoney = (value) => {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 加载计划列表
const loadPlans = async () => {
  if (!authStore.user) return

  loading.value = true
  try {
    const data = await SupabaseService.fundPlans.list(authStore.user.id)
    fundStore.setPlans(data)
  } catch (error) {
    console.error('加载计划失败:', error)
    message.error('加载计划失败')
  } finally {
    loading.value = false
  }
}

// 表单提交成功
const handleFormSuccess = async (planData) => {
  try {
    if (editingPlan.value) {
      // 更新计划
      const result = await SupabaseService.fundPlans.update(editingPlan.value.id, planData)
      fundStore.updatePlan(editingPlan.value.id, result)
      message.success('计划已更新')
    } else {
      // 创建计划
      const result = await SupabaseService.fundPlans.create({
        ...planData,
        user_id: authStore.user.id,
        next_execute_date: calculateNextExecuteDate(planData.start_date, planData.frequency)
      })
      fundStore.addPlan(result)
      message.success('计划已创建')
    }

    showCreateModal.value = false
    editingPlan.value = null
  } catch (error) {
    console.error('保存计划失败:', error)
    message.error('保存计划失败')
  }
}

// 计算下次执行日期
const calculateNextExecuteDate = (startDate, frequency) => {
  const start = new Date(startDate)
  const now = new Date()

  if (start > now) {
    return startDate
  }

  let next = new Date(start)

  switch (frequency) {
    case 'daily':
      while (next <= now) {
        next.setDate(next.getDate() + 1)
      }
      break
    case 'weekly':
      while (next <= now) {
        next.setDate(next.getDate() + 7)
      }
      break
    case 'monthly':
      while (next <= now) {
        next.setMonth(next.getMonth() + 1)
      }
      break
  }

  return next.toISOString().split('T')[0]
}

// 查看详情
const handleViewDetail = async (plan) => {
  selectedPlan.value = plan

  // 获取当前净值
  try {
    const navData = await FundApi.fundVPageDiagram(plan.fund_code)
    if (navData && navData.data && navData.data.length > 0) {
      selectedPlanNav.value = parseFloat(navData.data[0].nav)
    }
  } catch (error) {
    console.error('获取净值失败:', error)
  }

  showDetailModal.value = true
}

// 暂停计划
const handlePause = async (plan) => {
  try {
    await SupabaseService.fundPlans.update(plan.id, { status: 'paused' })
    fundStore.updatePlan(plan.id, { status: 'paused' })
    message.success('计划已暂停')
  } catch (error) {
    console.error('暂停计划失败:', error)
    message.error('暂停计划失败')
  }
}

// 恢复计划
const handleResume = async (plan) => {
  try {
    await SupabaseService.fundPlans.update(plan.id, { status: 'active' })
    fundStore.updatePlan(plan.id, { status: 'active' })
    message.success('计划已恢复')
  } catch (error) {
    console.error('恢复计划失败:', error)
    message.error('恢复计划失败')
  }
}

// 手动执行
const handleExecute = async (plan) => {
  try {
    // 获取当前净值
    const navData = await FundApi.fundVPageDiagram(plan.fund_code)
    if (!navData || !navData.data || navData.data.length === 0) {
      message.error('无法获取基金净值')
      return
    }

    const currentNav = parseFloat(navData.data[0].nav)
    const shares = plan.amount / currentNav

    // 创建交易记录
    await SupabaseService.fundTransactions.create({
      user_id: authStore.user.id,
      fund_code: plan.fund_code,
      fund_name: plan.fund_name,
      transaction_type: 'buy',
      transaction_date: new Date().toISOString(),
      amount: plan.amount,
      nav: currentNav,
      shares: shares,
      plan_id: plan.id
    })

    // 更新计划统计
    const newTotalInvested = (plan.total_invested || 0) + plan.amount
    const newTotalShares = (plan.total_shares || 0) + shares
    const nextExecuteDate = calculateNextExecuteDate(new Date().toISOString().split('T')[0], plan.frequency)

    await SupabaseService.fundPlans.update(plan.id, {
      total_invested: newTotalInvested,
      total_shares: newTotalShares,
      next_execute_date: nextExecuteDate
    })

    fundStore.updatePlan(plan.id, {
      total_invested: newTotalInvested,
      total_shares: newTotalShares,
      next_execute_date: nextExecuteDate
    })

    message.success('执行成功')
  } catch (error) {
    console.error('执行失败:', error)
    message.error('执行失败')
  }
}

// 删除计划
const handleDelete = async (plan) => {
  try {
    await SupabaseService.fundPlans.delete(plan.id)
    fundStore.removePlan(plan.id)
    message.success('计划已删除')
  } catch (error) {
    console.error('删除计划失败:', error)
    message.error('删除计划失败')
  }
}

onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
.plans-page {
  padding: var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  cursor: default;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.actions-bar h2 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .plans-page {
    padding: var(--spacing-lg);
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .actions-bar button {
    width: 100%;
  }
}
</style>
