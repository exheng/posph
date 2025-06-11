import React, { useEffect, useState } from 'react';
import {
    Card,
    Table,
    Space,
    DatePicker,
    Row,
    Col,
    Typography,
    Statistic,
    Tag,
    message
} from 'antd';
import {
    DollarOutlined,
    RiseOutlined,
    FallOutlined,
    LineChartOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { configStore } from '../../store/configStore';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function PerformanceReportPage() {
    const { config } = configStore();
    const [state, setState] = useState({
        sales: [],
        purchases: [],
        loading: false,
        dateRange: [dayjs().subtract(30, 'days'), dayjs()],
        summary: {
            totalSales: 0,
            totalPurchases: 0,
            totalProfit: 0,
            profitMargin: 0,
            averageDailyProfit: 0
        }
    });

    useEffect(() => {
        getData();
    }, [state.dateRange]);

    const getData = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            
            // Fetch sales data
            const salesRes = await request("order", "get");
            const salesList = Array.isArray(salesRes?.list) ? salesRes.list : [];
            
            // Fetch purchase data
            const purchasesRes = await request("purchase", "get");
            const purchasesList = Array.isArray(purchasesRes?.list) ? purchasesRes.list : [];

            // Filter data by date range using 'created_at'
            const filteredSales = salesList.filter(order => {
                const orderDate = dayjs(order.created_at);
                return orderDate.isAfter(state.dateRange[0]) && orderDate.isBefore(state.dateRange[1]);
            });

            const filteredPurchases = purchasesList.filter(order => {
                const orderDate = dayjs(order.created_at);
                return orderDate.isAfter(state.dateRange[0]) && orderDate.isBefore(state.dateRange[1]);
            });

            setState(prev => ({
                ...prev,
                sales: filteredSales,
                purchases: filteredPurchases,
                loading: false
            }));

            calculateSummary(filteredSales, filteredPurchases);
        } catch (error) {
            console.error("Error fetching data:", error);
            message.error("Failed to fetch data");
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const calculateSummary = (sales, purchases) => {
        const totalSales = sales.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        const totalPurchases = purchases.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        const totalProfit = totalSales - totalPurchases;
        const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

        // Calculate average daily profit
        const days = state.dateRange[1].diff(state.dateRange[0], 'day') + 1;
        const averageDailyProfit = totalProfit / days;

        setState(prev => ({
            ...prev,
            summary: {
                totalSales,
                totalPurchases,
                totalProfit,
                profitMargin,
                averageDailyProfit
            }
        }));
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
            default: return '$';
        }
    };

    const formatCurrency = (amount) => {
        if (isNaN(amount)) return '0.00';
        const rate = Number(config.store?.exchange_rate_to_usd || 1.0000);
        const convertedAmount = amount / rate;
        return convertedAmount.toFixed(2);
    };

    // Prepare data for trend chart
    const prepareChartData = () => {
        const dateMap = new Map();

        // Initialize dates in range
        let currentDate = state.dateRange[0];
        while (currentDate.isBefore(state.dateRange[1]) || currentDate.isSame(state.dateRange[1], 'day')) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            dateMap.set(dateStr, { date: dateStr, sales: 0, purchases: 0, profit: 0 });
            currentDate = currentDate.add(1, 'day');
        }

        // Add sales data
        state.sales.forEach(order => {
            const dateStr = dayjs(order.created_at).format('YYYY-MM-DD');
            const existing = dateMap.get(dateStr) || { date: dateStr, sales: 0, purchases: 0, profit: 0 };
            existing.sales += Number(order.total_amount || 0);
            dateMap.set(dateStr, existing);
        });

        // Add purchase data
        state.purchases.forEach(order => {
            const dateStr = dayjs(order.created_at).format('YYYY-MM-DD');
            const existing = dateMap.get(dateStr) || { date: dateStr, sales: 0, purchases: 0, profit: 0 };
            existing.purchases += Number(order.total_amount || 0);
            dateMap.set(dateStr, existing);
        });

        // Calculate profit for each day
        dateMap.forEach((value, key) => {
            value.profit = value.sales - value.purchases;
        });

        return Array.from(dateMap.values());
    };

    const chartData = prepareChartData();

    const lineConfig = {
        data: chartData,
        xField: 'date',
        yField: 'profit',
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
                    name: 'Daily Profit',
                    value: `${getCurrencySymbol()}${formatCurrency(datum.profit)}`,
                };
            },
        },
        height: 400,
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => <Text>{dayjs(text).format('MMM D, YYYY')}</Text>,
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
        },
        {
            title: 'Sales',
            dataIndex: 'sales',
            key: 'sales',
            render: (amount) => (
                <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                    {getCurrencySymbol()}{formatCurrency(amount)}
                </Text>
            ),
            sorter: (a, b) => a.sales - b.sales
        },
        {
            title: 'Purchases',
            dataIndex: 'purchases',
            key: 'purchases',
            render: (amount) => (
                <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                    {getCurrencySymbol()}{formatCurrency(amount)}
                </Text>
            ),
            sorter: (a, b) => a.purchases - b.purchases
        },
        {
            title: 'Profit',
            dataIndex: 'profit',
            key: 'profit',
            render: (amount) => {
                const color = amount >= 0 ? '#52c41a' : '#f5222d';
                return (
                    <Text strong style={{ color, fontSize: 16 }}>
                        {getCurrencySymbol()}{formatCurrency(amount)}
                    </Text>
                );
            },
            sorter: (a, b) => a.profit - b.profit
        }
    ];

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
                        <Title level={3} style={{ margin: 0, color: '#1a237e', letterSpacing: 1 }}>Performance Report</Title>
                        <RangePicker
                            value={state.dateRange}
                            onChange={(dates) => setState(prev => ({ ...prev, dateRange: dates }))}
                            style={{ width: 300, borderRadius: 8 }}
                        />
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
                            value={state.summary.totalSales}
                            precision={2}
                            prefix={<ShoppingCartOutlined style={{ color: '#1976d2' }} />}
                            valueStyle={{ color: '#1976d2' }}
                            formatter={(value) => `${getCurrencySymbol()}${formatCurrency(value)}`}
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
                            title={<span style={{ color: '#d32f2f', fontWeight: 500 }}>Total Purchases</span>}
                            value={state.summary.totalPurchases}
                            precision={2}
                            prefix={<ShoppingOutlined style={{ color: '#d32f2f' }} />}
                            valueStyle={{ color: '#d32f2f' }}
                            formatter={(value) => `${getCurrencySymbol()}${formatCurrency(value)}`}
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
                            title={<span style={{ color: '#388e3c', fontWeight: 500 }}>Total Profit</span>}
                            value={state.summary.totalProfit}
                            precision={2}
                            prefix={<DollarOutlined style={{ color: '#388e3c' }} />}
                            valueStyle={{ color: '#388e3c' }}
                            formatter={(value) => `${getCurrencySymbol()}${formatCurrency(value)}`}
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
                            title={<span style={{ color: '#fbc02d', fontWeight: 500 }}>Profit Margin</span>}
                            value={state.summary.profitMargin}
                            precision={2}
                            prefix={state.summary.profitMargin >= 0 ? <RiseOutlined style={{ color: '#fbc02d' }} /> : <FallOutlined style={{ color: '#fbc02d' }} />}
                            valueStyle={{ color: '#fbc02d' }}
                            suffix="%"
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
                                <span style={{ fontWeight: 600, color: '#1a237e' }}>Profit Trend</span>
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
                title={<span style={{ fontWeight: 600, color: '#1a237e' }}>Daily Performance</span>}
                style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)' }}
                bodyStyle={{ padding: 24 }}
            >
                <Table 
                    columns={columns} 
                    dataSource={chartData}
                    rowKey="date"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} days`
                    }}
                    bordered
                    style={{ borderRadius: 12, overflow: 'hidden' }}
                />
            </Card>
        </MainPage>
    );
}

export default PerformanceReportPage; 