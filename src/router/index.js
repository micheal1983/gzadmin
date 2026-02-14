import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import Home from '../views/home.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// src/router/index.js
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    // 如果访问的不是登录页，且没有 token，则强制跳转登录
    if (to.path !== '/login' && !token) {
        next('/login')
    } else {
        next() // 否则放行
    }
})

export default router