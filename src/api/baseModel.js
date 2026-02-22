import request from './request'

export class BaseModelApi {
    constructor(path) {
        this.path = path // 如 'article' 或 'game'
    }

    getList(params) {
        return request.get(`/${this.path}/getAll`, { params })
    }

    getDetail(id) {
        return request.get(`/${this.path}/getById?id=${id}`)
    }

    add(data) {
        return request.post(`/${this.path}/add`, data)
    }

    update(id, data) {
        return request.post(`/${this.path}/mif?id=${id}`, data)
    }

    del(id) {
        return request.post(`/${this.path}/del?id=${id}`)
    }
}

// 统一导出
export const articleApi = new BaseModelApi('article')
export const gameApi = new BaseModelApi('game')
export const pictureApi = new BaseModelApi('picture')
export const userApi = new BaseModelApi('user')