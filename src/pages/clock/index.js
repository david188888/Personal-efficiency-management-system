import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Form, Input, Button, Select, Space, Modal } from 'antd';
import './clock.css'

const { Option } = Select;

const CountdownTimer = () => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const [stopBtnClicked, setStopBtnClicked] = useState(false);
  const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(true);
  const [isResetButtonDisabled, setIsResetButtonDisabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const countDown = useRef(null);
  const intervalRef = useRef(null);

  const formatTime = (secondsLeft) => {
    let hours = Math.floor(secondsLeft / 3600);
    let minutes = Math.floor(secondsLeft / 60) - (hours * 60);
    let seconds = secondsLeft % 60;

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    if (seconds < 10) seconds = `0${seconds}`;

    return `${hours} : ${minutes} : ${seconds}`;
  };

  const setCountDown = useCallback(() => {
    const now = Date.now();
    const secondsLeft = Math.round((endTime - now) / 1000);

    if (secondsLeft < 0) {
      resetCountDown();
      setIsModalVisible(true); // 显示模态框
      return;
    }

    countDown.current.innerHTML = formatTime(secondsLeft);
    setRemainingTime(secondsLeft); // 更新剩余时间
  }, [endTime, formatTime]);

  const resetCountDown = useCallback(() => {
    clearInterval(intervalRef.current);
    countDown.current.innerHTML = '00 : 00 : 00';
    setEndTime(null);
    setStopBtnClicked(false);
    setIsStopButtonDisabled(true);
    setIsResetButtonDisabled(true);
  }, []);

  const handleFinish = (values) => {
    const time = parseInt(values.countDownTime, 10);
    if (isNaN(time)) {
      Modal.error({
        title: 'Error',
        content: 'Please enter a valid number',
      });
      return;
    }

    const timeInMs = time * ({ hours: 3600000, minutes: 60000, seconds: 1000 }[values.format]);
    if (!timeInMs) {
      Modal.error({
        title: 'Error',
        content: 'Invalid format',
      });
      return;
    }

    setEndTime(Date.now() + timeInMs + 1000); // 加上1000毫秒以补偿setInterval的延迟
    setIsStopButtonDisabled(false);
    setIsResetButtonDisabled(true);
  };

  const handleStopClick = () => {
    setStopBtnClicked((prev) => {
      // 如果当前是暂停状态，则继续计时
      if (prev) {
        // 设置新的结束时间，保持剩余时间不变
        setEndTime(Date.now() + remainingTime * 1000);
      }
      return !prev;
    });
    setIsResetButtonDisabled(false);
  };

  useEffect(() => {
    if (endTime && !stopBtnClicked) {
      intervalRef.current = setInterval(setCountDown, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current); // 组件卸载时清除计时器
  }, [endTime, stopBtnClicked, setCountDown]);

  // 模态框确认按钮的回调函数
  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="container">
      <Form className="form" onFinish={handleFinish}>
        <Space size={16}>
          <Form.Item name="countDownTime" rules={[{ required: true, message: 'Please input the countdown time!' }]}>
            <Input type="number" min="1" placeholder="Enter Countdown" />
          </Form.Item>
          <Form.Item name="format" rules={[{ required: true, message: 'Please select the time format!' }]}>
            <Select placeholder="Select time format">
              <Option value="hours">Hours</Option>
              <Option value="minutes">Minutes</Option>
              <Option value="seconds">Seconds</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              SET
            </Button>
          </Form.Item>
        </Space>
      </Form>
      <p className="countdown" ref={countDown}>00 : 00 : 00</p>
      <div className="buttons">
        <Button className="stop-btn" type="default" onClick={handleStopClick} disabled={isStopButtonDisabled}>
          {stopBtnClicked ? 'REPLAY' : 'STOP'}
        </Button>
        <Button className="reset-btn" type="default" onClick={resetCountDown} disabled={isResetButtonDisabled}>
          RESET
        </Button>
      </div>
      <Modal title="Time is up !" visible={isModalVisible}  onCancel={handleModalCancel}  onOk={handleModalOk}  cancelButtonProps={{ hidden: true }}>
     
      </Modal>
    </div>
  );
};

export default CountdownTimer;




