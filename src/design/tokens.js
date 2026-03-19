/**
 * Design Tokens - 设计令牌
 * 统一的设计系统配置
 */

export const designTokens = {
  // 颜色系统
  colors: {
    // 主色
    primary: '#18A058',      // 绿色 - 盈利
    danger: '#D03050',       // 红色 - 亏损
    warning: '#F0A020',      // 橙色 - 警告
    info: '#2080F0',         // 蓝色 - 信息
    success: '#18A058',      // 成功色

    // 中性色
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },

    // 背景色
    bg: {
      base: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    },

    // 文字颜色
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    }
  },

  // 间距系统 (4px 基准)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  // 圆角
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // 阴影
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // 字体大小
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },

  // 字重
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // 行高
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // 断点
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },

  // 过渡动画
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Z-index 层级
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  }
}

export default designTokens
