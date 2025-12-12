import { defineConfig, UserConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url' // 新增：导入 url 模块
import Vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

import dts from 'vite-plugin-dts'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import VueDevTools from 'vite-plugin-vue-devtools'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

// ===================== 核心：模拟 __dirname =====================
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// ================================================================

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  let userConfig: UserConfig = {}

  // Development mode CSS configuration
  const cssConfig =
    mode !== 'lib'
      ? {
        css: {
          postcss: {
            plugins: [tailwind(), autoprefixer()]
          }
        }
      }
      : {}

  const commonPlugins = [
    Vue(),
    // 优化：仅开发模式加载 DevTools，减少打包体积
    command === 'serve' ? VueDevTools() : null,
    Components({
      resolvers: [
        IconsResolver({
          prefix: ''
        })
      ]
    }),
    Icons(),
    VueI18nPlugin({
      // 修复路径：去掉多余的 /，使用模拟的 __dirname
      include: [resolve(__dirname, 'src/locales/**')]
    })
  ].filter(Boolean) // 过滤 null 插件

  if (mode === 'lib') {
    userConfig.build = {
      lib: {
        // 修复路径：使用模拟的 __dirname，去掉 /
        entry: resolve(__dirname, 'packages/index.ts'),
        name: 'AuthUIVue',
        fileName: 'auth-ui-vue'
      },
      outDir: 'lib',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        // 补充：peerDependencies 也标记为外部依赖
        external: ['vue', '@supabase/auth-ui-shared', '@supabase/supabase-js'],
        output: {
          globals: {
            vue: 'Vue',
            '@supabase/auth-ui-shared': 'SupabaseAuthUiShared',
            '@supabase/supabase-js': 'SupabaseJs'
          }
        }
      }
    }
    userConfig.plugins = [
      ...commonPlugins,
      dts({
        include: './packages'
      }),
      libInjectCss() // 建议开启：将 CSS 内联到库中
    ]
  }

  return {
    ...cssConfig,
    resolve: {
      alias: {
        // 修复路径：去掉 /，使用模拟的 __dirname
        '@': resolve(__dirname, 'packages'),
        '~': resolve(__dirname, 'src')
      }
    },
    plugins: [...commonPlugins],
    ...userConfig
  }
})