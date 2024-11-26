import {configureStore} from '@reduxjs/toolkit'
import TabReducer from './reducers/tab'


export default configureStore({
    reducer: {
        tab: TabReducer // 定义属性名tab 将reducer注册到store中再对外暴露
    }
    
})