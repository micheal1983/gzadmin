// 1. 配置 API 请求的服务器地址 (以后本地开发和线上部署，只需在这里切换注释)
export const API_BASE_URL = 'http://localhost:8000/api/'
//export const API_BASE_URL = 'http://localhost:8000/api/'
export const R2_DOMAIN = 'https://image.digidiving.com'

export const getFullUrl = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    const domain = R2_DOMAIN.endsWith('/') ? R2_DOMAIN.slice(0, -1) : R2_DOMAIN
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${domain}${cleanPath}`
}

// 🌟 新增：通用 info 字段解析器
export const parseExtInfo = (info) => {
    const defaultData = { author: 'Admin', content: '', cover: '', is_recommend: 0, is_new: 0 }
    if (!info) return defaultData
    try {
        let obj = typeof info === 'string' ? JSON.parse(info) : info
        if (typeof obj === 'string') obj = JSON.parse(obj)
        return { ...defaultData, ...obj }
    } catch (e) {
        return defaultData
    }
}