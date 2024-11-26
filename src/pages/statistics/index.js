import React,{useEffect,useState} from "react";
import * as Icon from "@ant-design/icons";
import {getData} from "../../api";
import MyEcharts from "../../components/echarts";


const Statistics = () => {

    useEffect(() => { //页面加载完成后才调用接口
        getData().then(res => {
            // console.log('1',res.data.data)
            const { tableData,orderData,userData,videoData } = res.data.data
            console.log(tableData,orderData,userData,videoData)
            setTableData(tableData)

            // 给echarts传入数据前 进行数据组装
            const order = orderData
            // x轴数据
            const xData = order.date
            const keyArray = Object.keys(orderData.data[0]) // 获取对象中的key 转为数组
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
                xData,
                series
              },
              user:{
                xData:userData.map(item => item.date),
                series: [
                  {
                    name:'新增用户',
                    data:userData.map(item => item.new),
                    type:'bar'
                  },
                  {
                    name:'活跃用户',
                    data:userData.map(item => item.active),
                    type:'bar'
                  }
                ]
              },
              video: {
                series:[
                  {
                    data:videoData,
                    type:'pie'
                  }
                ]
              }
            })
        })
        
      },[])

    // 组件间传递series 创建echart响应式数据
    const [echartData,setEchartData] = useState({})
      //定义table数组
    const [tableData,setTableData] = useState([])
    
    return (
       <>
            <h1>Statistics</h1>
        {echartData.order && <MyEcharts chartData={echartData.order} style={{height:'280px',width:'100%'}}/>}
        <div className="graph">
          {echartData.user && <MyEcharts chartData={echartData.user} style={{height:'250px',width:'50%'}}/>}
          {echartData.video && <MyEcharts chartData={echartData.video} style={{ width:'50%', height: '260px' }}/> }
        </div>
        </>
    )
}

export default Statistics;