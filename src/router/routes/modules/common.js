// 路由规则
const routes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import ('@/views/home'),
  },
  {
    path: '/chart',
    name: 'Chart',
    component: () => import ('@/views/chart'),
  },

]

export default routes
