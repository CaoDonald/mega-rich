// 1. 基础样式常量抽离（复用性最高的基础配置）
const baseTextStyle = {
    fontSize: '12px', // 默认文本字号
    tinyFontSize: '8px', // 极小字号
    fontWeightNormal: '500', // 常规字重
    fontWeightBold: 'bold' // 粗体
};

// 2. 坐标轴指示器公共配置
const commonAxisPointer = {
    type: 'cross',
    label: {
        backgroundColor: '#6a7985',
        fontSize: baseTextStyle.fontSize,
        padding: [5, 8],
        zlevel: 200,
        overflow: 'none'
    },
    zlevel: 200
};

// 3. LabelLine 公共配置
const commonLabelLine = {
    lineStyle: {
        width: 0.5
    },
    length: 8,
    length2: 3,
    smooth: 0.2
};

// 4. 饼图系列公共配置
const pieSeriesCommon = {
    minAngle: 2, // 最小扇区
    minShowLabelAngle: 3, // 最小呈现扇区
    center: ['50%', '60%'],
    label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: baseTextStyle.fontSize
    },
    emphasis: {
        label: {
            show: true,
            fontSize: baseTextStyle.fontSize,
            fontWeight: baseTextStyle.fontWeightBold
        }
    },
    labelLine: {
        ...commonLabelLine
    }
};

// 图表公共配置
const commonChartConfig = {
    title: {
        text: '',
        left: 'center',
        top: 5,
        textStyle: {
            fontSize: baseTextStyle.fontSize,
            fontWeight: baseTextStyle.fontWeightNormal
        }
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: commonAxisPointer,
        triggerOn: 'click',
        padding: 10,
        zlevel: 200,
        confine: true,
        appendToBody: true,
        textStyle: {
            fontSize: baseTextStyle.fontSize,
            zlevel: 200
        }
    },
    legend: {
        width: '90%',
        top: 30,
        left: 'center',
        type: 'scroll',
        orient: 'horizontal',
        textStyle: {
            fontSize: baseTextStyle.fontSize
        },
        itemWidth: 10,
        itemHeight: 10,
        pageIconSize: 10,
        pageTextStyle: {
            fontSize: baseTextStyle.fontSize
        },
        pageButtonGap: 5,
        zlevel: 10
    },
    grid: {
        left: '8%',
        right: '8%',
        bottom: '10%',
        top: '30%',
        containLabel: true,
        zlevel: 10
    },
    dataZoom: {
        type: 'inside',
        start: 0,
        end: 100,
        zlevel: 10
    },
    xAxis: {
        axisLabel: {
            fontSize: baseTextStyle.fontSize,
            margin: 8
        },
        axisTick: {
            show: false,
            zlevel: 10
        },
        zlevel: 10
    },
    yAxis: {
        axisLabel: {
            fontSize: baseTextStyle.tinyFontSize,
            margin: 4,
            show: false
        },
        axisTick: {
            show: false,
            zlevel: 10
        },
        zlevel: 10
    }
};

// 移动端图表配置覆盖
const mobileChartConfig = {
    grid: {
        left: '3%',
        right: '3%',
        bottom: '15%',
        top: '25%',
        containLabel: true
    },
    legend: {
        bottom: 0,
        top: 'auto',
        orient: 'horizontal',
        textStyle: {
            fontSize: '10px'
        },
        itemWidth: 8,
        itemHeight: 8
    },
    xAxis: {
        axisLabel: {
            fontSize: '8px',
            margin: 4
        }
    }
};

// 饼图通用配置
const pieChartCommonConfig = {
    ...commonChartConfig,
    tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}元 ({d}%)',
        textStyle: {
            fontSize: baseTextStyle.fontSize
        },
        appendToBody: true
    },
    legend: {
        top: 'bottom',
        ...commonChartConfig.legend
    },
    series: [
        // 内层饼图
        {
            ...pieSeriesCommon,
            avoidLabelOverlap: true,
            type: 'pie',
            radius: ['0%', '35%'],
            itemStyle: {
                borderRadius: 4,
                borderColor: '#fff',
                borderWidth: 1
            },
            label: {
                ...pieSeriesCommon.label,
                position: 'inside' // 内层标签在内部
            },
            labelLine: {
                ...pieSeriesCommon.labelLine,
                show: false // 移动端隐藏连接线
            }
        },
        // 外层饼图
        {
            ...pieSeriesCommon,
            radius: ['40%', '60%'], // 外层二级分类环形
            type: 'pie',
            labelLine: {
                ...pieSeriesCommon.labelLine,
                show: true // 外层显示连接线
            }
        }
    ]
};

export {
    baseTextStyle,
    commonAxisPointer,
    commonChartConfig,
    mobileChartConfig,
    pieChartCommonConfig
};