import React, { useEffect, useState, useRef } from 'react';
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
    MdNotifications,
    MdShoppingCart
} from "react-icons/md";
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { useNavigate } from 'react-router-dom';
import { notificationStore } from '../../store/notification.store';

const { Title, Text } = Typography;

function StockAlertPage() {
    const [form] = Form.useForm();
    const { addNotification, handleRealtimeUpdate } = notificationStore();
    const [state, setState] = useState({
        products: [],
        loading: false,
        visibleModal: false,
        selectedProduct: null,
        searchText: '',
        lowStockThreshold: 10, // Default threshold for low stock
        suppliers: [], // Add suppliers state
        processing: false, // Add processing state for the update operation
    });
    const navigate = useNavigate();

    // Keep track of previously notified products
    const notifiedProducts = useRef(new Set());

    useEffect(() => {
        getProducts();
        getSuppliers(); // Add function to get suppliers
        // Set up polling for real-time updates
        const interval = setInterval(getProducts, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const getProducts = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await request("product", "get");
            if (res && !res.error) {
                const products = res.list || [];
                const lowStockProducts = products.filter(product => 
                    product.qty <= state.lowStockThreshold
                );

                // Check for newly low stock products
                const newlyLowStock = lowStockProducts.filter(product => 
                    !notifiedProducts.current.has(product.id)
                );

                // Send notifications for newly low stock products
                newlyLowStock.forEach(product => {
                    const notificationId = `${product.id}_${Date.now()}`; // Create unique ID for each notification
                    handleRealtimeUpdate({
                        id: notificationId, // Add unique ID
                        type: 'low_stock',
                        title: 'Low Stock Alert',
                        message: `${product.name} is running low on stock`,
                        details: {
                            productName: product.name,
                            currentStock: product.qty,
                            category: product.category_name,
                            brand: product.brand,
                            threshold: state.lowStockThreshold,
                            productId: product.id // Add product ID to details
                        }
                    });
                    // Add to notified products set
                    notifiedProducts.current.add(product.id);
                });

                // Remove products that are no longer low stock
                products.forEach(product => {
                    if (product.qty > state.lowStockThreshold) {
                        notifiedProducts.current.delete(product.id);
                    }
                });

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

    const getSuppliers = async () => {
        try {
            const res = await request("config", "get");
            if (res && !res.error) {
                setState(prev => ({
                    ...prev,
                    suppliers: res.supplier || []
                }));
            }
        } catch (error) {
            message.error("Failed to fetch suppliers");
        }
    };

    const handleSearch = (value) => {
        setState(prev => ({ ...prev, searchText: value }));
    };

    const handleUpdateStock = async (values) => {
        try {
            setState(prev => ({ ...prev, processing: true }));
            
            // First update the stock
            const res = await request("product", "put", {
                id: state.selectedProduct.id,
                qty: values.qty
            });
            
            if (res && !res.error) {
                // Calculate the quantity needed
                const quantityNeeded = state.lowStockThreshold - values.qty;
                
                if (quantityNeeded <= 0) {
                    message.success("Stock updated successfully. No purchase order needed.");
                    oncloseModal();
                    getProducts();
                    return;
                }

                // Navigate to purchase order page with pre-filled data
                navigate('/purchase', { 
                    state: { 
                        autoCreate: true,
                        product: {
                            id: state.selectedProduct.id,
                            name: state.selectedProduct.name,
                            quantity: quantityNeeded,
                            price: state.selectedProduct.price || 0,
                            current_stock: values.qty,
                            threshold: state.lowStockThreshold
                        }
                    }
                });
            }
        } catch (error) {
            message.error("An error occurred while processing your request");
            console.error("Error:", error);
        } finally {
            setState(prev => ({ ...prev, processing: false }));
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
    };

    const createPurchaseOrder = (product) => {
        // Calculate quantity needed to reach threshold
        const quantityNeeded = product.threshold - product.qty;
        
        // Only create purchase order if quantity is still below threshold
        if (quantityNeeded > 0) {
            navigate('/purchase', {
                state: {
                    autoCreate: true,
                    product: {
                        id: product.id,
                        name: product.name,
                        quantity: quantityNeeded,
                        price: product.price,
                        current_stock: product.qty,
                        threshold: product.threshold
                    }
                }
            });
        } else {
            message.info('Product stock is now above threshold');
        }
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
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
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
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button 
                    type="primary"
                    icon={<MdShoppingCart />}
                    onClick={() => {
                        const quantityNeeded = state.lowStockThreshold - record.qty;
                        if (quantityNeeded > 0) {
                            navigate('/purchase', { 
                                state: { 
                                    autoCreate: true,
                                    product: {
                                        id: record.id,
                                        name: record.name,
                                        quantity: quantityNeeded,
                                        price: record.price || 0,
                                        current_stock: record.qty,
                                        threshold: state.lowStockThreshold
                                    }
                                }
                            });
                        } else {
                            message.info("No purchase order needed. Current stock is above threshold.");
                        }
                    }}
                >
                    Create Purchase Order
                </Button>
            )
        }
    ];

    const filteredProducts = state.products.filter(product =>
        product.name.toLowerCase().includes(state.searchText.toLowerCase()) ||
        product.category_name?.toLowerCase().includes(state.searchText.toLowerCase()) ||
        product.brand?.toLowerCase().includes(state.searchText.toLowerCase())
    );

    return (
        <MainPage loading={state.loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>Stock Alerts</Title>
                            <Text type="secondary">Monitor and manage low stock items</Text>
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
                title="Update Stock & Create Purchase Order"
                open={state.visibleModal}
                onCancel={oncloseModal}
                footer={null}
            >
                <Form
                    layout="vertical"
                    onFinish={handleUpdateStock}
                    initialValues={{
                        qty: state.selectedProduct?.qty
                    }}
                >
                    <Form.Item
                        name="qty"
                        label="New Stock Quantity"
                        rules={[
                            { required: true, message: 'Please enter the new stock quantity' },
                            { type: 'number', min: 0, message: 'Quantity must be positive' }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>

                    <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <Text type="secondary">
                            A purchase order will be automatically created for the remaining quantity needed to reach the threshold ({state.lowStockThreshold} units).
                        </Text>
                    </div>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={oncloseModal} disabled={state.processing}>
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                loading={state.processing}
                            >
                                {state.processing ? 'Processing...' : 'Update & Create PO'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </MainPage>
    );
}

export default StockAlertPage; 