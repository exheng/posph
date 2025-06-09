import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Typography,
    Space,
    Tag,
    Progress,
    List,
    Avatar,
    DatePicker,
    Select,
    Spin
} from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ShoppingOutlined,
    BarChartOutlined,
    TeamOutlined,
    RiseOutlined,
    FallOutlined
} from '@ant-design/icons';
import { Column, Line } from '@ant-design/plots';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function DashboardPage() {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
    const [timeRange, setTimeRange] = useState('week');
    const [dashboardData, setDashboardData] = useState({
        summary: {
            totalSales: 0,
            totalOrders: 0,
            totalCustomers: 0,
            totalProducts: 0,
            salesGrowth: 0,
            ordersGrowth: 0
        },
        recentOrders: [],
        topProducts: [],
        salesTrend: [],
        lowStock: [],
        dailySales: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange, timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch orders for summary and recent orders
            const ordersRes = await request("order", "get");
            if (ordersRes && !ordersRes.error) {
                const orders = ordersRes.list || [];
                
                // Calculate summary data - Fix total sales calculation
                const totalSales = orders.reduce((sum, order) => {
                    // Ensure we're using the correct field for total amount
                    const orderAmount = parseFloat(order.total_amount) || 0;
                    return sum + orderAmount;
                }, 0);
                
                const totalOrders = orders.length;
                
                // Calculate growth rates
                const previousPeriodOrders = orders.filter(order => 
                    dayjs(order.created_at).isBefore(dateRange[0])
                );
                const currentPeriodOrders = orders.filter(order => 
                    dayjs(order.created_at).isAfter(dateRange[0]) && 
                    dayjs(order.created_at).isBefore(dateRange[1])
                );

                const previousSales = previousPeriodOrders.reduce((sum, order) => {
                    const orderAmount = parseFloat(order.total_amount) || 0;
                    return sum + orderAmount;
                }, 0);
                
                const currentSales = currentPeriodOrders.reduce((sum, order) => {
                    const orderAmount = parseFloat(order.total_amount) || 0;
                    return sum + orderAmount;
                }, 0);
                
                const salesGrowth = previousSales ? ((currentSales - previousSales) / previousSales) * 100 : 0;
                const ordersGrowth = previousPeriodOrders.length ? 
                    ((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100 : 0;

                // Get recent orders
                const recentOrders = orders
                    .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
                    .slice(0, 5)
                    .map(order => ({
                        ...order,
                        key: order.id,
                        total_amount: parseFloat(order.total_amount) || 0 // Ensure amount is a number
                    }));

                // Prepare sales trend data
                const dailySales = prepareSalesTrendData(orders);

                setDashboardData(prev => ({
                    ...prev,
                    summary: {
                        ...prev.summary,
                        totalSales,
                        totalOrders,
                        salesGrowth,
                        ordersGrowth
                    },
                    recentOrders,
                    dailySales
                }));
            }

            // Fetch products for top products and low stock
            const productsRes = await request("product", "get");
            if (productsRes && !productsRes.error) {
                const products = productsRes.list || [];
                
                // Get low stock products (less than 10 items)
                const lowStock = products
                    .filter(product => product.qty < 10)
                    .slice(0, 5)
                    .map(product => ({
                        ...product,
                        key: product.id
                    }));

                // Get top products by quantity sold
                const topProducts = products
                    .sort((a, b) => b.qty - a.qty)
                    .slice(0, 5)
                    .map(product => ({
                        ...product,
                        key: product.id
                    }));

                setDashboardData(prev => ({
                    ...prev,
                    lowStock,
                    topProducts,
                    summary: {
                        ...prev.summary,
                        totalProducts: products.length
                    }
                }));
            }

            // Fetch customers for total count
            const customersRes = await request("customer", "get");
            if (customersRes && !customersRes.error) {
                setDashboardData(prev => ({
                    ...prev,
                    summary: {
                        ...prev.summary,
                        totalCustomers: customersRes.list?.length || 0
                    }
                }));
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const prepareSalesTrendData = (orders) => {
        const salesByDate = {};
        const startDate = dateRange[0];
        const endDate = dateRange[1];
        let currentDate = startDate;

        // Initialize all dates in range with 0 sales
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            salesByDate[currentDate.format('YYYY-MM-DD')] = 0;
            currentDate = currentDate.add(1, 'day');
        }

        // Fill in actual sales data
        orders.forEach(order => {
            const orderDate = dayjs(order.created_at).format('YYYY-MM-DD');
            if (salesByDate[orderDate] !== undefined) {
                const orderAmount = parseFloat(order.total_amount) || 0;
                salesByDate[orderDate] += orderAmount;
            }
        });

        // Convert to array format for chart
        return Object.entries(salesByDate).map(([date, amount]) => ({
            date,
            amount: parseFloat(amount.toFixed(2)) // Ensure amount is a number with 2 decimal places
        }));
    };

    const recentOrdersColumns = [
        {
            title: 'Order #',
            dataIndex: 'order_number',
            key: 'order_number',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Customer',
            dataIndex: 'customer_name',
            key: 'customer_name',
            render: (text) => <Text>{text || 'Walk-in Customer'}</Text>
        },
        {
            title: 'Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => (
                <Text strong style={{ color: '#52c41a' }}>
                    ${Number(amount).toFixed(2)}
                </Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'completed' ? 'success' : 'processing'}>
                    {status.toUpperCase()}
                </Tag>
            )
        }
    ];

    const lowStockColumns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <Avatar 
                        src={record.image ? `http://localhost:8081/pos_img/${record.image}` : null}
                        icon={<ShoppingOutlined />}
                    />
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Current Stock',
            dataIndex: 'qty',
            key: 'qty',
            render: (qty) => (
                <Progress 
                    percent={Math.min((qty / 10) * 100, 100)} 
                    size="small" 
                    status={qty < 5 ? 'exception' : 'normal'}
                    format={() => qty}
                />
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <Text strong style={{ color: '#1890ff' }}>
                    ${Number(price).toFixed(2)}
                </Text>
            )
        }
    ];

    const topProductsColumns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <Avatar 
                        src={record.image ? `http://localhost:8081/pos_img/${record.image}` : null}
                        icon={<ShoppingOutlined />}
                    />
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Stock',
            dataIndex: 'qty',
            key: 'qty',
            render: (qty) => (
                <Tag color={qty > 20 ? 'success' : qty > 10 ? 'warning' : 'error'}>
                    {qty} units
                </Tag>
            )
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <Text strong style={{ color: '#1890ff' }}>
                    ${Number(price).toFixed(2)}
                </Text>
            )
        }
    ];

    const salesTrendConfig = {
        data: dashboardData.dailySales,
        xField: 'date',
        yField: 'amount',
        smooth: true,
        animation: {
            appear: {
                animation: 'path-in',
                duration: 1000,
            },
        },
        point: {
            size: 5,
            shape: 'diamond',
            style: {
                fill: 'white',
                stroke: '#5B8FF9',
                lineWidth: 2,
            },
        },
        tooltip: {
            formatter: (datum) => {
                return { name: 'Sales', value: '$' + datum.amount.toFixed(2) };
            },
        },
    };

    return (
        <MainPage loading={loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>Dashboard</Title>
                        <Space>
                            <Select 
                                value={timeRange} 
                                onChange={setTimeRange}
                                style={{ width: 120 }}
                            >
                                <Option value="week">Last 7 Days</Option>
                                <Option value="month">Last 30 Days</Option>
                                <Option value="year">Last 12 Months</Option>
                            </Select>
                            <RangePicker 
                                value={dateRange}
                                onChange={setDateRange}
                            />
                        </Space>
                    </div>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Sales"
                            value={dashboardData.summary.totalSales}
                            precision={2}
                            prefix="$"
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type={dashboardData.summary.salesGrowth >= 0 ? 'success' : 'danger'}>
                                {dashboardData.summary.salesGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
                                {' '}{Math.abs(dashboardData.summary.salesGrowth).toFixed(1)}%
                            </Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>vs previous period</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={dashboardData.summary.totalOrders}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ShoppingCartOutlined />}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type={dashboardData.summary.ordersGrowth >= 0 ? 'success' : 'danger'}>
                                {dashboardData.summary.ordersGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
                                {' '}{Math.abs(dashboardData.summary.ordersGrowth).toFixed(1)}%
                            </Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>vs previous period</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Customers"
                            value={dashboardData.summary.totalCustomers}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Products"
                            value={dashboardData.summary.totalProducts}
                            valueStyle={{ color: '#fa8c16' }}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Sales Trend Chart */}
            <Card
                title={
                    <Space>
                        <BarChartOutlined />
                        <span>Sales Trend</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Line {...salesTrendConfig} />
            </Card>

            {/* Main Content */}
            <Row gutter={[16, 16]}>
                {/* Recent Orders */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <ShoppingCartOutlined />
                                <span>Recent Orders</span>
                            </Space>
                        }
                    >
                        <Table
                            columns={recentOrdersColumns}
                            dataSource={dashboardData.recentOrders}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                {/* Low Stock Alert */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <BarChartOutlined />
                                <span>Low Stock Alert</span>
                            </Space>
                        }
                    >
                        <Table
                            columns={lowStockColumns}
                            dataSource={dashboardData.lowStock}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Top Products */}
            <Card
                title={
                    <Space>
                        <ShoppingOutlined />
                        <span>Top Products</span>
                    </Space>
                }
                style={{ marginTop: 16 }}
            >
                <Table
                    columns={topProductsColumns}
                    dataSource={dashboardData.topProducts}
                    pagination={false}
                    size="small"
                />
            </Card>
        </MainPage>
    );
}

export default DashboardPage; 