import { computed } from 'vue'
import { isMobile } from '../utils/device.js'

/**
 * 移动端弹窗适配 composable
 * 手机端：弹窗全屏显示
 * 桌面端：保持默认居中样式
 */
export function useMobileModal() {
  const modalStyle = computed(() => {
    if (isMobile.value) {
      return {
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        borderRadius: '0',
        margin: '0',
        padding: '0'
      }
    }
    return {
      width: 'auto',
      minWidth: '300px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      overflow: 'auto'
    }
  })

  const modalClass = computed(() => {
    return isMobile.value ? 'mobile-fullscreen-modal' : 'desktop-modal'
  })

  return {
    modalStyle,
    modalClass,
    isMobile
  }
}