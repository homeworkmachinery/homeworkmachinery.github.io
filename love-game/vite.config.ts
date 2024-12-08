import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 确保入口文件是 scene-1.ts
        main: path.resolve(__dirname, 'index.html'),
      },
    },
    assetsInlineLimit: 0, // 防止将大于 0 的资源内联
   
  },
  server: {
    port: 3000,
    open: true,
  },
  publicDir: 'public',  // 指定 public 文件夹
  optimizeDeps: {
    include: ['three'],  // 强制 Vite 优化 three.js
  },
});
