<template>
  <div class="investment-detail">
    <div class="detail-header">
      <div class="search-filter">
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索基金名称或代码"
          clearable
          style="width: 240px"
        >
          <template #prefix>
            <n-icon><SearchOutline /></n-icon>
          </template>
        </n-input>
        
        <n-select
          v-model:value="filterType"
          :options="fundTypeOptions"
          placeholder="基金类型"
          clearable
          style="width: 140px"
        />
        
        <n-select
          v-model:value="filterSort"
          :options="sortOptions"
          placeholder="排序方式"
          style="width: 140px"
        />
      </div>
      
      <div class="header-actions">
        <n-button type="primary" @click="showAddModal = true">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          添加持仓
        </n-button>
        <n-button @click="syncData">
          <template #icon>
            <n-icon><RefreshOutline /></n-icon>
          </template>
          同步数据
        </n-button>
      </div>
    </div>

    <div class="holdings-list" v-if="!loading">
      <n-card
        v-for="holding in filteredHoldings"
        :key="holding.id"
        class="holding-card"
        hoverable
        @click="selectHolding(holding)"
      >
        <div class="holding-header">
          <div class="fund-info">
            <div class="fund-name">{{ holding.fund_name || '未知基金' }}</div>
            <div class="fund-code">{{ holding.fund_code }}</div>
          </div>
          <div class="fund-type">
            <n-tag :type="getFundTypeTag(holding.fund_type)" size="small">
              {{ getFundTypeName(holding.fund_type) }}
            </n-tag>
          </div>
        </div>
        
        <div class="holding-stats">
          <div class="stat-item">
            <div class="stat-label">持仓份额</div>
            <div class="stat-value">{{ (holding.shares || 0).toFixed(2) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">持仓成本</div>
            <div class="stat-value">¥{{ (holding.avg_cost || 0).toFixed(3) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">当前净值</div>
            <div class="stat-value">¥{{ (holding.current_nav || 0).toFixed(4) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">持仓金额</div>
            <div class="stat-value">¥{{ formatMoney((holding.current_nav || 0) * (holding.shares || 0)) }}</div>
          </div>
        </div>
        
        <div class="holding-profit" :class="getProfitClass(holding)">
          <div class="profit-main">
            <span class="profit-label">收益</span>
            <span class="profit-value">
              {{ holding.profit >= 0 ? '+' : '' }}{{ formatMoney(holding.profit || 0) }}
            </span>
          </div>
          <div class="profit-rate">
            {{ holding.profit_rate >= 0 ? '+' : '' }}{{ (holding.profit_rate || 0).toFixed(2) }}%
          </div>
        </div>
        
        <div class="holding-footer">
          <div class="update-time">
            <n-icon size="14"><TimeOutline /></n-icon>
            <span>更新时间：{{ formatTime(holding.updated_at) }}</span>
          </div>
          <div class="holding-actions">
            <n-button text type="primary" size="small" @click.stop="editHolding(holding)">
              <template #icon><n-icon><CreateOutline /></n-icon></template>
              编辑
            </n-button>
            <n-button text type="error" size="small" @click.stop="deleteHolding(holding)">
              <template #icon><n-icon><TrashOutline /></n-icon></template>
              删除
            </n-button>
          </div>
        </div>
      </n-card>
      
      <n-empty v-if="filteredHoldings.length === 0" description="暂无持仓数据" style="margin-top: 60px">
        <template #extra>
          <n-button type="primary" @click="showAddModal = true">添加第一个持仓</n-button>
        </template>
      </n-empty>
    </div>

    <div class="loading-container" v-else>
      <n-spin size="large" />
      <p>加载中...</p>
    </div>

    <n-modal v-model:show="showAddModal" preset="dialog" title="添加持仓" style="width: 500px">
      <AddEditHoldingForm
        v-if="showAddModal"
        :holding="editingHolding"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </n-modal>

    <n-modal v-model:show="showDetailModal" preset="dialog" title="持仓详情" style="width: 600px">
      <HoldingDetail :holding="selectedHolding" v-if="selectedHolding" />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, inject, h } from 'vue'
import {
  SearchOutline,
  AddOutline,
  RefreshOutline,
  TimeOutline,
  CreateOutline,
  TrashOutline
} from '@vicons/ionicons5'
import { supabase } from '../../../supabase.js'
import AddEditHoldingForm from './AddEditHoldingForm.vue'
import HoldingDetail from './HoldingDetail.vue'
import { useMessage } from 'naive-ui'

const userHoldings = inject('userHoldings')
const loading = inject('loading')
const message = useMessage

const searchKeyword = ref('')
const filterType = ref(null)
const filterSort = ref('profit_desc')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const selectedHolding = ref(null)
const editingHolding = ref(null)

const fundTypeOptions = [
  { label: '全部类型', value: null },
  { label: '股票型', value: 25 },
  { label: '混合型', value: 27 },
  { label: '债券型', value: 31 },
  { label: '货币型', value: 35 },
  { label: 'QDII', value: 6 },
  { label: '指数型', value: 26 }
]

const sortOptions = [
  { label: '收益从高到低', value: 'profit_desc' },
  { label: '收益从低到高', value: 'profit_asc' },
  { label: '金额从高到低', value: 'amount_desc' },
  { label: '金额从低到高', value: 'amount_asc' },
  { label: '最近添加', value: 'time_desc' },
  { label: '最早添加', value: 'time_asc' }
]

const typeMap = {
  25: '股票型',
  27: '混合型',
  31: '债券型',
  35: '货币型',
  6: 'QDII',
  26: '指数型'
}

const formatMoney = (value) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatTime = (time) => {
  if (!time) return '未知'
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getFundTypeName = (type) => {
  return typeMap[type] || '其他'
}

const getFundTypeTag = (type) => {
  const tags = {
    25: 'error',
    27: 'warning',
    31: 'success',
    35: 'info',
    6: 'default',
    26: 'default'
  }
  return tags[type] || 'default'
}

const getProfitClass = (holding) => {
  const profit = holding.profit || 0
  if (profit > 0) return 'positive'
  if (profit < 0) return 'negative'
  return 'neutral'
}

const filteredHoldings = computed(() => {
  let result = [...userHoldings.value]
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(h =>
      (h.fund_name && h.fund_name.toLowerCase().includes(keyword)) ||
      (h.fund_code && h.fund_code.toLowerCase().includes(keyword))
    )
  }
  
  if (filterType.value !== null) {
    result = result.filter(h => h.fund_type === filterType.value)
  }
  
  switch (filterSort.value) {
    case 'profit_desc':
      result.sort((a, b) => (b.profit || 0) - (a.profit || 0))
      break
    case 'profit_asc':
      result.sort((a, b) => (a.profit || 0) - (b.profit || 0))
      break
    case 'amount_desc':
      result.sort((a, b) => ((b.current_nav || 0) * (b.shares || 0)) - ((a.current_nav || 0) * (a.shares || 0)))
      break
    case 'amount_asc':
      result.sort((a, b) => ((a.current_nav || 0) * (a.shares || 0)) - ((b.current_nav || 0) * (b.shares || 0)))
      break
    case 'time_desc':
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      break
    case 'time_asc':
      result.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
      break
  }
  
  return result
})

const selectHolding = (holding) => {
  selectedHolding.value = holding
  showDetailModal.value = true
}

const editHolding = (holding) => {
  editingHolding.value = holding
  showAddModal.value = true
}

const deleteHolding = async (holding) => {
  message.warning('确认删除该持仓？')
}

const closeModal = () => {
  showAddModal.value = false
  editingHolding.value = null
}

const handleSubmit = async (formData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    if (editingHolding.value) {
      const { error } = await supabase
        .from('fund_holdings')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingHolding.value.id)
      
      if (error) throw error
      
      const index = userHoldings.value.findIndex(h => h.id === editingHolding.value.id)
      if (index !== -1) {
        userHoldings.value[index] = { ...userHoldings.value[index], ...formData }
      }
      message.success('更新成功')
    } else {
      const { error } = await supabase
        .from('fund_holdings')
        .insert({
          ...formData,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      userHoldings.value.push({
        id: Date.now(),
        ...formData,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      message.success('添加成功')
    }
    
    closeModal()
  } catch (error) {
    console.error('保存失败:', error)
    message.error('操作失败，请重试')
  }
}

const syncData = () => {
  message.info('正在同步基金数据...')
}
</script>

<style scoped>
.investment-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.search-filter {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.holdings-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.holding-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.holding-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.fund-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.fund-code {
  font-size: 13px;
  color: #6b7280;
}

.holding-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.holding-profit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.holding-profit.positive {
  background: rgba(16, 185, 129, 0.1);
}

.holding-profit.negative {
  background: rgba(239, 68, 68, 0.1);
}

.holding-profit.neutral {
  background: #f3f4f6;
}

.profit-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profit-label {
  font-size: 13px;
  color: #6b7280;
}

.profit-value {
  font-size: 18px;
  font-weight: 700;
}

.holding-profit.positive .profit-value {
  color: #10b981;
}

.holding-profit.negative .profit-value {
  color: #ef4444;
}

.profit-rate {
  font-size: 14px;
  font-weight: 600;
}

.holding-profit.positive .profit-rate {
  color: #10b981;
}

.holding-profit.negative .profit-rate {
  color: #ef4444;
}

.holding-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.update-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.holding-actions {
  display: flex;
  gap: 8px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #6b7280;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter {
    width: 100%;
  }
  
  .search-filter .n-input,
  .search-filter .n-select {
    flex: 1;
    min-width: 0;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .holdings-list {
    grid-template-columns: 1fr;
  }
  
  .holding-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .holding-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 10px;
  }
  
  .stat-label {
    font-size: 11px;
  }
  
  .stat-value {
    font-size: 13px;
  }
  
  .holding-profit {
    flex-direction: column;
    gap: 8px;
  }
  
  .profit-value {
    font-size: 16px;
  }
}
</style>
