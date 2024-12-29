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
          // 修改处理逻辑，确保能处理多种数据格式
          const hours = response.data.map(item => {
            // 检查 duration 的类型并相应处理
            if (typeof item.duration === 'string') {
              // 如果是字符串格式 "HH:MM:SS"
              const [hours, minutes, seconds] = item.duration.split(':').map(Number);
              return parseFloat((hours + minutes / 60 + seconds / 3600).toFixed(2));
            } else if (typeof item.duration === 'number') {
              // 如果是数字格式（假设是秒）
              return parseFloat((item.duration / 3600).toFixed(2));
            } else {
              // 如果是其他格式，返回0
              console.warn('Unexpected duration format:', item.duration);
              return 0;
            }
          });
          console.log('hours', hours);
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
            const {orderData,userData,videoData } = res.data
            console.log('orderData',orderData)
            console.log('userData',userData)
            console.log('videoData',videoData)          

            // 折线图数据处理
            const xData = orderData.date
            const series = [{
                name: 'Daily Work Hours',
                type: 'line',
                data: orderData.data.workHours,
                smooth: true
            }]

            // 更新图表数据
            setEchartData({
                order: {
                    title: 'The amount of time your team spent on accomplishing tasks last week',
                    xData,
                    series,
                },
                user: {
                    title: 'State of your completion tasks last week',
                    xData: userData.map(item => item.date),
                    series: [
                        {
                            name: 'Completed Tasks',
                            data: userData.map(item => item.new),
                            type: 'bar',
                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{c}'
                            }
                        },
                        {
                            name: 'Completion Rate',
                            data: userData.map(item => item.active),
                            type: 'bar',
                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{c}%'
                            }
                        },
                        {
                            name: 'Total Hours',
                            data: totalHours,
                            type: 'bar',
                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{c}h'
                            }
                        }
                    ]
                },
                video: {
                    title: 'The distribution of completed tasks',
                    series: [{
                        name: 'Task Distribution',
                        data: videoData,
                        type: 'pie'
                    }]
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