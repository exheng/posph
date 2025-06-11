import React, { useState } from 'react';
import { 
    List, 
    Typography, 
    Button, 
    Space, 
    Badge, 
    Modal, 
    Table,
    Tag,
    Divider,
    Empty
} from 'antd';
import { 
    MdWarning, 
    MdShoppingCart, 
    MdNotifications,
    MdNotificationsActive,
    MdDelete,
    MdInfo
} from "react-icons/md";
import { notificationStore } from '../../store/notification.store';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const getNotificationIcon = (type) => {
    switch (type) {
        case 'low_stock':
            return <MdWarning style={{ fontSize: '24px', color: '#faad14' }} />;
        case 'purchase_received':
            return <MdShoppingCart style={{ fontSize: '24px', color: '#52c41a' }} />;
        default:
            return <MdNotifications style={{ fontSize: '24px', color: '#1890ff' }} />;
    }
};

const getNotificationColor = (type) => {
    switch (type) {
        case 'low_stock':
            return '#faad14';
        case 'purchase_received':
            return '#52c41a';
        default:
            return '#1890ff';
    }
};

function MessagePanel() {
    const { notifications, removeNotification } = notificationStore();
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const readNotifications = notifications.filter(n => n.read);

    const handleViewDetails = (notification) => {
        setSelectedNotification(notification);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedNotification(null);
    };

    return (
        <div style={{ width: '500px', maxHeight: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
                padding: '16px', 
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                color: 'white'
            }}>
                <Space>
                    <MdNotificationsActive style={{ fontSize: '20px' }} />
                    <Title level={5} style={{ margin: 0, color: 'white' }}>Message History</Title>
                </Space>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                {readNotifications.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No messages in history"
                        style={{ margin: '32px 0' }}
                    />
                ) : (
                    <List
                        dataSource={readNotifications}
                        renderItem={(item) => (
                            <List.Item
                                onClick={() => handleViewDetails(item)}
                                style={{
                                    padding: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    borderBottom: '1px solid #f0f0f0',
                                    background: item.cleared ? '#f5f5f5' : 'white',
                                    opacity: item.cleared ? 0.8 : 1,
                                    ':hover': {
                                        background: '#f5f5f5'
                                    }
                                }}
                            >
                                <List.Item.Meta
                                    avatar={getNotificationIcon(item.type)}
                                    title={
                                        <Space>
                                            <Text strong>{item.title}</Text>
                                            <Tag color={getNotificationColor(item.type)}>
                                                {item.type === 'low_stock' ? 'Low Stock' : 'Purchase Order'}
                                            </Tag>
                                            <Tag color={item.cleared ? 'default' : 'blue'}>
                                                {item.cleared ? 'Cleared' : 'Read'}
                                            </Tag>
                                        </Space>
                                    }
                                    description={
                                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                                            <Text style={{ fontSize: '14px', marginBottom: '4px' }}>{item.message}</Text>
                                            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {dayjs(item.timestamp).fromNow()}
                                                </Text>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<MdDelete />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeNotification(item.id);
                                                    }}
                                                />
                                            </Space>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </div>

            <Modal
                title={
                    <Space>
                        {selectedNotification && getNotificationIcon(selectedNotification.type)}
                        <span>Message Details</span>
                    </Space>
                }
                open={modalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Close
                    </Button>
                ]}
                width={700}
            >
                {selectedNotification && (
                    <div style={{ padding: '16px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <Title level={5}>{selectedNotification.title}</Title>
                            <Text style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
                                {selectedNotification.message}
                            </Text>
                            <Space>
                                <Tag color={getNotificationColor(selectedNotification.type)}>
                                    {selectedNotification.type === 'low_stock' ? 'Low Stock' : 'Purchase Order'}
                                </Tag>
                                <Tag color={selectedNotification.cleared ? 'default' : 'blue'}>
                                    {selectedNotification.cleared ? 'Cleared' : 'Read'}
                                </Tag>
                            </Space>
                            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                                {dayjs(selectedNotification.timestamp).format('MMMM D, YYYY h:mm A')}
                            </Text>
                        </div>

                        <Divider />

                        {selectedNotification.type === 'low_stock' && selectedNotification.details && (
                            <div style={{ 
                                background: '#fafafa', 
                                padding: '24px', 
                                borderRadius: '8px',
                                marginBottom: '16px'
                            }}>
                                <Title level={5} style={{ marginBottom: '24px' }}>Product Details</Title>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '14px' }}>Product Name</Text>
                                        <div><Text strong style={{ fontSize: '16px' }}>{selectedNotification.details.productName}</Text></div>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '14px' }}>Current Stock</Text>
                                        <div><Text strong style={{ fontSize: '16px', color: '#faad14' }}>{selectedNotification.details.currentStock} units</Text></div>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '14px' }}>Category</Text>
                                        <div><Text strong style={{ fontSize: '16px' }}>{selectedNotification.details.category}</Text></div>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '14px' }}>Brand</Text>
                                        <div><Text strong style={{ fontSize: '16px' }}>{selectedNotification.details.brand}</Text></div>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '14px' }}>Stock Threshold</Text>
                                        <div><Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>{selectedNotification.details.threshold} units</Text></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedNotification.type === 'purchase_received' && selectedNotification.details && (
                            <>
                                <div style={{ 
                                    background: '#fafafa', 
                                    padding: '24px', 
                                    borderRadius: '8px',
                                    marginBottom: '24px'
                                }}>
                                    <Title level={5} style={{ marginBottom: '24px' }}>Order Information</Title>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '14px' }}>Supplier</Text>
                                            <div><Text strong style={{ fontSize: '16px' }}>{selectedNotification.details.supplier}</Text></div>
                                        </div>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '14px' }}>Order Date</Text>
                                            <div><Text strong style={{ fontSize: '16px' }}>{selectedNotification.details.orderDate}</Text></div>
                                        </div>
                                    </div>
                                </div>

                                <Title level={5} style={{ marginBottom: '16px' }}>Order Items</Title>
                                <Table
                                    dataSource={selectedNotification.details.items}
                                    pagination={false}
                                    columns={[
                                        {
                                            title: 'Product',
                                            dataIndex: 'name',
                                            key: 'name',
                                            render: (text) => <Text strong>{text}</Text>
                                        },
                                        {
                                            title: 'Quantity',
                                            dataIndex: 'quantity',
                                            key: 'quantity',
                                            align: 'right',
                                            render: (text) => <Text>{text} units</Text>
                                        },
                                        {
                                            title: 'Price',
                                            dataIndex: 'price',
                                            key: 'price',
                                            align: 'right',
                                            render: (price) => <Text strong>${Number(price).toFixed(2)}</Text>
                                        },
                                        {
                                            title: 'Total',
                                            key: 'total',
                                            align: 'right',
                                            render: (_, record) => <Text strong>${Number(record.total).toFixed(2)}</Text>
                                        },
                                    ]}
                                />

                                <div style={{ 
                                    textAlign: 'right', 
                                    marginTop: '24px',
                                    padding: '24px',
                                    background: '#fafafa',
                                    borderRadius: '8px'
                                }}>
                                    <Text strong style={{ fontSize: '18px' }}>
                                        Total Amount: ${Number(selectedNotification.details.totalAmount).toFixed(2)}
                                    </Text>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default MessagePanel; 