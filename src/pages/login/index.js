import React, { useState } from "react";
import { Form, Input, Button, message, Modal } from "antd";
import {TagsTwoTone} from "@ant-design/icons";
import "./login.css";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";


const Login = () => {
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const baseUrl = 'http://127.0.0.1:8080';

    const handleSubmit = (values) => {
        if (!values.password || !values.username) {
            return message.open({
                type: 'error',
                content: 'Please input username and password',
            });
        }
        get_user(values) // 用户鉴权及登录导航
    }

    const handleRegisterSubmit = (values) => {
        add_user(values)
    }

    const add_user =async (data) => {
        const url = `${baseUrl}/api/users/add_user`;
        try {
          const response = await axios.post(url, data);
          console.log('注册',data)
          console.log(response.data)
          if (response.status === 201) {
                message.success('register success');
                setIsModalVisible(false); 
            }
            else {
                message.error('register fail');
            }
        } 
        catch (error) {
          console.error('User adding fail:', error);
          throw error; // 抛出错误
        }
    }

    const get_user = async (data) => {
        const url = `${baseUrl}/api/users/get_user`;
        try {
            const response = await axios.get(url, { params: data });
            if (response.status === 200) {
                // 登录成功，处理返回的用户数据
                const userData = response.data;
                message.success('login success');
                localStorage.setItem('token',userData.user_id);
                localStorage.setItem('username', userData.username);
                console.log('token', localStorage.getItem('token'),localStorage.getItem('username'));
                navigate('/home');
            } 
            else {    
                message.error('login fail, Please try again');
            } 
        }catch (error) {
          console.error('loginfail:', error);
          throw error; // 重新抛出错误，以便外部处理
        }
    }

    return (
        <Form className="login-container" onFinish={handleSubmit}>
            <div className="login_title">System Login Page</div>

            <Form.Item label='Account' name="username" rules={[{ required: true, message: 'Please Enter your username' }]}>
                <Input type="text" placeholder="Enter your username" />
            </Form.Item>

            <Form.Item label='Password' name="password" rules={[{ required: true, message: 'Please Enter your password' }]}>
                <Input.Password type="password" placeholder="Enter your password" />
            </Form.Item>

            <Form.Item className="login_button">
                <Button type="primary" htmlType="submit">click to login</Button>
                <br />
                <a onClick={() => setIsModalVisible(true)} className="register-link">
                <TagsTwoTone /> Register your account
                </a>
            </Form.Item>

            <Modal title="注册" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
                <Form onFinish={handleRegisterSubmit}>
                    <Form.Item label='Account' name="username" rules={[{ required: true, message: 'Enter your username' }]}>
                        <Input type="text" placeholder="username" />
                    </Form.Item>

                    <Form.Item label='Password' name="password" rules={[{ required: true, message: 'Enter your password' }]}>
                        <Input.Password type="password" placeholder="password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">Register</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Form>
    )
}

export default Login;
