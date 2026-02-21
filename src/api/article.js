import request from './request'

export const articleApi = {
    // 获取列表
    getList(params) {
        return request.get('/article/getAll', { params })
    },

    // 获取详情
    getDetail(id) {
        return request.get(`/article/getById?id=${id}`)
    },

    // 修改文章
    update(id, data) {
        return request.post(`/article/mif?id=${id}`, {
            name: data.title,
            channel_id: data.channel_id, // 修复：必须传给后端
            status: data.status,
            info: data.info,
            update_time: Math.floor(Date.now() / 1000)
        })
    },

    // 新增文章
    add(data) {
        return request.post('/article/add', {
            name: data.title,
            channel_id: data.channel_id, // 修复：确保传给后端
            status: data.status,
            info: data.info,
            create_time: Math.floor(Date.now() / 1000)
        })
    },

    // 删除文章
    del(id) {
        return request.post(`/article/del?id=${id}`)
    },
}