<script setup>
import { onMounted, ref } from 'vue'
import supaAccount from './components/supa/Account.vue'
import supaAuth from './components/supa/Auth.vue'
import { supabase } from './supabase'
// Import predefined theme

import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supa-kit/auth-ui-vue'
const session = ref()

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})
</script>

<template>
  <div class="container" style="padding: 50px 0 100px 0">
<!--    <Account v-if="session" :session="session" />-->
<!--    <Auth v-else />-->
    nihao
    你好
    <Auth
      :supabaseClient="supabase"
      :appearance="{}"
      :providers="['google', 'facebook', 'twitter']"
    />
  </div>
</template>