import React,{useEffect,useState} from "react";
import * as Icon from "@ant-design/icons";
import {getData} from "../../api/index";
import MyEcharts from "../../components/echarts";
import axios from "axios";
import dayjs from "dayjs";

const Statistics = () => {
    
  //定义一周每天的任务总时长
  const [totalHours,setTotalHours] = useState([])

  //定义一周每天的任务数量
  const getTimeperday = () =>{
      // 计算过去7天的开始时间和今天的结束时间
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
      // 格式化日期为 ISO 8601 字符串
      const start_time_str = start.toISOString().slice(0, -5);
      const end_time_str = end.toISOString().slice(0, -5);
  
      // 构造请求URL
      const baseUrl = 'http://127.0.0.1:8080'
      const  url = `${baseUrl}/api/tasks/time_management_plot?start_time=${start_time_str}&end_time=${end_time_str}`;
  
      // 使用 axios 发送 GET 请求
      axios.get(url)
        .then(response => {
          // 在这里处理返回的数据
          console.log('请求每天任务时长',response.data);
          // 遍历 response.data 并计算每个 duration 的小时数
          const hours = response.data.map(item => {
          const [hours, minutes, seconds] = item.duration.split(':').map(Number);
          return parseFloat((hours + minutes / 60 + seconds / 3600).toFixed(2));
        });
         console.log('hours',hours)
          setTotalHours(hours);
        })
        .catch(error => {
          console.error('请求时长出错', error);
        });
  }
  
    useEffect(() => {
      getTimeperday()
    },[])

    useEffect(() => { //页面加载完成后才调用接口

        getData().then(res => {
            // console.log('1',res.data.data)
            const {orderData,userData,videoData } = res.data
            console.log('可视化数据',orderData,userData,videoData) // 分别是折线图 柱状图 饼图
          

            // 给echarts传入数据前 进行数据组装
            const order = orderData
            // x轴数据
            const xData = order.date
            const keyArray = Object.keys(orderData.data) // 获取对象中的key 转为数组
            // series数据
            const series = []
            keyArray.forEach(key => {
                series.push({
                    name: key,
                    type: 'line',
                    data: order.data.map(item => item[key])
                })
            }) 

            // 数据组装完成后进行更新
            setEchartData({
              order:{
                title: 'The amount of time your team spent on accomplishing tasks last week',
                xData,
                series,
              },
              user:{
                title: 'State of your completion tasks last week',
                xData:userData.map(item => item.date),
                series: [
                  {
                    name:'the number of completed tasks',
                    data:userData.map(item => item.new),
                    type:'bar',
                    label: {
                      show: true,
                      position: 'top', // 将标签显示在柱状图的顶部
                      formatter: '{c}'  
                    }
                  },
                  {
                    name:'task completion rate',
                    data:userData.map(item => item.active),
                    type:'bar',
                    label: {
                      show: true,
                      position: 'top', // 将标签显示在柱状图的顶部
                      formatter: '{c}%' // 使用formatter函数来格式化标签文本，其中{c}代表数据值
                    }
                  },
                  {
                    name:'total worked hour(s) today',
                    data:totalHours,
                    type:'bar',
                    label: {
                      show: true,
                      position: 'top', // 将标签显示在柱状图的顶部
                      formatter: '{c}' // 使用formatter函数来格式化标签文本，其中{c}代表数据值
                    }
                  }
                ]
              },
              video: {
                title:'The distibution of completed tasks',
                series:[
                  { 
                    name:'Proportion of time spent on tasks',
                    data:videoData,
                    type:'pie'
                  }
                ],
              }
            })
        })
        
      },[totalHours])

    // 组件间传递series 创建echart响应式数据
    const [echartData,setEchartData] = useState({})
      
    
    return (
       <>
           
        {echartData.order && <MyEcharts chartData={echartData.order} style={{height:'280px',width:'100%'}}/>}
       
          {echartData.user && <MyEcharts chartData={echartData.user} style={{height:'250px',width:'100%'}}/>}
          {echartData.video && <MyEcharts chartData={echartData.video} isAxisChart={false} style={{ left:'30rem',width:'460px', height: '70%' }}/> }
      
        </>
    )
}

export default Statistics;