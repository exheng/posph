import React, { useState } from 'react';
import { List, Typography, Space, Tag, Modal, Table, Button } from 'antd';
import { MdShoppingCart, MdInfo, MdDelete } from 'react-icons/md';
import { notificationStore } from '../../store/notification.store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

const MessagePanel = () => {
    const { notifications, removeNotification } = notificationStore();
    const readNotifications = notifications.filter(n => n.read);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'purchase_received':
                return <MdShoppingCart style={{ color: '#52c41a' }} />;
            default:
                return null;
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
                    <Text strong>Message History</Text>
                </div>

                <List
                    dataSource={readNotifications}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                padding: '12px 16px',
                                backgroundColor: item.cleared ? '#f5f5f5' : '#fafafa',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                opacity: item.cleared ? 0.8 : 1
                            }}
                            onClick={() => setSelectedMessage(item)}
                            actions={[
                                item.details && (
                                    <Button 
                                        type="text" 
                                        icon={<MdInfo />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMessage(item);
                                        }}
                                    />
                                ),
                                <Button 
                                    type="text" 
                                    danger
                                    icon={<MdDelete />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeNotification(item.id);
                                    }}
                                />
                            ]}
                        >
                            <List.Item.Meta
                                avatar={getNotificationIcon(item.type)}
                                title={
                                    <Space>
                                        <Text strong>{item.title}</Text>
                                        <Tag color={item.cleared ? "default" : "processing"}>
                                            {item.cleared ? "Cleared" : "Read"}
                                        </Tag>
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
                        emptyText: 'No message history'
                    }}
                />
            </div>

            <Modal
                title="Message Details"
                open={!!selectedMessage}
                onCancel={() => setSelectedMessage(null)}
                footer={null}
                width={700}
            >
                {selectedMessage?.details && (
                    <div>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <div>
                                <Text strong>Supplier: </Text>
                                <Text>{selectedMessage.details.supplier}</Text>
                            </div>
                            <div>
                                <Text strong>Order Date: </Text>
                                <Text>{selectedMessage.details.orderDate}</Text>
                            </div>
                            
                            <Table
                                columns={columns}
                                dataSource={selectedMessage.details.items}
                                pagination={false}
                                rowKey="name"
                            />

                            <div style={{ textAlign: 'right' }}>
                                <Text strong>Total Amount: </Text>
                                <Text strong style={{ color: '#52c41a' }}>
                                    ${Number(selectedMessage.details.totalAmount).toFixed(2)}
                                </Text>
                            </div>
                        </Space>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default MessagePanel; 