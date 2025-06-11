import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Card,
    Button,
    Typography,
    Space,
    Divider,
    Tag,
    message,
    Modal,
    Row,
    Col,
    Table,
    Image
} from 'antd';
import { 
    MdPrint, 
    MdArrowBack,
    MdStore,
    MdPhone,
    MdEmail,
    MdLocationOn,
    MdVisibility
} from "react-icons/md";
import { request, getStoreLogoUrl } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { useReactToPrint } from 'react-to-print';
import { configStore } from '../../store/configStore';

const { Title, Text } = Typography;

function ReceiptPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const receiptRef = useRef();
    const { config } = configStore();

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
            default: return '$'; // Default to USD symbol
        }
    };

    // Helper function to format currency for display
    const formatCurrency = (amount) => {
        if (isNaN(amount)) return '0.00';
        return Number(amount).toFixed(2);
    };

    useEffect(() => {
        if (!location.state?.orderNumber) {
            message.error('No order data found');
            navigate('/pos');
            return;
        }
        getOrderDetails();
    }, [location.state]);

    const getOrderDetails = async () => {
        try {
            setLoading(true);
            // Assuming the backend 'order/get' now returns currency and exchange_rate_to_usd
            const res = await request("order", "get");
            if (res && !res.error) {
                const order = res.list.find(o => o.order_number === location.state.orderNumber);
                if (order) {
                    setOrderData(order);
                } else {
                    message.error('Order not found');
                    navigate('/pos');
                }
            } else if (res?.error) {
                message.error(res.error);
                navigate('/pos');
            }
        } catch (error) {
            message.error("Failed to fetch order details");
            navigate('/pos');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => receiptRef.current,
        documentTitle: `Receipt-${orderData?.order_number || ''}`,
        pageStyle: `
            @page { 
                size: 58mm auto; 
                margin: 2mm;
            }
            @media print {
                body { 
                    margin: 0 !important;
                    padding: 0 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                .receipt-content {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
            }
        `,
        onBeforeGetContent: () => {
            return new Promise((resolve) => {
                message.loading('Preparing receipt for printing...', 1);
                setTimeout(() => {
                    resolve();
                }, 500);
            });
        },
        onAfterPrint: () => {
            message.success('Receipt sent to printer!');
        },
        onPrintError: (errorLocation, error) => {
            console.error('Print error:', error);
            message.error('Failed to print receipt. Please try again.');
        },
        removeAfterPrint: true,
    });

    const handleBack = () => {
        navigate('/pos');
    };

    const handleDirectPrint = () => {
        if (!orderData) {
            message.error('No order data to print');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt-${orderData.order_number}</title>
                <style>
                    @page { 
                        size: 58mm auto; 
                        margin: 2mm;
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 11px;
                        line-height: 1.4;
                        margin: 0;
                        padding: 16px;
                        width: 58mm;
                        background: white;
                        color: black;
                    }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .divider { 
                        border-top: 1px solid #000; 
                        margin: 8px 0; 
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        font-size: 11px; 
                    }
                    th, td { 
                        padding: 2px; 
                        text-align: left; 
                    }
                    th { font-weight: bold; }
                    .right { text-align: right; }
                    .small { font-size: 9px; color: #666; }
                    .store-logo { 
                        max-width: 100px; 
                        max-height: 100px; 
                        margin: 0 auto; 
                        display: block; 
                    }
                    .contact-info { margin-top: 8px; font-size: 11px; }
                </style>
            </head>
            <body>
                <div class="center">
                    ${config.store?.logo ? 
                        `<img src="/uploads/${config.store.logo}" class="store-logo" alt="Store Logo" />` :
                        `<div class="store-icon">🏪</div>`
                    }
                    <div class="bold" style="font-size: 18px;">${config.store?.name || 'POS PH'}</div>
                    <div style="color: #666; font-size: 11px;">Your Trusted Store</div>
                </div>
                <div class="divider"></div>
                <div>
                    <strong>Receipt No:</strong> ${orderData.order_number}<br />
                    <strong>Date:</strong> ${new Date(orderData.created_at).toLocaleString()}<br />
                    <strong>Customer:</strong> ${orderData.customer_name || 'Walk-in Customer'}
                </div>
                <div class="divider"></div>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderData.items?.map(item => `
                            <tr>
                                <td>
                                    ${item.product_name}
                                    <div class="small">${item.barcode}</div>
                                </td>
                                <td class="center">${item.quantity}</td>
                                <td class="right">${getCurrencySymbol(orderData.currency)}${formatCurrency(Number(item.price))}</td>
                                <td class="right">
                                    ${getCurrencySymbol(orderData.currency)}${formatCurrency((Number(item.price) * Number(item.quantity) - Number(item.discount || 0)))} 
                                </td>
                            </tr>
                        `).join('') || ''}
                    </tbody>
                </table>
                <div class="divider"></div>
                <div>
                    <div>Subtotal: ${getCurrencySymbol(orderData.currency)}${formatCurrency(Number(orderData.total_amount))}</div>
                    <div>Payment: ${orderData.payment_method?.toUpperCase()}</div>
                    <div>Amount Paid: ${getCurrencySymbol(orderData.currency)}${formatCurrency(Number(orderData.payment_amount))}</div>
                    <div>Change: ${getCurrencySymbol(orderData.currency)}${formatCurrency(Number(orderData.change_amount || 0))}</div>
                </div>
                <div class="divider"></div>
                <div class="center contact-info">
                    Thank you for your purchase!<br />
                    Please come again.<br />
                    <div style="margin-top: 8px;">
                        ${config.store?.phone ? `📞 ${config.store.phone}<br />` : ''}
                        ${config.store?.email ? `✉️ ${config.store.email}<br />` : ''}
                        ${config.store?.address ? `📍 ${config.store.address}` : ''}
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
                message.success('Receipt printed successfully!');
            }, 500);
        };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const ReceiptContent = () => (
        <div
            ref={receiptRef}
            className="receipt-content"
            style={{
                width: '58mm',
                background: 'white',
                padding: '16px',
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                lineHeight: '1.4',
                color: 'black',
                border: '1px solid #ddd',
            }}
        >
            {orderData ? (
                <>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        {config.store?.logo ? (
                            <Image
                                src={`http://localhost:8081/pos_img/${config.store.logo}`}
                                alt="Store Logo"
                                style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px' }}
                                preview={false}
                            />
                        ) : (
                            <div style={{
                                width: '100px',
                                height: '100px',
                                background: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px'
                            }}>
                                <MdStore style={{ fontSize: '48px', color: '#666' }} />
                            </div>
                        )}
                        <div style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '8px' }}>
                            {config.store?.name || 'POS PH'}
                        </div>
                        <div style={{ color: '#666', fontSize: '11px' }}>
                            Your Trusted Store
                        </div>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <div style={{ marginBottom: '12px' }}>
                        <Text strong>Receipt No:</Text> {orderData.order_number}<br />
                        <Text strong>Date:</Text> {formatDate(orderData.created_at)}<br />
                        <Text strong>Customer:</Text> {orderData.customer_name || 'Walk-in Customer'}
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <Table
                        dataSource={orderData.items}
                        pagination={false}
                        columns={[
                            {
                                title: 'Item',
                                dataIndex: 'product_name',
                                key: 'product_name',
                                render: (text, record) => (
                                    <Space direction="vertical" size={0}>
                                        <Text strong>{text}</Text>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>{record.barcode}</Text>
                                    </Space>
                                )
                            },
                            {
                                title: 'Qty',
                                dataIndex: 'quantity',
                                key: 'quantity',
                                align: 'center',
                                width: 50,
                            },
                            {
                                title: 'Price',
                                dataIndex: 'price',
                                key: 'price',
                                align: 'right',
                                render: (price) => `${getCurrencySymbol(orderData.currency)}${formatCurrency(Number(price))}`,
                                width: 80,
                            },
                            {
                                title: 'Total',
                                key: 'total',
                                align: 'right',
                                render: (_, record) => `${getCurrencySymbol(orderData.currency)}${formatCurrency((Number(record.price) * Number(record.quantity) - Number(record.discount || 0)))}`,
                                width: 90,
                            },
                        ]}
                        size="small"
                        rowKey="product_id"
                        summary={() => (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3} align="right">
                                    <Text strong>Subtotal:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="right">
                                    <Text strong>
                                        {getCurrencySymbol(orderData.currency)}{formatCurrency(Number(orderData.total_amount))}
                                    </Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}
                        style={{ marginBottom: '16px' }}
                    />

                    <Divider style={{ margin: '16px 0' }} />

                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Payment Method:</Text>
                            <Text strong>{orderData.payment_method?.toUpperCase()}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Amount Paid:</Text>
                            <Text strong>
                                {getCurrencySymbol(orderData.currency)}{formatCurrency(Number(orderData.payment_amount))}
                            </Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Change:</Text>
                            <Text strong>
                                {getCurrencySymbol(orderData.currency)}{formatCurrency(Number(orderData.change_amount || 0))}
                            </Text>
                        </div>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#666' }}>
                        <Text>Thank you for your purchase!</Text><br />
                        <Text>Please come again.</Text><br />
                        <div style={{ marginTop: '8px' }}>
                            {config.store?.phone && (
                                <Space size={4} style={{ marginBottom: '4px' }}>
                                    <MdPhone /> <Text>{config.store.phone}</Text>
                                </Space>
                            )}
                            {config.store?.email && (
                                <Space size={4} style={{ marginBottom: '4px' }}>
                                    <MdEmail /> <Text>{config.store.email}</Text>
                                </Space>
                            )}
                            {config.store?.address && (
                                <Space size={4}>
                                    <MdLocationOn /> <Text>{config.store.address}</Text>
                                </Space>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Text type="secondary">Loading receipt data...</Text>
                </div>
            )}
        </div>
    );
    return (
        <MainPage loading={loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                            <Button
                                icon={<MdArrowBack />}
                                onClick={handleBack}
                                style={{
                                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                Back to POS
                            </Button>
                            <Title level={4} style={{ margin: 0 }}>Order Receipt</Title>
                        </Space>
                    </div>
                </Space>
            </div>

            <Row gutter={[24, 24]} justify="center">
                <Col xs={24} md={16} lg={12}>
                    <Card
                        actions={[
                            <Button
                                type="text"
                                key="print"
                                icon={<MdPrint />}
                                onClick={handleDirectPrint}
                                style={{ width: '100%' }}
                            >
                                Print Receipt (POS Printer)
                            </Button>,
                            <Button
                                type="text"
                                key="preview"
                                icon={<MdVisibility />}
                                onClick={() => setPreviewVisible(true)}
                                style={{ width: '100%' }}
                            >
                                Preview & Print (A4)
                            </Button>
                        ]}
                    >
                        <div style={{ textAlign: 'center', padding: '24px' }}>
                            <Title level={2} style={{ color: '#52c41a' }}>Payment Successful!</Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>Your order has been processed.</Text>
                            <Divider />
                            {orderData ? (
                                <>
                                    <Title level={4} style={{ margin: '0 0 16px 0' }}>Order #{orderData.order_number}</Title>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Text type="secondary" style={{ display: 'block' }}>Total Amount</Text>
                                            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                                                {getCurrencySymbol(orderData.currency)}{formatCurrency(Number(orderData.total_amount))}
                                            </Title>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <Text type="secondary" style={{ display: 'block' }}>Amount Paid</Text>
                                            <Title level={3} style={{ margin: 0 }}>
                                                {getCurrencySymbol(orderData.currency)}{formatCurrency(Number(orderData.payment_amount))}
                                            </Title>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <Text type="secondary" style={{ display: 'block' }}>Change</Text>
                                            <Title level={3} style={{ margin: 0, color: '#f5222d' }}>
                                                {getCurrencySymbol(orderData.currency)}{formatCurrency(Number(orderData.change_amount || 0))}
                                            </Title>
                                        </div>
                                    </div>
                                    <Divider />
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={handleBack}
                                        style={{ marginTop: '24px' }}
                                    >
                                        New Sale
                                    </Button>
                                </>
                            ) : (
                                <Text>No order data available.</Text>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Receipt Preview"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                width={700}
                footer={[
                    <Button key="back" onClick={() => setPreviewVisible(false)}>
                        Close
                    </Button>,
                    <Button key="print" type="primary" onClick={handlePrint}>
                        Print
                    </Button>,
                ]}
            >
                <ReceiptContent />
            </Modal>
        </MainPage>
    );
}

export default ReceiptPage;
                                