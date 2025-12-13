<template>
  <n-layout>
    <n-layout-header bordered>
      <div class="header-content">
        <div class="logo">
          <h1>Mega Rich</h1>
        </div>

        <div class="user-info">
          <!-- 已登录 -->
          <n-dropdown
            v-if="user"
            trigger="click"
            placement="bottom-end"
            :options="dropdownOptions"
            @select="handleDropdownSelect"
          >
              <n-avatar
                :size="40"
                :src="user.avatar_url"
                fallback-src=""
                class="avatar"
              />
          </n-dropdown>

          <!-- 未登录 -->
          <n-button
            v-else
            type="primary"
            @click="handleLoginClick"
          >
            登录
          </n-button>
        </div>
      </div>
    </n-layout-header>

    <n-layout-content>
      <slot />
    </n-layout-content>

    <n-layout-footer bordered>
      <div class="footer-content">
        <p>© 2025 Mega Rich. All rights reserved.</p>
      </div>
    </n-layout-footer>

    <!-- 用户设置 -->
    <UserSettingsModal
      v-model:show="showSettingsModal"
      :user="user"
      @user-updated="handleUserUpdated"
    />
  </n-layout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { supabase } from '../supabase'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NAvatar,
  NButton,
  NDropdown
} from 'naive-ui'

const navigateTo = inject('navigateTo')

const user = ref(null)
const showSettingsModal = ref(false)

/** 下拉菜单选项（Naive UI 正确用法） */
const dropdownOptions = [
  {
    label: '设置',
    key: 'settings'
  },
  {
    label: '退出',
    key: 'logout'
  }
]

const handleDropdownSelect = (key) => {
  if (key === 'settings') {
    showSettingsModal.value = true
  } else if (key === 'logout') {
    handleLogout()
  }
}

onMounted(async () => {
  const {data,error} = await supabase.auth.getSession()
  console.log('data',data)
  if (data.session) {
    await loadUser(data.session.user)
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    console.log('onAuthStateChange',_event,session)
    if (session?.user) {
      await loadUser(session.user)
    } else {
      user.value = null
    }
  })
})

async function loadUser(authUser) {
  const userRes = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()
  console.log('userRes',userRes)
  const { data: profile } = userRes
  user.value = profile
    ? { ...authUser, ...profile }
    : authUser
  console.log('user',user)
}

const handleLoginClick = () => {
  navigateTo('login')
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  user.value = null
  navigateTo('home')
}

const handleUserUpdated = (updatedUser) => {
  user.value = updatedUser
}
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  cursor: pointer;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
</style>
