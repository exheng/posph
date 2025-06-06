import React, { useEffect, useState } from "react";
import { request } from "../../util/helper";
import { Space, Table, Tag ,Modal,Input, Select, message, List,Form, InputNumber, Upload, Image, Row, Col} from "antd";
import { MdAdd, MdDelete , MdEdit } from "react-icons/md";
import { Button } from 'antd';
import MainPage from "../../component/layout/Mainpage";
import { configStore } from "../../store/configStore";

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
    const [state, setState] = useState({
        visibleModal: false,
        Id : null,
        Name:"",
        Description:"",
        Status:"",
        ParentId:null,
        txtSearch:"",
    });

    const [previewOpen, setPreviewOpen] =useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [imageDefault, setImageDefault] = useState([]);
    const [imageOptional, setImageOptional] = useState([]);

    useEffect(() => {
        // getList();
    }, []);

    const oncloseModal = () => {
        setState((p)=>({
            ...p,
            visibleModal:false,
        }))
    };
    const onFinish = async (items) => {
        // console.log(items);
         var params = new FormData();
         params.append("name",items.name);

        //  params.append("upload_image",items.image_default);
        if (items.image_default?.file?.originFileObj) {
            params.append("upload_image", items.image_default.file.originFileObj, items.image_default.file.name);
        }

         const res = await request("product", "post", params);
         console.log(res);
    };
    const onNewBtn = async () => {
        const res = await request ("new_barcode","post")
        if (res && !res.error){
            form.setFieldValue("barcode", res.barcode)
            setState((p)=>({
                ...p,
                visibleModal:true,
            }))
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

    return (
        <MainPage loading ={false}>
        
        <div className="pageHeader">
                <Space>
                    <div>
                    Product
                    </div>
                    <Input.Search 
                    onChange={(value)=>
                        setState(p=>({...p,txtSearch:value.target.value}))
                        } 
                        allowClear
                        placeholder="Search"/>

                <Select
                    allowClear
                    style={{width:130}}
                    placeholder="Product"
                    options={config.category}
                />
                <Select
                    allowClear
                    style={{width:130}}
                    placeholder="Brand"
                    options={config.brand}
                />
                <Button type="primary">
                    Filter
                </Button>
                </Space>
                
                <Button type="primary" icon={<MdAdd />} onClick={onNewBtn}>
                        New
                </Button>
                </div>
        <Modal 
            open={state.visibleModal}
            title={form.getFieldValue("Id") ? "Edit Product" : "New Product"} 
            footer={null} onCancel={oncloseModal}
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
                                options={config.category}
                            />
                        </Form.Item>

                        <Form.Item name="price" label="Price"> 
                            <InputNumber placeholder="Input Price" style={{width:"100%"}}/>
                        </Form.Item>
                        <Form.Item name="Status" label="Status" > 
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
                        <Button type="primary" htmlType="submit" onClick={onFinish}>
                        {form.getFieldValue("Id") ? "Update" : "Save"}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
        {/* <Table
            dataSource={List}
            columns={[
            {
                key: "No",
                title: "No",
                render: (Item,data,index) => index + 1
            },
            {
                key: "Name",
                title: "Name",
                dataIndex: "Name",
            },
            {
                key: "Description",
                title: "Description",
                dataIndex: "Description",
            },
            {
                key: "Status",
                title: "Status",
                dataIndex: "Status",
                render : (status) => (status == 1? (
                <Tag color="green">Active</Tag>
                ) : (
                <Tag color="red">InActive</Tag>) ),
            },
            {
                key: "Action",
                title: "Action",
                align: "center",
                render : (Item,data,index) => (
                <Space>
                    <Button type="primary" icon={<MdEdit/>}onClick={()=>onclickEdit(data,index)}/>
                    <Button type="primary" danger icon={ <MdDelete/>}onClick={()=>onclickdelete(data,index)}/>
                </Space>

                )
            },
            ]}
        /> */}
        </MainPage>
    );
}

export default ProductPage;
