import { createRouter, createWebHashHistory } from 'vue-router'

import routes from './routes'

const router = createRouter({
  // vueRouter@3版本的mode改成了histort,hash模式配置createWebHashHistory,history模式配置createWebHistory
  history: createWebHashHistory(),
  routes,
  strict: false,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

/**
 * 初始化路由函数
 * @params app
 */
export function setupRouter(app) {
  app.use(router)
}

export default router
