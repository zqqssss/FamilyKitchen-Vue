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

export default router
