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
        <div class="feature-card" @click="navigateTo('invest')" style="cursor: pointer;">
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
        <div class="feature-card" @click="navigateTo('salary')" style="cursor: pointer;">
          <n-icon :size="48">
            <WalletOutline />
          </n-icon>
          <h4>月薪管理</h4>
          <p>轻松管理您的月薪和年终奖记录</p>
        </div>
        <div class="feature-card" @click="navigateTo('balance')" style="cursor: pointer;">
          <n-icon :size="48">
            <TrendingUpOutline />
          </n-icon>
          <h4>结余管理</h4>
          <p>实时追踪和分析您的收支结余情况</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { CashOutline, BarChartOutline, ShieldCheckmarkOutline, WalletOutline, TrendingUpOutline } from '@vicons/ionicons5'
import { inject } from 'vue'

const navigateTo = inject('navigateTo')

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
  box-sizing: border-box;
}

.hero-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 60px;
  box-sizing: border-box;
}

.hero-section h2 {
  font-size: 36px;
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-section p {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
  line-height: 1.5;
}

.features-section {
  text-align: center;
  margin-bottom: 60px;
}

.features-section h3 {
  font-size: 28px;
  margin-bottom: 40px;
  line-height: 1.2;
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
  box-sizing: border-box;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.feature-card h4 {
  font-size: 20px;
  margin: 20px 0 10px 0;
  line-height: 1.2;
}

.feature-card p {
  color: #666;
  font-size: 16px;
  line-height: 1.5;
}

/* 平板设备响应式设计 */
@media (max-width: 768px) {
  .home-container {
    padding: 20px 15px;
  }

  .hero-section {
    padding: 40px 20px;
    margin-bottom: 40px;
  }

  .hero-section h2 {
    font-size: 28px;
  }

  .hero-section p {
    font-size: 16px;
    margin-bottom: 24px;
  }

  .features-section {
    margin-bottom: 40px;
  }

  .features-section h3 {
    font-size: 24px;
    margin-bottom: 30px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .feature-card {
    padding: 25px;
  }
}

/* 手机设备响应式设计 */
@media (max-width: 480px) {
  .home-container {
    padding: 15px 10px;
  }

  .hero-section {
    padding: 30px 15px;
    border-radius: 8px;
    margin-bottom: 30px;
  }

  .hero-section h2 {
    font-size: 24px;
  }

  .hero-section p {
    font-size: 14px;
    margin-bottom: 20px;
  }

  .features-section h3 {
    font-size: 20px;
    margin-bottom: 25px;
  }

  .feature-card {
    padding: 20px 15px;
  }

  .feature-card h4 {
    font-size: 18px;
    margin: 15px 0 8px 0;
  }

  .feature-card p {
    font-size: 14px;
  }
}
</style>