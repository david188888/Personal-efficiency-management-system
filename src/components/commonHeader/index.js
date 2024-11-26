import React from "react";
import { Button, Layout,Avatar,Dropdown } from 'antd';
import {MenuFoldOutlined } from '@ant-design/icons'
import {useDispatch} from 'react-redux'
import {collapseMenu} from '../../store/reducers/tab'
import './index.css'
import { useNavigate,Navigate } from "react-router-dom";

const { Header } = Layout;
const CommonHeader = (collapsed) => {

    const navigate = useNavigate();
    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
        // return (<Navigate to='/login' />)
        
    }

    const items = [
        {
          key: '1',
          label: (
            <a target="_blank" rel="noopener noreferrer">
              个人中心
            </a>
          ),
        },
        {
          key: '2',
          label: (
            <a onClick={()=>logout()}target="_blank" rel="noopener noreferrer" >
              退出
            </a>
          ), 
          
        }
      ];

    // 调用钩子 创建dispatch对象
    const dispatch = useDispatch();

    const setCollapsed = ()=>{
        dispatch(collapseMenu())
    }

    return (
        <Header className="header-container">
            <Button
                type="text"
                icon={ <MenuFoldOutlined />  }
                // onClick={() => setCollapsed(!collapsed)}
                style={{
                fontSize: '16px',
                width: 64,
                height: 32,
                backgroundColor:'#fff'
                }}
                onClick={()=>setCollapsed()} //点击事件触发dispatch对象调用解构出来的reducer函数 collapseMenu
            />
            <Dropdown menu={{ items }}>

            <Avatar size={36} src={'https://pic.imgdb.cn/item/6651bb39d9c307b7e9c84238.jpg'} alt="avatar"/> 
            </Dropdown>
            </Header>
    )
}

export default CommonHeader;