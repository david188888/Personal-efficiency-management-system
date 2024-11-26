import logo from './logo.svg';
import './App.css';
import router from './router'
import { RouterProvider,Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="App">
     <RouterProvider router={router}/>
    </div>
  );
}

export default App;
