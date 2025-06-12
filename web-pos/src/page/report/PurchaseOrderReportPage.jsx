import React, { useEffect, useState } from 'react';
import {
    Card,
    Table,
    Space,
    Input,
    Button,
    DatePicker,
    Select,
    Row,
    Col,
    Typography,
    Statistic,
    Tag,
    message
} from 'antd';
import {
    ShoppingOutlined,
    DollarOutlined,
    RiseOutlined,
    FallOutlined,
    DownloadOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { configStore } from '../../store/configStore';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function PurchaseOrderReportPage() {
    const { config } = configStore();
    const [state, setState] = useState({
        orders: [],
        loading: false,
        searchText: '',
        dateRange: [dayjs().subtract(30, 'days'), dayjs()],
        selectedSupplier: null,
        selectedStatus: null,
        summary: {
            totalOrders: 0,
            totalAmount: 0,
            averageOrderValue: 0,
            pendingOrders: 0
        }
    });

    useEffect(() => {
        getOrders();
    }, [state.dateRange, state.selectedSupplier, state.selectedStatus]);

    const getOrders = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await request("purchase", "get");
            if (res && !res.error) {
                const ordersList = Array.isArray(res.list) ? res.list : [];
                setState(prev => ({
                    ...prev,
                    orders: ordersList,
                    loading: false
                }));
                calculateSummary(ordersList);
            } else {
                message.error("Failed to fetch purchase orders");
                setState(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error("Failed to fetch purchase orders");
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const calculateSummary = (orders) => {
        const filteredOrders = filterOrders(orders);
        const totalOrders = filteredOrders.length;
        const totalAmount = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
        const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;

        setState(prev => ({
            ...prev,
            summary: {
                totalOrders,
                totalAmount,
                averageOrderValue,
                pendingOrders
            }
        }));
    };

    const filterOrders = (orders) => {
        return orders.filter(order => {
            const matchesDate = !state.dateRange || (
                dayjs(order.order_date).isAfter(state.dateRange[0]) &&
                dayjs(order.order_date).isBefore(state.dateRange[1])
            );
            const matchesSupplier = !state.selectedSupplier || order.supplier_id === state.selectedSupplier;
            const matchesStatus = !state.selectedStatus || order.status === state.selectedStatus;
            const matchesSearch = !state.searchText || 
                order.order_number?.toLowerCase().includes(state.searchText.toLowerCase()) ||
                order.supplier_name?.toLowerCase().includes(state.searchText.toLowerCase());

            return matchesDate && matchesSupplier && matchesStatus && matchesSearch;
        });
    };

    const handleSearch = (value) => {
        setState(prev => ({ ...prev, searchText: value }));
    };

    const handleDateRangeChange = (dates) => {
        setState(prev => ({ ...prev, dateRange: dates }));
    };

    const handleSupplierChange = (value) => {
        setState(prev => ({ ...prev, selectedSupplier: value }));
    };

    const handleStatusChange = (value) => {
        setState(prev => ({ ...prev, selectedStatus: value }));
    };

    const exportToCSV = () => {
        try {
            const filteredOrders = filterOrders(state.orders);
            
            // Prepare headers
            const headers = [
                'Order Number',
                'Supplier',
                'Order Date',
                'Expected Delivery',
                'Total Amount',
                'Status',
                'Notes'
            ];

            // Prepare data rows
            const csvData = filteredOrders.map(order => [
                order.order_number,
                order.supplier_name,
                dayjs(order.order_date).format('YYYY-MM-DD'),
                dayjs(order.expected_delivery_date).format('YYYY-MM-DD'),
                `${getCurrencySymbol()}${formatCurrency(order.total_amount)}`,
                order.status?.toUpperCase(),
                order.notes || ''
            ]);

            // Combine headers and data
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `purchase_orders_${dayjs().format('YYYY-MM-DD')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success('Purchase orders exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            message.error('Failed to export purchase orders');
        }
    };

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

    const columns = [
        {
            title: 'Order Number',
            dataIndex: 'order_number',
            key: 'order_number',
            render: (text) => <Text strong style={{ fontSize: 16 }}>{text}</Text>
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier_name',
            key: 'supplier_name',
            render: (text) => <Tag color="blue" style={{ fontSize: 14 }}>{text}</Tag>
        },
        {
            title: 'Order Date',
            dataIndex: 'order_date',
            key: 'order_date',
            render: (text) => <Text>{dayjs(text).format('MMM D, YYYY')}</Text>,
            sorter: (a, b) => dayjs(a.order_date).unix() - dayjs(b.order_date).unix()
        },
        {
            title: 'Expected Delivery',
            dataIndex: 'expected_delivery_date',
            key: 'expected_delivery_date',
            render: (text) => <Text>{dayjs(text).format('MMM D, YYYY')}</Text>
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => (
                <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                    {getCurrencySymbol()}{formatCurrency(amount)}
                </Text>
            ),
            sorter: (a, b) => Number(a.total_amount) - Number(b.total_amount)
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = config?.purchase_status?.find(s => s.value === status);
                return (
                    <Tag color={
                        status === 'received' ? 'green' :
                        status === 'pending' ? 'orange' :
                        status === 'cancelled' ? 'red' :
                        status === 'shipped' ? 'blue' :
                        status === 'approved' ? 'cyan' : 'default'
                    } style={{ fontSize: 14 }}>
                        {statusConfig?.label || status?.toUpperCase() || 'PENDING'}
                    </Tag>
                );
            }
        }
    ];

    const filteredOrders = filterOrders(state.orders);

    // Prepare data for trend chart
    const trendData = filteredOrders.reduce((acc, order) => {
        const date = dayjs(order.order_date).format('YYYY-MM-DD');
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += Number(order.total_amount || 0);
        return acc;
    }, {});

    const chartData = Object.entries(trendData).map(([date, amount]) => ({
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
                formatter: (text) => `${getCurrencySymbol()}${text}`,
                style: {
                    fontSize: 14,
                },
            },
        },
        tooltip: {
            formatter: (datum) => {
                return {
                    name: 'Purchase Amount',
                    value: `${getCurrencySymbol()}${formatCurrency(datum.amount)}`,
                };
            },
        },
        height: 400,
    };

    return (
        <MainPage loading={state.loading}>
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
                        <Title level={3} style={{ margin: 0, color: '#1a237e', letterSpacing: 1 }}>Purchase Order Report</Title>
                        <Space>
                            <RangePicker
                                value={state.dateRange}
                                onChange={handleDateRangeChange}
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
                            title={<span style={{ color: '#1976d2', fontWeight: 500 }}>Total Orders</span>}
                            value={state.summary.totalOrders}
                            prefix={<ShoppingOutlined style={{ color: '#1976d2' }} />}
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
                            title={<span style={{ color: '#388e3c', fontWeight: 500 }}>Total Amount</span>}
                            value={state.summary.totalAmount}
                            precision={2}
                            prefix={<DollarOutlined style={{ color: '#388e3c' }} />}
                            valueStyle={{ color: '#388e3c' }}
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
                            value={state.summary.averageOrderValue}
                            precision={2}
                            prefix={<DollarOutlined style={{ color: '#fbc02d' }} />}
                            valueStyle={{ color: '#fbc02d' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)',
                            background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: '#d32f2f', fontWeight: 500 }}>Pending Orders</span>}
                            value={state.summary.pendingOrders}
                            prefix={<ShoppingOutlined style={{ color: '#d32f2f' }} />}
                            valueStyle={{ color: '#d32f2f' }}
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
                                <span style={{ fontWeight: 600, color: '#1a237e' }}>Purchase Trend</span>
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
                title={<span style={{ fontWeight: 600, color: '#1a237e' }}>Purchase Order Details</span>}
                style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)' }}
                bodyStyle={{ padding: 24 }}
            >
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Input.Search 
                            placeholder="Search orders..."
                            allowClear
                            style={{ width: 300 }}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Select
                            placeholder="Filter by supplier"
                            allowClear
                            style={{ width: 200 }}
                            onChange={handleSupplierChange}
                            options={config?.supplier || []}
                        />
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            style={{ width: 200 }}
                            onChange={handleStatusChange}
                            options={config?.purchase_status || []}
                        />
                    </Space>
                </div>
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

export default PurchaseOrderReportPage; 