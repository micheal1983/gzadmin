// 1. 配置 API 请求的服务器地址 (以后本地开发和线上部署，只需在这里切换注释)
//export const API_BASE_URL = 'https://tp5-5wz8.onrender.com/api/'
export const API_BASE_URL = 'http://localhost:8000/api/'

export const R2_DOMAIN = 'https://image.digidiving.com'

// 🌟 修改：支持传入模型(model)和频道(channel)参数进行动态拼接
export const getFullUrl = (path, model = 'games', channel = 'gz') => {
    if (!path) return ''
    if (path.startsWith('http')) return path

    // 确保域名结尾没有斜杠
    const domain = R2_DOMAIN.endsWith('/') ? R2_DOMAIN.slice(0, -1) : R2_DOMAIN
    // 确保文件名前面有斜杠
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    // 拼接成完整路径：域名/模型/频道/文件名
    return `${domain}/${model}/${channel}${cleanPath}`
}

// 🌟 通用 info 字段解析器
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