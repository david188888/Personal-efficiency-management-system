// mock数据模拟
import Mock from 'mockjs'

// 图表数据
let List = []
export default {
  getStatisticalData: () => {
    //Mock.Random.float 产生随机数100到8000之间 保留小数 最小0位 最大0位
    for (let i = 0; i < 7; i++) {
      List.push(
        Mock.mock({
          Jack: Mock.Random.float(10, 80, 0, 0),
          Samuel: Mock.Random.float(10, 80, 0, 0),
          Serena: Mock.Random.float(10, 80, 0, 0),
          Jonny: Mock.Random.float(10, 80, 0, 0),
          Tobby: Mock.Random.float(10, 80, 0, 0),
          Henry: Mock.Random.float(10, 80, 0, 0)
        })
      )
    }
    
    return {
      
      data: {
        // 饼图
        videoData: [
          {
            name: 'Coding',
            value:30
          },
          {
            name: 'Fitness',
            value: 12
          },
          {
            name: 'Reading',
            value: 15
          },
          {
            name: 'Game Time',
            value: 19
          },
          {
            name: 'Having lessons',
            value: 22
          },
          {
            name: 'Social activities',
            value: 4
          },
          {
            name: 'Entertainment on social media',
            value: 4
          }
        ],
        // 柱状图
        userData: [
          {
            date: 'Monday',
            new: 5,
            active: 50
          },
          {
            date: 'Tuesday',
            new: 6,
            active: 50
          },
          {
            date: 'Wenesday',
            new: 3,
            active:30
          },
          {
            date: 'Thursday',
            new: 7,
            active: 50
          },
          {
            date: 'Friday',
            new: 6,
            active: 55
          },
          {
            date: 'Saturday',
            new: 10,
            active: 6
          },
          {
            date: 'Sunday',
            new: 2,
            active: 17
          }
        ],
        // 折线图
        orderData: {
          date: ['20241202', '20241203', '20241204', '20241205', '20241206', '20241207', '20241008'],
          data: List
        },
        tableData: [
          { 
            time:'Monday',
            name: 'dating',
            todayBuy: 500,
            monthBuy: 3500,
            totalBuy: 22000
          },
          { 
            time:'Tuesday',
            name: 'gyming',
            todayBuy: 300,
            monthBuy: 2200,
            totalBuy: 24000
          },
          { 
            time:'Wenesday',
            name: 'coding',
            todayBuy: 800,
            monthBuy: 4500,
            totalBuy: 65000
          },
          { 
            time:'Thursday',
            name: 'gaming',
            todayBuy: 1200,
            monthBuy: 6500,
            totalBuy: 45000
          },
          { 
            time:'Friday',
            name: 'social activities',
            todayBuy: 300,
            monthBuy: 2000,
            totalBuy: 34000
          },
          { 
            time:'Saturday',
            name: 'sleeping',
            todayBuy: 350,
            monthBuy: 3000,
            totalBuy: 22000
          },
          { 
            time:'Sunday',
            name: 'travelling',
            todayBuy: 350,
            monthBuy: 3000,
            totalBuy: 22000
          }
        ]
      }
    }
  }
}
