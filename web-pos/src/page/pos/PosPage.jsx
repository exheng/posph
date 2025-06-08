import React, { useEffect, useState } from 'react';
import {
    Layout,
    Card,
    Input,
    Button,
    Table,
    Space,
    Typography,
    Divider,
    Row,
    Col,
    Select,
    InputNumber,
    message,
    Modal,
    Tag,
    Image,
    Form,
    Tooltip,
    List
} from 'antd';
import {
    MdSearch,
    MdAdd,
    MdRemove,
    MdDelete,
    MdShoppingCart,
    MdPayment,
    MdPerson,
    MdReceipt,
    MdPrint
} from 'react-icons/md';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { configStore } from '../../store/configStore';

const { Title, Text } = Typography;
const { Content } = Layout;

function PosPage() {
    const { config } = configStore();
    const [state, setState] = useState({
        products: [],
        cart: [],
        selectedCustomer: null,
        searchText: '',
        loading: false,
        selectedCategory: null,
        paymentModalVisible: false,
        receiptModalVisible: false,
        currentOrder: null,
        paymentMethod: 'cash',
        paymentAmount: 0,
        changeAmount: 0
    });
    const [form] = Form.useForm();

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await request("product", "get");
            if (res && !res.error) {
                setState(prev => ({
                    ...prev,
                    products: res.list || [],
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

    const handleCategoryChange = (value) => {
        setState(prev => ({ ...prev, selectedCategory: value }));
    };

    const calculateTotals = (cart) => {
        const subtotal = cart.reduce((sum, item) => {
            const itemTotal = Number(item.price) * Number(item.quantity);
            return sum + itemTotal;
        }, 0);
        
        const discount = cart.reduce((sum, item) => {
            const itemDiscount = (Number(item.price) * Number(item.quantity) * Number(item.discount || 0)) / 100;
            return sum + itemDiscount;
        }, 0);

        const total = subtotal - discount;

        return { subtotal, discount, total };
    };

    const updateCartItemQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            // Remove item from cart if quantity is 0 or less
            setState(prev => {
                const updatedCart = prev.cart.filter(item => item.id !== productId);
                const totals = calculateTotals(updatedCart);
                return {
                    ...prev,
                    cart: updatedCart,
                    ...totals
                };
            });
            return;
        }

        setState(prev => {
            const updatedCart = prev.cart.map(item => {
                if (item.id === productId) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            const totals = calculateTotals(updatedCart);

            return {
                ...prev,
                cart: updatedCart,
                ...totals
            };
        });
    };

    const addToCart = (product) => {
        setState(prev => {
            const existingItem = prev.cart.find(item => item.id === product.id);
            let updatedCart;
            
            if (existingItem) {
                // If item exists, update quantity
                const newQuantity = existingItem.quantity + 1;
                if (newQuantity <= 0) {
                    // Remove item if new quantity would be 0 or less
                    updatedCart = prev.cart.filter(item => item.id !== product.id);
                } else {
                    updatedCart = prev.cart.map(item => {
                        if (item.id === product.id) {
                            return { ...item, quantity: newQuantity };
                        }
                        return item;
                    });
                }
            } else {
                // Add new item to cart
                updatedCart = [...prev.cart, { ...product, quantity: 1 }];
            }

            const totals = calculateTotals(updatedCart);

            return {
                ...prev,
                cart: updatedCart,
                ...totals
            };
        });
    };

    const removeFromCart = (productId) => {
        setState(prev => {
            const updatedCart = prev.cart.filter(item => item.id !== productId);
            const totals = calculateTotals(updatedCart);

            return {
                ...prev,
                cart: updatedCart,
                ...totals
            };
        });
    };

    const clearCart = () => {
        setState(prev => ({
            ...prev,
            cart: [],
            subtotal: 0,
            discount: 0,
            total: 0
        }));
    };

    const calculateTotal = () => {
        const subtotal = state.cart.reduce((sum, item) => {
            const itemTotal = Number(item.price) * Number(item.quantity);
            return sum + itemTotal;
        }, 0);
        
        const discount = state.cart.reduce((sum, item) => {
            const itemDiscount = (Number(item.price) * Number(item.quantity) * Number(item.discount || 0)) / 100;
            return sum + itemDiscount;
        }, 0);

        const total = subtotal - discount;

        setState(prev => ({
            ...prev,
            subtotal,
            discount,
            total
        }));

        return total;
    };

    const showPaymentModal = () => {
        if (state.cart.length === 0) {
            message.warning('Cart is empty');
            return;
        }
        // Recalculate total before showing payment modal
        calculateTotal();
        setState(prev => ({
            ...prev,
            paymentModalVisible: true,
            paymentAmount: prev.total,
            changeAmount: 0
        }));
        form.resetFields();
    };

    const handlePayment = async (values) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            
            // Prepare order data
            const orderData = {
                customer_id: values.customer_id,
                items: state.cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    discount: item.discount || 0
                })),
                total_amount: state.total,
                payment_method: values.payment_method,
                payment_amount: Number(values.payment_amount),
                change_amount: Number(values.change_amount)
            };

            // Send order to backend
            const res = await request("order", "post", orderData);
            
            if (res && !res.error) {
                message.success('Payment successful!');
                
                // Show receipt
                setState(prev => ({
                    ...prev,
                    paymentModalVisible: false,
                    receiptModalVisible: true,
                    currentOrder: {
                        ...res,
                        items: state.cart,
                        payment_method: values.payment_method,
                        payment_amount: values.payment_amount,
                        change_amount: values.change_amount
                    }
                }));

                // Clear cart
                clearCart();
            } else {
                message.error(res.error || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            message.error('An error occurred during payment');
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handlePaymentAmountChange = (value) => {
        const paymentAmount = Number(value) || 0;
        const changeAmount = paymentAmount - state.total;
        
        setState(prev => ({
            ...prev,
            paymentAmount,
            changeAmount: changeAmount > 0 ? changeAmount : 0
        }));
    };

    const filteredProducts = state.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(state.searchText.toLowerCase()) ||
                            product.barcode.toLowerCase().includes(state.searchText.toLowerCase());
        const matchesCategory = !state.selectedCategory || product.category_id === state.selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const cartColumns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            render: (_, record) => (
                <Tooltip title={record.name}>
                    <Image
                        src={record.image ? `http://localhost:/pos_img/${record.image}` : 'default-product.png'}
                        alt={record.name}
                        style={{ 
                            width: '30px', 
                            height: '30px', 
                            objectFit: 'cover',
                            borderRadius: '4px'
                        }}
                        preview={false}
                    />
                </Tooltip>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: '25%',
            align: 'right',
            render: (price) => {
                const numPrice = Number(price);
                return isNaN(numPrice) ? '$0.00' : `$${numPrice.toFixed(2)}`;
            }
        },
        {
            title: 'Qty',
            key: 'quantity',
            width: '35%',
            align: 'center',
            render: (_, record) => (
                <Space size={2} style={{ justifyContent: 'center', width: '100%' }}>
                    <Button 
                        icon={<MdRemove />} 
                        size="small"
                        onClick={() => updateCartItemQuantity(record.id, record.quantity - 1)}
                        style={{ padding: '0 2px', minWidth: '24px' }}
                    />
                    <InputNumber 
                        min={1} 
                        value={record.quantity}
                        onChange={(value) => updateCartItemQuantity(record.id, value)}
                        style={{ width: '30px' }}
                        size="small"
                        controls={false}
                    />
                    <Button 
                        icon={<MdAdd />} 
                        size="small"
                        onClick={() => updateCartItemQuantity(record.id, record.quantity + 1)}
                        style={{ padding: '0 2px', minWidth: '24px' }}
                    />
                </Space>
            )
        },
        {
            title: 'Total',
            key: 'total',
            width: '25%',
            align: 'right',
            render: (_, record) => {
                const total = record.price * record.quantity;
                const discount = (record.discount || 0) * record.quantity;
                return `$${(total - discount).toFixed(2)}`;
            }
        }
    ];

    return (
        <MainPage loading={state.loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>Point of Sale</Title>
                            <Text type="secondary">Process sales and manage transactions</Text>
                        </div>
                    </div>
                </Space>
            </div>

            <Row gutter={[16, 16]}>
                <Col span={16}>
                    <Card>
                        <div style={{ marginBottom: 16 }}>
                            <Input.Search
                                placeholder="Search products..."
                                allowClear
                                prefix={<MdSearch />}
                                style={{ width: 300 }}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <List
                            grid={{
                                gutter: 16,
                                xs: 1,
                                sm: 2,
                                md: 3,
                                lg: 4,
                                xl: 4,
                                xxl: 4,
                            }}
                            dataSource={state.products}
                            renderItem={(item) => (
                                <List.Item>
                                    <Card
                                        hoverable
                                        cover={
                                            <div style={{ 
                                                height: 150, 
                                                overflow: 'hidden',
                                                background: '#f5f5f5',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {item.image ? (
                                                    <Image
                                                        alt={item.name}
                                                        src={`http://localhost:/pos_img/${item.image}`}
                                                        style={{ 
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                        preview={false}
                                                    />
                                                ) : (
                                                    <Text type="secondary">No Image</Text>
                                                )}
                                            </div>
                                        }
                                        onClick={() => addToCart(item)}
                                    >
                                        <Card.Meta
                                            title={item.name}
                                            description={
                                                <Space direction="vertical" size="small">
                                                    <Text type="secondary">Brand: {item.brand}</Text>
                                                    <Text type="secondary">Category: {item.category_name}</Text>
                                                    <Text strong>Price: ${item.price}</Text>
                                                    <Text>Stock: {item.qty}</Text>
                                                </Space>
                                            }
                                        />
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Cart" style={{ height: '100%' }}>
                        <Table
                            columns={cartColumns}
                            dataSource={state.cart}
                            pagination={false}
                            scroll={{ y: 300 }}
                            size="small"
                            style={{ marginBottom: 12 }}
                            rowKey="id"
                        />
                        <Divider style={{ margin: '8px 0' }} />
                        <Space direction="vertical" style={{ width: '100%' }} size={4}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Subtotal:</Text>
                                <Text>${Number(state.subtotal || 0).toFixed(2)}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Discount:</Text>
                                <Text>-${Number(state.discount || 0).toFixed(2)}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text strong>Total:</Text>
                                <Text strong>${Number(state.total || 0).toFixed(2)}</Text>
                            </div>
                            <Button 
                                type="primary" 
                                block 
                                onClick={showPaymentModal}
                                disabled={state.cart.length === 0}
                                style={{ marginTop: 8 }}
                            >
                                Proceed to Payment
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Payment Modal */}
            <Modal
                title="Payment"
                open={state.paymentModalVisible}
                onCancel={() => setState(prev => ({ ...prev, paymentModalVisible: false }))}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handlePayment}
                    initialValues={{
                        payment_method: 'cash',
                        payment_amount: state.total
                    }}
                >
                    <Form.Item
                        name="customer_id"
                        label="Customer"
                        rules={[{ required: true, message: 'Please select a customer' }]}
                    >
                        <Select
                            placeholder="Select Customer"
                            options={[
                                { label: 'Walk-in Customer', value: 1 },
                                // Add more customers from your database
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="payment_method"
                        label="Payment Method"
                        rules={[{ required: true, message: 'Please select payment method' }]}
                    >
                        <Select
                            options={[
                                { label: 'Cash', value: 'cash' },
                                { label: 'Card', value: 'card' },
                                { label: 'Mobile Payment', value: 'mobile' }
                            ]}
                        />
                    </Form.Item>

                    <div style={{ marginBottom: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Text>Subtotal: ${Number(state.subtotal).toFixed(2)}</Text>
                            </div>
                            {state.discount > 0 && (
                                <div>
                                    <Text>Discount: ${Number(state.discount).toFixed(2)}</Text>
                                </div>
                            )}
                            <div>
                                <Text strong>Total Amount: ${Number(state.total).toFixed(2)}</Text>
                            </div>
                        </Space>
                    </div>

                    <Form.Item
                        name="payment_amount"
                        label="Payment Amount"
                        rules={[
                            { required: true, message: 'Please enter payment amount' },
                            {
                                validator: (_, value) => {
                                    if (Number(value) < state.total) {
                                        return Promise.reject('Payment amount must be greater than or equal to total amount');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={state.total}
                            step={0.01}
                            onChange={handlePaymentAmountChange}
                        />
                    </Form.Item>

                    {state.changeAmount > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Change: ${Number(state.changeAmount).toFixed(2)}</Text>
                        </div>
                    )}

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setState(prev => ({ ...prev, paymentModalVisible: false }))}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Complete Payment
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Receipt Modal */}
            <Modal
                title="Receipt"
                open={state.receiptModalVisible}
                onCancel={() => setState(prev => ({ ...prev, receiptModalVisible: false }))}
                footer={[
                    <Button key="print" type="primary" onClick={() => window.print()}>
                        Print
                    </Button>,
                    <Button key="close" onClick={() => setState(prev => ({ ...prev, receiptModalVisible: false }))}>
                        Close
                    </Button>
                ]}
                width={400}
            >
                {state.currentOrder && (
                    <div style={{ padding: '20px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <Title level={4}>PhoneShop POS</Title>
                            <Text>Receipt</Text>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <Text>Order #: {state.currentOrder.order_number}</Text>
                            <br />
                            <Text>Date: {new Date().toLocaleString()}</Text>
                        </div>

                        <Table
                            dataSource={state.currentOrder.items}
                            pagination={false}
                            columns={[
                                {
                                    title: 'Item',
                                    dataIndex: 'name',
                                    key: 'name',
                                },
                                {
                                    title: 'Qty',
                                    dataIndex: 'quantity',
                                    key: 'quantity',
                                    align: 'right',
                                },
                                {
                                    title: 'Price',
                                    dataIndex: 'price',
                                    key: 'price',
                                    align: 'right',
                                    render: (price) => `$${Number(price).toFixed(2)}`
                                },
                                {
                                    title: 'Total',
                                    key: 'total',
                                    align: 'right',
                                    render: (_, record) => `$${(Number(record.price) * Number(record.quantity)).toFixed(2)}`
                                }
                            ]}
                            size="small"
                        />

                        <Divider />

                        <div style={{ textAlign: 'right' }}>
                            <div>
                                <Text>Subtotal: ${state.currentOrder.total_amount.toFixed(2)}</Text>
                            </div>
                            <div>
                                <Text>Payment Method: {state.currentOrder.payment_method}</Text>
                            </div>
                            <div>
                                <Text>Amount Paid: ${Number(state.currentOrder.payment_amount).toFixed(2)}</Text>
                            </div>
                            {state.currentOrder.change_amount > 0 && (
                                <div>
                                    <Text>Change: ${Number(state.currentOrder.change_amount).toFixed(2)}</Text>
                                </div>
                            )}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Text>Thank you for your purchase!</Text>
                        </div>
                    </div>
                )}
            </Modal>
        </MainPage>
    );
}

export default PosPage; 