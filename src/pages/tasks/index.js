import React, { useEffect, useState } from 'react'
import {
  Button,
  Form,
  Input,
  Table,
  Modal,
  Select,
  DatePicker,
  InputNumber,
  Popconfirm,
  message
} from 'antd'
import { useNavigate } from 'react-router-dom'
import {ReconciliationTwoTone } from '@ant-design/icons'
import './tasks.css'
import { useForm } from 'antd/es/form/Form'
import { getUser, addUser, editUser, deleteUser } from '../../api'
import dayjs from 'dayjs'
import axios from 'axios'
import { render } from '@testing-library/react'

const Task = () => {
    const navigate = useNavigate();
    const [listData, setListData] = useState({
            title: ''
        })
    const [tableData, setTableData] = useState([])
    const [modelType,setModelType] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchForm] = useForm()
    
    // 搜索
    const handleSearch = (e) => {
        console.log(e)
        const url = baseUrl+`/api/tasks/get_task?title=${e.keyword}`;
        console.log(e.keyword);
        axios.get(url)
        .then(response => {
          // 处理返回的数据
          console.log('查询结果',response.data );
          setTableData(Array.from(response.data.task_list))
        })
    }

    useEffect(() => {
    setListData(listData)
    },[listData]) // 监听listData变化更新列表
    const columns = [
        {
            title:'Task name',
            dataIndex:'title',
        },
        {
          title:'Start time',
          dataIndex:'start_time',
        },
        {
          title:'End time',
          dataIndex:'end_time',
        },
        {
            title:'Category',
            dataIndex:'category_id',
            render:(val) =>{
              if (val === 0) {
                return 'Study';
              } else if (val === 1) {
                  return 'Career';
              }
              return 'Others'
              },
            filters:[
                {
                    text:'Study',
                    value:0
                },
                {
                    text:'Career',
                    value:1
                },
                {
                    text:'Others',
                    value:2
                }
            ],
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value, record) => record.category_id === value,

        },
        {
          title:'Status',
          dataIndex:'completed',
          render:(val) =>{
              if (val === false) {
                return 'Pending';
              } else if (val === true) {
                  return 'Done';
              }
              },
            filters:[
                {
                    text:'Pending',
                    value:false
                },
                {
                    text:'Done',
                    value:true
                }
            ],
            filterSearch: true,
            onFilter: (value, record) => record.completed === value,
        },
        {
          title:'Priority',
          dataIndex:'priority',
          render: (val) => `${val}`
        },
        {
            title:(
              <div style={{ textAlign: 'center' }}>
                  Operations
              </div>
          ),
            render:(recordData) => {
                return (
                    <div className='flex-box'>
                        <Button type="primary" onClick={()=>{executeTask(recordData)}}>Start</Button>
                        <Button  type="primary" onClick={()=>{handleClick('edit',recordData)}}>Edit</Button>
                        <Popconfirm
                        title="Tip"
                        description="Mark the task as finished"
                        okText="Confirm"
                        cancelText="Cancel"
                        onConfirm={() => {handleFinish(recordData)}}>
                            <Button type="primary" style={{backgroundColor:'#86547a'}} >Done</Button>

                        </Popconfirm>
                        <Popconfirm
                        title="Tip"
                        description="Do you want to delete the task?"
                        okText="Confirm"
                        cancelText="Delete"
                        onConfirm={() => handleDelete(recordData)}>
                            <Button type="primary" danger>Delete</Button>
                        </Popconfirm>
                    </div>
                )
            }
        }
    ]

    // 获取表单实例 以清除已提交、删除的填写字段
    const [form] =Form.useForm()
    

    // 跳转执行任务倒计时
    const executeTask = (recordData) => {
        const duration = dayjs(recordData.end_time).diff(dayjs(recordData.start_time), 'second');
        // console.log('持续时间',recordData.end_time,recordData.start_time,duration)
        localStorage.setItem('duration',duration)
        // console.log('duration',localStorage.getItem('duration'))
        navigate('/mall');
    }
    // 点击新增
    const handleClick = (type, recordData) => {
        setIsModalOpen(!isModalOpen)
        if (type === 'add') {
            setModelType(0)
        } else{
            // 对原数据做深拷贝
            const cloneData = JSON.parse(JSON.stringify(recordData))
            // 对后端返回日期格式转换 到符合前端组件的格式
            cloneData.start_time = dayjs(cloneData.start_time)
            cloneData.end_time = dayjs(cloneData.end_time)
            setModelType(1)  // 走到编辑逻辑
            console.log('clone',cloneData)
            //表单数据回填
            form.setFieldsValue(cloneData)
        }
    }

      // 点击确认的事件处理

      const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // 转换时间为后端期望的格式
            values.start_time = dayjs(values.start_time).format('YYYY-MM-DDTHH:mm:ss');
            values.end_time = dayjs(values.end_time).format('YYYY-MM-DDTHH:mm:ss');
            values.user_id = localStorage.getItem('token');
           

            console.log('提交的数据:', values);

            const response = await axios.post(baseUrl + '/api/tasks/add_change_task', values);
            console.log('后端返回:', response.data);

            handleCancel();
            getTasks();
        } catch (error) {
            console.error('提交任务失败:', error.response ? error.response.data : error.message);
        }
    };

      // 取消按钮点击事件处理
      const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields(); // 清除已提交、删除的填写字段
      };

      const baseUrl = 'http://127.0.0.1:8080'

    const getTasks = async () => {
        const url = baseUrl+'/api/tasks/get_tasks';
        try {
            const response = await axios.get(url);
            const tasksData=response.data.flatMap(item => item[0]);

            console.log('Tasks返回',tasksData)
            setTableData(tasksData)
        } catch (error) {
            console.error('Error fetching tasks:', error.response ? error.response.data : error.message);
            throw error; // 重新抛出错误
        }
    };


  // handleFinish函数，用于将指定记录的status设置为1
  const handleFinish = async ({task_id} ) => {
    const user_id = localStorage.getItem('token');
    console.log('完成task的用户',user_id);
    try{
        const response = await axios.get(baseUrl + `/api/tasks/finish_task?task_id=${task_id}`);

        if (response.status === 200) {
            console.log('完成task的返回',response)
            const {level,points} = response.data;
            message.success(`任务完成，你拥有${points}积分，等级提升至${level}`);
            setTableData(prevData =>
                prevData.map(record =>
                  record.task_id ===  task_id ? { ...record, status: 1 } : record
                )
              );
            // 输出用户当前的 level 和 point
            console.log(`User Level: ${level}, User Point: ${points}`);
        } else {
            message.error('任务未完成',response.data);
        }
    } catch (error) {
        console.error('There was an error!', error);
    }
    
  };

    //删除
    const handleDelete = ({ task_id }) => {
        console.log('删掉的', task_id);
        axios.get(baseUrl + `/api/tasks/delete_task/${task_id}`)
            .then(() => {
                getTasks();
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
      };

    // 首次加载后调用后端接口返回数据
    useEffect(() => {
        getTasks()
    },[])

    return (
        <div className='user'>
            <div className='flex-box'>
                <Button type='primary' onClick={()=>{handleClick('add')}}>+Add new Task</Button>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ReconciliationTwoTone  style={{ marginRight: '8px',fontSize: '20px'}}/>
                  <span style={{ fontSize: '20px' }}>Tasks management</span>
                    </div>
                <Form
                form = {searchForm} // 绑定表单
                layout='inline'
                onFinish={handleSearch}>
                {/* 表单域 */}
                <Form.Item name='keyword'>
                   <Input placeholder='Please enter the Task name'></Input>
                </Form.Item>
                <Form.Item>
                   <Button htmlType='submit' type='primary'>Search</Button>
                </Form.Item>
                </Form>
            </div>
         <Table style={{marginTop: '20px'}} onChange={onChange} columns={columns} dataSource={tableData} rowKey={"id"}></Table>
         <Modal
           open = {isModalOpen}
           title={modelType === 1 ? 'Edit' : 'Add'}
           onOk={handleOk}
            onCancel={handleCancel}
            okText="确定"
            cancelText="取消"
            >

<Form
    labelCol={{ span: 6 }} // 文本布局宽度
    wrapperCol={{ span: 18 }} // 输入框布局宽度
    labelAlign="left"
    form={form} layout='vertical'>

    {modelType === 1 && <Form.Item label='ID' name='task_id'><Input /></Form.Item>}

    <Form.Item label='Task name' name='title'
        rules={[
            {
                required: true,
                message: 'Please enter task name',
            },
        ]}>
        <Input placeholder='Please enter task name'></Input>
    </Form.Item>

    <Form.Item label='Goal id' name='goal_id'
        rules={[
            {
                required: true,
                message: 'Please enter goal id',
            },
        ]}>
        <Input placeholder='Please enter goal id'></Input>
    </Form.Item>
 
    <Form.Item
        label="Start time"
        name="start_time"
        rules={[
            {
                required: true,
                message: 'Please select start time',
            },
        ]}
    >
        <DatePicker showTime placeholder="Please select" format="YYYY-MM-DD HH:mm:ss" />
    </Form.Item>

    <Form.Item
        label="End time"
        name="end_time"
        rules={[
            {
                required: true,
                message: 'Please select end time',
            },
        ]}
    >
        <DatePicker showTime placeholder="Please select" format="YYYY-MM-DD HH:mm:ss" />
    </Form.Item>

    <Form.Item
        label="Category"
        name="category_id"
        rules={[
            {
                required: true,
                message: 'Category is required',
            },
        ]}
    >
        <Select
            placeholder="Please select category"
            options={[
                { value: 0, label: 'Study' },
                { value: 1, label: 'Career' },
                { value: 2, label: 'Others' }
            ]}
        ></Select>
    </Form.Item>

    <Form.Item
        label="Status"
        name="completed"
        rules={[
            {
                required: true,
                message: 'Status is required',
            },
        ]}
    >
        <Select
            placeholder="Please select status"
            options={[
                { value: 0, label: 'Pending' },
                { value: 1, label: 'Done' }
            ]}
        ></Select>
    </Form.Item>

    <Form.Item
        label="Priority"
        name="priority"
        rules={[
            {
                required: true,
                message: 'Please enter priority',
            },
        ]}
    >
        <InputNumber placeholder="Please enter priority" />
    </Form.Item>

</Form>


            </Modal>
        </div>
    )
}



export default Task;