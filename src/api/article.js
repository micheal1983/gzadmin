import request from './request'

export const articleApi = {
    // 获取列表
    getList() {
        return request.get('/article/index')
    },
    // 获取详情
    getDetail(id) {
        return request.get(`/article/findById?id=${id}`)
    },
    // 添加文章：注意字段名匹配数据库
    add(data) {
        return request.post('/article/add', {
            name: data.title,             // 数据库字段为 name
            channel_id: 1,                // 默认为管理员频道
            status: 1,
            info: JSON.stringify({        // 复杂正文存入 info
                content: data.content,
                author: data.author
            }),
            create_time: Math.floor(Date.now() / 1000)
        })
    },
    // 修改文章
    update(id, data) {
        return request.post(`/article/mif?id=${id}`, {
            name: data.title,
            info: JSON.stringify({
                content: data.content,
                author: data.author
            }),
            update_time: Math.floor(Date.now() / 1000)
        })
    }
}