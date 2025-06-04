import React from 'react';
import {Form, Button, Modal, message, Input, Space} from 'antd';
import { request } from '../../util/helper';
import { setAccessToken, setProfile } from '../../store/profile.store';
import {useNavigate} from "react-router-dom";

function LogingPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const onLogin = async (item) => {
    var param ={
      username: item.username ,
      password: item.password,
    };
    const res = await request("auth/login", "post", param);
    if (res && !res.error){
      setAccessToken(res.access_token);
      setProfile(JSON.stringify(res.profile));
      navigate("/");
    } else{
      alert(JSON.stringify(res));
    };
    
  };
  

  return (
    <div>
      <h1>LogingPage..</h1>
      <Form layout="vertical" form={form} onFinish={onLogin}>
        <Form.Item name="username" label="Username">
          <Input placeholder="username"/>
        </Form.Item>
        <Form.Item name="password" label="Password">
          <Input.Password placeholder="Password"/>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">Login</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LogingPage