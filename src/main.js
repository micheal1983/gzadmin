import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 添加请求拦截器
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        // 注意：Bearer 后面有个空格
        config.headers.Authorization = 'Bearer ' + token
    }
    return config
})

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // 发现 Token 失效，清理并跳转
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

createApp(App).use(router).mount('#app')
