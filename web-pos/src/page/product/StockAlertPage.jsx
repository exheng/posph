import React, { useEffect, useState } from 'react';
import { 
    Table, 
    Card, 
    Space, 
    Button, 
    Input, 
    Tag, 
    Modal, 
    Form, 
    InputNumber, 
    message,
    Typography,
    Tooltip,
    Badge
} from 'antd';
import { 
    MdAdd, 
    MdSearch, 
    MdWarning, 
    MdRefresh,
    MdNotifications
} from "react-icons/md";
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function StockAlertPage() {
    const [form] = Form.useForm();
    const [state, setState] = useState({
        products: [],
        loading: false,
        visibleModal: false,
        selectedProduct: null,
        searchText: '',
        lowStockThreshold: 10, // Default threshold for low stock
    });
    const navigate = useNavigate();

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await request("product", "get");
            if (res && !res.error) {
                // Filter products with low stock
                const lowStockProducts = res.list.filter(product => 
                    product.qty <= state.lowStockThreshold
                );
                setState(prev => ({ 
                    ...prev, 
                    products: lowStockProducts,
                    loading: false 
                }));
            }
        } catch (error) {
            message.error("Failed to fetch products");
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSearch = (value) => {
        setState(prev => ({ ...prev, searchText: value }));
    };

    const handleUpdateStock = async (values) => {
        try {
            const params = {
                id: state.selectedProduct.id,
                qty: values.newStock
            };
            const res = await request("product", "put", params);
            if (res && !res.error) {
                message.success("Stock updated successfully!");
                oncloseModal();
                getProducts();
            }
        } catch (error) {
            message.error("Failed to update stock");
        }
    };

    const oncloseModal = () => {
        setState(prev => ({
            ...prev,
            visibleModal: false,
            selectedProduct: null
        }));
        form.resetFields();
    };

    const showUpdateModal = (product) => {
        setState(prev => ({
            ...prev,
            visibleModal: true,
            selectedProduct: product
        }));
        form.setFieldsValue({
            currentStock: product.qty,
            newStock: product.qty
        });
    };

    const createPurchaseOrder = (product) => {
        // Navigate to purchase order page with pre-filled product
        navigate('/purchase', { 
            state: { 
                selectedProduct: product,
                createOrder: true
            }
        });
    };

    const columns = [
        {
            title: 'Product Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <Text strong>{text}</Text>
                    {record.qty === 0 && (
                        <Tag color="red">Out of Stock</Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Category',
            dataIndex: 'category_name',
            key: 'category_name'
        },
        {
            title: 'Current Stock',
            dataIndex: 'qty',
            key: 'qty',
            render: (qty) => (
                <Space>
                    <Text>{qty}</Text>
                    {qty <= state.lowStockThreshold && (
                        <Tooltip title="Low Stock Alert">
                            <Badge count={<MdWarning style={{ color: '#faad14' }} />} />
                        </Tooltip>
                    )}
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="primary"
                        onClick={() => showUpdateModal(record)}
                    >
                        Update Stock
                    </Button>
                    <Button 
                        type="default"
                        onClick={() => createPurchaseOrder(record)}
                    >
                        Create Purchase Order
                    </Button>
                </Space>
            )
        }
    ];

    const filteredProducts = state.products.filter(product =>
        product.name.toLowerCase().includes(state.searchText.toLowerCase()) ||
        product.category_name.toLowerCase().includes(state.searchText.toLowerCase())
    );

    return (
        <MainPage loading={state.loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>Stock Alerts</Title>
                            <Text type="secondary">Monitor and manage low stock products</Text>
                        </div>
                        <Space>
                            <Button 
                                icon={<MdRefresh />} 
                                onClick={getProducts}
                            >
                                Refresh
                            </Button>
                        </Space>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Input.Search 
                            placeholder="Search products..."
                            allowClear
                            prefix={<MdSearch />}
                            style={{ width: 300 }}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Text type="secondary">
                            Showing {filteredProducts.length} products with low stock
                        </Text>
                    </div>
                </Space>
            </div>

            <Card>
                <Table 
                    columns={columns} 
                    dataSource={filteredProducts}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`
                    }}
                />
            </Card>

            <Modal
                title="Update Stock"
                open={state.visibleModal}
                onCancel={oncloseModal}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateStock}
                >
                    <Form.Item
                        name="currentStock"
                        label="Current Stock"
                    >
                        <InputNumber disabled style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="newStock"
                        label="New Stock"
                        rules={[
                            {
                                required: true,
                                message: 'Please input new stock quantity'
                            }
                        ]}
                    >
                        <InputNumber 
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Enter new stock quantity"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={oncloseModal}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Update Stock
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </MainPage>
    );
}

export default StockAlertPage; 