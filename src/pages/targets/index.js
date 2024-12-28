import React, { useContext, useEffect, useState } from 'react'
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
import UserContext from '../Usercontext'

const Target = () => {
    const user_id = useContext(UserContext);
    const [listData, setListData] = useState({
          title: ''
        })
    const [tableData, setTableData] = useState([])
    const [children,setChildren]= useState([]) // 初始化子目标为空数组
    const [visible, setVisible] = useState(false); // 下面弹窗的显示状态
    const [modalData, setModalData] = useState(null); // 目标对应任务
    // 0（新增）1（编辑）
    const [modelType,setModelType] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [expandedRows,setExpandedRows] = useState([]) // 初始化展开行

    // 创建form搜索实例
    const [searchForm] = useForm()
    // 搜索
    const handleSearch = (e) => {
      console.log(e)
      const url = baseUrl+`/api/goals/get_goal_by_title?title=${e.keyword}`;
      axios.get(url)
      .then(response => {
        // 处理返回的数据
        console.log('查询结果',response.data );
        setTableData( response.data.goal_list ); // 假设返回的数据结构中有一个键为goal_list的数组
      })
  }

  const queryTask =(recordData) =>{
    const {goal_id} = recordData
    // console.log('goal_id',goal_id,recordData)
    const url=baseUrl+`/api/tasks/get_task_by_goal_id?goal_id=${goal_id}`
    axios.get(url)
    .then(response => {
      console.log('目标对应任务',response.data.task_list );
      setModalData(response.data.task_list); // 将对应任务存到 modalData
      console.log('modalData',modalData)
      setVisible(true); // 显示弹窗
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
                        <Button  type="primary" onClick={()=>{queryTask(recordData)}}>Query Task</Button>
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
          values.user_id = localStorage.getItem('token');
          console.log('提交字段',values)
          if (values.parent_goal_id && modelType === 0) {
            var url = baseUrl+'/api/goals/add_subgoal';
            
          } else {
            var url = baseUrl+'/api/goals/add_change_goal';
          } 
        try {
            const response = await axios.post(url, values);
            console.log('服务器响应:', response);
        } catch (error) {
            console.error('Error adding/updating goal:', error.response ? error.response.data : error.message);
            throw error; // 重新抛出错误
        }
          // 关闭弹窗并更新列表数据
          handleCancel();
          await getGoals(); // 用异步确保等待 getGoals 函数解析为数组
          await getsubGoal(values.parent_goal_id); // 更新子目标数据
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
        
        const url = `${baseUrl}/api/goals/get_goals?user_id=${user_id}`;
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
    
    const getsubGoal = async (record) => {
        const url = `${baseUrl}/api/goals/get_subgoal?parent_goal_id=${record}`;
        try {
            const response = await axios.get(url);
            const formattedData = response.data.map(item => ({
                ...item,
                start_date: dayjs(item.start_date).format('YYYY-MM-DD'),
                end_date: dayjs(item.end_date).format('YYYY-MM-DD'),
                
              }))
            console.log('子Goal返回',formattedData)
            setChildren(formattedData)   
        } catch (error) {
            console.error('Error fetching goals:', error.response ? error.response.data : error.message);
            throw error; // 重新抛出错误
        }
    };
    
    useEffect(() => {
        setChildren(children)
    },[children])

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
    
    const onExpand = async (expanded, record) => {
      console.log('record',record)
        if (expanded) {
          // 如果行被展开，且子目标数据还未获取，则获取子目标数据
          if (!record.children) {
            try {
            await getsubGoal(record.goal_id);
            console.log('父目标id',record.goal_id)
            } catch (error) {
              console.error('Error fetching subgoals:', error);
            }
          }
        }
        setExpandedRows(prevRows => expanded ? [...prevRows, record.title] : prevRows.filter(title => title !== record.title));
      };
      
    const expandedRowRender = (record) => {
        const subGoals = children.filter(item => item.parent_goal_id === record.goal_id);

        // 检查当前记录是否有子目标
        const hasChildren = subGoals && subGoals.length > 0;
        return (
            <div>
            {hasChildren ? (
              // 如果有子目标，渲染子目标列表，并在下方添加 "添加子目标" 按钮
              <div>
                <Table
                  columns={columns} // 子目标的列定义，可能需要根据实际情况调整
                  dataSource={subGoals}
                  rowKey="goal_id"
                  pagination={false} // 子目标列表不需要分页
                />
                <Button type="primary" onClick={() => handleClick('add', record.goal_id)}>
                  + Add Subtarget
                </Button>
              </div>
            ) : (
              // 如果没有子目标，只渲染 "添加子目标" 按钮
              <Button type="primary" onClick={() => handleClick('add', record.goal_id)}>
                + Add Subtarget
              </Button>
            )}
          </div>
        );
      };

      const handleTemplateSelect = (template) => {
        const today = dayjs();
        const oneYearLater = today.add(1, 'year');
        if (template === 'career') {
          form.setFieldsValue({
            title: '职业晋升',
            category: 1,
            start_date: today,
            end_date: oneYearLater,
            status: 2,
            progress: 1,
          });
        } else if (template === 'study') {
          form.setFieldsValue({
            title: '学业发展',
            category: 0,
            start_date: today,
            end_date: oneYearLater,
            status: 2,
            progress: 1,
          });
        }
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
            
         <Table style={{marginTop: '20px'}} columns={columns} dataSource={tableData} rowKey={"id"}
            expandable={{
        expandedRowRender,
        rowExpandable: record => record.name !== 'Not Expandable',
        onExpand,
        // expandedRowKeys: expandedRows, // 设置展开的行
      }}
          ></Table>
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

    <Form.Item label='Parent Target name' name='parent_goal_title'
        rules={[
            {
                required: false,
                message: 'Please enter parent target title',
            },
        ]}>
        <Input placeholder='Please enter parent target name'></Input>
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

    <Form.Item 
        label="Template"
        name="template"
        rules={[
            {
                required: false,
                message: 'You can select a template',
            },
        ]}>
                <Button type='primary' key="career" onClick={() => handleTemplateSelect('career')}>
                职业晋升
              </Button>,
              <Button type='primary' key="study" onClick={() => handleTemplateSelect('study')}>
                学业发展
              </Button>
              </Form.Item>

</Form>
            </Modal>

            <Modal
        title="Task Details"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        {modalData && modalData.map((task, index) => (
          <div key={index}>
            <p>Title: {task.title}</p>
            <p>Start Time: {dayjs(task.start_time).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p>End Time: {dayjs(task.end_time).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p>Duration: {dayjs(task.end_time).diff(dayjs(task.start_time), 'day')} day</p>
            <p>Priority: {task.priority}</p>
          </div>
        )
        )}
      </Modal>

        </div>
    )
}



export default Target;