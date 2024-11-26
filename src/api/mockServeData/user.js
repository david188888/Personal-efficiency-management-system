import Mock from 'mockjs'

// get请求从config.url获取参数，post从config.body中获取参数
function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"') +
    '"}'
  )
}

let TaskList = []
const count = 200

for (let i = 0; i < count; i++) {
  TaskList.push(
    Mock.mock({
      id: Mock.Random.guid(),
      'target_name': Mock.Random.csentence(5, 10),
      'start_date': Mock.Random.date(),
      'end_date': Mock.Random.date(),
      'category|0-2': 0,
      'status|0-2': 0,
      'progress|30-90': 30
    })
  )
}

export default {
  /**
   * 获取任务列表
   * 要带参数 title, page, limit; title可以不填, page,limit有默认值。
   * @param title, page, limit
   * @return {{code: number, count: number, data: *[]}}
   */
  getTaskList: config => {
    const { title, page = 1, limit = 40 } = param2Obj(config.url)
    const mockList = TaskList.filter(task => {
      if (title && task.target_name.indexOf(title) === -1) return false
      return true
    })
    const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))
    return {
      code: 20000,
      count: mockList.length,
      list: pageList
    }
  },
  /**
   * 增加任务
   * @param target_name, start_date, end_date, category, status, progress
   * @return {{code: number, data: {message: string}}}
   */
  createTask: config => {
    const { target_name, start_date, end_date, category, status, progress } = JSON.parse(config.body)
    TaskList.unshift({
      id: Mock.Random.guid(),
      target_name: target_name,
      start_date: start_date,
      end_date: end_date,
      category: category,
      status: status,
      progress: progress
    })
    return {
      code: 20000,
      data: {
        message: '添加成功'
      }
    }
  },
  /**
   * 删除任务
   * @param id
   * @return {*}
   */
  deleteTask: config => {
    const { id } = JSON.parse(config.body)
    if (!id) {
      return {
        code: -999,
        message: '参数不正确'
      }
    } else {
      TaskList = TaskList.filter(task => task.id !== id)
      return {
        code: 20000,
        message: '删除成功'
      }
    }
  },
  /**
   * 批量删除任务
   * @param config
   * @return {{code: number, data: {message: string}}}
   */
  batchDeleteTasks: config => {
    let { ids } = param2Obj(config.url)
    ids = ids.split(',')
    TaskList = TaskList.filter(task => !ids.includes(task.id))
    return {
      code: 20000,
      data: {
        message: '批量删除成功'
      }
    }
  },
  /**
   * 修改任务
   * @param id, target_name, start_date, end_date, category, status, progress
   * @return {{code: number, data: {message: string}}}
   */
  updateTask: config => {
    const { id, target_name, start_date, end_date, category, status, progress } = JSON.parse(config.body)
    TaskList.some(task => {
      if (task.id === id) {
        task.target_name = target_name
        task.start_date = start_date
        task.end_date = end_date
        task.category = category
        task.status = status
        task.progress = progress
        return true
      }
    })
    return {
      code: 20000,
      data: {
        message: '编辑成功'
      }
    }
  }
}

