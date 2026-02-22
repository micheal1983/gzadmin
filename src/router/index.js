import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'), // 布局架子
        redirect: '/home',
        children: [
            {
                path: 'home',
                name: 'Home',
                component: () => import('../views/Home.vue') // 默认进入的内容页
            },
            // === 🌟 新增：用户管理路由 ===
            {
                path: 'user-list',
                name: 'UserList',
                component: () => import('../views/user/UserList.vue')
            },
            // === 新增：频道管理路由 ===
            {
                path: 'channel-list',
                name: 'ChannelList',
                component: () => import('../views/channel/ChannelList.vue')
            },
            // === 新增结束 ===
            // --- 游戏管理 ---
            {
                path: 'game-add',
                name: 'GameAdd',
                component: () => import('../views/game/GameForm.vue')
            },
            {
                path: 'game-edit/:id', // 动态路由传参
                name: 'GameEdit',
                component: () => import('../views/game/GameForm.vue')
            },
            {
                path: 'game-list',
                name: 'GameList',
                component: () => import('../views/game/GameList.vue')
            },
            // --- 文章管理 ---
            {
                path: 'article-add',
                name: 'ArticleAdd',
                component: () => import('../views/article/ArticleForm.vue')
            },
            {
                path: 'article-edit/:id', // 动态路由传参
                name: 'ArticleEdit',
                component: () => import('../views/article/ArticleForm.vue')
            },
            {
                path: 'article-list',
                name: 'ArticleList',
                component: () => import('../views/article/ArticleList.vue')
            },
            // 图片管理
            {
                path: '/picture-list',
                name: 'PictureList',
                component: () => import('../views/picture/PictureList.vue')
            },
            {
                path: '/picture-add',
                name: 'PictureAdd',
                component: () => import('../views/picture/PictureForm.vue')
            },
            {
                path: '/picture-edit/:id',
                name: 'PictureEdit',
                component: () => import('../views/picture/PictureForm.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// --- 路由守卫逻辑 ---
// router/index.js
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token'); // 确保这里的 key 和 login 存的一致

    if (to.path === '/login') {
        next(); // 如果是去登录页，必须直接放行，否则会死循环
    } else if (!token) {
        next('/login'); // 没 Token 且不是去登录页，踢回登录
    } else {
        next(); // 有 Token，正常放行
    }
});

export default router;