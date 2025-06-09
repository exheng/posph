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
    Table
} from 'antd';
import { 
    MdPrint, 
    MdArrowBack,
    MdStore,
    MdPhone,
    MdEmail,
    MdLocationOn,
    MdVisibility,
    MdDateRange
} from "react-icons/md";
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import { useReactToPrint } from 'react-to-print';

const { Title, Text } = Typography;

function ReceiptPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const receiptRef = useRef();

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

    // Alternative print function using window.print()
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
                    .store-icon { font-size: 28px; }
                    .contact-info { margin-top: 8px; font-size: 11px; }
                </style>
            </head>
            <body>
                <div class="center">
                    <div class="store-icon">🏪</div>
                    <div class="bold" style="font-size: 18px;">POS PH</div>
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
                                <td class="right">$${Number(item.price).toFixed(2)}</td>
                                <td class="right">
                                    $${(Number(item.price) * Number(item.quantity) - Number(item.discount || 0)).toFixed(2)}
                                </td>
                            </tr>
                        `).join('') || ''}
                    </tbody>
                </table>
                <div class="divider"></div>
                <div>
                    <div>Subtotal: $${Number(orderData.total_amount).toFixed(2)}</div>
                    <div>Payment: ${orderData.payment_method?.toUpperCase()}</div>
                    <div>Amount Paid: $${Number(orderData.payment_amount).toFixed(2)}</div>
                    <div>Change: $${Number(orderData.change_amount || 0).toFixed(2)}</div>
                </div>
                <div class="divider"></div>
                <div class="center contact-info">
                    Thank you for your purchase!<br />
                    Please come again.<br />
                    <div style="margin-top: 8px;">
                        📞 +123 456 7890<br />
                        ✉️ support@posph.com<br />
                        📍 123 Store Street
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
                        <MdStore style={{ fontSize: 28, color: '#000' }} />
                        <div style={{ fontWeight: 'bold', fontSize: 18, color: '#000' }}>POS PH</div>
                        <div style={{ color: '#666', fontSize: 11 }}>Your Trusted Store</div>
                    </div>
                    <hr style={{ border: '1px solid #000', margin: '8px 0' }} />
                    <div style={{ color: '#000' }}>
                        <strong>Receipt No:</strong> {orderData.order_number}<br />
                        <strong>Date:</strong> {formatDate(orderData.created_at)}<br />
                        <strong>Customer:</strong> {orderData.customer_name || 'Walk-in Customer'}
                    </div>
                    <hr style={{ border: '1px solid #000', margin: '8px 0' }} />
                    <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', color: '#000' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Item</th>
                                <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Qty</th>
                                <th style={{ textAlign: 'right', fontWeight: 'bold' }}>Price</th>
                                <th style={{ textAlign: 'right', fontWeight: 'bold' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderData.items?.map(item => (
                                <tr key={item.id}>
                                    <td style={{ padding: '2px 0' }}>
                                        {item.product_name}
                                        <div style={{ fontSize: 9, color: '#666' }}>
                                            {item.barcode}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '2px 0' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', padding: '2px 0' }}>${Number(item.price).toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', padding: '2px 0' }}>
                                        ${(Number(item.price) * Number(item.quantity) - Number(item.discount || 0)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr style={{ border: '1px solid #000', margin: '8px 0' }} />
                    <div style={{ color: '#000' }}>
                        <div>Subtotal: ${Number(orderData.total_amount).toFixed(2)}</div>
                        <div>Payment: {orderData.payment_method?.toUpperCase()}</div>
                        <div>Amount Paid: ${Number(orderData.payment_amount).toFixed(2)}</div>
                        <div>Change: ${Number(orderData.change_amount || 0).toFixed(2)}</div>
                    </div>
                    <hr style={{ border: '1px solid #000', margin: '8px 0' }} />
                    <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#000' }}>
                        Thank you for your purchase!<br />
                        Please come again.<br />
                        <div style={{ marginTop: 8 }}>
                            <MdPhone style={{ color: '#000', verticalAlign: 'middle' }} /> +123 456 7890<br />
                            <MdEmail style={{ color: '#000', verticalAlign: 'middle' }} /> support@posph.com<br />
                            <MdLocationOn style={{ color: '#000', verticalAlign: 'middle' }} /> 123 Store Street
                        </div>
                    </div>
                </>
            ) : (
                <div>Loading receipt...</div>
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
                                style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)', border: 'none' }}
                            >
                                Back
                            </Button>
                            <Title level={4} style={{ margin: 0 }}>Receipt</Title>
                        </Space>
                        <Space>
                            <Button
                                icon={<MdVisibility />}
                                onClick={() => setPreviewVisible(true)}
                                disabled={!orderData}
                            >
                                Preview
                            </Button>
                            <Button
                                type="default"
                                icon={<MdPrint />}
                                onClick={handleDirectPrint}
                                disabled={!orderData}
                                style={{ background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', border: 'none', color: 'white' }}
                            >
                                Print
                            </Button>
                        </Space>
                    </div>
                </Space>
            </div>

            {/* Hidden receipt for react-to-print */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <ReceiptContent />
            </div>

            <div style={{ padding: 24, background: 'white', marginTop: 24 }}>
                <Card>
                    {orderData ? (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Title level={4}>Order Details</Title>
                            <Text>Order Number: <Text strong>{orderData.order_number}</Text></Text>
                            <Text>Customer: <Text strong>{orderData.customer_name || 'Walk-in Customer'}</Text></Text>
                            <Text>Total Amount: <Text strong>${Number(orderData.total_amount).toFixed(2)}</Text></Text>
                            <Text>Payment Method: <Tag color={orderData.payment_method === 'cash' ? 'green' : orderData.payment_method === 'card' ? 'blue' : 'purple'}>{orderData.payment_method?.toUpperCase()}</Tag></Text>
                            <Text>Amount Paid: <Text strong>${Number(orderData.payment_amount).toFixed(2)}</Text></Text>
                            <Text>Change: <Text strong>${Number(orderData.change_amount || 0).toFixed(2)}</Text></Text>
                            <Divider />
                            <Title level={5}>Items</Title>
                            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Item</th>
                                        <th style={{ textAlign: 'center' }}>Qty</th>
                                        <th style={{ textAlign: 'right' }}>Price</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderData.items?.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                {item.product_name}
                                                <div style={{ fontSize: 10, color: '#888' }}>
                                                    Barcode: {item.barcode}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>${Number(item.price).toFixed(2)}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                ${(Number(item.price) * Number(item.quantity) - Number(item.discount || 0)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Space>
                    ) : (
                        <Text>Loading order details...</Text>
                    )}
                </Card>
            </div>

            <Modal
                title="Receipt Preview"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button 
                        key="print-direct" 
                        type="default" 
                        onClick={() => {
                            setPreviewVisible(false);
                            setTimeout(() => {
                                handleDirectPrint();
                            }, 100);
                        }}
                        icon={<MdPrint />}
                        style={{ background: '#52c41a', color: 'white', border: 'none' }}
                    >
                        Print
                    </Button>,
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        Close
                    </Button>
                ]}
                width={400}
                centered
            >
                <div style={{ 
                    background: '#f5f5f5', 
                    padding: '20px', 
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <ReceiptContent />
                </div>
            </Modal>
        </MainPage>
    );
}

export default ReceiptPage;