import { ref, onMounted, onUnmounted } from 'vue'

// 手机端断点：768px
const MOBILE_BREAKPOINT = 768
// 小屏手机断点：480px
const SMALL_MOBILE_BREAKPOINT = 480

// 响应式设备状态
export const isMobile = ref(false)
export const isSmallMobile = ref(false)
export const windowWidth = ref(0)
export const windowHeight = ref(0)

// 更新设备状态
const updateDeviceInfo = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
  isSmallMobile.value = window.innerWidth < SMALL_MOBILE_BREAKPOINT
}

// 初始化
if (typeof window !== 'undefined') {
  updateDeviceInfo()
}

// 使用 composable 绑定事件
export function useDeviceDetect() {
  onMounted(() => {
    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDeviceInfo)
    window.removeEventListener('orientationchange', updateDeviceInfo)
  })

  return {
    isMobile,
    isSmallMobile,
    windowWidth,
    windowHeight,
    MOBILE_BREAKPOINT,
    SMALL_MOBILE_BREAKPOINT
  }
}

export { MOBILE_BREAKPOINT, SMALL_MOBILE_BREAKPOINT }