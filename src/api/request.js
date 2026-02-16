import axios from 'axios'

// 1. 创建实例
const service = axios.create({
    // 以后换服务器，只需要改这里！
    baseURL: 'https://tp5-5wz8.onrender.com/api',
    //baseURL: 'http://localhost:8000/api/',
    timeout: 5000 // 请求超时时间
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