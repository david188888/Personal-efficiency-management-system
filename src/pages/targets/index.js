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
import { render } from '@testing-library/react'

const User = () => {
    
    const [listData, setListData] = useState({
          name: ''
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
      setListData({ // 这个State设置是一个异步操作 要实时监听listData变化 用useEffect见下
          name: e.keyword // 给name值传入 一个对象 跟初始格式保持一致
      })
      
      // getTableData()
  }

    useEffect(() => {
      getTableData()
      // console.log(listData)
    },[listData]) // 监听listData变化更新列表
    
    const columns = [
        {
            title:'Target name',
            dataIndex:'target_name',
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
              if (val === 1) {
                return 'Study';
              } else if (val === 0) {
                  return 'Career';
              }
              return 'Others'
              }
        },
        {
          title:'Status',
          dataIndex:'status',
          render:(val) =>{
              if (val === 1) {
                return 'Doing';
              } else if (val === 0) {
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
                        <Button style={{backgroundColor:'#FFA500'}} onClick={()=>{}}>Check</Button>
                        <Popconfirm 
                        title="Tip"
                        description="Mark the goal as achieved"
                        okText="Confirm"
                        cancelText="Cancel"
                        onConfirm={() => {}}>
                            <Button type="primary" style={{backgroundColor:'#86547a'}} onClick={()=>{}}>Done</Button>

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
            console.log('clone',cloneData)
            // 对后端返回日期格式转换 到符合前端组件的格式
            cloneData.start_date = dayjs(cloneData.start_date)
            cloneData.end_date = dayjs(cloneData.end_date)
            setModelType(1)  // 走到编辑逻辑
            //表单数据回填
            form.setFieldsValue(cloneData)
        }
        
    }
      // 关闭弹窗
      const handleCancel = () => {
        setIsModalOpen(false)
        form.resetFields() // 清除已提交、删除的填写字段
      }
      // 点击确认的事件处理
      const handleOk = () => {
        form.validateFields().then((val) => {
          // 日期参数
          val.birth = dayjs(val.birth).format('YYYY-MM-DD')
          if (modelType) { // 编辑
            console.log(val,'val')
            editUser(val).then(() => {
              // 比新增多传一个id 因要先找到更新哪个用户 在弹窗中一起提交 添加id提交后的val会多出一个id字段供后端识别
              // 关闭弹窗
              handleCancel()
              getTableData()
            })
          } else { // 新增
            addUser(val).then(() => {
              // 关闭弹窗
              handleCancel()
              getTableData() // 更新列表数据
            })
          }
        }).catch((err) => { 
          console.log(err)
        })
      }

    

    //删除
    const handleDelete = ({id}) => {
        console.log('删掉的',id)
        deleteUser({id}).then(
          getTableData()
        )
    }
    // 请求列表
  const getTableData = () => {
    getUser().then(({ data }) => {
      console.log(data)
      setTableData(data.list)
    })
  }
    // 首次加载后调用后端接口返回数据
    useEffect(() => {
        getTableData()
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

    {modelType === 1 && <Form.Item label='ID' name='id'><Input /></Form.Item>}

    <Form.Item label='Target name' name='target_name'
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



export default User;