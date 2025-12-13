import { createApp } from 'vue'
import { create } from 'naive-ui'
// import './style.css'
import App from './App.vue'

const naive = create()
const app = createApp(App)

app.use(naive)
app.mount('#app')
