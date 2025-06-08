import React, { useEffect, useState, useRef } from 'react';
import { render } from 'react-dom';
import {
    Table,
    Card,
    Space,
    Button,
    Input,
    Tag,
    Modal,
    Form,
    InputNumber,
    message,
    Typography,
    Select,
    DatePicker,
    Row,
    Col,
    Divider
} from 'antd';
import {
    MdAdd,
    MdSearch,
    MdSave,
    MdDelete,
    MdEdit,
    MdPrint,
    MdRefresh
} from "react-icons/md";
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import { configStore } from '../../store/configStore';
import ReactToPrint from 'react-to-print';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Receipt Component for Printing
const PurchaseOrderReceipt = React.forwardRef(({ order }, ref) => {
    if (!order) return null;
    
    return (
        <div ref={ref} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Title level={3}>Purchase Order Receipt</Title>
                <Text>PhoneShop POS System</Text>
            </div>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Text strong>Order Number:</Text>
                    <br />
                    <Text>{order.order_number}</Text>
                </Col>
                <Col span={12}>
                    <Text strong>Order Date:</Text>
                    <br />
                    <Text>{dayjs(order.order_date).format('YYYY-MM-DD')}</Text>
                </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col span={12}>
                    <Text strong>Supplier:</Text>
                    <br />
                    <Text>{order.supplier_name}</Text>
                </Col>
                <Col span={12}>
                    <Text strong>Expected Delivery:</Text>
                    <br />
                    <Text>{dayjs(order.expected_delivery_date).format('YYYY-MM-DD')}</Text>
                </Col>
            </Row>
            
            <Divider />
            
            <Table
                dataSource={order.items || []}
                pagination={false}
                columns={[
                    {
                        title: 'Product',
                        dataIndex: 'product_name',
                        key: 'product_name',
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
                        key: 'total',
                        align: 'right',
                        render: (_, record) => `$${(Number(record.quantity) * Number(record.price)).toFixed(2)}`,
                    },
                ]}
            />
            
            <Divider />
            
            <div style={{ textAlign: 'right' }}>
                <Text strong>Total Amount: ${Number(order.total_amount || 0).toFixed(2)}</Text>
            </div>
            
            <Divider />
            
            <div style={{ marginTop: '20px' }}>
                <Text strong>Notes:</Text>
                <br />
                <Text>{order.notes || 'No additional notes'}</Text>
            </div>
            
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <Text type="secondary">Thank you for your business!</Text>
            </div>
        </div>
    );
});

PurchaseOrderReceipt.displayName = 'PurchaseOrderReceipt';

function PurchaseOrderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { config } = configStore();
    const [form] = Form.useForm();
    const receiptRef = useRef();
    const [state, setState] = useState({
        orders: [],
        products: [],
        loading: false,
        visibleModal: false,
        selectedOrder: null,
        searchText: '',
        selectedSupplier: null,
        orderItems: [],
        totalAmount: 0,
        printOrder: null
    });

    useEffect(() => {
        getOrders();
        getProducts();
    }, []);

    const getOrders = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await request("purchase", "get");
            if (res && !res.error) {
                const ordersList = Array.isArray(res.list) ? res.list : [];
                setState(prev => ({
                    ...prev,
                    orders: ordersList,
                    loading: false
                }));
            } else {
                message.error("Failed to fetch purchase orders");
                setState(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error("Failed to fetch purchase orders");
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const getProducts = async () => {
        try {
            const res = await request("product", "get");
            if (res && !res.error) {
                setState(prev => ({
                    ...prev,
                    products: res.list || []
                }));
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            message.error("Failed to fetch products");
        }
    };

    const handleSearch = (value) => {
        setState(prev => ({ ...prev, searchText: value }));
    };

    const showCreateModal = () => {
        setState(prev => ({
            ...prev,
            visibleModal: true,
            selectedOrder: null,
            orderItems: [],
            totalAmount: 0
        }));
        form.resetFields();
    };

    const showEditModal = (order) => {
        // Format the order items to match the form structure
        const formattedItems = order.items.map(item => ({
            product_id: item.product_id,
            quantity: Number(item.quantity),
            price: Number(item.price)
        }));

        setState(prev => ({
            ...prev,
            visibleModal: true,
            selectedOrder: order,
            orderItems: formattedItems,
            totalAmount: Number(order.total_amount) || 0
        }));

        // Set form values with proper formatting
        form.setFieldsValue({
            id: order.id,
            supplier_id: order.supplier_id,
            order_date: order.order_date ? dayjs(order.order_date) : null,
            expected_delivery_date: order.expected_delivery_date ? dayjs(order.expected_delivery_date) : null,
            status: order.status || 'pending',
            notes: order.notes
        });

        // Log the current status for debugging
        console.log('Current order status:', order.status);
    };

    const oncloseModal = () => {
        setState(prev => ({
            ...prev,
            visibleModal: false,
            selectedOrder: null,
            orderItems: [],
            totalAmount: 0
        }));
        form.resetFields();
    };

    const addOrderItem = () => {
        setState(prev => ({
            ...prev,
            orderItems: [...prev.orderItems, { product_id: null, quantity: 1, price: 0 }]
        }));
    };

    const removeOrderItem = (index) => {
        setState(prev => ({
            ...prev,
            orderItems: prev.orderItems.filter((_, i) => i !== index)
        }));
    };

    const updateOrderItem = (index, field, value) => {
        setState(prev => {
            const newItems = [...prev.orderItems];
            newItems[index] = { 
                ...newItems[index], 
                [field]: field === 'product_id' ? value : Number(value) 
            };
            
            // Calculate total amount
            const total = newItems.reduce((sum, item) => {
                return sum + (Number(item.quantity || 0) * Number(item.price || 0));
            }, 0);

            return {
                ...prev,
                orderItems: newItems,
                totalAmount: total
            };
        });
    };

    const handleSubmit = async (values) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            
            // Format dates to YYYY-MM-DD
            const orderData = {
                id: state.selectedOrder?.id, // Include ID for updates
                supplier_id: values.supplier_id,
                order_date: values.order_date.format('YYYY-MM-DD'),
                expected_delivery_date: values.expected_delivery_date.format('YYYY-MM-DD'),
                notes: values.notes,
                items: state.orderItems.map(item => ({
                    product_id: item.product_id,
                    quantity: Number(item.quantity),
                    price: Number(item.price)
                })),
                total_amount: state.totalAmount,
                status: values.status || 'pending' // Ensure status is included with a default value
            };

            // Log the data being sent for debugging
            console.log('Submitting order data:', orderData);
            console.log('Status value:', values.status);

            const method = state.selectedOrder ? 'put' : 'post';
            const res = await request("purchase", method, orderData);
            
            if (res && !res.error) {
                message.success(res.message || "Purchase order saved successfully!");
                oncloseModal();
                await getOrders(); // Refresh the list to show updated status
            } else {
                message.error(res.error || "Failed to save purchase order");
            }
        } catch (error) {
            console.error("Error saving purchase order:", error);
            message.error("An error occurred while saving the purchase order");
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handlePrint = (order) => {
        setState(prev => ({ ...prev, printOrder: order }));
    };

    const columns = [
        {
            title: 'Order Number',
            dataIndex: 'order_number',
            key: 'order_number',
        },
        {
            title: 'Supplier',
            dataIndex: 'supplier_name',
            key: 'supplier_name',
        },
        {
            title: 'Order Date',
            dataIndex: 'order_date',
            key: 'order_date',
            render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
        },
        {
            title: 'Expected Delivery',
            dataIndex: 'expected_delivery_date',
            key: 'expected_delivery_date',
            render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => {
                const num = parseFloat(amount);
                return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = config?.purchase_status?.find(s => s.value === status);
                return (
                    <Tag color={
                        status === 'received' ? 'green' :
                        status === 'pending' ? 'orange' :
                        status === 'cancelled' ? 'red' :
                        status === 'shipped' ? 'blue' :
                        status === 'approved' ? 'cyan' : 'default'
                    }>
                        {statusConfig?.label || status?.toUpperCase() || 'PENDING'}
                    </Tag>
                );
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                return (
                    <Space>
                        <Button 
                            type="primary"
                            icon={<MdEdit />}
                            onClick={() => showEditModal(record)}
                        >
                            Edit
                        </Button>
                        <Button 
                            icon={<MdPrint />}
                            onClick={() => {
                                setState(prev => ({ ...prev, printOrder: record }));
                                setTimeout(() => {
                                    const printContent = document.createElement('div');
                                    printContent.innerHTML = receiptRef.current.innerHTML;
                                    const printWindow = window.open('', '_blank');
                                    printWindow.document.write(`
                                        <html>
                                            <head>
                                                <title>Purchase Order Receipt</title>
                                                <style>
                                                    body { font-family: Arial, sans-serif; }
                                                    table { width: 100%; border-collapse: collapse; }
                                                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                                                </style>
                                            </head>
                                            <body>
                                                ${printContent.innerHTML}
                                            </body>
                                        </html>
                                    `);
                                    printWindow.document.close();
                                    printWindow.print();
                                    printWindow.close();
                                }, 100);
                            }}
                        >
                            Print
                        </Button>
                    </Space>
                );
            }
        }
    ];

    const filteredOrders = state.orders.filter(order =>
        order.order_number?.toLowerCase().includes(state.searchText.toLowerCase()) ||
        order.supplier_name?.toLowerCase().includes(state.searchText.toLowerCase())
    );

    return (
        <MainPage loading={state.loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>Purchase Orders</Title>
                            <Text type="secondary">Manage your purchase orders</Text>
                        </div>
                        <Button 
                            type="primary"
                            icon={<MdAdd />}
                            onClick={showCreateModal}
                        >
                            New Purchase Order
                        </Button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Input.Search 
                            placeholder="Search orders..."
                            allowClear
                            prefix={<MdSearch />}
                            style={{ width: 300 }}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </Space>
            </div>

            <Card>
                <Table 
                    columns={columns} 
                    dataSource={filteredOrders}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`
                    }}
                />
            </Card>

            <Modal
                title={state.selectedOrder ? "Edit Purchase Order" : "New Purchase Order"}
                open={state.visibleModal}
                onCancel={oncloseModal}
                width={800}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        status: 'pending'
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="supplier_id"
                                label="Supplier"
                                rules={[{ required: true, message: 'Please select a supplier' }]}
                            >
                                <Select
                                    placeholder="Select Supplier"
                                    options={config?.supplier || []}
                                    showSearch
                                    optionFilterProp="label"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="order_date"
                                label="Order Date"
                                rules={[{ required: true, message: 'Please select order date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="expected_delivery_date"
                                label="Expected Delivery Date"
                                rules={[{ required: true, message: 'Please select expected delivery date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true, message: 'Please select status' }]}
                                initialValue="pending"
                            >
                                <Select
                                    placeholder="Select Status"
                                    options={config?.purchase_status || []}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea rows={4} placeholder="Enter any additional notes" />
                    </Form.Item>

                    <Divider>Order Items</Divider>

                    {state.orderItems.map((item, index) => (
                        <Row gutter={16} key={index} style={{ marginBottom: 16 }}>
                            <Col span={8}>
                                <Select
                                    placeholder="Select Product"
                                    value={item.product_id}
                                    onChange={(value) => updateOrderItem(index, 'product_id', value)}
                                    options={state.products.map(product => ({
                                        label: product.name,
                                        value: product.id
                                    }))}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(value) => updateOrderItem(index, 'quantity', value)}
                                    min={1}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    placeholder="Price"
                                    value={item.price}
                                    onChange={(value) => updateOrderItem(index, 'price', value)}
                                    min={0}
                                    step={0.01}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={4}>
                                <Text>${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</Text>
                            </Col>
                            <Col span={4}>
                                <Button 
                                    danger 
                                    icon={<MdDelete />}
                                    onClick={() => removeOrderItem(index)}
                                />
                            </Col>
                        </Row>
                    ))}

                    <Button 
                        type="dashed" 
                        onClick={addOrderItem}
                        icon={<MdAdd />}
                        style={{ width: '100%', marginBottom: 16 }}
                    >
                        Add Item
                    </Button>

                    <Divider>
                        <Text strong>
                            Total Amount: ${Number(state.totalAmount || 0).toFixed(2)}
                        </Text>
                    </Divider>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={oncloseModal}>Cancel</Button>
                            <Button type="primary" htmlType="submit" icon={<MdSave />}>
                                {state.selectedOrder ? 'Update Order' : 'Create Order'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {state.printOrder && (
                <div style={{ display: 'none' }}>
                    <PurchaseOrderReceipt ref={receiptRef} order={state.printOrder} />
                </div>
            )}
        </MainPage>
    );
}

export default PurchaseOrderPage; 