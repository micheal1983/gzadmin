import axios from 'axios'
// 引入我们在 format.js 中集中管理的 API 地址
import { API_BASE_URL } from '../utils/format'

// 1. 创建实例
const service = axios.create({
    // 动态使用统一配置的域名！
    baseURL: API_BASE_URL,
    timeout: 10000 // 请求超时时间
})

// 2. 请求拦截器（自动注入 Token）
service.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// 3. 响应拦截器（全局处理 401 等错误）
service.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response && error.response.status === 401) {
            alert('登录已过期，请重新登录')
            location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default service