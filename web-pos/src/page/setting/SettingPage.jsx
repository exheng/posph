import React, { useEffect, useState } from 'react';
import {
    Card,
    Tabs,
    Form,
    Input,
    InputNumber,
    Switch,
    Button,
    Upload,
    Select,
    Space,
    Typography,
    message,
    Divider,
    Row,
    Col
} from 'antd';
import {
    UploadOutlined,
    SaveOutlined,
    SettingOutlined,
    GlobalOutlined,
    SkinOutlined
} from '@ant-design/icons';
import { request, getStoreLogoUrl } from '../../util/helper';
import { configStore } from '../../store/configStore';
import MainPage from '../../component/layout/Mainpage';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function SettingPage() {
    const { config, setConfig } = configStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        if (config) {
            form.setFieldsValue({
                store: {
                    name: config.store?.name,
                    address: config.store?.address,
                    phone: config.store?.phone,
                    email: config.store?.email,
                    website: config.store?.website,
                    currency: config.store?.currency,
                    tax_rate: config.store?.tax_rate,
                },
                system: {
                    enable_notifications: config.system?.enable_notifications,
                    enable_email_notifications: config.system?.enable_email_notifications,
                    enable_sms_notifications: config.system?.enable_sms_notifications,
                    low_stock_threshold: config.system?.low_stock_threshold,
                    enable_auto_backup: config.system?.enable_auto_backup,
                    backup_frequency: config.system?.backup_frequency,
                },
                appearance: {
                    theme: config.appearance?.theme,
                    primary_color: config.appearance?.primary_color,
                    secondary_color: config.appearance?.secondary_color,
                    enable_animations: config.appearance?.enable_animations,
                }
            });
        }
    }, [config, form]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const res = await request('config/update', 'post', values);
            if (res && !res.error) {
                message.success('Settings updated successfully');
                setConfig(values);
            }
        } catch (error) {
            message.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('logo', file);
            const res = await request('config/upload-logo', 'post', formData, true);
            if (res && !res.error) {
                message.success('Logo uploaded successfully');
                setLogoFile(file);
                // Refresh config to get new logo
                const configRes = await request('config', 'get');
                if (configRes && !configRes.error) {
                    setConfig(configRes);
                }
            }
        } catch (error) {
            message.error('Failed to upload logo');
        }
        return false;
    };

    return (
        <MainPage loading={loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>Settings</Title>
                            <Text type="secondary">Configure your store settings and preferences</Text>
                        </div>
                    </div>
                </Space>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    store: {
                        currency: 'USD',
                        tax_rate: 0,
                    },
                    system: {
                        enable_notifications: true,
                        enable_email_notifications: true,
                        enable_sms_notifications: false,
                        low_stock_threshold: 10,
                        enable_auto_backup: true,
                        backup_frequency: 'daily',
                    },
                    appearance: {
                        theme: 'light',
                        primary_color: '#1890ff',
                        secondary_color: '#52c41a',
                        enable_animations: true,
                    }
                }}
            >
                <Card>
                    <Tabs defaultActiveKey="store">
                        <TabPane
                            tab={
                                <span>
                                    <SettingOutlined />
                                    Store Settings
                                </span>
                            }
                            key="store"
                        >
                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'name']}
                                        label="Store Name"
                                        rules={[{ required: true, message: 'Please enter store name' }]}
                                    >
                                        <Input placeholder="Enter store name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'phone']}
                                        label="Phone Number"
                                        rules={[{ required: true, message: 'Please enter phone number' }]}
                                    >
                                        <Input placeholder="Enter phone number" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name={['store', 'address']}
                                label="Address"
                                rules={[{ required: true, message: 'Please enter address' }]}
                            >
                                <Input.TextArea rows={3} placeholder="Enter store address" />
                            </Form.Item>

                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'email']}
                                        label="Email"
                                        rules={[
                                            { type: 'email', message: 'Please enter a valid email' },
                                            { required: true, message: 'Please enter email' }
                                        ]}
                                    >
                                        <Input placeholder="Enter email address" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['store', 'website']}
                                        label="Website"
                                    >
                                        <Input placeholder="Enter website URL" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 24]}>
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
                                                { label: 'CHF (Fr)', value: 'CHF' },
                                                { label: 'CNY (¥)', value: 'CNY' },
                                                { label: 'SEK (kr)', value: 'SEK' },
                                                { label: 'NZD (NZ$)', value: 'NZD' },
                                                { label: 'SGD (S$)', value: 'SGD' },
                                                { label: 'HKD (HK$)', value: 'HKD' },
                                                { label: 'KHR (៛)', value: 'KHR' },
                                            ]}
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
                                            style={{ width: '100%' }}
                                            placeholder="Enter tax rate"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Store Logo">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {config?.store?.logo && (
                                        <img
                                            src={getStoreLogoUrl(config.store.logo)}
                                            alt="Store Logo"
                                            style={{
                                                maxWidth: '200px',
                                                maxHeight: '100px',
                                                objectFit: 'contain',
                                                marginBottom: '16px'
                                            }}
                                        />
                                    )}
                                    <Upload
                                        beforeUpload={handleLogoUpload}
                                        showUploadList={false}
                                        accept="image/*"
                                    >
                                        <Button icon={<UploadOutlined />}>Upload Logo</Button>
                                    </Upload>
                                </Space>
                            </Form.Item>
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <GlobalOutlined />
                                    System Settings
                                </span>
                            }
                            key="system"
                        >
                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['system', 'enable_notifications']}
                                        label="Enable Notifications"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['system', 'enable_email_notifications']}
                                        label="Enable Email Notifications"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['system', 'enable_sms_notifications']}
                                        label="Enable SMS Notifications"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['system', 'low_stock_threshold']}
                                        label="Low Stock Threshold"
                                        rules={[{ required: true, message: 'Please enter threshold' }]}
                                    >
                                        <InputNumber
                                            min={1}
                                            style={{ width: '100%' }}
                                            placeholder="Enter threshold"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['system', 'enable_auto_backup']}
                                        label="Enable Auto Backup"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['system', 'backup_frequency']}
                                        label="Backup Frequency"
                                        rules={[{ required: true, message: 'Please select frequency' }]}
                                    >
                                        <Select
                                            options={[
                                                { label: 'Daily', value: 'daily' },
                                                { label: 'Weekly', value: 'weekly' },
                                                { label: 'Monthly', value: 'monthly' },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <SkinOutlined/>
                                    Appearance
                                </span>
                            }
                            key="appearance"
                        >
                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['appearance', 'theme']}
                                        label="Theme"
                                        rules={[{ required: true, message: 'Please select theme' }]}
                                    >
                                        <Select
                                            options={[
                                                { label: 'Light', value: 'light' },
                                                { label: 'Dark', value: 'dark' },
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

                            <Row gutter={[24, 24]}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['appearance', 'primary_color']}
                                        label="Primary Color"
                                        rules={[{ required: true, message: 'Please select primary color' }]}
                                    >
                                        <Input type="color" style={{ width: '100%', height: '40px' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['appearance', 'secondary_color']}
                                        label="Secondary Color"
                                        rules={[{ required: true, message: 'Please select secondary color' }]}
                                    >
                                        <Input type="color" style={{ width: '100%', height: '40px' }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>
                    </Tabs>

                    <Divider />

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={loading}
                        >
                            Save Changes
                        </Button>
                    </Form.Item>
                </Card>
            </Form>
        </MainPage>
    );
}

export default SettingPage; 