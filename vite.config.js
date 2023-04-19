import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// unocss
import Unocss from 'unocss/vite'
// custom icons
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

import { createHtmlPlugin } from 'vite-plugin-html'

// rollup打包分析插件
import { visualizer } from 'rollup-plugin-visualizer'
// 压缩
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isBuild = command === 'build'
  const APP_TITLE = env.VITE_APP_TITLE

  return {
    plugins: [
      vue(),
      Unocss(),
      Icons({
        compiler: 'vue3',
        customCollections: {
          custom: FileSystemIconLoader(resolve(process.cwd(), 'src/assets/svgs')),
        },
        scale: 1,
        defaultCalss: 'inline-block',
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/assets/svgs')],
        symbolId: 'icon-custom-[dir]-[name]',
        inject: 'body-last',
        customDomId: '__CUSTOM_SVG_ICON__',
      }),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
        ],
        resolvers: [
          ElementPlusResolver(),
        ],
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({ customCollections: ['custom'], componentPrefix: 'icon' }),
        ],
      }),
      createHtmlPlugin({
        minify: isBuild,
        inject: {
          data: {
            title: APP_TITLE,
          },
        },
      }),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
      viteCompression({
        ext: '.gz', // gz br
        algorithm: 'gzip',
        deleteOriginFile: true,
      }),
    ],
    base: './', // 配置文件的根目录为相对路径， 默认为 '/'
    server: {
      host: true, // 默认 'localhost', 可以设置为 '0.0.0.0' or true
      https: false, // 是否启用 https
      cors: true, // 为开发服务器配置 CORS, 默认启用并允许任何源
      open: true, // 服务启动时自动在浏览器中打开应用
      port: 3000, // 启动端口
      strictPort: false, // 设为true时端口被占用则直接退出, 不会尝试下一个可用端口
      hmr: true, // 热更新
      /** 设置代理 */
      proxy: {
        '/api': {
          traget: 'http://localhost:3000',
          changeOrigin: true, // 改变来源
          rewrite: path => path.replace(/^\/api/, ''), // 重写path
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
      // 忽略后缀名的配置选项, 添加 .vue 选项时要记得原本默认忽略的选项也要手动写入
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    css: {
      preprocessorOptions: {
        // 全局样式变量引入
        scss: {
          additionalData: '@import "@/styles/variables.scss";',
        },
      },
    },
    build: {
      outDir: 'dist', // 指定输出路径
      assetsDir: 'static', // 生成静态资源的存放路径
      cssCodeSplit: true, // 启用 CSS 代码拆分。如果禁用，整个项目中的所有 CSS 将被提取到一个 CSS 文件中
      sourcemap: false, // 构建后是否生成 source map 文件
      chunkSizeWarningLimit: 1024, // 单位 kb, 打包后文件大小警告的限制
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  }
})
