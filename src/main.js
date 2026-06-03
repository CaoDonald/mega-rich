import { createApp } from 'vue'
import { create } from 'naive-ui'
import App from './App.vue'
import router from './router'
import './styles/component.css'
import {
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
    NPopover,
    NForm,
    NFormItem, NConfigProvider,
    NInput, NIcon,
    NSelect, NDatePicker, NDataTable, NCard, NStatistic, NModal, NInputNumber, NMessageProvider
} from 'naive-ui'

import {
    AddOutline,
    RefreshOutline,
    SearchOutline,
    EyeOutline,
    CreateOutline,
    TrashOutline,
    ListOutline,
    TrendingUpOutline,
    TrendingDownOutline,
    SettingsOutline,
    CashOutline,
    CaretUpOutline,
    CaretDownOutline,
    CloudUploadOutline,
    CloudDownloadOutline
} from '@vicons/ionicons5'

// 1. 创建 Naive UI 插件，并配置全局注册的组件
const naive = create({
    components: [
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
        NPopover,
        NForm,
        NFormItem, NConfigProvider,
        NInput, NIcon,
        NSelect, NDatePicker, NDataTable, NCard, NStatistic, NModal, NInputNumber
    ]
})

const app = createApp(App)

app.use(naive)
app.use(router)

app.mount('#app')