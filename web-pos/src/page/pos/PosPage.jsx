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
    List,
    Avatar
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
import { DollarOutlined } from '@ant-design/icons';
import PaymentPage from './PaymentPage';
import { useNavigate } from 'react-router-dom';

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
        changeAmount: 0,
        subtotal: 0,
        discount: 0,
        total: 0
    });
    const [form] = Form.useForm();
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [customerModalVisible, setCustomerModalVisible] = useState(false);
    const [customerForm] = Form.useForm();
    const [customerSearchText, setCustomerSearchText] = useState('');
    const [customerLoading, setCustomerLoading] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState({
        customer: null,
        paymentMethod: 'cash',
        paymentAmount: 0,
        notes: ''
    });
    const [showPayment, setShowPayment] = useState(false);
    const navigate = useNavigate();

    const getCurrencySymbol = () => {
        switch (config.store?.currency) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'JPY': return '¥';
            case 'AUD': return 'A$';
            case 'CAD': return 'C$';
            case 'CHF': return 'CHF';
            case 'CNY': return '¥';
            case 'SEK': return 'kr';
            case 'NZD': return 'NZ$';
            case 'SGD': return 'S$';
            case 'HKD': return 'HK$';
            case 'KHR': return '៛'; // Khmer Riel
            default: return '$';
        }
    };

    const formatCurrency = (amount) => {
        if (isNaN(amount)) return '0.00';
        const rate = Number(config.store?.exchange_rate_to_usd || 1.0000);
        const convertedAmount = amount / rate;
        return convertedAmount.toFixed(2);
    };

    useEffect(() => {
        getProducts();
        if (paymentModalVisible) {
            getCustomers();
        }
    }, [paymentModalVisible]);

    useEffect(() => {
        const totals = calculateTotals(state.cart);
        setState(prev => ({
            ...prev,
            subtotal: totals.subtotal,
            discount: totals.discount,
            total: totals.total
        }));
    }, [state.cart, config.store?.currency, config.store?.exchange_rate_to_usd]);

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

    const getCustomers = async () => {
        try {
            setCustomerLoading(true);
            const res = await request("customer", "get");
            if (res && !res.error) {
                setCustomers(res.list || []);
            }
        } catch (error) {
            message.error("Failed to fetch customers");
        } finally {
            setCustomerLoading(false);
        }
    };

    const handleSearch = (value) => {
        setState(prev => ({ ...prev, searchText: value }));
    };

    const handleCategoryChange = (value) => {
        setState(prev => ({ ...prev, selectedCategory: value }));
    };

    const calculateTotals = (cart) => {
        const exchangeRate = Number(config.store?.exchange_rate_to_usd || 1.0000);

        const subtotalUSD = cart.reduce((sum, item) => {
            const itemTotal = Number(item.price) * Number(item.quantity);
            return sum + itemTotal;
        }, 0);
        
        const discountUSD = cart.reduce((sum, item) => {
            const itemDiscount = (Number(item.price) * Number(item.quantity) * Number(item.discount || 0)) / 100;
            return sum + itemDiscount;
        }, 0);

        const totalUSD = subtotalUSD - discountUSD;

        const subtotalConverted = subtotalUSD / exchangeRate;
        const discountConverted = discountUSD / exchangeRate;
        const totalConverted = totalUSD / exchangeRate;

        return { 
            subtotal: Number(subtotalConverted.toFixed(2)), 
            discount: Number(discountConverted.toFixed(2)), 
            total: Number(totalConverted.toFixed(2)) 
        };
    };

    const updateCartItemQuantity = (productId, newQuantity) => {
        const product = state.products.find(p => p.id === productId);
        
        if (newQuantity > Number(product?.qty || 0)) {
            message.warning(`Only ${product?.qty} items available in stock`);
            return;
        }

        if (newQuantity <= 0) {
            setState(prev => {
                const updatedCart = prev.cart.filter(item => item.id !== productId);
                return {
                    ...prev,
                    cart: updatedCart,
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
            return {
                ...prev,
                cart: updatedCart,
            };
        });
    };

    const addToCart = (product) => {
        if (Number(product.qty || 0) <= 0) {
            message.warning("This product is out of stock");
            return;
        }

        setState(prev => {
            const existingItem = prev.cart.find(item => item.id === product.id);
            let updatedCart;
            
            if (existingItem) {
                const newQuantity = existingItem.quantity + 1;
                if (newQuantity > Number(product.qty)) {
                    message.warning(`Only ${product.qty} items available in stock`);
                    return prev;
                }
                updatedCart = prev.cart.map(item => {
                    if (item.id === product.id) {
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                });
            } else {
                updatedCart = [...prev.cart, { ...product, quantity: 1 }];
            }
            return {
                ...prev,
                cart: updatedCart,
            };
        });
    };

    const removeFromCart = (productId) => {
        setState(prev => {
            const updatedCart = prev.cart.filter(item => item.id !== productId);
            return {
                ...prev,
                cart: updatedCart,
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

    const handleCustomerSubmit = async (values) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await request("customer", "post", values);
            if (res && !res.error) {
                message.success("Customer registered successfully");
                setCustomerModalVisible(false);
                customerForm.resetFields();
                getCustomers();
            }
        } catch (error) {
            message.error("Failed to register customer");
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const showPaymentModal = () => {
        if (state.cart.length === 0) {
            message.warning("Please add items to cart first");
            return;
        }

        navigate('/pos/customer-selection', {
            state: {
                cart: state.cart,
                total: state.total,
                subtotal: state.subtotal,
                discount: state.discount
            }
        });
    };

    const filteredProducts = state.products.filter(product => {
        const searchText = state.searchText.toLowerCase();
        const matchesSearch = 
            product.name?.toLowerCase().includes(searchText) ||
            product.barcode?.toLowerCase().includes(searchText) ||
            product.brand?.toLowerCase().includes(searchText) ||
            product.category_name?.toLowerCase().includes(searchText);
        const matchesCategory = !state.selectedCategory || product.category_id === state.selectedCategory;
        const hasStock = Number(product.qty || 0) > 0;
        return matchesSearch && matchesCategory && hasStock;
    });

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(customerSearchText.toLowerCase()) ||
        customer.phone?.includes(customerSearchText)
    );

    const cartColumns = [
        {
            title: 'Item',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            render: (_, record) => (
                <Image
                    src={record.image ? `http://localhost:8081/pos_img/${record.image}` : 'default-product.png'}
                    alt={record.name}
                    style={{ 
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    preview={false}
                />
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
                return `${getCurrencySymbol()}${formatCurrency(numPrice)}`;
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
                return `${getCurrencySymbol()}${formatCurrency(total - discount)}`;
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

            <div className="pos-container">
                <Row gutter={[24, 24]}>
                    <Col span={16}>
                        <Card>
                            <div style={{ marginBottom: 16, display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <Input.Search
                                    placeholder="Search by name, barcode, brand, or category..."
                                    allowClear
                                    prefix={<MdSearch />}
                                    style={{ width: 400 }}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onSearch={handleSearch}
                                />
                                <Select
                                    placeholder="Filter by category"
                                    allowClear
                                    style={{ width: 200 }}
                                    onChange={handleCategoryChange}
                                    options={config?.category?.map(cat => ({
                                        label: cat.label,
                                        value: cat.value
                                    }))}
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
                                dataSource={filteredProducts}
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
                                                            src={`http://localhost:8081/pos_img/${item.image}`}
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
                                                        <Text type="secondary">Brand: {item.brand_name}</Text>
                                                        <Text type="secondary">Category: {item.category_name}</Text>
                                                        <Text strong>Price: {getCurrencySymbol()}{formatCurrency(item.price)}</Text>
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
                        <Card>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={4}>Current Order</Title>
                            </div>

                            <Table
                                dataSource={state.cart}
                                pagination={false}
                                columns={[
                                    {
                                        title: 'Item',
                                        dataIndex: 'name',
                                        key: 'name',
                                        render: (_, record) => (
                                            <Image
                                                src={record.image ? `http://localhost:8081/pos_img/${record.image}` : 'default-product.png'}
                                                alt={record.name}
                                                style={{ 
                                                    width: '50px', 
                                                    height: '50px', 
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                                preview={false}
                                            />
                                        )
                                    },
                                    {
                                        title: 'Qty',
                                        key: 'quantity',
                                        width: 120,
                                        align: 'center',
                                        render: (_, record) => (
                                            <Space size={2} style={{ justifyContent: 'center', width: '100%' }}>
                                                <Button 
                                                    icon={<MdRemove />} 
                                                    size="small"
                                                    onClick={() => updateCartItemQuantity(record.id, record.quantity - 1)}
                                                    style={{ 
                                                        padding: '0 2px', 
                                                        minWidth: '24px',
                                                        borderRadius: '6px'
                                                    }}
                                                />
                                                <InputNumber 
                                                    min={1} 
                                                    value={record.quantity}
                                                    onChange={(value) => updateCartItemQuantity(record.id, value)}
                                                    style={{ 
                                                        width: '40px',
                                                        textAlign: 'center'
                                                    }}
                                                    size="small"
                                                    controls={false}
                                                />
                                                <Button 
                                                    icon={<MdAdd />} 
                                                    size="small"
                                                    onClick={() => updateCartItemQuantity(record.id, record.quantity + 1)}
                                                    style={{ 
                                                        padding: '0 2px', 
                                                        minWidth: '24px',
                                                        borderRadius: '6px'
                                                    }}
                                                />
                                            </Space>
                                        )
                                    },
                                    {
                                        title: 'Total',
                                        key: 'total',
                                        width: 100,
                                        align: 'right',
                                        render: (_, record) => (
                                            <Text strong>{getCurrencySymbol()}{formatCurrency(Number(record.price || 0) * Number(record.quantity || 0))}</Text>
                                        )
                                    }
                                ]}
                                size="small"
                                style={{
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}
                            />

                            <Divider style={{ margin: '16px 0' }} />

                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    padding: '8px 0'
                                }}>
                                    <Text type="secondary">Subtotal:</Text>
                                    <Text>{getCurrencySymbol()}{state.subtotal.toFixed(2)}</Text>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    padding: '8px 0'
                                }}>
                                    <Text type="secondary">Discount:</Text>
                                    <Text>{getCurrencySymbol()}{state.discount.toFixed(2)}</Text>
                                </div>
                                <Divider style={{ margin: '12px 0' }} />
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    padding: '8px 0'
                                }}>
                                    <Text strong style={{ fontSize: '16px' }}>Total:</Text>
                                    <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>{getCurrencySymbol()}{state.total.toFixed(2)}</Text>
                                </div>
                            </Space>

                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={showPaymentModal}
                                style={{ 
                                    marginTop: 24,
                                    height: '48px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)'
                                }}
                            >
                                Proceed to Payment
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal
                title="Customer Selection"
                open={customerModalVisible}
                onCancel={() => setCustomerModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={customerForm}
                    layout="vertical"
                    onFinish={handleCustomerSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Customer Name"
                                rules={[{ required: true, message: 'Please enter customer name' }]}
                            >
                                <Input placeholder="Enter customer name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Phone Number"
                                rules={[{ required: true, message: 'Please enter phone number' }]}
                            >
                                <Input placeholder="Enter phone number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ type: 'email', message: 'Please enter a valid email' }]}
                    >
                        <Input placeholder="Enter email address" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input.TextArea rows={3} placeholder="Enter address" />
                    </Form.Item>
                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setCustomerModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Register Customer</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </MainPage>
    );
}

export default PosPage; 