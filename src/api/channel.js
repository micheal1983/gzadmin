import request from './request'

export const channelApi = {
    // 获取频道列表
    getList() {
        return request.get('/channel/index')
    },
    // 获取模型列表（用于添加/编辑时的下拉菜单）
    getModels() {
        return request.get('/model/index')
    },
    // 添加频道
    add(data) {
        return request.post('/channel/add', {
            name: data.name,
            model_id: data.model_id,
            remark: data.remark,
            status: 1,
            create_time: Math.floor(Date.now() / 1000)
        })
    },
    // 修改频道
    update(id, data) {
        return request.post(`/channels/mif?id=${id}`, {
            name: data.name,
            model_id: data.model_id,
            remark: data.remark,
            update_time: Math.floor(Date.now() / 1000)
        })
    },
    // 删除频道
    delete(id) {
        return request.get(`/channels/del?id=${id}`)
    }
}