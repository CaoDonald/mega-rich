<script setup>
import Layout from './components/Layout.vue'
import { NMessageProvider } from 'naive-ui'
</script>

<template>
  <n-message-provider>
    <Layout>
      <router-view></router-view>
    </Layout>
  </n-message-provider>
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