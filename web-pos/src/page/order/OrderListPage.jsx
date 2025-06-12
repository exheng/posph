import React, { useEffect, useState } from 'react';
import {
    Card,
    Table,
    Space,
    Input,
    Button,
    Tag,
    Typography,
    Row,
    Col,
    DatePicker,
    Modal,
    Descriptions,
    Badge,
    Tooltip,
    Statistic
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    EyeOutlined,
    PrinterOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function OrderListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
    });

    // Helper function to get currency symbol based on order currency
    const getCurrencySymbol = (currencyCode) => {
        switch (currencyCode) {
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

    // Helper function to format currency for display
    const formatCurrency = (amount) => {
        if (isNaN(amount)) return '0.00';
        return Number(amount).toFixed(2);
    };

    useEffect(() => {
        getOrders();
    }, []);

    const getOrders = async () => {
        try {
            setLoading(true);
            // Assuming the backend 'order/get' now returns currency and exchange_rate_to_usd
            const res = await request("order", "get");
            if (res && !res.error) {
                setOrders(res.list || []);
                calculateStats(res.list || []);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (orderList) => {
        const totalOrders = orderList.length;
        
        // Sum total revenue in a base currency (e.g., USD) then convert for display
        const totalRevenueUSD = orderList.reduce((sum, order) => {
            const amountInOrderCurrency = Number(order.total_amount);
            const exchangeRate = Number(order.exchange_rate_to_usd || 1.0000);
            return sum + (amountInOrderCurrency / exchangeRate);
        }, 0);

        const averageOrderValueUSD = totalOrders > 0 ? totalRevenueUSD / totalOrders : 0;

        setStats({
            totalOrders,
            totalRevenue: totalRevenueUSD,
            averageOrderValue: averageOrderValueUSD
        });
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const handlePrintOrder = (order) => {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <html>
                <head>
                    <title>Order Receipt - ${order.order_number}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            padding: 20px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            border-bottom: 2px solid #000;
                            padding-bottom: 10px;
                        }
                        .order-info {
                            margin-bottom: 20px;
                        }
                        .items-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        .items-table th, .items-table td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        .items-table th {
                            background-color: #f5f5f5;
                        }
                        .total-section {
                            text-align: right;
                            margin-top: 20px;
                            border-top: 2px solid #000;
                            padding-top: 10px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            font-size: 12px;
                            color: #666;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 15px;
                            }
                            .no-print {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Order Receipt</h2>
                        <p>${order.order_number}</p>
                    </div>
                    
                    <div class="order-info">
                        <p><strong>Date:</strong> ${dayjs(order.created_at).format('MMMM D, YYYY h:mm A')}</p>
                        <p><strong>Customer:</strong> ${order.customer_name || 'Walk-in Customer'}</p>
                        <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.product_name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${getCurrencySymbol(order.currency)}${formatCurrency(Number(item.price))}</td>
                                    <td>${getCurrencySymbol(order.currency)}${formatCurrency((Number(item.price) * Number(item.quantity)))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <p><strong>Total Amount:</strong> ${getCurrencySymbol(order.currency)}${formatCurrency(Number(order.total_amount))}</p>
                        ${order.payment_amount ? `
                            <p><strong>Payment Amount:</strong> ${getCurrencySymbol(order.currency)}${formatCurrency(Number(order.payment_amount))}</p>
                            <p><strong>Change Amount:</strong> ${getCurrencySymbol(order.currency)}${formatCurrency(Number(order.change_amount))}</p>
                        ` : ''}
                    </div>

                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>Printed on: ${dayjs().format('MMMM D, YYYY h:mm A')}</p>
                    </div>

                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                        <button onclick="window.print()">Print Receipt</button>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const getPaymentMethodColor = (method) => {
        const colors = {
            cash: 'green',
            card: 'blue',
            bank: 'purple'
        };
        return colors[method] || 'default';
    };

    const getPaymentMethodIcon = (method) => {
        const icons = {
            cash: <DollarOutlined />,
            card: <ShoppingCartOutlined />,
            bank: <UserOutlined />
        };
        return icons[method] || null;
    };

    const columns = [
        {
            title: 'Order Number',
            dataIndex: 'order_number',
            key: 'order_number',
            render: (text) => (
                <Text strong style={{ color: '#1890ff' }}>{text}</Text>
            )
        },
        {
            title: 'Customer',
            dataIndex: 'customer_name',
            key: 'customer_name',
            render: (text) => (
                <Space>
                    <UserOutlined />
                    <Text>{text || 'Walk-in Customer'}</Text>
                </Space>
            )
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => (
                <Space>
                    <CalendarOutlined />
                    <Text>{dayjs(text).format('MMM D, YYYY h:mm A')}</Text>
                </Space>
            ),
            sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount, record) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {getCurrencySymbol(record.currency)}{formatCurrency(Number(amount))}
                </Text>
            ),
            sorter: (a, b) => Number(a.total_amount) - Number(b.total_amount)
        },
        {
            title: 'Payment Method',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method) => (
                <Tag color={getPaymentMethodColor(method)} icon={getPaymentMethodIcon(method)}>
                    {method.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Badge 
                    status={status === 'completed' ? 'success' : 'processing'} 
                    text={status.charAt(0).toUpperCase() + status.slice(1)} 
                />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button 
                            type="primary" 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewOrder(record)}
                            style={{ background: '#1890ff' }}
                        />
                    </Tooltip>
                    <Tooltip title="Print Order">
                        <Button 
                            icon={<PrinterOutlined />} 
                            onClick={() => handlePrintOrder(record)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.order_number?.toLowerCase().includes(searchText.toLowerCase()) ||
            order.customer_name?.toLowerCase().includes(searchText.toLowerCase());
        
        const matchesDate = !dateRange || (
            dayjs(order.created_at).isAfter(dateRange[0]) &&
            dayjs(order.created_at).isBefore(dateRange[1])
        );

        return matchesSearch && matchesDate;
    });

    return (
        <MainPage loading={loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Title level={4}>Order List</Title>
                    <Row gutter={[16, 16]} align="middle">
                        <Col span={8}>
                            <Input
                                placeholder="Search orders..."
                                prefix={<SearchOutlined />}
                                onChange={(e) => handleSearch(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col span={8}>
                            <RangePicker
                                onChange={handleDateRangeChange}
                                style={{ width: '100%' }}
                            />
                        </Col>
                    </Row>
                </Space>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={stats.totalOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={stats.totalRevenue}
                            precision={2}
                            prefix="$"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Average Order Value"
                            value={stats.averageOrderValue}
                            precision={2}
                            prefix="$"
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} orders`
                    }}
                />
            </Card>

            <Modal
                title="Order Details"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Order Number" span={2}>
                                {selectedOrder.order_number}
                            </Descriptions.Item>
                            <Descriptions.Item label="Customer">
                                {selectedOrder.customer_name || 'Walk-in Customer'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Date">
                                {dayjs(selectedOrder.created_at).format('MMM D, YYYY h:mm A')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Method">
                                <Tag color={getPaymentMethodColor(selectedOrder.payment_method)}>
                                    {selectedOrder.payment_method.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Badge 
                                    status={selectedOrder.status === 'completed' ? 'success' : 'processing'} 
                                    text={selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)} 
                                />
                            </Descriptions.Item>
                        </Descriptions>

                        <Title level={5} style={{ marginTop: 24 }}>Items</Title>
                        <Table
                            dataSource={selectedOrder.items}
                            columns={[
                                {
                                    title: 'Product',
                                    dataIndex: 'product_name',
                                    key: 'product_name',
                                },
                                {
                                    title: 'Quantity',
                                    dataIndex: 'quantity',
                                    key: 'quantity',
                                    align: 'center'
                                },
                                {
                                    title: 'Price',
                                    dataIndex: 'price',
                                    key: 'price',
                                    render: (price) => `${getCurrencySymbol(selectedOrder.currency)}${formatCurrency(Number(price))}`,
                                    align: 'right'
                                },
                                {
                                    title: 'Total',
                                    key: 'total',
                                    render: (_, record) => 
                                        `${getCurrencySymbol(selectedOrder.currency)}${formatCurrency((Number(record.price) * Number(record.quantity)))}`,
                                    align: 'right'
                                }
                            ]}
                            pagination={false}
                            summary={() => (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                                        <Text strong>Total Amount:</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <Text strong style={{ color: '#52c41a' }}>
                                            {getCurrencySymbol(selectedOrder.currency)}{formatCurrency(Number(selectedOrder.total_amount))}
                                        </Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}
                        />
                    </>
                )}
            </Modal>
        </MainPage>
    );
}

export default OrderListPage; 