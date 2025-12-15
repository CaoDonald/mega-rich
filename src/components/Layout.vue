<template>
  <n-layout>
    <n-layout-header bordered>
      <div class="header-content">
        <div class="logo">
          <h1>Mega Rich</h1>
        </div>

        <div class="nav-menu">
          <n-button
            :type="currentPage.value === 'home' ? 'primary' : 'default'"
            @click="navigateTo('home')"
          >
            首页
          </n-button>
          <n-button
            :type="currentPage.value === 'balance' ? 'primary' : 'default'"
            @click="navigateTo('balance')"
            v-if="user"
          >
            结余管理
          </n-button>
          <n-button
            :type="currentPage.value === 'salary' ? 'primary' : 'default'"
            @click="navigateTo('salary')"
            v-if="user"
          >
            月薪管理
          </n-button>
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

    <!-- 用户设置（待实现） -->
    <!-- <UserSettingsModal
      v-model:show="showSettingsModal"
      :user="user"
      @user-updated="handleUserUpdated"
    /> -->
  </n-layout>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { supabase } from '../supabase'


const navigateTo = inject('navigateTo')
const currentPage = inject('currentPage')

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

.nav-menu {
  display: flex;
  gap: 10px;
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

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }

  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
