<template>
  <div>
    <n-tabs v-model:value="activeTab">
      <n-tab-pane name="primary" tab="一级分类管理">
        <div class="category-section">
          <div class="section-header">
          <h3>一级分类列表</h3>
          <n-button type="primary" @click="showPrimaryCategoryForm = true">
            <template #icon>
              <n-icon><AddOutline /></n-icon>
            </template>
            新增
          </n-button>
        </div>
          
          <n-data-table
            :columns="primaryCategoryColumns"
            :data="primaryCategories"
            :pagination="pagination"
            :row-key="row => row.id"
          />
        </div>
      </n-tab-pane>
      
      <n-tab-pane name="secondary" tab="二级分类管理">
        <div class="category-section">
          <div class="section-header">
          <h3>二级分类列表</h3>
          <n-button type="primary" @click="handleAddSecondaryCategory">
            <template #icon>
              <n-icon><AddOutline /></n-icon>
            </template>
            新增
          </n-button>
        </div>
          
          <n-select
            v-model:value="selectedPrimaryCategory"
            placeholder="筛选一级分类"
            :options="primaryCategoryOptions"
            class="primary-category-filter"
          />
          
          <n-data-table
            :columns="secondaryCategoryColumns"
            :data="filteredSecondaryCategories"
            :pagination="pagination"
            :row-key="row => row.id"
          />
        </div>
      </n-tab-pane>
    </n-tabs>
    
    <!-- 一级分类表单弹窗 -->
    <n-modal
      v-model:show="showPrimaryCategoryForm"
      :title="editingPrimaryCategory ? '编辑一级分类' : '添加一级分类'"
      preset="dialog"
      :destroy-on-close="true"
      width="auto"
      :min-width="400"
      :max-width="600"
    >
      <n-form label-placement="top">
        <n-form-item label="分类名称" required>
          <n-input
            v-model:value="primaryCategoryForm.name"
            placeholder="请输入分类名称"
            :maxlength="50"
          />
        </n-form-item>
        
        <div class="form-actions">
          <n-button @click="showPrimaryCategoryForm = false">取消</n-button>
          <n-button type="primary" @click="savePrimaryCategory">
            {{ editingPrimaryCategory ? '更新' : '保存' }}
          </n-button>
        </div>
      </n-form>
    </n-modal>
    
    <!-- 二级分类表单弹窗 -->
    <n-modal
      v-model:show="showSecondaryCategoryForm"
      :title="editingSecondaryCategory ? '编辑二级分类' : '添加二级分类'"
      preset="dialog"
      :destroy-on-close="true"
      width="auto"
      :min-width="400"
      :max-width="600"
    >
      <n-form label-placement="top">
        <n-form-item label="所属一级分类" required>
          <n-select
            v-model:value="secondaryCategoryForm.category_id"
            placeholder="选择一级分类"
            :options="primaryCategoryOptions"
          />
        </n-form-item>
        
        <n-form-item label="分类名称" required>
          <n-input
            v-model:value="secondaryCategoryForm.name"
            placeholder="请输入分类名称"
            :maxlength="50"
          />
        </n-form-item>
        
        <div class="form-actions">
          <n-button @click="showSecondaryCategoryForm = false">取消</n-button>
          <n-button type="primary" @click="saveSecondaryCategory">
            {{ editingSecondaryCategory ? '更新' : '保存' }}
          </n-button>
        </div>
      </n-form>
    </n-modal>
    
    <!-- 删除确认弹窗 -->
    <n-modal
      v-model:show="showDeleteConfirm"
      title="删除确认"
      preset="dialog"
      negative-text="取消"
      positive-text="删除"
      @positive-click="confirmDelete"
      width="auto"
      :min-width="300"
      :max-width="400"
    >
      <div class="delete-confirm-content">
        <p>确定要删除这个分类吗？</p>
        <p class="category-info">{{ deletingCategory?.name }}</p>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { useMessage } from 'naive-ui'
import { NButton, NIcon } from 'naive-ui'
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import {labelWidth, valueWidth, percentWidth,pagination} from '../../../utils/TableConfig.js'

// 获取消息实例
const message = useMessage()

