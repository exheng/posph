import React from 'react';
import { Form, Button, Input, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { request } from '../../util/helper';
import { setAccessToken, setProfile } from '../../store/profile.store';
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

function LogingPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onLogin = async (item) => {
    try {
      console.log('Attempting login with:', { username: item.username });
      const param = {
        username: item.username,
        password: item.password,
      };
      const res = await request("auth/login", "post", param);
      console.log('Login response:', res);
      
      if (res && !res.error) {
        console.log('Login successful, setting tokens and profile');
        setAccessToken(res.access_token);
        setProfile(res.profile);
        message.success('Login successful!');
        console.log('Navigating to home page');
        navigate("/", { replace: true });
      } else {
        console.error('Login failed:', res?.error);
        message.error(res?.error?.username || res?.error?.password || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('An error occurred during login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: 420,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s ease',
          ':hover': {
            transform: 'translateY(-5px)'
          }
        }}
      >
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 32,
          padding: '20px 0'
        }}>
          <Title level={2} style={{ 
            color: '#1a1a1a',
            marginBottom: 8,
            fontWeight: 600
          }}>
            Welcome Back
          </Title>
          <Text style={{ 
            color: '#666',
            fontSize: '16px',
            display: 'block'
          }}>
            Please login to your account
          </Text>
        </div>
        
        <Form
          layout="vertical"
          form={form}
          onFinish={onLogin}
          size="large"
          style={{ padding: '0 20px' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#667eea' }} />}
              placeholder="Username"
              style={{
                height: '48px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                ':hover': {
                  borderColor: '#667eea'
                }
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#667eea' }} />}
              placeholder="Password"
              style={{
                height: '48px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                ':hover': {
                  borderColor: '#667eea'
                }
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default LogingPage;