<script setup>
import { ref, provide } from 'vue'
import Layout from './components/Layout.vue'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import ForgotPassword from './components/ForgotPassword.vue'
import Balance from './components/Balance.vue'
import Salary from './components/Salary.vue'
import { NMessageProvider } from 'naive-ui'

// 页面切换状态管理
const currentPage = ref('home')

// 页面切换方法
const navigateTo = (page) => {
  currentPage.value = page
}

// 提供页面切换方法给所有子组件
provide('navigateTo', navigateTo)
provide('currentPage', currentPage)
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <Layout>
        <!-- 根据当前页面状态显示不同组件 -->
        <Home v-if="currentPage === 'home'" />
        <Login v-else-if="currentPage === 'login'" />
        <Register v-else-if="currentPage === 'register'" />
        <ForgotPassword v-else-if="currentPage === 'forgot-password'" />
        <Balance v-else-if="currentPage === 'balance'" />
        <Salary v-else-if="currentPage === 'salary'" />
      </Layout>
    </n-message-provider>
  </n-config-provider>
  </template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}
</style>