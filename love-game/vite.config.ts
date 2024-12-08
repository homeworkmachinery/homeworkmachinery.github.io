import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({

  build: {
    outDir: 'dist',  // 输出目录
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),  // 设置入口文件
    },
  },
  publicDir: 'public',  // 指定 public 文件夹
  optimizeDeps: {
    include: ['three'],  // 强制 Vite 优化 three.js
  },
});
