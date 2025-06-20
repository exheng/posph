import React, { useEffect, useState } from "react";
import { request } from "../../util/helper";
import { 
  Space, 
  Table, 
  Tag, 
  Modal, 
  Input, 
  Select, 
  message, 
  List, 
  Form, 
  InputNumber, 
  Upload, 
  Image, 
  Row, 
  Col,
  Card,
  Typography,
  Button,
  Tooltip
} from "antd";
import { 
  MdAdd, 
  MdDelete, 
  MdEdit,
  MdSearch,
  MdFilterList,
  MdClear
} from "react-icons/md";
import MainPage from "../../component/layout/Mainpage";
import { configStore } from "../../store/configStore";
import { getProfile } from "../../store/profile.store";

const { Title, Text } = Typography;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function ProductPage() {
    const { config } = configStore();
    const [form] = Form.useForm();
    const profile = getProfile();
    const userRole = profile?.role_name?.toLowerCase();
    const [state, setState] = useState({
        visibleModal: false,
        Id: null,
        Name: "",
        Description: "",
        Status: "",
        ParentId: null,
        txtSearch: "",
        selectedCategory: null,
        selectedBrand: null,
        products: [],
        loading: false
    });

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [imageDefault, setImageDefault] = useState([]);
    const [imageOptional, setImageOptional] = useState([]);

    // Add debounce function
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    useEffect(() => {
        getProducts();
    }, []);

    // Add effect for auto-filtering
    useEffect(() => {
        getProducts();
    }, [state.txtSearch, state.selectedCategory, state.selectedBrand]);

    const getProducts = async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const res = await request("product", "get");
            if (res && !res.error) {
                let filteredProducts = res.list || [];
                
                // Apply search filter
                if (state.txtSearch) {
                    filteredProducts = filteredProducts.filter(product => 
                        product.name.toLowerCase().includes(state.txtSearch.toLowerCase()) ||
                        product.barcode.toLowerCase().includes(state.txtSearch.toLowerCase()) ||
                        product.brand.toLowerCase().includes(state.txtSearch.toLowerCase())
                    );
                }

                // Apply category filter
                if (state.selectedCategory) {
                    filteredProducts = filteredProducts.filter(product => 
                        product.category_id === state.selectedCategory
                    );
                }

                // Apply brand filter
                if (state.selectedBrand) {
                    filteredProducts = filteredProducts.filter(product => 
                        product.brand === state.selectedBrand
                    );
                }

                setState(prev => ({ 
                    ...prev, 
                    products: filteredProducts,
                    loading: false 
                }));
            }
        } catch (error) {
            message.error("Failed to fetch products");
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSearch = debounce((value) => {
        setState(prev => ({ ...prev, txtSearch: value }));
    }, 300);

    const handleClearFilters = () => {
        setState(prev => ({
            ...prev,
            txtSearch: "",
            selectedCategory: null,
            selectedBrand: null
        }));
    };

    const oncloseModal = () => {
        setState((p)=>({
            ...p,
            visibleModal:false,
        }));
        form.resetFields();
        setImageDefault([]);
        setImageOptional([]);
        setPreviewImage("");
    };

    const onFinish = async (items) => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            var params = new FormData();
            params.append("id", form.getFieldValue("id")); // Add ID for update
            params.append("name", items.name);
            params.append("category_id", items.category_id);
            params.append("barcode", items.barcode);
            params.append("brand", items.brand);
            params.append("description", items.description);
            params.append("qty", items.qty);
            params.append("price", items.price);
            params.append("discount", items.discount);
            params.append("status", items.status);
            
            // Only append image if a new one is selected
            if (items.image_default?.file?.originFileObj) {
                params.append("upload_image", items.image_default.file.originFileObj, items.image_default.file.name);
            }

            const method = form.getFieldValue("id") ? "put" : "post";
            const endpoint = form.getFieldValue("id") ? "product/update" : "product/create";
            const res = await request(endpoint, method, params);
            
            if (res && !res.error) {
                message.success(res.message || (method === "post" ? "Product created successfully!" : "Product updated successfully!"));
                oncloseModal();
                getProducts();
            } else {
                res.error?.barcode && message.error(res.error?.barcode);
            }
        } catch (error) {
            message.error("An error occurred while saving the product");
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const onNewBtn = async () => {
        // Only allow admin and manager to add new products
        if (userRole === 'cashier') {
            message.warning("Cashiers cannot add new products. Please contact an administrator.");
            return;
        }

        const res = await request("product/new_barcode", "post");
        if (res && !res.error) {
            form.setFieldValue("barcode", res.barcode);
            setState((p) => ({
                ...p,
                visibleModal: true,
            }));
        }
    };

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || (file.preview ));
        setPreviewOpen(true);
    };

    const handleChangeImageDefault= ({ fileList: newFileList }) => setImageDefault(newFileList);
    const handleChangeImageOptional= ({ fileList: newFileList }) => setImageOptional(newFileList);

    const clickBtnEdit = (item) => {
        // Only allow admin and manager to edit products
        if (userRole === 'cashier') {
            message.warning("Cashiers cannot edit products. Please contact an administrator.");
            return;
        }

        form.setFieldsValue({
            id: item.id,
            name: item.name,
            category_id: item.category_id,
            barcode: item.barcode,
            brand: item.brand,
            description: item.description,
            qty: item.qty,
            price: item.price,
            discount: item.discount,
            status: item.status
        });
        if (item.image) {
            setImageDefault([{
                uid: '-1',
                name: item.image,
                status: 'done',
                url: `http://localhost:8081/pos_img/${item.image}`
            }]);
        }
        setState((p)=>({
            ...p,
            visibleModal: true,
        }));
    };

    const clickBtnDelete = (item) => {
        // Only allow admin and manager to delete products
        if (userRole === 'cashier') {
            message.warning("Cashiers cannot delete products. Please contact an administrator.");
            return;
        }

        Modal.confirm({
            title: "Delete Product",
            icon: <MdDelete style={{ color: '#ff4d4f' }} />,
            content: (
                <div>
                    <p>Are you sure you want to delete this product?</p>
                    <p><strong>Product:</strong> {item.name}</p>
                    <p><strong>Barcode:</strong> {item.barcode}</p>
                    <p><strong>Current Stock:</strong> {item.qty}</p>
                    <p style={{ color: '#ff4d4f', marginTop: '8px' }}>
                        This action cannot be undone.
                    </p>
                </div>
            ),
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    setState(prev => ({ ...prev, loading: true }));
                    const res = await request(`product/remove?id=${item.id}`, "delete");
                    if (res && !res.error) {
                        message.success("Product deleted successfully!");
                        getProducts();
                    } else {
                        console.error("Delete error:", res.error);
                        message.error("An error occurred while deleting the product");
                    }
                } catch (error) {
                    console.error("Delete error:", error);
                    message.error("An error occurred while deleting the product");
                } finally {
                    setState(prev => ({ ...prev, loading: false }));
                }
            }
        });
    };

    const columns = [
        {
            title: 'No',
            dataIndex: 'id',
            key: 'id',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
                <Image
                    width={50}
                    height={50}
                    src={image ? `http://localhost:8081/pos_img/${image}` : 'default-product.png'}
                    style={{ objectFit: 'cover' }}
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Barcode',
            dataIndex: 'barcode',
            key: 'barcode',
        },
        {
            title: 'Category',
            dataIndex: 'category_name',
            key: 'category_name',
        },
        {
            title: 'Brand',
            dataIndex: 'brand_name',
            key: 'brand_name',
        },
        {
            title: 'Stock',
            dataIndex: 'qty',
            key: 'qty',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `$${price.toFixed(2)}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        // Only show action column for admin and manager
        ...(userRole !== 'cashier' ? [{
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="primary" 
                        icon={<MdEdit />} 
                        onClick={() => clickBtnEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button 
                        danger 
                        icon={<MdDelete />} 
                        onClick={() => clickBtnDelete(record)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        }] : []),
    ];

    return (
        <MainPage loading={state.loading}>
            <div className="pageHeader">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4} style={{ margin: 0 }}>Products</Title>
                        {/* Only show Add New Product button for admin and manager */}
                        {userRole !== 'cashier' && (
                            <Button 
                                type="primary" 
                                icon={<MdAdd />} 
                                onClick={onNewBtn}
                                style={{ 
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.2)'
                                }}
                            >
                                Add New Product
                            </Button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Input.Search 
                            placeholder="Search products..."
                            allowClear
                            prefix={<MdSearch />}
                            style={{ width: 300 }}
                            value={state.txtSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Select
                            allowClear
                            style={{ width: 200 }}
                            placeholder="Category"
                            options={config?.category || []}
                            value={state.selectedCategory}
                            onChange={(value) => setState(prev => ({ ...prev, selectedCategory: value }))}
                        />
                        <Select
                            allowClear
                            style={{ width: 200 }}
                            placeholder="Brand"
                            options={config?.brand?.map((item) => ({ label: `${item.label} (${item.country})`, value: item.value })) || []}
                            value={state.selectedBrand}
                            onChange={(value) => setState(prev => ({ ...prev, selectedBrand: value }))}
                        />
                        <Button 
                            onClick={handleClearFilters}
                            icon={<MdClear />}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </Space>
            </div>

            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 3,
                    lg: 4,
                    xl: 4,
                    xxl: 4,
                }}
                dataSource={state.products}
                renderItem={(item) => (
                    <List.Item>
                        <Card
                            hoverable
                            cover={
                                <div style={{ 
                                    height: 200, 
                                    overflow: 'hidden',
                                    background: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.image ? (
                                        <Image
                                            alt={item.name}
                                            src={`http://localhost:8081/pos_img/${item.image}`}
                                            style={{ 
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                            preview={false}
                                        />
                                    ) : (
                                        <Text type="secondary">No Image</Text>
                                    )}
                                </div>
                            }
                            // Only show actions for admin and manager
                            actions={userRole !== 'cashier' ? [
                                <Tooltip title="Edit">
                                    <Button 
                                        type="text" 
                                        icon={<MdEdit />} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clickBtnEdit(item);
                                        }}
                                    />
                                </Tooltip>,
                                <Tooltip title="Delete">
                                    <Button 
                                        type="text" 
                                        danger
                                        icon={<MdDelete />} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clickBtnDelete(item);
                                        }}
                                    />
                                </Tooltip>
                            ] : []}
                        >
                            <Card.Meta
                                title={item.name}
                                description={
                                    <Space direction="vertical" size="small">
                                        <Text type="secondary">Brand: {item.brand_name}</Text>
                                        <Text type="secondary">Category: {item.category_name}</Text>
                                        <Text strong>Price: ${item.price}</Text>
                                        <Text>Stock: {item.qty}</Text>
                                        <Tag color={item.status === 1 ? "green" : "red"}>
                                            {item.status === 1 ? "Active" : "Inactive"}
                                        </Tag>
                                    </Space>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />

            <Modal 
                open={state.visibleModal}
                title={form.getFieldValue("id") ? "Edit Product" : "New Product"} 
                footer={null} 
                onCancel={oncloseModal}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={10}>
                        <Col span={12}>
                            <Form.Item name="name" label="Product Name" 
                                rules={[
                                    {
                                        required:true,
                                        message: "Please fill name product"
                                    }
                                ]}
                            > 
                                <Input placeholder="Input Product Name" />
                            </Form.Item>

                            <Form.Item name="brand" label="Brand"
                                rules={[
                                        {
                                            required:true,
                                            message: "Please select device brand"
                                        }
                                    ]}> 
                               <Select 
                                    placeholder="Select Brand"
                                    options={config.brand?.map((item) => ({
                                        label: `${item.label} (${item.country})`,
                                        value: item.value // Ensure "value" is correctly set
                                    }))}
                                />

                            </Form.Item>
                            <Form.Item name="barcode" label="Barcode"> 
                                <Input disabled placeholder="Barcode" style={{width:"100%"}}/>
                            </Form.Item>
                            <Form.Item name="qty" label="Quantity"> 
                                <InputNumber placeholder="Input Quantity" style={{width:"100%"}}/>
                            </Form.Item>
                            <Form.Item name="discount" label="Discount"> 
                                <InputNumber placeholder="Input Discount" style={{width:"100%"}}/>
                            </Form.Item>
                            
                        </Col>
                        <Col span={12}>
                            <Form.Item name="category_id" label="Category"
                                rules={[
                                        {
                                            required:true,
                                            message: "Please select type device"
                                        }
                                    ]}
                                > 
                                <Select 
                                    placeholder="Select Category"
                                    options={config?.category}
                                />
                            </Form.Item>

                            <Form.Item name="price" label="Price"> 
                                <InputNumber placeholder="Input Price" style={{width:"100%"}}/>
                            </Form.Item>
                            <Form.Item name="status" label="Status" > 
                                <Select 
                                    placeholder="Select Status"
                                    options={[
                                    {
                                        label:"Active",
                                        value: 1,
                                    },
                                    {
                                        label:"Inactive",
                                        value: 0,
                                    },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item name="description" label="Description"> 
                                <Input.TextArea placeholder="Input Description" />
                            </Form.Item>
                        </Col>
                    </Row>

                    

                    <Form.Item name="image_default" label="Image"> 
                        <Upload
                            customRequest={(options) => {
                                options.onSuccess();
                            }}
                            listType="picture-card" 
                            fileList={imageDefault}
                            onPreview={handlePreview}
                            onChange={handleChangeImageDefault}
                        >
                            <div>{<MdAdd />}</div>
                        </Upload>
                    </Form.Item>
                    <Form.Item name="image_optional" label="Image (Optional)"> 
                        <Upload 
                            customRequest={(options) => {
                                options.onSuccess();
                            }}  
                            listType="picture-card" 
                            multiple={true} maxCount={5} 
                            fileList={imageOptional}
                            onPreview={handlePreview}
                            onChange={handleChangeImageOptional}>
                            <div>{<MdAdd />}</div>
                        </Upload>
                    </Form.Item>

                    {previewImage && (
                        <Image
                            wrapperStyle={{
                                display:"none",
                            }}
                            preview={{
                                visible : previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(""),
                            }}
                            src={previewImage}
                        />

                    )}
                    <div style={{textAlign: "right"}}>
                        <Space>
                            <Button onClick={oncloseModal}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                {form.getFieldValue("id") ? "Update" : "Save"}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </MainPage>
    );
}

export default ProductPage;
