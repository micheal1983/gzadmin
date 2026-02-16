import request from './request'

export const articleApi = {
    // 获取列表
    getList() {
        return request.get('/article/getAll')
    },

    // 获取详情
    getDetail(id) {
        return request.get(`/article/getById?id=${id}`)
    },

    // 修改后的 update 方法
    update(id, data) {
        console.log(data);
        return request.post(`/article/mif?id=${id}`, {
            name: data.title,    // 将组件传的 title 映射为数据库的 name
            status: data.status, // 必须显式传递 status，否则更新后状态会丢失
            info: data.info,     // 直接接收组件打包好的 JSON 字符串 (包含 content, cover, author)
            update_time: Math.floor(Date.now() / 1000)
        })
    },

    // 修改后的 add 方法
    add(data) {
        return request.post('/article/add', {
            name: data.title,
            channel_id: data.channel_id || 1,
            status: data.status, // 确保新增时也带上状态
            info: data.info,     // 直接接收组件打包好的 JSON
            create_time: Math.floor(Date.now() / 1000)
        })
    },

    // 删除文章 (统一使用 ?id=)
    // 这样后端可以通过相同的方式获取 ID，保持逻辑纯净
    del(id) {
        return request.post(`/article/del?id=${id}`)
    },
}