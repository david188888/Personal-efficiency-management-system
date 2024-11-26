import http from './axios' // 获取封装好的axios实例

export const getData = () => {
    return http.request({ // 调用二次封装的request
        url: '/home/getData',
        method: 'get',
    })
}

export const getUser = (params) => {
    return http.request({
        url: '/user/getUser',
        method: 'get',
        params
    })
}

export const addUser = (data) => {
    return http.request({
        url:'/user/addUser',
        method: 'post',
        data
    })
}

export const editUser = (data) => {
    return http.request({
        url: '/user/editUser',
        method: 'post',
        data
    })
}

export const deleteUser = (data) => {
    return http.request({
        url:'/user/deleteUser',
        method: 'post',
        data
    })
}

export const getMenu = (data)=>{
    return http.request({
        url:'permission/getMenu',
        method:'post',
        data
    })
}