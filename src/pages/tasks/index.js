import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Checkbox } from 'antd';
import axios from 'axios';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/get_tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addOrUpdateTask = async (values) => {
    try {
        console.log('任务',values);
        values.goal_id = 2
         // 转换日期格式
        const formattedValues = {
        ...values,
        start_time: values.start_time ? values.start_time.format('YYYY-MM-DDTHH:mm:ss') : null,
        end_time: values.end_time ? values.end_time.format('YYYY-MM-DDTHH:mm:ss') : null,
        expected_completion_time: values.expected_completion_time ? values.expected_completion_time.format('YYYY-MM-DDTHH:mm:ss') : null,
      };
      const response = await axios.post('/api/tasks/add_change_task', formattedValues);
      console.log(response.data.message);
      fetchTasks();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error adding/updating task:', error);
    }
  };

  const deleteTask = async (task_id) => {
    try {
      const response = await axios.get(`/api/tasks/delete_task/${task_id}`);
      console.log(response.data.message);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const columns = [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Start Time',
        dataIndex: 'start_time',
        key: 'start_time',
      },
      {
        title: 'End Time',
        dataIndex: 'end_time',
        key: 'end_time',
      },
      {
        title: 'Expected Completion Time',
        dataIndex: 'expected_completion_time',
        key: 'expected_completion_time',
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
      },
      {
        title: 'Point',
        dataIndex: 'point',
        key: 'point',
      },
      {
        title: 'Category ID',
        dataIndex: 'category_id',
        key: 'category_id',
      },
      {
        title: 'Repeat Cycle',
        dataIndex: 'repeat_cycle',
        key: 'repeat_cycle',
      },
      {
        title: 'Completed',
        dataIndex: 'completed',
        key: 'completed',
      },
      {
        title: 'Front Task ID',
        dataIndex: 'front_task_id',
        key: 'front_task_id',
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Button onClick={() => deleteTask(record.task_id)}>Delete</Button>
        ),
      },
  ];

  return (
    <div>
      <Button onClick={() => setIsModalVisible(true)}>Add Task</Button>
      <Table dataSource={tasks} columns={columns} rowKey="task_id" />

      <Modal
        title={editingTask ? 'Edit Task' : 'Add Task'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingTask(null);
        }}
      >
        <Form form={form} onFinish={addOrUpdateTask} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input placeholder="Enter the title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input placeholder="Enter the description" />
          </Form.Item>
          <Form.Item name="start_time" label="Start Time">
            <DatePicker
              showTime
              format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="Select start time"
            />
          </Form.Item>
          <Form.Item name="end_time" label="End Time">
            <DatePicker
              showTime
              format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="Select end time"
            />
          </Form.Item>
          <Form.Item
            name="expected_completion_time"
            label="Expected Completion Time"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="Select expected completion time"
            />
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <Input type="number" placeholder="Enter priority" />
          </Form.Item>
          <Form.Item name="point" label="Point">
            <Input type="number" placeholder="Enter point" />
          </Form.Item>
          <Form.Item name="category_id" label="Category ID">
            <Input type="number" placeholder="Enter category ID" />
          </Form.Item>
          <Form.Item name="repeat_cycle" label="Repeat Cycle">
            <Input placeholder="Enter repeat cycle" />
          </Form.Item>
          <Form.Item name="completed" label="Completed"  valuePropName="checked"
  initialValue={false}  >
            <Checkbox style={{ marginLeft: 4, transform: 'scale(1.5)' }}>
             
            </Checkbox>
          </Form.Item>
          <Form.Item name="front_task_id" label="Front Task ID">
            <Input type="number" placeholder="Enter front task ID" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskManager;

