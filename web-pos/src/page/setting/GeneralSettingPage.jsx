import React, { useEffect, useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Switch,
    Select,
    InputNumber,
    Upload,
    message,
    Tabs,
    Typography,
    Space,
    Divider,
    Row,
    Col,
    ColorPicker,
    Image
} from 'antd';
import {
    SaveOutlined,
    UploadOutlined,
    ShopOutlined,
    SettingOutlined,
    SkinOutlined,
    MailOutlined,
    BellOutlined,
    DatabaseOutlined,
    GlobalOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { useAuth } from '../../context/AuthContext.jsx';
import { configStore } from '../../store/configStore';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

function GeneralSettingPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { token } = useAuth();
    const { config, refreshConfig } = configStore();
    const [currentLogo, setCurrentLogo] = useState(config.store?.logo || null);

    useEffect(() => {
        getSettings();
    }, []);

    useEffect(() => {
        if (config.store) {
            form.setFieldsValue({
                store: config.store,
                system: config.system,
                appearance: config.appearance
            });
            setCurrentLogo(config.store.logo);
        }
    }, [config, form]);

    const getSettings = async () => {
        setLoading(true);
        try {
            const response = await request('config', 'get', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response && !response.error) {
                form.setFieldsValue({
                    store: response.store,
                    system: response.system,
                    appearance: response.appearance
                });
                setCurrentLogo(response.store.logo);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            message.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomUpload = async ({ file, onSuccess, onError }) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('logo', file);
        try {
            const response = await request('config/upload-logo', 'post', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response && !response.error) {
                message.success('Logo uploaded successfully');
                setCurrentLogo(response.filename);
                form.setFieldsValue({
                    store: {
                        ...form.getFieldValue('store'),
                        logo: response.filename
                    }
                });
                await refreshConfig();
                onSuccess(response, file);
            } else {
                message.error(response?.error || 'Failed to upload logo');
                onError(new Error(response?.error || 'Failed to upload logo'));
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            message.error('Failed to upload logo');
            onError(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await request('config/update', 'post', values, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Settings updated successfully');
            await refreshConfig();
            window.dispatchEvent(new Event('configUpdated'));
        } catch (error) {
            console.error('Error updating settings:', error);
            message.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainPage loading={loading}>
            <div className="pageHeader" style={{ marginBottom: 24 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(90deg, #e0e7ff 0%, #f0f5ff 100%)',
                        borderRadius: 16,
                        padding: '18px 32px',
                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.06)'
                    }}>
                        <Title level={3} style={{ margin: 0, color: '#1a237e', letterSpacing: 1 }}>
                            General Settings
                        </Title>
                    </div>
                </Space>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Tabs defaultActiveKey="store" style={{ background: 'white', padding: 24, borderRadius: 16 }}>
                    <TabPane
                        tab={
                            <span>
                                <ShopOutlined />
                                Store Settings
                            </span>
                        }
                        key="store"
                    >
                        <Card>
                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'name']}
                                        label="Store Name"
                                        rules={[{ required: true, message: 'Please enter store name' }]}
                                    >
                                        <Input prefix={<ShopOutlined />} placeholder="Enter store name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'phone']}
                                        label="Phone Number"
                                        rules={[{ required: true, message: 'Please enter phone number' }]}
                                    >
                                        <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        name={['store', 'address']}
                                        label="Address"
                                        rules={[{ required: true, message: 'Please enter address' }]}
                                    >
                                        <Input.TextArea
                                            prefix={<EnvironmentOutlined />}
                                            placeholder="Enter store address"
                                            rows={3}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'email']}
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Please enter email' },
                                            { type: 'email', message: 'Please enter a valid email' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Enter email address" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'website']}
                                        label="Website"
                                        rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                                    >
                                        <Input prefix={<GlobalOutlined />} placeholder="Enter website URL" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'currency']}
                                        label="Currency"
                                        rules={[{ required: true, message: 'Please select currency' }]}
                                    >
                                        <Select
                                            options={[
                                                { label: 'USD ($)', value: 'USD' },
                                                { label: 'EUR (€)', value: 'EUR' },
                                                { label: 'GBP (£)', value: 'GBP' },
                                                { label: 'JPY (¥)', value: 'JPY' },
                                                { label: 'AUD (A$)', value: 'AUD' },
                                                { label: 'CAD (C$)', value: 'CAD' },
                                                { label: 'CHF (CHF)', value: 'CHF' },
                                                { label: 'CNY (¥)', value: 'CNY' },
                                                { label: 'SEK (kr)', value: 'SEK' },
                                                { label: 'NZD (NZ$)', value: 'NZD' },
                                                { label: 'SGD (S$)', value: 'SGD' },
                                                { label: 'HKD (HK$)', value: 'HKD' }
                                            ]}
                                            onChange={(value) => {
                                                const currentStoreValues = form.getFieldValue('store');
                                                form.setFieldsValue({
                                                    store: {
                                                        ...currentStoreValues,
                                                        currency: value
                                                    }
                                                });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'exchange_rate_to_usd']}
                                        label="Exchange Rate to USD"
                                        rules={[{ required: true, message: 'Please enter exchange rate' }]}
                                    >
                                        <InputNumber
                                            min={0.0001}
                                            step={0.0001}
                                            style={{ width: '100%' }}
                                            placeholder="e.g., 1.0000 for USD"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'tax_rate']}
                                        label="Tax Rate (%)"
                                        rules={[{ required: true, message: 'Please enter tax rate' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            formatter={value => `${value}%`}
                                            parser={value => value.replace('%', '')}
                                            style={{ width: '100%' }}
                                            placeholder="e.g., 7.5"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'logo']}
                                        label="Store Logo"
                                    >
                                        <Upload
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            customRequest={handleCustomUpload}
                                            onRemove={() => {
                                                setCurrentLogo(null);
                                                form.setFieldsValue({
                                                    store: {
                                                        ...form.getFieldValue('store'),
                                                        logo: null
                                                    }
                                                });
                                            }}
                                        >
                                            {currentLogo ? (
                                                <Image src={`http://localhost:8081/pos_img/${currentLogo}`} alt="logo" preview={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <div>
                                                    {uploading ? <LoadingOutlined /> : <UploadOutlined />}
                                                    <div style={{ marginTop: 8 }}>Upload</div>
                                                </div>
                                            )}
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <SettingOutlined />
                                System Settings
                            </span>
                        }
                        key="system"
                    >
                        <Card>
                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item name={['system', 'enable_notifications']} label="Enable Notifications" valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name={['system', 'enable_email_notifications']} label="Enable Email Notifications" valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name={['system', 'enable_sms_notifications']} label="Enable SMS Notifications" valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['system', 'low_stock_threshold']}
                                        label="Low Stock Threshold"
                                        rules={[{ required: true, message: 'Please enter a threshold' }]}
                                    >
                                        <InputNumber min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name={['system', 'enable_auto_backup']} label="Enable Auto Backup" valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name={['system', 'backup_frequency']} label="Backup Frequency">
                                        <Select>
                                            <Option value="daily">Daily</Option>
                                            <Option value="weekly">Weekly</Option>
                                            <Option value="monthly">Monthly</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={
                            <span>
                                <SkinOutlined />
                                Appearance
                            </span>
                        }
                        key="appearance"
                    >
                        <Card>
                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['appearance', 'primary_color']}
                                        label="Primary Color"
                                        rules={[{ required: true, message: 'Please select primary color' }]}
                                    >
                                        <ColorPicker
                                            onChangeComplete={(color) => {
                                                form.setFieldsValue({
                                                    appearance: {
                                                        ...form.getFieldValue('appearance'),
                                                        primary_color: color.toHexString()
                                                    }
                                                });
                                            }}
                                            value={form.getFieldValue(['appearance', 'primary_color'])}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['appearance', 'secondary_color']}
                                        label="Secondary Color"
                                        rules={[{ required: true, message: 'Please select secondary color' }]}
                                    >
                                        <ColorPicker
                                            onChangeComplete={(color) => {
                                                form.setFieldsValue({
                                                    appearance: {
                                                        ...form.getFieldValue('appearance'),
                                                        secondary_color: color.toHexString()
                                                    }
                                                });
                                            }}
                                            value={form.getFieldValue(['appearance', 'secondary_color'])}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['appearance', 'theme']}
                                        label="Theme"
                                        rules={[{ required: true, message: 'Please select theme' }]}
                                    >
                                        <Select
                                            options={[
                                                { label: 'Light', value: 'light' },
                                                { label: 'Dark', value: 'dark' }
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['appearance', 'enable_animations']}
                                        label="Enable Animations"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </TabPane>
                </Tabs>

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                        style={{
                            background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600
                        }}
                    >
                        Save Settings
                    </Button>
                </div>
            </Form>
        </MainPage>
    );
}

export default GeneralSettingPage; 