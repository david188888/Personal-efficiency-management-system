import {createBrowserRouter,Navigate} from 'react-router-dom'
import Main from '../pages/main'
import Home from '../pages/home'
import Clock from '../pages/clock'
import Targets from '../pages/targets'
import Statistics from '../pages/statistics'
import Tasks from '../pages/tasks'
import Login from '../pages/login'
// import {BrowserRouter,Routes,Route} from 'react-router-dom'

// 路由表写法
const routes = [
    {
        path:'/',
        Component: Main,
        children: [
            // 访问根路径时，默认重定向到home页面  
            {
                path:'/',
                element:<Navigate to='login' />
            },
            {
                path:'home',
                Component:Home
            },
            {
                path:'mall',
                Component:Clock
            },
            {
                path:'user',
                Component:Targets
            },      
            {
                path:'pagea',
                Component:Statistics
                        
            },
            {
                path:'pageb',
                Component:Tasks
            },
                    
            
        ]
    },
    {
        path:'/login',
        Component:Login
    }

]

export default createBrowserRouter(routes)