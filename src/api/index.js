import axios from 'axios';
// 图表数据
export const getData = async () => {
    try {
            // 获取当前日期和一周前的日期
            const today = new Date();
            const endTime = new Date(today);
            endTime.setHours(23, 59, 59, 999); // 今天的结束时间
      
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 6); // 最近7天包括今天
            startDate.setHours(0, 0, 0, 0); // 一周前的开始时间
      
            // 格式化日期为 'YYYY-MM-DDTHH:MM:SS' 格式
            const formatDate = (date) => date.toISOString().slice(0, 19);
      
            const formattedStartTime = formatDate(startDate);
            const formattedEndTime = formatDate(endTime);
      
            // 定义后端 API 的 URL
            const taskProportionURL = '/api/tasks/task_proportion';
            const timeManagementBarURL = '/api/tasks/time_management_bar';
            const timeManagementPlotURL = '/api/tasks/time_management_plot';
            const [taskProportionRes, timeManagementBarRes, timeManagementPlotRes] = await Promise.all([
              axios.get(taskProportionURL, {
                params: {
                  start_time: formattedStartTime,
                  end_time: formattedEndTime,
                },
              }),
              axios.get(timeManagementBarURL, {
                params: {
                  start_time: formattedStartTime,
                  end_time: formattedEndTime,
                },
              }),
              axios.get(timeManagementPlotURL, {
                params: {
                  start_time: formattedStartTime,
                  end_time: formattedEndTime,
                },
              }),
            ]);
      
            // 处理任务占比数据（饼图）
            const taskProportionData = taskProportionRes.data;
            const videoData = taskProportionData.map((item) => ({
              name: item.type,       // 任务类型
              value: item.count,     // 任务数量
            }));
      
            // 处理最近一周每天的任务数量和目标完成度（柱状图）
            const timeManagementBarData = timeManagementBarRes.data;
            const userData = timeManagementBarData.map((item) => ({
              week_day: item.week_day,
              task_count: item.task_count,
              goal_progress: item.goal_progress,
            }));
      
            // 处理每天的工作时间变化（折线图）
            const timeManagementPlotData = timeManagementPlotRes.data;
            const orderData = {
              date: timeManagementPlotData.map((item) => item.date),                       // 日期
              data: timeManagementPlotData.map((item) => parseFloat(item.duration)),        // 工作时长（小时）
            };
      
            // 返回格式化后的数据
            return {
              data: {
                // 饼图数据
                videoData,
                // 柱状图数据
                userData,
                // 折线图数据
                orderData,
              },
            };
          } catch (error) {
            console.error('Error fetching statistical data:', error);
            // 返回空数据结构并包含错误信息
            return {
              data: {
                videoData: [],
                userData: [],
                orderData: {
                  date: [],
                  data: [],
                },
                error: error.message,
              },
            };
          }
        };
