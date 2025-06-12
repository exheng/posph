import React, { useEffect, useState } from 'react';
import {
    Table,
    Card,
    Space,
    Button,
    Input,
    Modal,
    Form,
    message,
    Typography,
    Select,
    Row,
    Col,
    Tag,
    Tooltip
} from 'antd';
import {
    MdAdd,
    MdSearch,
    MdEdit,
    MdDelete,
    MdPerson,
    MdPhone,
    MdEmail,
    MdLocationOn
} from "react-icons/md";
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';

const { Title, Text } = Typography;
const { TextArea } = Input;

function CustomerPage() {
    const [form] = Form.useForm();
    const [state, setState] = useState({
        customers: [],
        loading: false,
        visibleModal: false,
        selectedCustomer: null,
        searchText: '',
    });

    useEffect(() => {
        getCustomers();
    }, []);

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
            visibleModal: true,
            selectedCustomer: null
        }));
        form.resetFields();
    };

    const showEditModal = (customer) => {
        setState(prev => ({
            ...prev,
            visibleModal: true,
            selectedCustomer: customer
        }));

        form.setFieldsValue({
            id: customer.id,
            name: customer.name,
            tel: customer.tel,
            email: customer.email,
            address: customer.address
        });
    };

    const oncloseModal = () => {
        setState(prev => ({
            ...prev,
            visibleModal: false,
            selectedCustomer: null
        }));
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            
            const customerData = {
                id: state.selectedCustomer?.id,
                name: values.name,
                tel: values.tel,
                email: values.email,
                address: values.address
            };

            const method = state.selectedCustomer ? 'post' : 'post';
            const endpoint = state.selectedCustomer ? 'customer/update' : 'customer/create';
            const res = await request(endpoint, method, customerData);
            
            if (res && !res.error) {
                message.success(res.message || "Customer saved successfully!");
                oncloseModal();
                getCustomers();
            } else {
                message.error(res.error || "Failed to save customer");
            }
        } catch (error) {
            console.error("Error saving customer:", error);
            message.error("An error occurred while saving the customer");
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDelete = (customer) => {
        Modal.confirm({
            title: "Delete Customer",
            content: "Are you sure you want to delete this customer?",
            onOk: async () => {
                try {
                    const res = await request("customer", "delete", { id: customer.id });
                    if (res && !res.error) {
                        message.success(res.message || "Customer deleted successfully!");
                        getCustomers();
                    } else {
                        message.error(res.error || "Failed to delete customer");
                    }
                } catch (error) {
                    console.error("Error deleting customer:", error);
                    message.error("An error occurred while deleting the customer");
                }
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
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button 
                            type="text" 
                            icon={<MdEdit />} 
                            onClick={() => showEditModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button 
                            type="text" 
                            danger 
                            icon={<MdDelete />} 
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
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
                        <div>
                            <Title level={4} style={{ margin: 0 }}>Customers</Title>
                            <Text type="secondary">Manage your customer database</Text>
                        </div>
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
                            Add New Customer
                        </Button>
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
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} customers`
                    }}
                />
            </Card>

            <Modal
                title={state.selectedCustomer ? "Edit Customer" : "New Customer"}
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
                                {state.selectedCustomer ? 'Update Customer' : 'Add Customer'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </MainPage>
    );
}

export default CustomerPage;