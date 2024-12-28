import http from './axios' // 获取封装好的axios实例

export const getData = () => {
    return http.request({ // 调用二次封装的request
        url: '/home/getData',
        method: 'get',
    })
}