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
    //   const handleCancel = () => {
    //     setIsModalOpen(false)
    //     form.resetFields() // 清除已提交、删除的填写字段
    //   }
      // 点击确认的事件处理
      const handleOk = async () => {
        try {
          const values = await form.validateFields();
          //日期参数
          values.description = '描述'
          values.start_date = dayjs(values.start_date).format('YYYY-MM-DDTHH:mm:ss') ;
          values.end_date = dayjs(values.end_date).format('YYYY-MM-DDTHH:mm:ss') ;
          values.user_id = 2; // 假设你有一个固定的user_id
        //   values.team_id = 2; // 假设你有一个固定的team_id
          values.is_root = true; // 假设你有一个固定的is_root值
        //   const values = {
        //     title: "管理",
        //     description: "chenggong",
        //     user_id: null,
        //     start_date: "2024-01-11T08:00:00",
        //     end_date: "2024-01-13T08:00:00",
        //     team_id: null,
        //     parent_goal_id: null,
        //     is_root: true
        // };
          console.log('表单数据',values)
        
         await addChangeGoal(values);
          
      
          // 关闭弹窗并更新列表数据
          handleCancel();
          getGoals();
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
      
      // 定义addChangeGoal函数
      const addChangeGoal = async (data) => {
        const url = baseUrl+'/api/goals/add_change_goal';
        try {
            const response = await axios.post(url, data);
            console.log('服务器响应:', response);
        } catch (error) {
            console.error('Error adding/updating goal:', error.response ? error.response.data : error.message);
            throw error; // 重新抛出错误，以便外部处理
        }
    };
    
    const getGoals = async () => {
        const url = baseUrl+'/api/goals/get_goals';
        try {
            const response = await axios.get(url);
            console.log('Goals返回', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching goals:', error.response ? error.response.data : error.message);
            throw error; // 重新抛出错误，以便外部处理
        }
    };
    
    

    

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