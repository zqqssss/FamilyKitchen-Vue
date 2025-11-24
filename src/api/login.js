import request from '@/utils/request'

// 登录接口
export const loginApi = (data) => {
    return request({
        url: '/admin/login', // 对应后端的 Controller 路径
        method: 'post',
        data
    })
}
