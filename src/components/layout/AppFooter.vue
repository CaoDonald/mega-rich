<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-content">
        <p class="copyright">© 2026 Mega Rich. All rights reserved.</p>
        <div class="footer-links">
          <a href="#" class="footer-link">关于</a>
          <a href="#" class="footer-link">隐私政策</a>
          <a href="#" class="footer-link">使用条款</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  background: var(--color-bg-base);
  border-top: 1px solid var(--color-gray-200);
  margin-top: auto;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.copyright {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.footer-links {
  display: flex;
  gap: var(--spacing-lg);
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-base);
}

.footer-link:hover {
  color: var(--color-primary);
}

/* 移动端样式 */
@media (max-width: 768px) {
  .footer-container {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }
}
</style>
