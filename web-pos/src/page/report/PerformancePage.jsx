import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Space,
    Table,
    Tag
} from 'antd';
import {
    TrophyOutlined,
    UserOutlined,
    CalendarOutlined,
    RiseOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function PerformancePage() {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [summary, setSummary] = useState({
        bestProduct: null,
        topCustomer: null,
        bestDay: null,
        totalProfit: 0
    });
    const [trendData, setTrendData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);

    useEffect(() => {
        getPerformanceData();
    }, []);

    const getPerformanceData = async () => {
        setLoading(true);
        const orderRes = await request('order', 'get');
        const productRes = await request('product', 'get');
        if (orderRes && !orderRes.error && productRes && !productRes.error) {
            setOrders(orderRes.list || []);
            setProducts(productRes.list || []);
            processPerformance(orderRes.list || [], productRes.list || []);
        }
        setLoading(false);
    };

    const processPerformance = (orders, products) => {
        // Best-selling product
        const productSales = {};
        orders.forEach(order => {
            (order.items || []).forEach(item => {
                if (!productSales[item.product_id]) productSales[item.product_id] = 0;
                productSales[item.product_id] += Number(item.quantity);
            });
        });
        const bestProductId = Object.keys(productSales).sort((a, b) => productSales[b] - productSales[a])[0];
        const bestProduct = products.find(p => p.id == bestProductId);

        // Top customer
        const customerSales = {};
        orders.forEach(order => {
            if (!customerSales[order.customer_id]) customerSales[order.customer_id] = 0;
            customerSales[order.customer_id] += Number(order.total_amount);
        });
        const topCustomerId = Object.keys(customerSales).sort((a, b) => customerSales[b] - customerSales[a])[0];
        const topCustomer = orders.find(o => o.customer_id == topCustomerId)?.customer_name;

        // Best sales day
        const daySales = {};
        orders.forEach(order => {
            const day = dayjs(order.create_at).format('YYYY-MM-DD');
            if (!daySales[day]) daySales[day] = 0;
            daySales[day] += Number(order.total_amount);
        });
        const bestDay = Object.keys(daySales).sort((a, b) => daySales[b] - daySales[a])[0];

        // Total profit (assuming profit = total sales - total cost, here just use total sales)
        const totalProfit = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

        // Trend data (sales over time)
        const trend = Object.keys(daySales).map(day => ({ date: day, sales: daySales[day] }));
        trend.sort((a, b) => a.date.localeCompare(b.date));

        // Top 5 products
        const topProductsArr = Object.keys(productSales)
            .map(pid => ({
                name: products.find(p => p.id == pid)?.name || 'Unknown',
                sales: productSales[pid]
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        // Top 5 customers
        const topCustomersArr = Object.keys(customerSales)
            .map(cid => ({
                name: orders.find(o => o.customer_id == cid)?.customer_name || 'Unknown',
                sales: customerSales[cid]
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        setSummary({
            bestProduct: bestProduct?.name || 'N/A',
            topCustomer: topCustomer || 'N/A',
            bestDay: bestDay || 'N/A',
            totalProfit
        });
        setTrendData(trend);
        setTopProducts(topProductsArr);
        setTopCustomers(topCustomersArr);
    };

    // Chart config
    const colorPalette = [
        '#6EC6FF', '#A5D6A7', '#FFD54F', '#FF8A65', '#BA68C8',
        '#90CAF9', '#FFB74D', '#81C784', '#E57373', '#4DB6AC'
    ];
    const lineConfig = {
        data: trendData,
        xField: 'date',
        yField: 'sales',
        smooth: true,
        lineStyle: {
            stroke: '#1976d2',
            lineWidth: 4,
            shadowColor: '#e3e3e3',
            shadowBlur: 6,
        },
        point: {
            size: 6,
            shape: 'circle',
            style: {
                fill: '#fff',
                stroke: '#1976d2',
                lineWidth: 2
            }
        },
        label: {
            style: {
                fill: '#333',
                fontWeight: 500,
                fontSize: 16
            },
        },
        xAxis: {
            label: {
                style: {
                    fontSize: 16,
                    fill: '#333',
                },
            },
        },
        yAxis: {
            label: {
                style: {
                    fontSize: 16,
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
            showMarkers: true,
            customContent: (title, items) => {
                if (!items || !items.length) return '';
                return `<div style=\"padding:8px 12px;\">
                    <div style=\"font-weight:600;font-size:18px;margin-bottom:4px;\">${title}</div>
                    <div style=\"font-size:17px;\">Sales: <b>$${Number(items[0].data.sales).toFixed(2)}</b></div>
                </div>`;
            }
        },
        animation: {
            appear: {
                animation: 'path-in',
                duration: 800,
            },
        },
        style: {
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)'
        },
        height: 400,
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
                        <Title level={3} style={{ margin: 0, color: '#1a237e', letterSpacing: 1 }}>Performance Overview</Title>
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
                            title={<span style={{ color: '#1976d2', fontWeight: 500 }}>Best-Selling Product</span>}
                            value={summary.bestProduct}
                            prefix={<TrophyOutlined style={{ color: '#1976d2' }} />}
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
                            title={<span style={{ color: '#388e3c', fontWeight: 500 }}>Top Customer</span>}
                            value={summary.topCustomer}
                            prefix={<UserOutlined style={{ color: '#388e3c' }} />}
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
                            title={<span style={{ color: '#fbc02d', fontWeight: 500 }}>Highest Sales Day</span>}
                            value={summary.bestDay}
                            prefix={<CalendarOutlined style={{ color: '#fbc02d' }} />}
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
                            title={<span style={{ color: '#d32f2f', fontWeight: 500 }}>Total Sales</span>}
                            value={summary.totalProfit}
                            precision={2}
                            prefix={<RiseOutlined style={{ color: '#d32f2f' }} />}
                            valueStyle={{ color: '#3f8600' }}
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
                        <Line {...lineConfig} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card
                        title={<span style={{ fontWeight: 600, color: '#1976d2' }}>Top 5 Products</span>}
                        style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)' }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Table
                            columns={[
                                { title: 'Product', dataIndex: 'name', key: 'name', render: (text) => <Text strong style={{ fontSize: 16 }}>{text}</Text> },
                                { title: 'Units Sold', dataIndex: 'sales', key: 'sales', render: (val) => <Tag color="blue" style={{ fontSize: 15 }}>{val}</Tag> }
                            ]}
                            dataSource={topProducts}
                            rowKey="name"
                            pagination={false}
                            bordered
                            style={{ borderRadius: 12, overflow: 'hidden' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        title={<span style={{ fontWeight: 600, color: '#388e3c' }}>Top 5 Customers</span>}
                        style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)' }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Table
                            columns={[
                                { title: 'Customer', dataIndex: 'name', key: 'name', render: (text) => <Text strong style={{ fontSize: 16 }}>{text}</Text> },
                                { title: 'Total Spent', dataIndex: 'sales', key: 'sales', render: (val) => <Tag color="green" style={{ fontSize: 15 }}>${Number(val).toFixed(2)}</Tag> }
                            ]}
                            dataSource={topCustomers}
                            rowKey="name"
                            pagination={false}
                            bordered
                            style={{ borderRadius: 12, overflow: 'hidden' }}
                        />
                    </Card>
                </Col>
            </Row>
        </MainPage>
    );
}

export default PerformancePage; 