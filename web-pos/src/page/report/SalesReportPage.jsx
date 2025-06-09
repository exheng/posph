import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    DatePicker,
    Select,
    Table,
    Statistic,
    Typography,
    Space,
    Button,
    Tag
} from 'antd';
import {
    DollarOutlined,
    ShoppingOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function SalesReportPage() {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
    const [salesData, setSalesData] = useState([]);
    const [summary, setSummary] = useState({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        salesGrowth: 0
    });
    const [chartData, setChartData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('daily');

    useEffect(() => {
        getSalesData();
    }, [dateRange, selectedPeriod]);

    const getSalesData = async () => {
        try {
            setLoading(true);
            const res = await request("order", "get");
            if (res && !res.error) {
                const filteredData = filterDataByDateRange(res.list || []);
                processSalesData(filteredData);
            }
        } catch (error) {
            console.error("Error fetching sales data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterDataByDateRange = (data) => {
        return data.filter(order => {
            const orderDate = dayjs(order.create_at);
            return orderDate.isAfter(dateRange[0]) && orderDate.isBefore(dateRange[1].add(1, 'day'));
        });
    };

    const processSalesData = (data) => {
        // Calculate summary statistics
        const totalSales = data.reduce((sum, order) => sum + Number(order.total_amount), 0);
        const totalOrders = data.length;
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Calculate sales growth
        const previousPeriodData = data.filter(order => 
            dayjs(order.create_at).isBefore(dateRange[0])
        );
        const previousPeriodSales = previousPeriodData.reduce((sum, order) => 
            sum + Number(order.total_amount), 0
        );
        const salesGrowth = previousPeriodSales > 0 
            ? ((totalSales - previousPeriodSales) / previousPeriodSales) * 100 
            : 0;

        setSummary({
            totalSales,
            totalOrders,
            averageOrderValue,
            salesGrowth
        });

        // Process data for charts
        const chartData = processChartData(data);
        setChartData(chartData);
    };

    const processChartData = (data) => {
        const groupedData = {};
        
        data.forEach(order => {
            const date = dayjs(order.create_at);
            let key;
            
            switch (selectedPeriod) {
                case 'daily':
                    key = date.format('YYYY-MM-DD');
                    break;
                case 'weekly':
                    key = date.format('YYYY-[W]WW');
                    break;
                case 'monthly':
                    key = date.format('YYYY-MM');
                    break;
                default:
                    key = date.format('YYYY-MM-DD');
            }

            if (!groupedData[key]) {
                groupedData[key] = {
                    date: key,
                    sales: 0,
                    orders: 0
                };
            }

            groupedData[key].sales += Number(order.total_amount);
            groupedData[key].orders += 1;
        });

        return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => dayjs(text).format('MMMM D, YYYY')
        },
        {
            title: 'Orders',
            dataIndex: 'orders',
            key: 'orders',
            sorter: (a, b) => a.orders - b.orders,
            render: (val) => <Tag color="blue" style={{ fontSize: 15 }}>{val}</Tag>
        },
        {
            title: 'Sales',
            dataIndex: 'sales',
            key: 'sales',
            render: (text) => <Text strong style={{ color: '#52c41a', fontSize: 16 }}>${Number(text).toFixed(2)}</Text>,
            sorter: (a, b) => a.sales - b.sales
        }
    ];

    const exportToCSV = () => {
        const headers = ['Date', 'Orders', 'Sales'];
        const csvData = chartData.map(item => [
            dayjs(item.date).format('YYYY-MM-DD'),
            item.orders,
            item.sales
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

    // Modern chart config for Column Chart (Vertical Bar)
    const colorPalette = [
        '#6EC6FF', '#A5D6A7', '#FFD54F', '#FF8A65', '#BA68C8',
        '#90CAF9', '#FFB74D', '#81C784', '#E57373', '#4DB6AC'
    ];
    const columnConfig = {
        data: chartData,
        xField: 'date',
        yField: 'sales',
        seriesField: 'date',
        legend: false,
        columnWidthRatio: 0.5,
        columnStyle: {
            radius: [12, 12, 0, 0],
            fillOpacity: 0.95,
            shadowColor: '#e3e3e3',
            shadowBlur: 6,
        },
        label: {
            position: 'top',
            style: {
                fill: '#333',
                fontWeight: 500,
                fontSize: 18
            },
        },
        xAxis: {
            label: {
                style: {
                    fontSize: 18,
                    fill: '#333',
                },
            },
        },
        yAxis: {
            label: {
                style: {
                    fontSize: 18,
                    fill: '#333',
                },
            },
            grid: {
                line: {
                    style: {
                        stroke: '#f0f0f0',
                        lineWidth: 1,
                        lineDash: [4, 4],
                    },
                },
            },
        },
        tooltip: {
            showMarkers: false,
            customContent: (title, items) => {
                if (!items || !items.length) return '';
                return `<div style=\"padding:8px 12px;\">
                    <div style=\"font-weight:600;font-size:18px;margin-bottom:4px;\">${title}</div>
                    <div style=\"font-size:17px;\">Sales: <b>$${Number(items[0].data.sales).toFixed(2)}</b></div>
                </div>`;
            }
        },
        interactions: [{ type: 'active-region' }],
        animation: {
            appear: {
                animation: 'scale-in-y',
                duration: 800,
            },
        },
        style: {
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)'
        },
        height: 480,
        color: ({ date }) => {
            // Assign a unique color to each bar based on its index
            const idx = chartData.findIndex(item => item.date === date);
            return colorPalette[idx % colorPalette.length];
        },
        padding: [40, 40, 60, 60],
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
                            <Select
                                value={selectedPeriod}
                                onChange={setSelectedPeriod}
                                style={{ width: 120, borderRadius: 8 }}
                                options={[
                                    { value: 'daily', label: 'Daily' },
                                    { value: 'weekly', label: 'Weekly' },
                                    { value: 'monthly', label: 'Monthly' }
                                ]}
                            />
                            <RangePicker
                                value={dateRange}
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
                            prefix={<DollarOutlined style={{ color: '#1976d2' }} />}
                            valueStyle={{ color: '#3f8600' }}
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
                            prefix={<ShoppingOutlined style={{ color: '#388e3c' }} />}
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
                            prefix={<DollarOutlined style={{ color: '#fbc02d' }} />}
                            valueStyle={{ color: '#1890ff' }}
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
                            title={<span style={{ color: '#d32f2f', fontWeight: 500 }}>Sales Growth</span>}
                            value={summary.salesGrowth}
                            precision={2}
                            valueStyle={{ 
                                color: summary.salesGrowth >= 0 ? '#3f8600' : '#cf1322'
                            }}
                            prefix={summary.salesGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card
                        title={<span style={{ fontWeight: 600, color: '#1a237e' }}>Sales Trend</span>}
                        style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)' }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Column {...columnConfig} />
                    </Card>
                </Col>
            </Row>

            <Card
                title={<span style={{ fontWeight: 600, color: '#1a237e' }}>Detailed Sales Data</span>}
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
                        showTotal: (total) => `Total ${total} records`
                    }}
                    bordered
                    style={{ borderRadius: 12, overflow: 'hidden' }}
                />
            </Card>
        </MainPage>
    );
}

export default SalesReportPage; 