import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Router from './router'
import { Provider} from 'react-redux'
import store from './store'
import'./api/mock'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode> {/*容器组件为 及早发现非纯由渲染引起的错误，会重新渲染一次 和重构i性能运行Effect一次*/}
    {/* Provider容器包裹整个应用 将store状态传递给Provider */}
    <Provider store={store}> 
    <App />         {/* 数组路由表形式就用这个 */}
    {/* <Router /> 路由组件形式就用这个*/}  
    </Provider>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
