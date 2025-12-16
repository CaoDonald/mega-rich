<template>
  <div class="home-container">
    <div class="hero-section">
      <h2>欢迎来到 Mega Rich</h2>
      <p>探索财富管理的新时代</p>
      <n-button type="primary" size="large" @click="exploreFeatures">
        探索功能
      </n-button>
    </div>

    <div class="features-section">
      <h3>核心功能</h3>
      <div class="features-grid">
        <div class="feature-card">
          <n-icon :size="48">
            <CashOutline />
          </n-icon>
          <h4>财富追踪</h4>
          <p>实时监控您的资产和投资组合</p>
        </div>
        <div class="feature-card">
          <n-icon :size="48">
            <BarChartOutline />
          </n-icon>
          <h4>数据分析</h4>
          <p>强大的分析工具帮助您做出明智决策</p>
        </div>
        <div class="feature-card">
          <n-icon :size="48">
            <ShieldCheckmarkOutline />
          </n-icon>
          <h4>安全保障</h4>
          <p>银行级别的安全措施保护您的数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { CashOutline, BarChartOutline, ShieldCheckmarkOutline } from '@vicons/ionicons5'

const exploreFeatures = () => {
  // 这里可以添加探索功能的逻辑
  console.log('探索功能')
}
</script>

<style scoped>
.home-container {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 60px;
}

.hero-section h2 {
  font-size: 36px;
  margin-bottom: 16px;
}

.hero-section p {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.features-section {
  text-align: center;
  margin-bottom: 60px;
}

.features-section h3 {
  font-size: 28px;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  padding: 30px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.feature-card h4 {
  font-size: 20px;
  margin: 20px 0 10px 0;
}

.feature-card p {
  color: #666;
  font-size: 16px;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;
  }

  .hero-section h2 {
    font-size: 28px;
  }

  .hero-section p {
    font-size: 16px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>