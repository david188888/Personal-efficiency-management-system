import axios from 'axios'

const baseurl ='/api'

// 二次封装axios
class httpRequest {
    constructor(baseurl) {
        this.baseurl = baseurl
    }

    getInsideConfig() { //定义初始参数
        const config = {
            baseURL: this.baseurl,
            headers: {}
        }
        return config
    }

    interceptors(instance) {
        // 添加请求拦截器
        instance.interceptors.request.use(function (config) {
          // 在发送请求之前做些什么
          return config;
        }, function (error) {
          // 对请求错误做些什么
          return Promise.reject(error);
        });
    
        // 添加响应拦截器
        instance.interceptors.response.use(function (response) {
          // 对响应数据做点什么
          return response;
        }, function (error) {
          console.log(error, 'error')
          // 对响应错误做点什么
          return Promise.reject(error);
        });
      }

    request(options) { //定义请求方法
        options = {...options, ...this.getInsideConfig()} //合并初始参数和传入参数
        const instance = axios.create()//创建axios实例
        this.interceptors(instance) // 绑定拦截器
        return instance(options) //返回axios实例
    }
    
}

export default new httpRequest(baseurl)