// src/utils/format.js

// 1. 配置 API 请求的服务器地址 (以后本地开发和线上部署，只需在这里切换注释)
export const API_BASE_URL = 'http://localhost:8000/api/'
// export const API_BASE_URL = 'https://tp5-5wz8.onrender.com/api/'

// 2. 配置 R2 图片服务器域名
export const R2_DOMAIN = 'https://image.digidiving.com'

// 3. 统一的图片地址处理函数
export const getFullUrl = (path) => {
    if (!path) return ''
    // 如果已经是完整的 http 链接，直接返回
    if (path.startsWith('http')) return path

    // 稳健拼接，防止出现双斜杠
    const domain = R2_DOMAIN.endsWith('/') ? R2_DOMAIN.slice(0, -1) : R2_DOMAIN
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    return `${domain}${cleanPath}`
}