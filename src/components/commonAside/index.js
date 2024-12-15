import React from "react";
import MenuConfig from "../../config";
import * as Icon from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { useNavigate } from "react-router-dom"
import {useDispatch} from "react-redux";
import { selectMenuList } from "../../store/reducers/tab";

const { Header, Sider, Content } = Layout;


// 将icon转换为react元素
const iconToElement = (name) => React.createElement(Icon[name]);
// 接收到菜单的配置项 进行遍历

const MenuItems = MenuConfig.map((item) => {
    // 无子菜单
    const child = {
        key: item.path,
        icon:iconToElement(item.icon),
        label: item.label
    }
    // 有子菜单
    if(item.children){
        child.children = item.children.map(item => {
            return {
                key: item.path,
                label: item.label
            }
        })
    }
    return child
    })



const CommonAside = ({collapsed}) => {
    const navigate = useNavigate(); // 路由跳转实例
   
    const dispatch = useDispatch()

    // 添加数据到store方法
    const setTabsList = (val) => {
        dispatch(selectMenuList(val))
      }
      // 点击菜单
      const selectMenu = (e) => {
        let data
        MenuConfig.forEach((item) => {
            
          // 找到当前的数据
          if (item.path === e.keyPath[e.keyPath.length - 1]) {
            console.log('当前item',item)
            data = item
            // 如果是有二级菜单
            if (e.keyPath.length > 1) {
              data = item.children.find((child) => {
                return child.path === e.key
              })
            }
          }
        })
        setTabsList({
          path: data.path,
          name: data.name,
          label: data.label
        })
        // 页面跳转
        navigate(e.key)
      }

    return (
        <Sider trigger={null} collapsed={collapsed}>
       <h3 className= "app-name">{collapsed?'Personal Admin':'Personal Efficiency Management'}</h3> 
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={MenuItems}
          style={{
            height: '100%'
        }}
        onClick = {selectMenu}
        />
      </Sider>
    )
}

export default CommonAside;