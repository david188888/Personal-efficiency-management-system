import Mock from 'mockjs'
import homeApi from './mockServeData/home'

// 拦截请求接口
Mock.mock(/home\/getData/,homeApi.getStatisticalData) 



