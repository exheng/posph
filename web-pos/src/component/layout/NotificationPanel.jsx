import React, { useState } from 'react';
import { List, Badge, Typography, Button, Space, Tag, Modal, Table } from 'antd';
import { MdShoppingCart, MdCheck, MdDelete, MdInfo } from 'react-icons/md';
import { notificationStore } from '../../store/notification.store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const NotificationPanel = () => {
    const { notifications, markAsRead, markAllAsRead, clearNotifications } = notificationStore();
    const [selectedNotification, setSelectedNotification] = useState(null);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'purchase_received':
                return <MdShoppingCart style={{ color: '#52c41a' }} />;
            default:
                return null;
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.details) {
            setSelectedNotification(notification);
        }
    };

    const columns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (price) => `$${Number(price).toFixed(2)}`,
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            align: 'right',
            render: (total) => `$${Number(total).toFixed(2)}`,
        },
    ];

    return (
        <>
            <div style={{ width: 360, maxHeight: 480, overflow: 'auto' }}>
                <div style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Text strong>Notifications</Text>
                    <Space>
                        <Button 
                            type="link" 
                            size="small"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </Button>
                        <Button 
                            type="link" 
                            size="small"
                            onClick={clearNotifications}
                        >
                            Clear all
                        </Button>
                    </Space>
                </div>

                <List
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                padding: '12px 16px',
                                backgroundColor: item.read ? 'transparent' : '#f6ffed',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onClick={() => handleNotificationClick(item)}
                            actions={[
                                item.details && (
                                    <Button 
                                        type="text" 
                                        icon={<MdInfo />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedNotification(item);
                                        }}
                                    />
                                )
                            ]}
                        >
                            <List.Item.Meta
                                avatar={getNotificationIcon(item.type)}
                                title={
                                    <Space>
                                        <Text strong>{item.title}</Text>
                                        {!item.read && <Badge status="processing" />}
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary">{item.message}</Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {dayjs(item.timestamp).fromNow()}
                                        </Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{
                        emptyText: 'No notifications'
                    }}
                />
            </div>

            <Modal
                title="Purchase Order Details"
                open={!!selectedNotification}
                onCancel={() => setSelectedNotification(null)}
                footer={null}
                width={700}
            >
                {selectedNotification?.details && (
                    <div>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <div>
                                <Text strong>Supplier: </Text>
                                <Text>{selectedNotification.details.supplier}</Text>
                            </div>
                            <div>
                                <Text strong>Order Date: </Text>
                                <Text>{selectedNotification.details.orderDate}</Text>
                            </div>
                            
                            <Table
                                columns={columns}
                                dataSource={selectedNotification.details.items}
                                pagination={false}
                                rowKey="name"
                            />

                            <div style={{ textAlign: 'right' }}>
                                <Text strong>Total Amount: </Text>
                                <Text strong style={{ color: '#52c41a' }}>
                                    ${Number(selectedNotification.details.totalAmount).toFixed(2)}
                                </Text>
                            </div>
                        </Space>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default NotificationPanel; 