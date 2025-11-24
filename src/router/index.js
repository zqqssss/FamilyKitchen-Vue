import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/login/index.vue')
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('../views/dashboard/index.vue'),
                meta: { title: '首页' }
            },
            {
                path: 'dish',
                name: 'Dish',
                component: () => import('../views/dish/index.vue'),
                meta: { title: '菜品管理' }
            },
            {
                path: 'order',
                name: 'Order',
                component: () => import('../views/order/index.vue'),
                meta: { title: '订单管理' }
            },
            {
                path: 'feedback',
                name: 'Feedback',
                component: () => import('../views/feedback/index.vue'),
                meta: { title: '反馈管理' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// ✨✨✨ 新增：全局前置守卫 ✨✨✨
router.beforeEach((to, from, next) => {
    // 1. 获取 token (注意 key 要和你登录页面存的一致，之前我们用的是 'adminToken')
    const token = localStorage.getItem('adminToken')

    // 2. 判断逻辑
    if (to.path === '/login') {
        // 如果去的是登录页，且已经有 token，直接转到首页
        if (token) {
            next('/')
        } else {
            next() // 没 token，允许去登录页
        }
    } else {
        // 如果去的不是登录页（比如首页、订单页），必须有 token
        if (!token) {
            next('/login') // 没 token，强制打回登录页
        } else {
            next() // 有 token，放行
        }
    }
})

export default router
