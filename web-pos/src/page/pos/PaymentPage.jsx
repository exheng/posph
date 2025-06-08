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
    Tooltip
} from 'antd';
import { DollarOutlined, UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { configStore } from '../../store/configStore';
import { MdDelete } from "react-icons/md";

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
        notes: ''
    });

    // Get cart data from navigation state
    const { cart = [], total = 0, subtotal = 0, discount = 0, customer: navigatedCustomer } = location.state || {};

    useEffect(() => {
        // Check if we have cart data
        if (!cart || cart.length === 0) {
            message.error('No items in cart');
            navigate('/pos');
            return;
        }

        // Set the customer from navigation state if available
        if (navigatedCustomer) {
            setSelectedCustomer(navigatedCustomer.id === 'walk-in' ? 'walk-in' : navigatedCustomer.id);
            // Set initial customer data if it's a new customer or not 'walk-in'
            if (navigatedCustomer.id !== 'walk-in' && navigatedCustomer.id) {
                 // Find the customer in the fetched list or use navigated data
                const foundCustomer = customers.find(c => c.id === navigatedCustomer.id);
                setPaymentInfo(prev => ({ ...prev, customer: foundCustomer || navigatedCustomer }));
            } else if (navigatedCustomer.id === 'walk-in') {
                setPaymentInfo(prev => ({ ...prev, customer: { name: 'Walk-in Customer', id: 'walk-in' } }));
            }

        }

        // Initialize payment amount with total
        setPaymentInfo(prev => ({
            ...prev,
            paymentAmount: Number(total || 0)
        }));

        // Fetch customers
        getCustomers();
    }, [cart, total, navigatedCustomer]); // Add navigatedCustomer to dependency array

    const getCustomers = async () => {
        try {
            setLoading(true);
            const res = await request("customer", "get");
            if (res && !res.error) {
                setCustomers(res.list || []);
            } else {
                message.error("Failed to fetch customers");
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
            message.error("Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        try {
            if (!selectedCustomer) {
                message.warning("Please select a customer");
                return;
            }

            const finalPaymentAmount = Number(paymentInfo.paymentAmount || 0);
            const finalTotal = Number(total || 0);

            if (finalPaymentAmount < finalTotal) {
                message.warning("Payment amount must be greater than or equal to total amount");
                return;
            }

            setLoading(true);

            const orderData = {
                customer_id: selectedCustomer === 'walk-in' ? null : selectedCustomer,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    discount: item.discount || 0
                })),
                total_amount: finalTotal,
                payment_method: paymentInfo.paymentMethod,
                payment_amount: finalPaymentAmount,
                change_amount: finalPaymentAmount - finalTotal,
                notes: paymentInfo.notes
            };

            const res = await request("order", "post", orderData);
            
            if (res && !res.error) {
                message.success("Payment processed successfully!");
                // Navigate back to POS with cleared cart and order number
                navigate('/pos', { 
                    state: { 
                        clearCart: true,
                        orderNumber: res.data.order_number // Use res.data.order_number
                    }
                });
            } else {
                message.error(res.error || "Failed to process payment");
            }
        } catch (error) {
            console.error("Error processing payment:", error);
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
                        src={record.image ? `http://localhost:8081/pos_img/${record.image}` : 'default-product.png'} // Ensure correct image path
                        alt={record.name}
                        style={{ 
                            width: '40px', 
                            height: '40px', 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                        preview={false}
                    />
                </Space>
            )
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 60,
            align: 'center',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (price) => `$${Number(price || 0).toFixed(2)}`
        },
        {
            title: 'Total',
            key: 'total',
            align: 'right',
            render: (_, record) => `$${(Number(record.price || 0) * Number(record.quantity || 0)).toFixed(2)}`
        }
    ];

    if (!cart || cart.length === 0) {
        return null;
    }

    return (
        <MainPage loading={loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>Payment</Title>
                            <Text type="secondary">Process payment for your order</Text>
                        </div>
                    </div>
                </Space>
            </div>

            <Row gutter={24}>
                <Col span={16}>
                    <Card>
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                paymentMethod: paymentInfo.paymentMethod,
                                paymentAmount: paymentInfo.paymentAmount,
                                notes: paymentInfo.notes
                            }}
                            onValuesChange={(changedValues) => {
                                setPaymentInfo(prev => ({
                                    ...prev,
                                    ...changedValues
                                }));
                            }}
                        >
                            <Form.Item
                                label="Customer"
                                required
                                tooltip="Select a customer or choose 'Walk-in Customer'"
                            >
                                <Select
                                    placeholder="Select Customer"
                                    value={selectedCustomer}
                                    onChange={setSelectedCustomer}
                                    options={[
                                        { label: 'Walk-in Customer', value: 'walk-in' },
                                        ...customers.map(customer => ({
                                            label: customer.name,
                                            value: customer.id
                                        }))
                                    ]}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                name="paymentMethod"
                                label="Payment Method"
                                required
                            >
                                <Select
                                    options={[
                                        { label: 'Cash', value: 'cash' },
                                        { label: 'Credit Card', value: 'credit_card' },
                                        { label: 'Mobile Payment', value: 'mobile_payment' }
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item
                                name="paymentAmount"
                                label="Payment Amount"
                                required
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter payment amount'
                                    },
                                    {
                                        validator: (_, value) => {
                                            const numValue = Number(value || 0);
                                            if (numValue < total) {
                                                return Promise.reject('Payment amount must be greater than or equal to total amount');
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={Number(total || 0)}
                                    step={0.01}
                                    precision={2}
                                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item
                                name="notes"
                                label="Notes"
                            >
                                <Input.TextArea rows={4} placeholder="Enter any additional notes" />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 0 }}>
                                <Space style={{ width: '100%', justifyContent: 'flex-end', paddingTop: '16px' }}>
                                    <Button onClick={handleCancel}>Cancel</Button>
                                    <Button type="primary" onClick={handlePayment} loading={loading}>
                                        Complete Payment
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Order Summary" style={{ marginBottom: '24px' }}>
                        <Table
                            dataSource={cart}
                            columns={orderSummaryColumns}
                            pagination={false}
                            rowKey="id"
                            size="small"
                            summary={() => (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                                        <Text strong>Subtotal:</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <Text strong>${Number(subtotal || 0).toFixed(2)}</Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}
                        />
                        <Divider style={{ margin: '12px 0' }} />
                        <Row justify="space-between" style={{ marginBottom: '8px' }}>
                            <Col><Text>Discount:</Text></Col>
                            <Col><Text>${Number(discount || 0).toFixed(2)}</Text></Col>
                        </Row>
                        <Row justify="space-between" style={{ marginBottom: '16px' }}>
                            <Col><Title level={5} style={{ margin: 0 }}>Total:</Title></Col>
                            <Col><Title level={5} style={{ margin: 0 }}>${Number(total || 0).toFixed(2)}</Title></Col>
                        </Row>
                        <Divider style={{ margin: '12px 0' }} />
                        <Row justify="space-between" style={{ marginBottom: '8px' }}>
                            <Col><Text>Payment Amount:</Text></Col>
                            <Col><Text>${Number(paymentInfo.paymentAmount || 0).toFixed(2)}</Text></Col>
                        </Row>
                        <Row justify="space-between" style={{ marginBottom: '8px' }}>
                            <Col><Text strong>Change:</Text></Col>
                            <Col>
                                <Text strong>
                                    ${(Number(paymentInfo.paymentAmount || 0) - Number(total || 0)).toFixed(2)}
                                </Text>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </MainPage>
    );
}

export default PaymentPage; 