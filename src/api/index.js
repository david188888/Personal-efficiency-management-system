import axios from 'axios';
// 图表数据
const user_id = localStorage.getItem('token')
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
            const tableDataUrl = '/api/tasks/time_management';
            const [taskProportionRes, timeManagementBarRes, timeManagementPlotRes, tableDataRes] = await Promise.all([
              axios.get(taskProportionURL, {
                params: {
                  start_time: formattedStartTime,
                  end_time: formattedEndTime,
                  user_id: user_id,
                },
              }),
              axios.get(timeManagementBarURL, {
                params: {
                  start_time: formattedStartTime,
                  end_time: formattedEndTime,
                  user_id: user_id,
                },
              }),
              axios.get(timeManagementPlotURL, {
                params: {
                  start_time: formattedStartTime,
                  end_time: formattedEndTime,
                  user_id: user_id,
                },
              }),
              axios.get(tableDataUrl, {
                params: {
                  start_time: formattedStartTime,
                  end_time: formattedEndTime,
                  user_id: user_id,
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
              date: item.week_day,
              new: item.task_count,          // 完成的任务数量
              active: Math.round(item.goal_progress * 100)  // 转换为百分比
            }));
      
            // 处理每天的工作时间变化（折线图）
            const timeManagementPlotData = timeManagementPlotRes.data;
            const orderData = {
              date: timeManagementPlotData.map((item) => item.date),                       // 日期
              data: {
                workHours: timeManagementPlotData.map((item) => parseFloat(item.duration))        // 工作时长（小时）
              }
            };

            // 添加时间格式化函数
            const formatDuration = (seconds) => {
              // 确保输入是数字
              const totalSeconds = parseFloat(seconds);
              if (isNaN(totalSeconds)) return '0minutes';
              
              const days = Math.floor(totalSeconds / (24 * 3600));
              const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              
              let result = [];
              if (days > 0) result.push(`${days}days`);
              if (hours > 0) result.push(`${hours}hours`);
              if (minutes > 0) result.push(`${minutes}minutes`);
              
              return result.join(' ') || '0minutes';
            };

            // 处理表格数据

            // 设置category的映射,我的category是0,1,2 分别对应'工作','学习','生活'
            const categoryMap = ['study', 'career', 'others'];


            const tableData = tableDataRes.data.map((item) => ({
              name: item.task_name,
              duration: formatDuration(item.total_work_time),
              category: categoryMap[item.category],
            }));
            // 返回格式化后的数据
            return {
              data: {
                // 饼图数据
                videoData,
                // 柱状图数据
                userData,
                // 折线图数据
                orderData,
                // 表格数据
                tableData,
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
                tableData: [],
                error: error.message,
              },
            };
          }
        };
