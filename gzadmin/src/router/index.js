import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Test from "../views/test.vue";
import Login from "../views/login.vue";

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/test', name: 'Test', component: Test },
    { path: '/login', name: 'Login', component: Login },
]

const router = createRouter({
    history: createWebHistory('/gzadmin/'),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 总是滚动到顶部
        return { top: 0 }
    }
})

export default router
