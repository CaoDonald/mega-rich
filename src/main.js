import { createApp } from 'vue'
import { create } from 'naive-ui' // 新增 NMessageProvider（useMessage 依赖）
import App from './App.vue'
import './styles/component.css'    // 引入抽离的按钮样式
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
        NFormItem, NConfigProvider,
        NInput, NIcon,
        NSelect, NDatePicker, NDataTable, NCard, NStatistic, NModal, NInputNumber
    ]
})

const app = createApp(App)

app.use(naive)

app.mount('#app')