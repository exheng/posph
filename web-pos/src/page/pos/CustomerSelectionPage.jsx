import React, { useEffect, useState } from 'react';
import {
    Card,
    Space,
    Button,
    Input,
    Modal,
    Form,
    message,
    Typography,
    Tabs,
    Table,
    Tag,
    Tooltip,
    Divider
} from 'antd';
import {
    MdSearch,
    MdPerson,
    MdPhone,
    MdEmail,
    MdLocationOn,
    MdAdd,
    MdArrowForward
} from "react-icons/md";
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

function CustomerSelectionPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const [state, setState] = useState({
        customers: [],
        loading: false,
        searchText: '',
        selectedCustomer: null,
        visibleModal: false,
        cartData: null,
    });

    useEffect(() => {
        getCustomers();
        if (location.state) {
            setState(prev => ({
                ...prev,
                cartData: {
                    cart: location.state.cart,
                    total: location.state.total,
                    subtotal: location.state.subtotal,
                    discount: location.state.discount,
                }
            }));
        }
    }, [location.state]);

    const getCustomers = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await request("customer", "get");
            if (res && !res.error) {
                setState(prev => ({
                    ...prev,
                    customers: res.list || [],
                    loading: false
                }));
            } else {
                message.error("Failed to fetch customers");
                setState(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
            message.error("Failed to fetch customers");
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSearch = (value) => {
        setState(prev => ({ ...prev, searchText: value }));
    };

    const showCreateModal = () => {
        setState(prev => ({
            ...prev,
            visibleModal: true
        }));
        form.resetFields();
    };

    const oncloseModal = () => {
        setState(prev => ({
            ...prev,
            visibleModal: false
        }));
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            
            const customerData = {
                name: values.name,
                tel: values.tel,
                email: values.email,
                address: values.address
            };

            const res = await request("customer/create", "post", customerData);
            
            if (res && !res.error) {
                message.success(res.message || "Customer registered successfully!");
                oncloseModal();
                await getCustomers();
                // Select the newly created customer
                setState(prev => ({
                    ...prev,
                    selectedCustomer: res.data
                }));
            } else {
                message.error(res.error || "Failed to register customer");
            }
        } catch (error) {
            console.error("Error registering customer:", error);
            message.error("An error occurred while registering the customer");
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleCustomerSelect = (customer) => {
        setState(prev => ({
            ...prev,
            selectedCustomer: customer
        }));
    };

    const handleProceedToPayment = () => {
        if (!state.selectedCustomer) {
            message.error("Please select or register a customer first");
            return;
        }

        // Navigate to payment page with customer data
        navigate('/pos/payment', {
            state: {
                customer: state.selectedCustomer,
                cart: location.state.cart,
                total: location.state.total,
                subtotal: location.state.subtotal,
                discount: location.state.discount
            }
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <div style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MdPerson size={24} />
                    </div>
                    <div>
                        <Text strong style={{ display: 'block' }}>{text}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>ID: {record.id}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Space>
                        <MdPhone size={16} />
                        <Text>{record.tel || 'N/A'}</Text>
                    </Space>
                    <Space>
                        <MdEmail size={16} />
                        <Text>{record.email || 'N/A'}</Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: (text) => (
                <Space>
                    <MdLocationOn size={16} />
                    <Text>{text || 'No address provided'}</Text>
                </Space>
            )
        }
    ];

    const filteredCustomers = state.customers.filter(customer =>
        customer.name?.toLowerCase().includes(state.searchText.toLowerCase()) ||
        customer.tel?.toLowerCase().includes(state.searchText.toLowerCase()) ||
        customer.email?.toLowerCase().includes(state.searchText.toLowerCase())
    );

    return (
        <MainPage loading={state.loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>Select Customer</Title>
                        <Space>
                            <Button 
                                type="primary"
                                icon={<MdAdd />}
                                onClick={showCreateModal}
                                style={{
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)'
                                }}
                            >
                                Create New Customer
                            </Button>
                            <Button 
                                type="primary"
                                onClick={handleProceedToPayment}
                                style={{
                                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(82, 196, 26, 0.2)'
                                }}
                            >
                                Proceed to Payment
                            </Button>
                        </Space>
                    </div>

                    <Input.Search 
                        placeholder="Search customers..."
                        allowClear
                        prefix={<MdSearch />}
                        style={{ width: 300 }}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </Space>
            </div>

            <Card>
                <Table 
                    columns={columns} 
                    dataSource={filteredCustomers}
                    rowKey="id"
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} customers`
                    }}
                    onRow={(record) => ({
                        onClick: () => handleCustomerSelect(record),
                        style: {
                            cursor: 'pointer',
                            background: state.selectedCustomer?.id === record.id ? '#e6f7ff' : 'inherit'
                        }
                    })}
                />
            </Card>

            {state.selectedCustomer && (
                <Card style={{ marginTop: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Title level={5}>Selected Customer</Title>
                        <Space>
                            <Tag color="blue">Name: {state.selectedCustomer.name}</Tag>
                            <Tag color="green">Phone: {state.selectedCustomer.tel}</Tag>
                            {state.selectedCustomer.email && (
                                <Tag color="purple">Email: {state.selectedCustomer.email}</Tag>
                            )}
                        </Space>
                    </Space>
                </Card>
            )}

            <Modal
                title="Register New Customer"
                open={state.visibleModal}
                onCancel={oncloseModal}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Customer Name"
                        rules={[{ required: true, message: 'Please enter customer name' }]}
                    >
                        <Input prefix={<MdPerson />} placeholder="Enter customer name" />
                    </Form.Item>

                    <Form.Item
                        name="tel"
                        label="Phone Number"
                        rules={[
                            { required: true, message: 'Please enter phone number' },
                            { pattern: /^[0-9+\-\s()]*$/, message: 'Please enter a valid phone number' }
                        ]}
                    >
                        <Input prefix={<MdPhone />} placeholder="Enter phone number" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input prefix={<MdEmail />} placeholder="Enter email address" />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <TextArea 
                            prefix={<MdLocationOn />} 
                            placeholder="Enter customer address"
                            rows={4}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={oncloseModal}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Register Customer
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </MainPage>
    );
}

export default CustomerSelectionPage; 