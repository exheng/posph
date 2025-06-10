import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Select,
    Table,
    Statistic,
    Typography,
    Space,
    Button,
    DatePicker,
    Tag
} from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    RiseOutlined,
    FallOutlined,
    DownloadOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function SalesReportPage() {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [dateRange, setDateRange] = useState(null);
    const [summary, setSummary] = useState({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        growthRate: 0
    });

    useEffect(() => {
        getOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, dateRange]);

    const getOrders = async () => {
        setLoading(true);
        const res = await request('order', 'get');
        if (res && !res.error) {
            setOrders(res.list || []);
        }
        setLoading(false);
    };

    const filterOrders = () => {
        let filtered = orders;
        if (dateRange) {
            filtered = filtered.filter(order => {
                const orderDate = dayjs(order.created_at);
                return orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1]);
            });
        }
        setFilteredOrders(filtered);
        updateSummary(filtered);
    };

    const updateSummary = (data) => {
        const totalSales = data.reduce((sum, order) => sum + Number(order.total_amount), 0);
        const totalOrders = data.length;
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Calculate growth rate (comparing with previous period)
        const currentPeriodSales = totalSales;
        const previousPeriodSales = orders
            .filter(order => {
                const orderDate = dayjs(order.created_at);
                const previousStart = dateRange ? dateRange[0].subtract(dateRange[1].diff(dateRange[0])) : dayjs().subtract(30, 'days');
                const previousEnd = dateRange ? dateRange[0] : dayjs();
                return orderDate.isAfter(previousStart) && orderDate.isBefore(previousEnd);
            })
            .reduce((sum, order) => sum + Number(order.total_amount), 0);

        const growthRate = previousPeriodSales > 0 
            ? ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100 
            : 0;

        setSummary({
            totalSales,
            totalOrders,
            averageOrderValue,
            growthRate
        });
    };

    const exportToCSV = () => {
        const headers = ['Order Number', 'Date', 'Customer', 'Items', 'Total Amount', 'Payment Method'];
        const csvData = filteredOrders.map(order => [
            order.order_number,
            dayjs(order.created_at).format('YYYY-MM-DD HH:mm:ss'),
            order.customer_name || 'Walk-in Customer',
            order.items.length,
            order.total_amount,
            order.payment_method
        ]);
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sales_report_${dayjs().format('YYYY-MM-DD')}.csv`;
        link.click();
    };

    const columns = [
        {
            title: 'Order Number',
            dataIndex: 'order_number',
            key: 'order_number',
            render: (text) => <Text strong style={{ fontSize: 16 }}>{text}</Text>
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => <Text>{dayjs(text).format('MMM D, YYYY h:mm A')}</Text>,
            sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
        },
        {
            title: 'Customer',
            dataIndex: 'customer_name',
            key: 'customer_name',
            render: (text) => <Tag color="blue" style={{ fontSize: 14 }}>{text || 'Walk-in Customer'}</Tag>
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            render: (items) => <Text>{items.length}</Text>,
            sorter: (a, b) => a.items.length - b.items.length
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => (
                <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                    ${Number(amount).toFixed(2)}
                </Text>
            ),
            sorter: (a, b) => Number(a.total_amount) - Number(b.total_amount)
        },
        {
            title: 'Payment Method',
            dataIndex: 'payment_method',
            key: 'payment_method',
            render: (method) => (
                <Tag color={method === 'cash' ? 'green' : method === 'card' ? 'blue' : 'purple'} style={{ fontSize: 14 }}>
                    {method.toUpperCase()}
                </Tag>
            )
        }
    ];

    // Prepare data for sales trend chart
    const salesTrendData = filteredOrders.reduce((acc, order) => {
        const date = dayjs(order.created_at).format('YYYY-MM-DD');
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += Number(order.total_amount);
        return acc;
    }, {});

    const chartData = Object.entries(salesTrendData).map(([date, amount]) => ({
        date,
        amount
    })).sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

    const lineConfig = {
        data: chartData,
        xField: 'date',
        yField: 'amount',
        smooth: true,
        lineStyle: {
            stroke: '#1890ff',
            lineWidth: 3,
        },
        point: {
            size: 5,
            shape: 'circle',
            style: {
                fill: '#1890ff',
                stroke: '#fff',
                lineWidth: 2,
            },
        },
        label: {
            style: {
                fill: '#333',
                fontSize: 14,
            },
        },
        xAxis: {
            label: {
                formatter: (text) => dayjs(text).format('MMM D'),
                style: {
                    fontSize: 14,
                },
            },
        },
        yAxis: {
            label: {
                formatter: (text) => `$${text}`,
                style: {
                    fontSize: 14,
                },
            },
        },
        tooltip: {
            formatter: (datum) => {
                return {
                    name: 'Sales',
                    value: `$${datum.amount.toFixed(2)}`,
                };
            },
        },
        height: 400,
    };

    return (
        <MainPage loading={loading}>
            <div className="pageHeader" style={{ marginBottom: 24 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(90deg, #e0e7ff 0%, #f0f5ff 100%)',
                        borderRadius: 16,
                        padding: '18px 32px',
                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.06)'
                    }}>
                        <Title level={3} style={{ margin: 0, color: '#1a237e', letterSpacing: 1 }}>Sales Report</Title>
                        <Space>
                            <RangePicker
                                onChange={setDateRange}
                                style={{ width: 300, borderRadius: 8 }}
                            />
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={exportToCSV}
                                style={{
                                    background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontWeight: 600
                                }}
                            >
                                Export
                            </Button>
                        </Space>
                    </div>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)',
                            background: 'linear-gradient(135deg, #e0f7fa 0%, #e3f2fd 100%)',
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: '#1976d2', fontWeight: 500 }}>Total Sales</span>}
                            value={summary.totalSales}
                            precision={2}
                            prefix="$"
                            prefix={<DollarOutlined style={{ color: '#1976d2' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)',
                            background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%)',
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: '#388e3c', fontWeight: 500 }}>Total Orders</span>}
                            value={summary.totalOrders}
                            prefix={<ShoppingCartOutlined style={{ color: '#388e3c' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)',
                            background: 'linear-gradient(135deg, #fffde7 0%, #fff8e1 100%)',
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: '#fbc02d', fontWeight: 500 }}>Average Order Value</span>}
                            value={summary.averageOrderValue}
                            precision={2}
                            prefix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)',
                            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: summary.growthRate >= 0 ? '#4caf50' : '#f44336', fontWeight: 500 }}>Growth Rate</span>}
                            value={summary.growthRate}
                            precision={2}
                            prefix={summary.growthRate >= 0 ? <RiseOutlined /> : <FallOutlined />}
                            suffix="%"
                            valueStyle={{ color: summary.growthRate >= 0 ? '#4caf50' : '#f44336' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card
                        title={
                            <Space>
                                <LineChartOutlined />
                                <span style={{ fontWeight: 600, color: '#1a237e' }}>Sales Trend</span>
                            </Space>
                        }
                        style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)' }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Line {...lineConfig} />
                    </Card>
                </Col>
            </Row>

            <Card
                title={<span style={{ fontWeight: 600, color: '#1a237e' }}>Sales Details</span>}
                style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)' }}
                bodyStyle={{ padding: 24 }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} orders`
                    }}
                    bordered
                    style={{ borderRadius: 12, overflow: 'hidden' }}
                />
            </Card>
        </MainPage>
    );
}

export default SalesReportPage; 