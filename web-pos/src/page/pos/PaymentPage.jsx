import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    message,
    Typography,
    Space,
    Row,
    Col,
    Divider,
    Table,
    Image,
    Tooltip,
    Steps,
    Badge,
    Tag,
    Modal
} from 'antd';
import { 
    DollarOutlined, 
    UserOutlined, 
    PhoneOutlined, 
    MailOutlined, 
    EnvironmentOutlined,
    CreditCardOutlined,
    MobileOutlined,
    BankOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { configStore } from '../../store/configStore';
import { MdDelete, MdReceipt, MdPrint, MdArrowBack } from "react-icons/md";
import khqr from '../../assets/khqr.jpg'

const { Title, Text } = Typography;

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { config } = configStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState({
        paymentMethod: 'cash',
        paymentAmount: 0,
        notes: '',
        discount: 0,
        discountPercent: 0
    });
    const [currentStep, setCurrentStep] = useState(0);
    const [qrModalVisible, setQrModalVisible] = useState(false);

    // Get cart data from navigation state
    const { cart = [], total = 0, subtotal = 0, discount = 0, customer: navigatedCustomer } = location.state || {};

    // Helper function to get currency symbol
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
            default: return '$'; // Default to USD symbol
        }
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (isNaN(amount)) return '0.00';
        return Number(amount).toFixed(2);
    };

    useEffect(() => {
        if (!cart || cart.length === 0) {
            message.error('No items in cart');
            navigate('/pos');
            return;
        }

        // Set customer from navigation state
        if (navigatedCustomer) {
            setSelectedCustomer(navigatedCustomer.id);
            setPaymentInfo(prev => ({ 
                ...prev, 
                customer: navigatedCustomer
            }));
            // Set form value for customer
            form.setFieldValue('customer', navigatedCustomer.name);
        }

        // Set initial payment amount to total
        const initialPaymentAmount = Number(total || 0);
        const initialDiscountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;
        setPaymentInfo(prev => ({
            ...prev,
            paymentAmount: initialPaymentAmount,
            discount: Number(discount || 0),
            discountPercent: initialDiscountPercent
        }));
        // Set form values
        form.setFieldValue('paymentAmount', initialPaymentAmount);
        form.setFieldValue('discountPercent', initialDiscountPercent);

        getCustomers();
    }, [cart, total, navigatedCustomer]);

    const getCustomers = async () => {
        try {
            setLoading(true);
            const res = await request("customer", "get");
            if (res && !res.error) {
                setCustomers(res.list || []);
            }
        } catch (error) {
            message.error("Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        try {
            const finalPaymentAmount = Number(paymentInfo.paymentAmount || 0);
            const finalTotal = Number(subtotal || 0) - Number(paymentInfo.discount || 0);

            if (finalPaymentAmount < finalTotal) {
                message.warning("Payment amount must be greater than or equal to total amount");
                return;
            }

            setLoading(true);

            const orderData = {
                customer_id: navigatedCustomer?.id || null,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    // Backend expects prices in its base currency (likely USD) for calculations.
                    // Convert item.price from current display currency back to USD for the backend.
                    // Assuming `item.price` coming from POS page is already converted to selected currency
                    // We need to convert it back to USD for the backend if the backend's base currency is USD.
                    // Or, if backend handles currency conversion, send as is.
                    // For now, let's assume backend expects USD price for products
                    // and totals are calculated based on prices * exchange_rate.
                    // If backend handles currency conversion, it needs to be updated.
                    // For simplicity, let's pass price as is and total_amount in selected currency.
                    price: item.price, // This `item.price` is the price in the *display* currency, as passed from PosPage.
                    discount: item.discount || 0
                })),
                // total_amount, payment_amount, change_amount are already in the selected currency
                total_amount: finalTotal, 
                payment_method: paymentInfo.paymentMethod,
                payment_amount: finalPaymentAmount,
                change_amount: finalPaymentAmount - finalTotal,
                notes: paymentInfo.notes,
                discount: paymentInfo.discount,
                discount_percent: paymentInfo.discountPercent,
                // Add currency and exchange rate to order data for backend persistence
                currency: config.store?.currency || 'USD',
                exchange_rate_to_usd: config.store?.exchange_rate_to_usd || 1.0000
            };

            const res = await request("order/create", "post", orderData);
            
            if (res && !res.error) {
                message.success("Payment processed successfully!");
                setCurrentStep(2);
                navigate('/pos/receipt', { 
                    state: { 
                        orderNumber: res.data.order_number,
                        orderData: {
                            ...orderData,
                            customer: navigatedCustomer,
                            items: cart
                        }
                    }
                });
            } else if (res?.error) {
                console.error("Payment API Error:", res.details || res.error);
                message.error(`Failed to process payment: ${res.details || res.error}`);
            } else {
                console.error("Unexpected API Response:", res);
                message.error("An unexpected error occurred during payment. Please try again.");
            }
        } catch (error) {
            console.error("Payment function error:", error);
            message.error("An error occurred while processing payment");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/pos');
    };

    const orderSummaryColumns = [
        {
            title: 'Item',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <Image
                        src={record.image ? `http://localhost:8081/pos_img/${record.image}` : 'default-product.png'}
                        alt={record.name}
                        style={{ 
                            width: '40px', 
                            height: '40px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        preview={false}
                    />
                    <div>
                        <Text strong>{text}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.barcode}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 60,
            align: 'center',
            render: (qty) => (
                <Badge count={qty} style={{ backgroundColor: '#1890ff' }} />
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (price) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {getCurrencySymbol()}{formatCurrency(Number(price || 0))}
                </Text>
            )
        },
        {
            title: 'Total',
            key: 'total',
            align: 'right',
            render: (_, record) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {getCurrencySymbol()}{formatCurrency(Number(record.price || 0) * Number(record.quantity || 0))}
                </Text>
            )
        }
    ];

    const handlePayNow = () => {
        setQrModalVisible(true);
    };

    const handleModalPayment = async () => {
        setQrModalVisible(false);
        await handlePayment();
    };

    if (!cart || cart.length === 0) {
        return null;
    }

    return (
        <MainPage loading={loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                            <Button 
                                icon={<ArrowLeftOutlined />} 
                                onClick={handleCancel}
                                style={{ 
                                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                Back
                            </Button>
                            <Title level={4} style={{ margin: 0 }}>Payment</Title>
                        </Space>
                    </div>
                </Space>
            </div>

            <Steps
                current={currentStep}
                items={[
                    {
                        title: 'Customer',
                        description: 'Select customer',
                        icon: <UserOutlined />
                    },
                    {
                        title: 'Payment',
                        description: 'Process payment',
                        icon: <DollarOutlined />
                    },
                    {
                        title: 'Complete',
                        description: 'Order completed',
                        icon: <MdReceipt />
                    }
                ]}
                style={{ marginBottom: 24 }}
            />

            <Row gutter={24}>
                <Col span={14}>
                    <Card 
                        title={
                            <Space>
                                <DollarOutlined />
                                <span>Payment Details</span>
                            </Space>
                        }
                        style={{ marginBottom: 24 }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handlePayment}
                            initialValues={{
                                paymentMethod: 'cash',
                                paymentAmount: total,
                                customer: navigatedCustomer?.name || 'Walk-in Customer'
                            }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Customer"
                                        name="customer"
                                    >
                                        <Input 
                                            value={navigatedCustomer?.name || 'Walk-in Customer'} 
                                            disabled 
                                            style={{ 
                                                background: '#f5f5f5',
                                                cursor: 'not-allowed',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Payment Amount"
                                        name="paymentAmount"
                                        rules={[{ required: true, message: 'Please enter payment amount' }]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                            min={0}
                                            onChange={(value) => setPaymentInfo(prev => ({ ...prev, paymentAmount: value }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Discount (%)"
                                        name="discountPercent"
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            formatter={value => `${value}%`}
                                            parser={value => value.replace('%', '')}
                                            min={0}
                                            max={100}
                                            onChange={(value) => {
                                                const newDiscountPercent = Number(value || 0);
                                                const newDiscount = (subtotal * newDiscountPercent) / 100;
                                                const newTotal = subtotal - newDiscount;
                                                setPaymentInfo(prev => ({ 
                                                    ...prev, 
                                                    discountPercent: newDiscountPercent,
                                                    discount: newDiscount,
                                                    paymentAmount: newTotal
                                                }));
                                                form.setFieldValue('paymentAmount', newTotal);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Notes"
                                        name="notes"
                                    >
                                        <Input.TextArea 
                                            rows={2}
                                            placeholder="Add any notes for this payment"
                                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, notes: e.target.value }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Payment Method"
                                name="paymentMethod"
                                rules={[{ required: true, message: 'Please select a payment method' }]}
                            >
                                <Row gutter={[16, 16]}>
                                    <Col span={8}>
                                        <Card
                                            hoverable
                                            style={{
                                                border: paymentInfo.paymentMethod === 'cash' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                                background: paymentInfo.paymentMethod === 'cash' ? '#e6f7ff' : 'white'
                                            }}
                                            onClick={() => {
                                                setPaymentInfo(prev => ({ ...prev, paymentMethod: 'cash' }));
                                                form.setFieldValue('paymentMethod', 'cash');
                                            }}
                                        >
                                            <Space direction="vertical" align="center" style={{ width: '100%' }}>
                                                <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                                                <Text strong>Cash</Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Pay with cash</Text>
                                            </Space>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card
                                            hoverable
                                            style={{
                                                border: paymentInfo.paymentMethod === 'card' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                                background: paymentInfo.paymentMethod === 'card' ? '#e6f7ff' : 'white'
                                            }}
                                            onClick={() => {
                                                setPaymentInfo(prev => ({ ...prev, paymentMethod: 'card' }));
                                                form.setFieldValue('paymentMethod', 'card');
                                            }}
                                        >
                                            <Space direction="vertical" align="center" style={{ width: '100%' }}>
                                                <CreditCardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                                <Text strong>Card</Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Credit/Debit card</Text>
                                            </Space>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card
                                            hoverable
                                            style={{
                                                border: paymentInfo.paymentMethod === 'bank' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                                background: paymentInfo.paymentMethod === 'bank' ? '#e6f7ff' : 'white'
                                            }}
                                            onClick={() => {
                                                setPaymentInfo(prev => ({ ...prev, paymentMethod: 'bank' }));
                                                form.setFieldValue('paymentMethod', 'bank');
                                            }}
                                        >
                                            <Space direction="vertical" align="center" style={{ width: '100%' }}>
                                                <BankOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                                                <Text strong>QR Code</Text>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>Pay with QR code</Text>
                                            </Space>
                                        </Card>
                                    </Col>
                                </Row>
                            </Form.Item>

                            <Form.Item>
                                {paymentInfo.paymentMethod === 'bank' ? (
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        style={{
                                            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                            border: 'none',
                                            boxShadow: '0 2px 8px rgba(82, 196, 26, 0.2)'
                                        }}
                                        onClick={handlePayNow}
                                    >
                                        Pay Now
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        size="large"
                                        style={{
                                            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                            border: 'none',
                                            boxShadow: '0 2px 8px rgba(82, 196, 26, 0.2)'
                                        }}
                                    >
                                        Complete Payment
                                    </Button>
                                )}
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col span={10}>
                    <Card 
                        title={
                            <Space>
                                <MdReceipt />
                                <span>Order Summary</span>
                            </Space>
                        }
                        style={{ marginBottom: '24px' }}
                    >
                        <Table
                            dataSource={cart}
                            columns={orderSummaryColumns}
                            pagination={false}
                            rowKey="id"
                            size="middle"
                            style={{ fontSize: '16px' }}
                            summary={() => (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                                        <Text strong style={{ fontSize: '16px' }}>Subtotal:</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <Text strong style={{ fontSize: '16px' }}>${Number(subtotal || 0).toFixed(2)}</Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}
                        />
                        <Divider style={{ margin: '16px 0' }} />
                        <Row justify="space-between" style={{ marginBottom: '12px' }}>
                            <Col><Text style={{ fontSize: '16px' }}>Discount ({paymentInfo.discountPercent}%):</Text></Col>
                            <Col><Text type="danger" style={{ fontSize: '16px' }}>-${Number(paymentInfo.discount || 0).toFixed(2)}</Text></Col>
                        </Row>
                        <Row justify="space-between" style={{ marginBottom: '20px' }}>
                            <Col><Title level={4} style={{ margin: 0 }}>Total:</Title></Col>
                            <Col><Title level={4} style={{ margin: 0, color: '#52c41a' }}>${(Number(subtotal || 0) - Number(paymentInfo.discount || 0)).toFixed(2)}</Title></Col>
                        </Row>
                        <Divider style={{ margin: '16px 0' }} />
                        <Row justify="space-between" style={{ marginBottom: '12px' }}>
                            <Col><Text style={{ fontSize: '16px' }}>Payment Amount:</Text></Col>
                            <Col><Text strong style={{ fontSize: '16px' }}>${Number(paymentInfo.paymentAmount || 0).toFixed(2)}</Text></Col>
                        </Row>
                        <Row justify="space-between" style={{ marginBottom: '12px' }}>
                            <Col><Text strong style={{ fontSize: '16px' }}>Change:</Text></Col>
                            <Col>
                                <Tag color="success" style={{ fontSize: '16px', padding: '4px 8px' }}>
                                    ${(Number(paymentInfo.paymentAmount || 0) - Number(total || 0)).toFixed(2)}
                                </Tag>
                            </Col>
                        </Row>
                    </Card>                  
                </Col>
            </Row>
            <Modal
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={null}
                centered
            >
                <div style={{ textAlign: 'center' }}>
                    <img src={khqr} alt="KHQR Code" style={{ maxWidth: 260, width: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <div style={{ marginTop: 12, fontWeight: 500, fontSize: 16 }}>Scan to pay with KHQR</div>
                    <Button
                        type="primary"
                        size="large"
                        style={{ marginTop: 24, width: 180 }}
                        onClick={handleModalPayment}
                    >
                        Complete Payment
                    </Button>
                </div>
            </Modal>
        </MainPage>
    );
}

export default PaymentPage; 