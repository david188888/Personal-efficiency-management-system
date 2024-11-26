import Mock from 'mockjs'
import homeApi from './mockServeData/home'
import userApi from './mockServeData/user'
import permissionApi from './mockServeData/permission'

// 拦截请求接口
Mock.mock(/home\/getData/,homeApi.getStatisticalData) 

// get可以不写 post必须表明

Mock.mock(/user\/getUser/,userApi.getTaskList)

// 新增用户
Mock.mock(/user\/addeUser/,'post',userApi.createTask)
// 编辑用户
Mock.mock(/user\/editUser/,'post',userApi.updateTask)
 
// 删除用户
Mock.mock(/user\/deleteUser/, 'post', userApi.deleteTask)

// 登录
Mock.mock(/permission\/getMenu/,'post',permissionApi.getMenu)