const props = defineProps({
  primaryCategories: {
    type: Array,
    required: true
  },
  secondaryCategories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:primaryCategories', 'update:secondaryCategories'])

// 状态管理
const activeTab = ref('primary')
const selectedPrimaryCategory = ref(null)

// 表单状态
const showPrimaryCategoryForm = ref(false)
const showSecondaryCategoryForm = ref(false)
const showDeleteConfirm = ref(false)

const editingPrimaryCategory = ref(null)
const editingSecondaryCategory = ref(null)
const deletingCategory = ref(null)
const deleteType = ref(null) // 'primary' or 'secondary'

// 表单数据
const primaryCategoryForm = ref({
  name: '',
  description: ''
})

const secondaryCategoryForm = ref({
  category_id: null,
  name: '',
  description: ''
})

// 计算属性
const primaryCategoryOptions = computed(() => {
  return props.primaryCategories.map(c => ({ label: c.name, value: c.id }))
})

const filteredSecondaryCategories = computed(() => {
  if (!selectedPrimaryCategory.value) {
    return props.secondaryCategories
  }
  return props.secondaryCategories.filter(s => s.category_id === selectedPrimaryCategory.value)
})

// 表格列配置
const primaryCategoryColumns = [
  {
    title: '分类名称',
    key: 'name'
  },
  {
    title: '创建时间',
    key: 'created_at',
    render(row) {
      return new Date(row.created_at).toLocaleString()
    }
  },
  {
    title: '操作',
    key: 'actions',
    fixed: 'right',
    render(row) {
      return h('div', { class: 'actions-cell' }, [
        h(NButton,
          {
            quaternary: true,
            size: 'small',
            onClick: () => editPrimaryCategory(row),
            title: '编辑'
          },
          {
            icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
          }
        ),
        h(NButton,
          {
            quaternary: true,
            type: 'error',
            size: 'small',
            onClick: () => deletePrimaryCategory(row),
            disabled: hasSubcategories(row.id),
            title: '删除'
          },
          {
            icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
          }
        )
      ])
    }
  }
]

const secondaryCategoryColumns = [
  {
    title: '一级分类',
    key: 'primary_category',
    render(row) {
      const category = props.primaryCategories.find(c => c.id === row.category_id)
      return category?.name || ''
    }
  },
  {
    title: '分类名称',
    key: 'name'
  },
  {
    title: '创建时间',
    key: 'created_at',
    render(row) {
      return new Date(row.created_at).toLocaleString()
    }
  },
  {
    title: '操作',
    key: 'actions',
    fixed: 'right',
    width:100,
    render(row) {
      return h('div', { class: 'actions-cell' }, [
        h(NButton,
          {
            quaternary: true,
            size: 'small',
            onClick: () => editSecondaryCategory(row),
            title: '编辑'
          },
          {
            icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
          }
        ),
        h(NButton,
          {
            quaternary: true,
            type: 'error',
            size: 'small',
            onClick: () => deleteSecondaryCategory(row),
            title: '删除'
          },
          {
            icon: () => h(NIcon, null, { default: () => h(TrashOutline) })
          }
        )
      ])
    }
  }
]

// 方法
const hasSubcategories = (categoryId) => {
  return props.secondaryCategories.some(s => s.category_id === categoryId)
}

const editPrimaryCategory = (category) => {
  editingPrimaryCategory.value = { ...category }
  primaryCategoryForm.value = {
    name: category.name,
    description: category.description
  }
  showPrimaryCategoryForm.value = true
}

const editSecondaryCategory = (category) => {
  editingSecondaryCategory.value = { ...category }
  secondaryCategoryForm.value = {
    category_id: category.category_id,
    name: category.name,
    description: category.description
  }
  showSecondaryCategoryForm.value = true
}

const handleAddSecondaryCategory = () => {
  editingSecondaryCategory.value = null
  secondaryCategoryForm.value = {
    category_id: selectedPrimaryCategory.value || null,
    name: '',
    description: ''
  }
  showSecondaryCategoryForm.value = true
}

const deletePrimaryCategory = (category) => {
  deletingCategory.value = category
  deleteType.value = 'primary'
  showDeleteConfirm.value = true
}

const deleteSecondaryCategory = (category) => {
  deletingCategory.value = category
  deleteType.value = 'secondary'
  showDeleteConfirm.value = true
}

const savePrimaryCategory = () => {
  if (!primaryCategoryForm.value.name.trim()) {
    message.error('分类名称不能为空')
    return
  }
  
  if (editingPrimaryCategory.value) {
    // 编辑现有分类
    emit('update:primaryCategories', props.primaryCategories.map(c => 
      c.id === editingPrimaryCategory.value.id 
        ? { ...c, ...primaryCategoryForm.value } 
        : c
    ))
    message.success('一级分类更新成功')
  } else {
    // 添加新分类
    const newCategory = {
      id: Date.now().toString(), // 临时ID，实际会被Supabase生成的UUID替换
      user_id: null, // 实际会被Supabase的user_id替换
      name: primaryCategoryForm.value.name,
      description: primaryCategoryForm.value.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    emit('update:primaryCategories', [...props.primaryCategories, newCategory])
    message.success('一级分类添加成功')
  }
  
  resetPrimaryCategoryForm()
}

const saveSecondaryCategory = () => {
  if (!secondaryCategoryForm.value.category_id || !secondaryCategoryForm.value.name.trim()) {
    message.error('请填写完整的分类信息')
    return
  }
  
  if (editingSecondaryCategory.value) {
    // 编辑现有分类
    emit('update:secondaryCategories', props.secondaryCategories.map(s => 
      s.id === editingSecondaryCategory.value.id 
        ? { ...s, ...secondaryCategoryForm.value } 
        : s
    ))
    message.success('二级分类更新成功')
  } else {
    // 添加新分类
    const newCategory = {
      id: Date.now().toString(), // 临时ID，实际会被Supabase生成的UUID替换
      user_id: null, // 实际会被Supabase的user_id替换
      category_id: secondaryCategoryForm.value.category_id,
      name: secondaryCategoryForm.value.name,
      description: secondaryCategoryForm.value.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    emit('update:secondaryCategories', [...props.secondaryCategories, newCategory])
    message.success('二级分类添加成功')
  }
  
  resetSecondaryCategoryForm()
}

const confirmDelete = () => {
  if (deleteType.value === 'primary') {
    // 删除一级分类
    emit('update:primaryCategories', props.primaryCategories.filter(c => c.id !== deletingCategory.value.id))
    message.success('一级分类删除成功')
  } else {
    // 删除二级分类
    emit('update:secondaryCategories', props.secondaryCategories.filter(s => s.id !== deletingCategory.value.id))
    message.success('二级分类删除成功')
  }
  
  showDeleteConfirm.value = false
  deletingCategory.value = null
  deleteType.value = null
}

const resetPrimaryCategoryForm = () => {
  primaryCategoryForm.value = {
    name: '',
    description: ''
  }
  editingPrimaryCategory.value = null
  showPrimaryCategoryForm.value = false
}

const resetSecondaryCategoryForm = () => {
  secondaryCategoryForm.value = {
    category_id: null,
    name: '',
    description: ''
  }
  editingSecondaryCategory.value = null
  showSecondaryCategoryForm.value = false
}
</script>

<style scoped>
.category-manager-container {
  margin: 0 auto;
}

.category-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--custom-color);
}

.primary-category-filter {
  margin-bottom: 20px;
  max-width: 200px;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

:deep(.n-button) {
  transition: all 0.3s ease;
  border-radius: var(--custom-border-radius);
  font-weight: 500;
}

:deep(.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

:deep(.n-button:active) {
  transform: translateY(0);
}

:deep(.n-button--primary) {
  background-color: var(--custom-color-brand);
  border-color: var(--custom-color-brand);
}

:deep(.n-button--primary:hover) {
  background-color: var(--custom-color-brand-hover);
  border-color: var(--custom-color-brand-hover);
}

:deep(.n-data-table-thead) {
  background-color: rgba(255, 255, 255, 0.08);
}

:deep(.n-data-table-thead-th) {
  font-weight: 600;
  color: var(--custom-color);
  padding: 12px 16px;
  border-bottom: 2px solid var(--custom-color-secondary);
}

:deep(.n-data-table-tbody-td) {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.n-data-table-tbody-tr:hover) {
  background-color: rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s ease;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.delete-confirm-content {
  padding: 20px 0;
}

.category-info {
  color: var(--custom-color-secondary);
  margin: 8px 0;
  font-size: 0.9rem;
}

</style>
