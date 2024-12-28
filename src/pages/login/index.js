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
                content: '请输入用户名和密码',
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
                message.success('注册成功');
                setIsModalVisible(false); 
            }
            else {
                message.error('注册失败，请重试');
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
                message.success('登录成功');
                // console.log(userData);
                localStorage.setItem('token',userData.user_id);
                localStorage.setItem('username', userData.username);
                console.log('token', localStorage.getItem('token'),localStorage.getItem('username'));
                navigate('/home');
            } 
            else {    
                message.error('登录失败，请重试');
            } 
        }catch (error) {
          console.error('loginfail:', error);
          throw error; // 重新抛出错误，以便外部处理
        }
    }

    return (
        <Form className="login-container" onFinish={handleSubmit}>
            <div className="login_title">系统登录页</div>

            <Form.Item label='账号' name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input type="text" placeholder="用户名" />
            </Form.Item>

            <Form.Item label='密码' name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password type="password" placeholder="请输入密码" />
            </Form.Item>

            <Form.Item className="login_button">
                <Button type="primary" htmlType="submit">点击登录</Button>
                <br />
                <a onClick={() => setIsModalVisible(true)} className="register-link">
                <TagsTwoTone /> 还未注册账号？去注册
                </a>
            </Form.Item>

            <Modal title="注册" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
                <Form onFinish={handleRegisterSubmit}>
                    <Form.Item label='账号' name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input type="text" placeholder="用户名" />
                    </Form.Item>

                    <Form.Item label='密码' name="password" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input.Password type="password" placeholder="请输入密码" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">注册</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Form>
    )
}

export default Login;
