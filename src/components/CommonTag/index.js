import {Tag,Space} from 'antd'
import './tag.css'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom';
import { closeTab, setCurrentMenu,selectMenuList } from '../../store/reducers/tab'

const CommonTag = () => {
    const tabList = useSelector(state => state.tab.tabList) // Tag和Aside组件间 传当前的路由信息
    const currentMenu =  useSelector(state => state.tab.currentMenu) // 当前位于的路由项

    console.log('删之后',tabList,'currentMenu',currentMenu)
    const dispatch =useDispatch()
    const location = useLocation()
    const navigate = useNavigate()

    const handleClose = (tag,index) => {
        console.log('删之前',tabList.length-1,index,tag.path, location.pathname)
    
        dispatch(closeTab(tag))
        if (tag.path !== location.pathname) {
            return  // 如果当前关闭的tag不是当前路由，则不进行跳转
        } 
        if (index === tabList.length-1) { // 关闭的是最后一个tag
            const curData = tabList[index-1]
            console.log('前一个tag',curData)
            dispatch(selectMenuList(curData)) // 更新当前路由
            navigate(curData.path) // 跳转到前一个tag
        } else {
            // 关闭的不是最后一个 则跳转到后一个tag
            if (tabList.length>1 ) {
                const newData = tabList[index+1]
                dispatch(selectMenuList(newData))
                navigate(newData.path)
            }
            
        }
    }

    // 根据tabList中对象内容进行tag渲染 高亮需要存到store
    const setTag = (flag, item, index) => {
        return (
            flag ?
            <Tag color="#55acee" closeIcon onClose={() => handleClose(item, index)} key={item.name}>{item.label}</Tag>
            :
            <Tag onClick={() => handleChange(item)} key={item.name}>{item.label}</Tag>
        )
    }

    // 点击tag切换路由
    const handleChange = (tag) => {
        dispatch(selectMenuList(tag))
        navigate(tag.path)
    }
   
  return (
  
    <Space className="common-tag" size={[0, 8]} wrap>
    {/* { currentMenu && tabList.map((item, index) => (
        setTag(currentMenu.path === item.path, item, index)
    )) } */}
   
     {currentMenu.name && tabList.map((item,index)=>(
        setTag(item.path===currentMenu.path,item,index)))}
    </Space>
  )
}

export default CommonTag