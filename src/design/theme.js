/**
 * Naive UI 主题配置
 * 覆盖 Naive UI 默认主题以匹配设计系统
 */

import { designTokens } from './tokens.js'

/**
 * @type {import('naive-ui').GlobalThemeOverrides}
 */
export const themeOverrides = {
  common: {
    primaryColor: designTokens.colors.primary,
    primaryColorHover: '#16A34A',
    primaryColorPressed: '#15803D',
    primaryColorSuppl: '#22C55E',

    errorColor: designTokens.colors.danger,
    errorColorHover: '#DC2626',
    errorColorPressed: '#B91C1C',

    warningColor: designTokens.colors.warning,
    warningColorHover: '#F59E0B',
    warningColorPressed: '#D97706',

    infoColor: designTokens.colors.info,
    infoColorHover: '#3B82F6',
    infoColorPressed: '#2563EB',

    successColor: designTokens.colors.success,
    successColorHover: '#16A34A',
    successColorPressed: '#15803D',

    borderRadius: designTokens.radius.md,
    borderRadiusSmall: designTokens.radius.sm,

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: designTokens.fontSize.base,
    fontSizeSmall: designTokens.fontSize.sm,
    fontSizeMedium: designTokens.fontSize.base,
    fontSizeLarge: designTokens.fontSize.lg,
  },

  Button: {
    borderRadiusMedium: designTokens.radius.md,
    borderRadiusSmall: designTokens.radius.sm,
    borderRadiusLarge: designTokens.radius.lg,
    heightMedium: '40px',
    heightSmall: '32px',
    heightLarge: '48px',
    fontSizeMedium: designTokens.fontSize.base,
    fontSizeSmall: designTokens.fontSize.sm,
    fontSizeLarge: designTokens.fontSize.lg,
  },

  Card: {
    borderRadius: designTokens.radius.lg,
    paddingMedium: designTokens.spacing.lg,
    paddingSmall: designTokens.spacing.md,
    paddingLarge: designTokens.spacing.xl,
  },

  Input: {
    borderRadius: designTokens.radius.md,
    heightMedium: '40px',
    heightSmall: '32px',
    heightLarge: '48px',
  },

  Select: {
    borderRadius: designTokens.radius.md,
    heightMedium: '40px',
    heightSmall: '32px',
    heightLarge: '48px',
  },

  Modal: {
    borderRadius: designTokens.radius.xl,
  },

  Dialog: {
    borderRadius: designTokens.radius.xl,
  },

  Tabs: {
    tabBorderRadius: designTokens.radius.md,
  },

  Tag: {
    borderRadius: designTokens.radius.sm,
  },

  Message: {
    borderRadius: designTokens.radius.md,
  },

  Notification: {
    borderRadius: designTokens.radius.lg,
  }
}

export default themeOverrides
