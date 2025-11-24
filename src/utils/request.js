import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
    baseURL: '/api', // 这里会匹配 vite.config.js 中的代理配置
    timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        // 例如：如果有 token，这就带上
        const token = localStorage.getItem('adminToken')
        if (token) {
            config.headers['token'] = token
        }
        return config
    },
    error => {
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data
        // 这里根据你后端的 Result 结构进行判断
        // 假设后端成功是 code === 200
        if (res.code !== 200) {
            ElMessage.error(res.message || '系统错误')
            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res.data // 直接返回 data 部分
        }
    },
    error => {
        console.log('err' + error) // for debug
        ElMessage.error(error.message || '网络请求失败')
        return Promise.reject(error)
    }
)

export default service
