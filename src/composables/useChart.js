/**
 * useChart Composable - 图表配置逻辑
 * 基于 Design Tokens 的统一图表配置
 */

import { designTokens } from '../design/tokens.js'

export function useChart() {
  // 通用图表配置
  const commonChartConfig = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    textStyle: {
      fontFamily: designTokens.fontFamily,
      fontSize: 12,
      color: designTokens.colors.text.secondary
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: designTokens.colors.gray[200],
      borderWidth: 1,
      textStyle: {
        color: designTokens.colors.text.primary,
        fontSize: 12
      },
      padding: [8, 12],
      extraCssText: `box-shadow: ${designTokens.shadow.md}; border-radius: ${designTokens.radius.md};`
    },
    legend: {
      textStyle: {
        color: designTokens.colors.text.secondary,
        fontSize: 12
      }
    }
  }

  // 折线图配置
  const getLineChartConfig = (options = {}) => {
    return {
      ...commonChartConfig,
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: designTokens.colors.gray[300]
          }
        },
        axisLabel: {
          color: designTokens.colors.text.secondary,
          fontSize: 11
        },
        ...options.xAxis
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: designTokens.colors.text.secondary,
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: designTokens.colors.gray[200],
            type: 'dashed'
          }
        },
        ...options.yAxis
      },
      series: options.series?.map(s => ({
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2
        },
        areaStyle: s.areaStyle !== false ? {
          opacity: 0.1
        } : undefined,
        ...s
      })) || [],
      ...options
    }
  }

  // 柱状图配置
  const getBarChartConfig = (options = {}) => {
    return {
      ...commonChartConfig,
      xAxis: {
        type: 'category',
        axisLine: {
          lineStyle: {
            color: designTokens.colors.gray[300]
          }
        },
        axisLabel: {
          color: designTokens.colors.text.secondary,
          fontSize: 11
        },
        ...options.xAxis
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: designTokens.colors.text.secondary,
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: designTokens.colors.gray[200],
            type: 'dashed'
          }
        },
        ...options.yAxis
      },
      series: options.series?.map(s => ({
        type: 'bar',
        barMaxWidth: 40,
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        },
        ...s
      })) || [],
      ...options
    }
  }

  // 饼图配置
  const getPieChartConfig = (options = {}) => {
    return {
      ...commonChartConfig,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: designTokens.colors.gray[200],
        borderWidth: 1,
        textStyle: {
          color: designTokens.colors.text.primary,
          fontSize: 12
        },
        padding: [8, 12],
        extraCssText: `box-shadow: ${designTokens.shadow.md}; border-radius: ${designTokens.radius.md};`,
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'center',
        textStyle: {
          color: designTokens.colors.text.secondary,
          fontSize: 12
        },
        ...options.legend
      },
      series: options.series?.map(s => ({
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        ...s
      })) || [],
      ...options
    }
  }

  // 环形图配置
  const getDoughnutChartConfig = (options = {}) => {
    return getPieChartConfig({
      ...options,
      series: options.series?.map(s => ({
        ...s,
        radius: ['50%', '70%']
      }))
    })
  }

  // 面积图配置
  const getAreaChartConfig = (options = {}) => {
    return getLineChartConfig({
      ...options,
      series: options.series?.map(s => ({
        ...s,
        areaStyle: {
          opacity: 0.3,
          ...s.areaStyle
        }
      }))
    })
  }

  // 颜色方案
  const colorSchemes = {
    profit: [designTokens.colors.primary, designTokens.colors.danger],
    category: [
      designTokens.colors.primary,
      designTokens.colors.info,
      designTokens.colors.warning,
      designTokens.colors.danger,
      '#8b5cf6',
      '#06b6d4'
    ],
    gradient: {
      profit: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(24, 160, 88, 0.3)' },
          { offset: 1, color: 'rgba(24, 160, 88, 0.05)' }
        ]
      },
      loss: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(208, 48, 80, 0.3)' },
          { offset: 1, color: 'rgba(208, 48, 80, 0.05)' }
        ]
      }
    }
  }

  // 格式化金额
  const formatMoney = (value) => {
    return value.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // 格式化百分比
  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`
  }

  // 响应式配置
  const getResponsiveConfig = () => {
    const isMobile = window.innerWidth <= 768

    return {
      grid: {
        left: isMobile ? '5%' : '3%',
        right: isMobile ? '5%' : '4%',
        bottom: isMobile ? '5%' : '3%',
        top: isMobile ? '15%' : '10%',
        containLabel: true
      },
      legend: {
        orient: isMobile ? 'horizontal' : 'vertical',
        top: isMobile ? 'top' : 'center',
        right: isMobile ? 'center' : '10%'
      }
    }
  }

  return {
    // 配置方法
    commonChartConfig,
    getLineChartConfig,
    getBarChartConfig,
    getPieChartConfig,
    getDoughnutChartConfig,
    getAreaChartConfig,
    getResponsiveConfig,

    // 颜色方案
    colorSchemes,

    // 工具方法
    formatMoney,
    formatPercent
  }
}
