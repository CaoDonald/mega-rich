import { createApp } from 'vue'
import { create } from 'naive-ui'
// import './style.css'
import App from './App.vue'
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NAvatar,
  NButton,
  NDropdown
} from 'naive-ui'

const naive = create()
const app = createApp(App)

app.use(naive,  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NAvatar,
  NButton,
  NDropdown)
app.mount('#app')
