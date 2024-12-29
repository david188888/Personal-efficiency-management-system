import React,{useEffect,useState} from "react";
import {Row,Col,Card,Table} from "antd";
import * as Icon from "@ant-design/icons";
import * as echarts from "echarts";
import MyEcharts from "../../components/echarts";
import "./home.css";
import {getData} from "../../api";

const columns = [
  {
    title: 'Name',
    dataIndex: 'name'
  },
    {
      title: 'Category',
      dataIndex: 'category'
    },
    {
      title: 'Duration',
      dataIndex: 'duration'
    }
  ]
  const countData = [
    {
      "name": "Completed today",
      // "value": 'reading',
      "icon": "CheckCircleOutlined",
      "color": "#2ec7c9"
    },
    {
      "name": "To be finished today",
      // "value": 'writing notes',
      "icon": "ClockCircleOutlined",
      "color": "#ffb980"
    },
    {
      "name": "Not finished today.",
      // "value": 'coding',
      "icon": "CloseCircleOutlined",
      "color": "#5ab1ef"
    },
    {
      "name": "It was completed today",
      // "value": 'take the package',
      "icon": "CheckCircleOutlined",
      "color": "#2ec7c9"
    },
    {
      "name": "To be finished today",
      // "value": 'hand out the form',
      "icon": "ClockCircleOutlined",
      "color": "#ffb980"
    },
    {
      "name": "Not finished today.",
      // "value": 'send the email',
      "icon": "CloseCircleOutlined",
      "color": "#5ab1ef"
    }
  ]
// 将icon转换为react元素
const iconToElement = (name) => React.createElement(Icon[name]);


const Home = () => {

    // 左下渲染表格的数据
    const [tableData,setTableData] = useState([])

    useEffect(() => { //页面加载完成后才调用接口
        getData().then(res => {
            // console.log('1',res.data.data)
            const { tableData} = res.data
            console.log('home数据',tableData)
            setTableData(tableData)
        })
        
      },[])

    const userImg = require("../../assets/images/avatar.jpg")
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    

    return (
        <Row className="home">
      <Col span={9}> 
        <Card hoverable>
          <div className="user">
            <img src={userImg} />
            <div className="userinfo">
              <p className="name">Welcome {localStorage.getItem('user_name')} !</p>
              <p className="access">Have a good day 😄</p>
            </div>
          </div>
          <div className="login-info">
            <p>Last time you logged in：<span>{formattedDate}</span></p>
         
          </div>
        </Card>
        <Card style={{ marginTop: '-10px' }} hoverable>
          <Table rowKey={"name"} columns={columns}  dataSource={tableData} pagination={false} /> 
         
        </Card>

        
      </Col>
      <Col style={{ marginTop: '20px' }} span={15}>
        <div className="num">
          {
            countData.map((item,index)=>{
              return (
                <Card key={index}>
                  <div className="icon-box" style={{ backgroundColor: item.color}}>
                    {iconToElement(item.icon)}
                  </div>
                  <div className="detail">
                    <p className="num">{item.value}</p>
                    <p className="txt">{item.name}</p>
                  </div>
                </Card>
              )
            })
          }
        </div>
      
        {/* echarts渲染发生在DOM渲染之后，所以需要使用useEffect */}
        
      </Col>
    </Row>
    )
}

export default Home;