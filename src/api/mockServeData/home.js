

// 图表数据
let List = []
export default {
  getStatisticalData: () => {
    //Mock.Random.float 产生随机数100到8000之间 保留小数 最小0位 最大0位
    for (let i = 0; i < 7; i++) {
      List.push(
        // Mock.mock({
          // Jack: Mock.Random.float(10, 80, 0, 0),
          // Samuel: Mock.Random.float(10, 80, 0, 0),
          // Serena: Mock.Random.float(10, 80, 0, 0),
          // Jonny: Mock.Random.float(10, 80, 0, 0),
          // Tobby: Mock.Random.float(10, 80, 0, 0),
          // Henry: Mock.Random.float(10, 80, 0, 0)
        // })
      )
    }
    const today = new Date();

  // 初始化一个空数组来存储格式化后的日期
  const formattedDates = [];

  // 计算并格式化过去7天的日期
  for (let i = 0; i < 7; i++) {
    // 创建一个新的日期对象，表示今天减去i天
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // 获取年、月、日
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以需要+1
    const day = String(date.getDate()).padStart(2, '0');

    // 将格式化的日期添加到数组中
    formattedDates.push(`${year}${month}${day}`);
    
  }
    
    return {
      
      data: {
        // 饼图
        videoData: [
          // {
          //   name: '',
          //   value:30
          // },
          // {
          //   name: '',
          //   value: 12
          // },
          // {
          //   name: '',
          //   value: 15
          // },
          // {
          //   name: '',
          //   value: 19
          // },
          // {
          //   name: '',
          //   value: 22
          // },
          // {
          //   name: '',
          //   value: 4
          // },
          // {
          //   name: '',
          //   value: 4
          // }
        ],
        // 柱状图
        userData: [
          {
            date: formattedDates.reverse()[0],
            // new: 5,
            // active: 50
          },
          {
            date: formattedDates.reverse()[1],
            // new: 6,
            // active: 50
          },
          {
            date: formattedDates.reverse()[2],
            // new: 3,
            // active:30
          },
          {
            date: formattedDates.reverse()[3],
            // new: 7,
            // active: 50
          },
          {
            date: formattedDates.reverse()[4],
            // new: 6,
            // active: 55
          },
          {
            date: formattedDates.reverse()[5],
            // new: 10,
            // active: 6
          },
          {
            date: formattedDates.reverse()[6],
            // new: 2,
            // active: 17
          }
        ],
        // 折线图
        orderData: {
          date: formattedDates.reverse(),
          data: List
        },

        // 首页左边任务表
        tableData: [
          // { 
          //   time:'Monday',
          //   name: 'dating',
          //   todayBuy: 'to be set',
          //   monthBuy: 'to be set',
          //   totalBuy: 'to be set'
          // },
          // { 
          //   time:'Tuesday',
          //   name: 'gyming',
          //   todayBuy: 'to be set',
          //   monthBuy: 'to be set',
          //   totalBuy: 'to be set'
          // },
          // { 
          //   time:'Wenesday',
          //   name: 'coding',
          //   todayBuy: 'to be set',
          //   monthBuy: 'to be set',
          //   totalBuy: 'to be set'
          // },
          // { 
          //   time:'Thursday',
          //   name: 'gaming',
          //   todayBuy: 'to be set',
          //   monthBuy: 'to be set',
          //   totalBuy: 'to be set'
          // },
          // { 
          //   time:'Friday',
          //   name: 'socialing',
          //   todayBuy: 'to be set',
          //   monthBuy: 'to be set',
          //   totalBuy: 'to be set'
          // },
          // { 
          //   time:'Saturday',
          //   name: 'sleeping',
          //   todayBuy: 'to be set',
          //   monthBuy: 'to be set',
          //   totalBuy: 'to be set'
          // },
          // { 
          //   time:'Sunday',
          //   name: 'travelling',
          //   todayBuy: 'to be set',
          //   monthBuy: 'to be set',
          //   totalBuy: 'to be set'
          // }
        ]
      }
    }
  }
}
