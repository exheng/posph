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
    Tag
} from 'antd';
import {
    AppstoreOutlined,
    TagsOutlined,
    WarningOutlined,
    StopOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import { Bar, Column } from '@ant-design/plots';
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';

const { Title, Text } = Typography;

function InventoryReportPage() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [summary, setSummary] = useState({
        totalProducts: 0,
        totalStock: 0,
        lowStock: 0,
        outOfStock: 0
    });

    useEffect(() => {
        getProducts();
        getConfig();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, selectedBrand]);

    const getProducts = async () => {
        setLoading(true);
        const res = await request('product', 'get');
        if (res && !res.error) {
            setProducts(res.list || []);
        }
        setLoading(false);
    };

    const getConfig = async () => {
        const res = await request('config', 'get');
        if (res && !res.error) {
            setCategoryOptions(res.category || []);
            setBrandOptions(res.brand?.map(b => ({ label: b.label, value: b.value })) || []);
        }
    };

    const filterProducts = () => {
        let filtered = products;
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category_id === selectedCategory);
        }
        if (selectedBrand) {
            filtered = filtered.filter(p => p.brand === selectedBrand);
        }
        setFilteredProducts(filtered);
        updateSummary(filtered);
    };

    const updateSummary = (data) => {
        const totalProducts = data.length;
        const totalStock = data.reduce((sum, p) => sum + Number(p.qty || 0), 0);
        const lowStock = data.filter(p => Number(p.qty || 0) > 0 && Number(p.qty || 0) <= 10).length;
        const outOfStock = data.filter(p => Number(p.qty || 0) === 0).length;
        setSummary({ totalProducts, totalStock, lowStock, outOfStock });
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Category', 'Brand', 'Stock', 'Status'];
        const csvData = filteredProducts.map(item => [
            item.name,
            item.category_name,
            item.brand,
            item.qty,
            item.status === 1 ? 'Active' : 'Inactive'
        ]);
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_report.csv`;
        link.click();
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong style={{ fontSize: 16 }}>{text}</Text>
        },
        {
            title: 'Category',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (text) => <Tag color="blue" style={{ fontSize: 14 }}>{text}</Tag>
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            render: (text) => <Tag color="purple" style={{ fontSize: 14 }}>{text}</Tag>
        },
        {
            title: 'Stock',
            dataIndex: 'qty',
            key: 'qty',
            render: (qty) => <Text strong style={{ color: qty === 0 ? '#cf1322' : qty <= 10 ? '#faad14' : '#52c41a', fontSize: 16 }}>{qty}</Text>,
            sorter: (a, b) => a.qty - b.qty
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Tag color={status === 1 ? 'green' : 'red'} style={{ fontSize: 14, borderRadius: 8, padding: '2px 12px' }}>
                    {status === 1 ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
    ];

    // Chart data: Top 10 products by stock
    const chartData = [...filteredProducts]
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 10)
        .map(p => ({ name: p.name, stock: Number(p.qty) }));

    // Modern chart config for Column Chart (Vertical Bar)
    const colorPalette = [
        '#6EC6FF', '#A5D6A7', '#FFD54F', '#FF8A65', '#BA68C8',
        '#90CAF9', '#FFB74D', '#81C784', '#E57373', '#4DB6AC'
    ];
    const columnConfig = {
        data: chartData,
        xField: 'name',
        yField: 'stock',
        seriesField: 'name',
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
                    <div style=\"font-size:17px;\">Stock: <b>${items[0].data.stock}</b></div>
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
        color: ({ name }) => {
            // Assign a unique color to each bar based on its index
            const idx = chartData.findIndex(item => item.name === name);
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
                        <Title level={3} style={{ margin: 0, color: '#1a237e', letterSpacing: 1 }}>Inventory Report</Title>
                        <Space>
                            <Select
                                placeholder="Category"
                                allowClear
                                style={{ width: 180, borderRadius: 8 }}
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                            />
                            <Select
                                placeholder="Brand"
                                allowClear
                                style={{ width: 180, borderRadius: 8 }}
                                options={brandOptions}
                                value={selectedBrand}
                                onChange={setSelectedBrand}
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
                            title={<span style={{ color: '#1976d2', fontWeight: 500 }}>Total Products</span>}
                            value={summary.totalProducts}
                            prefix={<AppstoreOutlined style={{ color: '#1976d2' }} />}
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
                            title={<span style={{ color: '#388e3c', fontWeight: 500 }}>Total Stock</span>}
                            value={summary.totalStock}
                            prefix={<TagsOutlined style={{ color: '#388e3c' }} />}
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
                            title={<span style={{ color: '#fbc02d', fontWeight: 500 }}>Low Stock (≤10)</span>}
                            value={summary.lowStock}
                            valueStyle={{ color: '#fbc02d' }}
                            prefix={<WarningOutlined style={{ color: '#fbc02d' }} />}
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
                            title={<span style={{ color: '#d32f2f', fontWeight: 500 }}>Out of Stock</span>}
                            value={summary.outOfStock}
                            valueStyle={{ color: '#d32f2f' }}
                            prefix={<StopOutlined style={{ color: '#d32f2f' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card
                        title={<span style={{ fontWeight: 600, color: '#1a237e' }}>Top 10 Products by Stock</span>}
                        style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)' }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <Column {...columnConfig} />
                    </Card>
                </Col>
            </Row>

            <Card
                title={<span style={{ fontWeight: 600, color: '#1a237e' }}>Inventory Details</span>}
                style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(24, 144, 255, 0.08)' }}
                bodyStyle={{ padding: 24 }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredProducts}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} products`
                    }}
                    bordered
                    style={{ borderRadius: 12, overflow: 'hidden' }}
                />
            </Card>
        </MainPage>
    );
}

export default InventoryReportPage; 