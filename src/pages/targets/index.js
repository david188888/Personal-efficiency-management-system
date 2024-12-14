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
  Popconfirm
} from 'antd'
import {ReconciliationTwoTone } from '@ant-design/icons'
import './target.css'
import { getUser, addUser, editUser, deleteUser } from '../../api'
import { useForm } from 'antd/es/form/Form'
import dayjs from 'dayjs'
import axios from 'axios'
import { render } from '@testing-library/react'

const Target = () => {
    
    const [listData, setListData] = useState({
          title: ''
        })
    const [tableData, setTableData] = useState([])
    // 0（新增）1（编辑）
    const [modelType,setModelType] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // 创建form搜索实例
    const [searchForm] = useForm()
    // 搜索
    const handleSearch = (e) => {
      console.log(e)
      const url = `http://127.0.0.1:8080/api/goals/get_goal_by_title?title=${e.keyword}`;
      axios.get(url)
      .then(response => {
        // 处理返回的数据
        console.log('查询结果',response.data );
        setTableData( response.data.goal_list ); // 假设返回的数据结构中有一个键为goal_list的数组
      })
  }
  

  useEffect(() => {
    setListData(listData)
    
    },[listData]) // 监听listData变化更新列表
    
    const columns = [
        {
            title:'Target name',
            dataIndex:'title',
        },
        {
          title:'Start date',
          dataIndex:'start_date',
        },
        {
          title:'End date',
          dataIndex:'end_date',
        },
        {
            title:'Category',
            dataIndex:'category',
            render:(val) =>{
              if (val === 0) {
                return 'Study';
              } else if (val === 1) {
                  return 'Career';
              }
              return 'Others'
              }
        },
        {
          title:'Status',
          dataIndex:'status',
          render:(val) =>{
              if (val === 0) {
                return 'Doing';
              } else if (val === 1) {
                  return 'Done';
              }
              return 'Pending'
              }
        },
        {
          title:'Progress',
          dataIndex:'progress',
          render: (val) => `${val}%`
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
                        <Button  type="primary" onClick={()=>{handleClick('edit',recordData)}}>Edit</Button>
                    
                        <Popconfirm 
                        title="Tip"
                        description="Mark the goal as achieved"
                        okText="Confirm"
                        cancelText="Cancel"
                        onConfirm={() => {handleFinish(recordData)}}>
                            <Button type="primary" style={{backgroundColor:'#86547a'}} >Done</Button>

                        </Popconfirm>
                        <Popconfirm 
                        title="Tip"
                        description="Do you want to delete the target?"
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

    // 点击新增
    const handleClick = (type, recordData) => {
        setIsModalOpen(!isModalOpen)
        if (type === 'add') {
            setModelType(0)
        } else{
            
            // 对原数据做深拷贝
            const cloneData = JSON.parse(JSON.stringify(recordData))
            
            // 对后端返回日期格式转换 到符合前端组件的格式
            cloneData.start_date = dayjs(cloneData.start_date)
            cloneData.end_date = dayjs(cloneData.end_date)
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
          
          //日期参数
           
          values.start_date = dayjs(values.start_date).format('YYYY-MM-DDTHH:mm:ss') ;
          values.end_date = dayjs(values.end_date).format('YYYY-MM-DDTHH:mm:ss') ;
          values.user_id = localStorage.getItem('token');; // 假设你有一个固定的user_id
          values.parent_goal_id = null; // 假设你有一个固定的parent_goal_id值
          console.log('提交字段',values)
        
        const url = baseUrl+'/api/goals/add_change_goal';
        try {
            const response = await axios.post(url, values);
            console.log('服务器响应:', response);
        } catch (error) {
            console.error('Error adding/updating goal:', error.response ? error.response.data : error.message);
            throw error; // 重新抛出错误
        }
          // 关闭弹窗并更新列表数据
          handleCancel();
          getGoals() // 用异步确保等待 getGoals 函数解析为数组
          
        } catch (err) {
          console.error('Validation or API call failed:', err);
        }
      };
      
      // 取消按钮点击事件处理  
      const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields(); // 清除已提交、删除的填写字段
      };

      const baseUrl = 'http://127.0.0.1:8080'
      
    
    const getGoals = async () => {
        const url = baseUrl+'/api/goals/get_goals';
        try {
            const response = await axios.get(url);
            const formattedData = response.data.map(item => ({
                ...item,
                start_date: dayjs(item.start_date).format('YYYY-MM-DD'),
                end_date: dayjs(item.end_date).format('YYYY-MM-DD')
              }))
            console.log('Goals返回',formattedData)
            setTableData(formattedData)
            
        } catch (error) {
            console.error('Error fetching goals:', error.response ? error.response.data : error.message);
            throw error; // 重新抛出错误
        }
    };
    
    
    

  // handleFinish函数，用于将指定记录的status设置为1
  const handleFinish = ({goal_id} ) => {
    setTableData(prevData =>
      prevData.map(record =>
        record.goal_id ===  goal_id ? { ...record, status: 1 } : record
      )
    );
  };
      
    

    //删除
    const handleDelete = ({ goal_id }) => {
        console.log('删掉的', goal_id);
        axios.get(baseUrl + `/api/goals/delete_goals?goal_id=${goal_id}`)
            .then(() => {
                getGoals();  // 调用 getGoals 函数
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };
    
 
    // 首次加载后调用后端接口返回数据
    useEffect(() => {
        getGoals()
    },[])

    return (
        <div className='user'>
            <div className='flex-box'>
                <Button type='primary' onClick={()=>{handleClick('add')}}>+Add new Target</Button>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ReconciliationTwoTone  style={{ marginRight: '8px',fontSize: '20px'}}/>
                  <span style={{ fontSize: '20px' }}>Targets management</span>
                    </div>
                
                <Form 
                form = {searchForm} // 绑定表单
                layout='inline'
                onFinish={handleSearch}> 
                {/* 表单域 */}
                <Form.Item name='keyword'>
                   <Input placeholder='Please enter the Target name'></Input>
                </Form.Item>
                
                <Form.Item>
                   <Button htmlType='submit' type='primary'>Search</Button>
                </Form.Item>
                
                </Form>
            </div>
            
         <Table style={{marginTop: '20px'}} columns={columns} dataSource={tableData} rowKey={"id"}></Table>
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

    {modelType === 1 && <Form.Item label='ID' name='goal_id'><Input /></Form.Item>}

    <Form.Item label='Target name' name='title'
        rules={[
            {
                required: true,
                message: 'Please enter target name',
            },
        ]}>
        <Input placeholder='Please enter target name'></Input>
    </Form.Item>

    <Form.Item
        label="Start date"
        name="start_date"
        rules={[
            {
                required: true,
                message: 'Please select start date',
            },
        ]}
    >
        <DatePicker placeholder="Please select" format="YYYY/MM/DD" />
    </Form.Item>

    <Form.Item
        label="End date"
        name="end_date"
        rules={[
            {
                required: true,
                message: 'Please select end date',
            },
        ]}
    >
        <DatePicker placeholder="Please select" format="YYYY/MM/DD" />
    </Form.Item>

    <Form.Item
        label="Category"
        name="category"
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
        name="status"
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
                { value: 0, label: 'Doing' },
                { value: 1, label: 'Done' },
                { value: 2, label: 'Pending' }
            ]}
        ></Select>
    </Form.Item>

    <Form.Item
        label="Progress"
        name="progress"
        rules={[
            {
                required: true,
                message: 'Please enter progress',
            },
        ]}
    >
        <InputNumber placeholder="Please enter progress" />
    </Form.Item>

</Form>


            </Modal>
        </div>
    )
}



export default Target;