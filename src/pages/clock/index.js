import axios from 'axios';
import { useState, useEffect, useRef,useCallback } from 'react';
import { Modal, Form, Input, Select, Button, Space } from 'antd';
import './clock.css'

 const CountdownTimer = () => {
  const [form] = Form.useForm();
  const [remainingTime, setRemainingTime] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const [stopBtnClicked, setStopBtnClicked] = useState(false);
  const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(true);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const intervalRef = useRef(null);
  const [pauseTime, setPauseTime] = useState(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    //获取 duration
    setDuration(localStorage.getItem('duration'));
    localStorage.removeItem('duration');
    if (duration) {
      console.log('duration', duration);
      const durationInMs = parseInt(duration, 10)*1000;
      setEndTime(Date.now() + durationInMs+2000); // 设置 endTime 为当前时间加上 duration
      setIsStopButtonDisabled(false);
      setIsResetButtonDisabled(false);
    }
  }, [duration]);

  const formatTime = (timeInMs) => {
    const hours = Math.floor(timeInMs / 3600000);
    const minutes = Math.floor((timeInMs % 3600000) / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const setCountDown = () => {
    if (pauseTime !== null) { 
      setRemainingTime(prevTime => prevTime - 1000);
    } else if (endTime) {
      const now = Date.now();
      const timeLeft = endTime - now;
      if (timeLeft <= 0) {
        clearInterval(intervalRef.current);
        setEndTime(null);
        setRemainingTime(0);
        setIsStopButtonDisabled(true);
        setIsResetButtonDisabled(true);
        // 倒计时结束，可以在这里显示通知
        Modal.info({ title: "Time's up!", content: `Task: ${taskDescription}` });
      } else {
        setRemainingTime(timeLeft);
      }
    }
  };

  useEffect(() => {
    if (endTime && !stopBtnClicked) {
      intervalRef.current = setInterval(setCountDown, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [endTime, stopBtnClicked, remainingTime]);

  const handleSetClick = () => { 
    setTaskDescription('');
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (!taskDescription) {
      Modal.error({
        title: 'Error',
        content: 'Please enter the task description!',
      });
      return;
    }

    const countDownTime = parseInt(form.getFieldValue('countDownTime'), 10);
    const format = form.getFieldValue('format');
    const timeInMs = countDownTime * ({ hours: 3600000, minutes: 60000, seconds: 1000 }[format]);

    if (isNaN(timeInMs) || timeInMs <= 0) {
      Modal.error({
        title: 'Error',
        content: 'Please enter a valid countdown time!',
      });
      return;
    }

    setEndTime(Date.now() + timeInMs+ 2000);
    setIsStopButtonDisabled(false);
    setIsResetButtonDisabled(false);
    setIsModalVisible(false);
  };

  const handleStopClick = () => {
    if (!stopBtnClicked) {
      // 当用户点击 STOP 时，存储当前的剩余时间
      setPauseTime(remainingTime);
    } else {
      // 当用户点击 CONTINUE 时，重置 endTime 并清除暂停时间
      setEndTime(Date.now() + remainingTime);
      setPauseTime(null);
    }
    setStopBtnClicked(!stopBtnClicked);
    setIsResetButtonDisabled(false);
  };

  const handleResetClick = () => {
    clearInterval(intervalRef.current);
    setEndTime(null);
    setRemainingTime(0);
    setStopBtnClicked(false);
    setIsStopButtonDisabled(true);
    setIsResetButtonDisabled(true);
  };

  return (
    <div>
      <Form form={form} layout="inline" className="form">
  <Form.Item name="countDownTime" className="form-item-input" rules={[{ required: true, message: 'Please input the countdown time!' }]}>
    <Input type="number" placeholder="Time" style={{ width: 100 }} />
  </Form.Item>
  <Form.Item name="format" className="form-item-select" rules={[{ required: true, message: 'Please select the time format!' }]}>
    <Select placeholder="Format" style={{ width: 120 }}>
      <Select.Option value="hours">Hours</Select.Option>
      <Select.Option value="minutes">Minutes</Select.Option>
      <Select.Option value="seconds">Seconds</Select.Option>
    </Select>
  </Form.Item>
  <Form.Item>
    <Button type="primary" className="set-button" onClick={handleSetClick}>SET</Button>
  </Form.Item>
</Form>
<p className="countdown">{endTime ? formatTime(remainingTime) : '00:00:00'}</p>
<div className="buttons">
  <Button className="control-button" onClick={handleStopClick} disabled={isStopButtonDisabled}>
    {stopBtnClicked ? 'CONTINUE' : 'STOP'}
  </Button>
  <Button className="control-button" onClick={handleResetClick} disabled={isResetButtonDisabled}>
    RESET
  </Button>
</div>

<Modal
  title="Task Description"
  visible={isModalVisible}
  onOk={handleModalOk}
  onCancel={() => setIsModalVisible(false)}
>
  <Input
    placeholder="Enter task description"
    value={taskDescription}
    onChange={(e) => setTaskDescription(e.target.value)}
  />
</Modal>

    </div>
  );
};
 

export default CountdownTimer;





