import Reat,{useEffect, useRef} from 'react'
import * as echarts from 'echarts'

//echarts的配置项
// 有坐标系
const axisOption = {
    // 图例文字颜色
    textStyle: {
      color: "#333",
    },
    // 提示框
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category", // 类目轴
      data: [],
      axisLine: {
        lineStyle: {
          color: "#17b3a3",
        },
      },
      axisLabel: {
        interval: 0,
        color: "#333",
      },
    },
    yAxis: [
      {
        type: "value",
        axisLine: {
          lineStyle: {
            color: "#17b3a3",
          },
        },
      },
    ],
    color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980", "#d87a80", "#8d98b3"],
    series: [],
  }
  
  // 无坐标系的配置项
  const normalOption = {
    tooltip: {
      trigger: "item",
    },
    color: [
      "#0f78f4",
      "#dd536b",
      "#9462e5",
      "#a6a6a6",
      "#e1bb22",
      "#39c362",
      "#3ed1cf",
    ],
    series: [],
  }

  const Echarts = ({style,chartData,isAxisChart=true}) => {
      // 创建一个ref 该ref.current访问到实际dom元素
    const echartRef = useRef()
    // 用useRef创建一响应式变量保存图表实例 但不想让它触发重新渲染 故不用useState
    let echartObj = useRef(null)
    useEffect(() => { //首次加载后
        let options
        // 页面挂载后 通过init方法初始化echart图表实例 存在echartObj.current中
        echartObj.current = echarts.init(echartRef.current) 
        // option配置项的组装
        if (isAxisChart==true){
            axisOption.xAxis.data = chartData.xData
            axisOption.series = chartData.series
            options = axisOption
        }else{
            normalOption.series = chartData.series
            options = axisOption
            console.log('没有横坐标')
        }
        echartObj.current.setOption(options) // 在图表实例上调用setOption给实例传递配置项
    },[chartData])
      return (
        <div style={style} ref={echartRef}></div> //动态获取DOM实例 则要先绑定一个ref(见下div处)
      )
  }

  export default Echarts