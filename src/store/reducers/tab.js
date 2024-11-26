import {createSlice, current} from '@reduxjs/toolkit'



const tabSlice = createSlice({
    name: 'tab',
    initialState: {
        isCollapse: false,
        tabList:[{
            path:'/',
            name:'home',
            label:'首页'
        }],
        currentMenu: {
            
        }
    },
    reducers: { // 用于修改上面的state 通过reducer接收action action再修改state
       collapseMenu: state =>{
            state.isCollapse = !state.isCollapse
       },
       selectMenuList: (state, {payload:val}) => { //payload是action传递来的参数 对其解构
        if (val.name !=='home') {
            state.currentMenu = val //当前选中的菜单存入state
            //若已存在的tag 不要重复添加
            const isExist = state.tabList.some(item => item.name === val.name)
            if (!isExist) {
                state.tabList.push(val)
            }
        }  else if (val.name ==='home' && state.tabList.length === 1) {
            state.currentMenu =  {}
        }  
       },
       closeTab: (state, {payload:val}) => {
           let res = state.tabList.findIndex(item=>item.name ===val.name)
           state.tabList.splice(res,1)
       },
       setCurrentMenu: (state, { payload: val }) => {
        if (val.name === 'home') {
          state.currentMenu = {}
        } else {
          state.currentMenu = val
        }
      }
  }
})

export const {collapseMenu, selectMenuList,closeTab,setCurrentMenu} = tabSlice.actions //actions属性解构reducers 包含所有reducer的方法 
export default tabSlice.reducer
//通过一个变量暴露给页面使用 简洁