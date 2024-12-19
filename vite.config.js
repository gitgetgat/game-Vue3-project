import { fileURLToPath, URL } from 'node:url'

import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import postcssNesting from 'postcss-nesting';

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import copyPublicPlugin from './vite-plugin-copy-public'; // 引入自定义插件

// https://vite.dev/config/
export default defineConfig({
  base: "/game-Vue3-project/",
  cleanUrls: true, //生成简洁的 URL
  css: {
    postcss: {
      plugins: [
        tailwind(),
        autoprefixer(),
        postcssNesting
      ],
    },
  },
  plugins: [
    vue(),
    copyPublicPlugin(), // 注册自定义插件
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})