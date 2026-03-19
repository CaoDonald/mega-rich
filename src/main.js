import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { create } from 'naive-ui'
import App from './App.vue'
import router from './router'
import './styles/component.css'

// 导入需要全局注册的组件
import {
    NTag,
    NEmpty,
    NSkeleton,
    NCollapse,
    NCollapseItem,
    NRadioGroup,
    NRadioButton,
    NUpload,
    NAlert,
    NTabPane,
    NTabs,
    NResult,
    NSpin,
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NLayoutFooter,
    NAvatar,
    NButton,
    NDropdown,
    NForm,
    NFormItem,
    NConfigProvider,
    NInput,
    NIcon,
    NSelect,
    NDatePicker,
    NDataTable,
    NCard,
    NStatistic,
    NModal,
    NInputNumber,
    NMessageProvider,
    NSpace
} from 'naive-ui'

// 创建 Naive UI 插件
const naive = create({
    components: [
        NTag,
        NEmpty,
        NSkeleton,
        NCollapseItem,
        NCollapse,
        NRadioGroup,
        NRadioButton,
        NUpload,
        NAlert,
        NTabPane,
        NTabs,
        NResult,
        NSpin,
        NMessageProvider,
        NLayout,
        NLayoutHeader,
        NLayoutContent,
        NLayoutFooter,
        NAvatar,
        NButton,
        NDropdown,
        NForm,
        NFormItem,
        NConfigProvider,
        NInput,
        NIcon,
        NSelect,
        NDatePicker,
        NDataTable,
        NCard,
        NStatistic,
        NModal,
        NInputNumber,
        NSpace
    ]
})

// 创建应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 注册插件
app.use(pinia)
app.use(router)
app.use(naive)

// 挂载应用
app.mount('#app')