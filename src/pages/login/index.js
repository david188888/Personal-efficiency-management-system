import React from "react";
import { Form,Input,Button,message } from "antd";
import "./login.css"
import {getMenu} from '../../api'
import { useNavigate,Navigate } from "react-router-dom";



const Login = () =>{
    
    const navigate = useNavigate();

    //在已登录状态下 需要转到系统内页面，不能重定向到login页面
    if (localStorage.getItem('token')){
        return <Navigate to='/home' replace/>
    }


    const handleSubmit = (values) =>{
        if (!values.password || !values.username) {
            return message.open({
                type: 'error',
                content: '请输入用户名和密码',
            });
        } 
            getMenu(values).then(({data})=>{
                console.log(data)
                if (data.code === 20000) {
                    localStorage.setItem('token',data.data.token)
                    navigate('/home')
                } else {
                    return message.open({
                        type: 'error',
                        content: '用户名或密码错误，请重新输入',
                    })
                }
                
            })
}

    return(
        <Form className="login-container" onFinish={handleSubmit}>
           <div className="login_title">系统登录页</div>

           <Form.Item label='账号' name="username" rules={[{required: true, message: '请输入用户名'}]}>
                <Input type="text" placeholder="用户名" />
           </Form.Item>

           <Form.Item label='密码' name="password" rules={[{required: true, message: '请输入密码'}]}>
                <Input.Password type="password" placeholder="请输入密码" />
           </Form.Item>

           <Form.Item className="login_button">
                <Button type="primary" htmlType="submit">点击登录</Button>
           </Form.Item>
        </Form>
    )
}

export default Login;