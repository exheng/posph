import React, { useState } from 'react';
import { Form, Button, Input, Card, Typography, message, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { request } from '../../util/helper';
import { useNavigate, Link } from "react-router-dom";

const { Title, Text } = Typography;

function RegisterPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const onRegister = async (values) => {
    try {
      setLoading(true);
      const param = {
        name: values.name,
        username: values.email,
        password: values.password,
        is_active: true,
        role_id: 2, // Default role for new users
      };
      const res = await request("auth/register", "post", param);
      if (res && !res.error) {
        message.success('Registration successful! Please login.');
        navigate("/login");
      } else {
        message.error(res.error || 'Registration failed');
      }
    } catch (error) {
      message.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    const colors = ['#ff4d4f', '#faad14', '#52c41a', '#4361ee'];
    return colors[passwordStrength - 1] || '#d9d9d9';
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
          maxWidth: 480,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1a1a1a', marginBottom: 8 }}>
            Create Account
          </Title>
          <Text style={{ color: '#666', fontSize: '16px' }}>
            Join us today and start managing your business
          </Text>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: 24 }}>
          <Button 
            icon={<GoogleOutlined />} 
            block 
            style={{ height: '40px' }}
          >
            Google
          </Button>
          <Button 
            icon={<GithubOutlined />} 
            block 
            style={{ height: '40px' }}
          >
            GitHub
          </Button>
        </div>

        <Divider style={{ margin: '24px 0' }}>OR</Divider>

        <Form
          form={form}
          layout="vertical"
          onFinish={onRegister}
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#4361ee' }} />}
              placeholder="Full Name"
              style={{ height: '48px', borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#4361ee' }} />}
              placeholder="Email Address"
              style={{ height: '48px', borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[{ pattern: /^\+?[\d\s-]+$/, message: 'Please enter a valid phone number!' }]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: '#4361ee' }} />}
              placeholder="Phone Number (Optional)"
              style={{ height: '48px', borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#4361ee' }} />}
              placeholder="Password"
              onChange={(e) => calculatePasswordStrength(e.target.value)}
              style={{ height: '48px', borderRadius: '8px' }}
            />
          </Form.Item>

          {passwordStrength > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                height: '4px', 
                background: getStrengthColor(),
                width: `${(passwordStrength / 4) * 100}%`,
                transition: 'all 0.3s ease',
                borderRadius: '2px'
              }} />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: 4 }}>
                Password Strength: {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1]}
              </Text>
            </div>
          )}

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#4361ee' }} />}
              placeholder="Confirm Password"
              style={{ height: '48px', borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms and conditions')) }
            ]}
          >
            <Checkbox>
              I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(67, 97, 238, 0.3)',
              }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text>
            Already have an account? <Link to="/login">Sign In</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;