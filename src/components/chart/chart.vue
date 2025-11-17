<template>
  <view class="chart-container">
    <canvas 
      :canvas-id="canvasId" 
      :id="canvasId" 
      class="charts" 
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    ></canvas>
  </view>
</template>

<script>
import uCharts from '@qiun/ucharts';

export default {
  name: 'Chart',
  props: {
    canvasId: {
      type: String,
      default: 'chartCanvas'
    },
    type: {
      type: String,
      default: 'pie' // pie, line, column, area, radar, gauge, ring, bar
    },
    opts: {
      type: Object,
      default: () => ({})
    },
    categories: {
      type: Array,
      default: () => []
    },
    series: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chart: null,
      chartData: {
        categories: [],
        series: []
      }
    };
  },
  watch: {
    categories: {
      handler(newVal) {
        this.chartData.categories = newVal;
        this.updateChart();
      },
      deep: true
    },
    series: {
      handler(newVal) {
        this.chartData.series = newVal;
        this.updateChart();
      },
      deep: true
    },
    type(newVal) {
      this.initChart();
    }
  },
  mounted() {
    this.initChart();
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods: {
    initChart() {
      const systemInfo = uni.getSystemInfoSync();
      const pixelRatio = systemInfo.pixelRatio;
      
      this.chartData = {
        categories: this.categories,
        series: this.series
      };
      
      const config = {
        type: this.type,
        canvasId: this.canvasId,
        width: systemInfo.windowWidth,
        height: 300,
        pixelRatio: pixelRatio,
        ...this.getDefaultConfig(),
        ...this.opts
      };
      
      setTimeout(() => {
        // 获取canvas上下文
        const canvas = uni.createCanvasContext(this.canvasId, this);
        config.context = canvas;
        
        // 确保数据有效性，提供默认数据避免uCharts内部错误
        const safeCategories = this.chartData.categories && this.chartData.categories.length > 0 
          ? this.chartData.categories 
          : ['暂无数据'];
        
        const safeSeries = this.chartData.series && this.chartData.series.length > 0 
          ? this.chartData.series 
          : [{ name: '数据', data: [1] }];
        
        // 对饼图数据进行特殊处理，确保格式正确
        let seriesToUse = safeSeries;
        if (this.type === 'pie') {
          seriesToUse = this.fixPieSeriesData(safeSeries);
        }
        
        // 在配置中直接提供数据，避免构造函数内部访问未定义数据
        config.categories = safeCategories;
        config.series = seriesToUse;
        
        this.chart = new uCharts(config);
        
        // 如果实际数据有效，更新为实际数据
        if (this.chartData.categories && this.chartData.categories.length > 0 && 
            this.chartData.series && this.chartData.series.length > 0) {
          let seriesToUpdate = this.chartData.series;
          if (this.type === 'pie') {
            seriesToUpdate = this.fixPieSeriesData(this.chartData.series);
          }
          
          this.chart.updateData({
            categories: this.chartData.categories,
            series: seriesToUpdate
          });
        }
      }, 100);
    },
    
    updateChart() {
      if (this.chart && this.chartData.categories.length > 0 && this.chartData.series.length > 0) {
        // 对饼图数据进行特殊处理，确保格式正确
        let seriesToUpdate = this.chartData.series;
        if (this.type === 'pie') {
          seriesToUpdate = this.fixPieSeriesData(this.chartData.series);
        }
        
        this.chart.updateData({
          categories: this.chartData.categories,
          series: seriesToUpdate
        });
      }
    },
    
    // 修复饼图数据格式
    fixPieSeriesData(series) {
      if (!series || series.length === 0) return series;
      
      return series.map(seriesItem => {
        if (!seriesItem.data || !Array.isArray(seriesItem.data)) return seriesItem;
        
        // 检查数据格式，如果是数字数组，转换为对象数组
        const fixedData = seriesItem.data.map((item, index) => {
          if (typeof item === 'number') {
            // 如果是数字，转换为包含name和value的对象
            const categoryName = this.chartData.categories[index] || `数据${index + 1}`;
            return { name: categoryName, value: item };
          } else if (item && typeof item === 'object' && item.value !== undefined) {
            // 如果已经是正确的格式，确保有name属性
            return {
              name: item.name || this.chartData.categories[index] || `数据${index + 1}`,
              value: item.value
            };
          }
          return item;
        });
        
        return {
          ...seriesItem,
          data: fixedData
        };
      });
    },
    
    getDefaultConfig() {
      const baseConfig = {
        padding: [15, 15, 0, 15],
        colors: ['#1890FF', '#13C2C2', '#52C41A', '#FADB14', '#FA8C16', '#F5222D', '#722ED1', '#EB2F96'],
        dataLabel: true,
        dataPointShape: true,
        enableScroll: false,
        legend: {
          show: true,
          position: 'bottom',
          float: 'center',
          itemGap: 20,
          lineHeight: 14,
          margin: 5
        },
        xAxis: {
          disableGrid: false,
          gridType: 'dash',
          dashLength: 2,
          gridColor: '#CCCCCC',
          fontSize: 10
        },
        yAxis: {
          disabled: false,
          disableGrid: false,
          gridType: 'dash',
          dashLength: 2,
          gridColor: '#CCCCCC',
          data: [],
          format: (val) => {
            if (val >= 10000) {
              return (val / 10000).toFixed(1) + '万';
            }
            return val.toFixed(0);
          }
        },
        extra: {
          pie: {
            lableWidth: 15,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            labelWidth: 15,
            border: true,
            borderWidth: 1,
            borderColor: '#FFFFFF'
          },
          line: {
            type: 'straight',
            width: 2,
            area: false,
            gradient: false
          },
          column: {
            type: 'group',
            width: 10,
            activeBgColor: '#000000',
            activeBgOpacity: 0.08,
            columnGap: 5
          },
          tooltip: {
            showBox: true,
            textColor: '#FFFFFF',
            textSize: 12,
            bgColor: '#000000',
            bgOpacity: 0.7,
            gridType: 'solid',
            dashLength: 4,
            gridColor: '#CCCCCC'
          }
        }
      };
      
      return baseConfig;
    },
    
    touchStart(e) {
      if (this.chart) {
        this.chart.touchStart(e);
      }
    },
    
    touchMove(e) {
      if (this.chart) {
        this.chart.touchMove(e);
      }
    },
    
    touchEnd(e) {
      if (this.chart) {
        this.chart.touchEnd(e);
      }
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
  position: relative;
}

.charts {
  width: 100%;
  height: 300px;
}
</style>