import React, { useEffect, useState } from "react";
import { request } from "../../util/helper";
import { Space, Table, Tag ,Modal,Input, Select, message, List,Form, Tabs, Typography} from "antd";
import { MdAdd, MdDelete , MdEdit } from "react-icons/md";
import { Button } from 'antd';
import MainPage from "../../component/layout/Mainpage";
import { configStore } from "../../store/configStore";

const { Title } = Typography;
const { TabPane } = Tabs;


function CategoryPage() {
  const {config} = configStore();
  const [List, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formRef] = Form.useForm();
  const [state, setState] = useState({
    visibleModal: false,
    Id : null,
    Name:"",
    Description:"",
    Status:"",
    ParentId:null,
    txtSearch:"",
  });

  // Brand related states and functions
  const [brandList, setBrandList] = useState([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandVisibleModal, setBrandVisibleModal] = useState(false);
  const [brandFormRef] = Form.useForm();
  const [brandSearchText, setBrandSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'brands'

  useEffect(() => {
    if (activeTab === 'categories') {
      getList();
    } else {
      getBrands();
    }
  }, [activeTab, state.txtSearch, brandSearchText]);
  


  const getList = async () => {
    setLoading(true);
    const res = await request("category?txtSearch=" + state.txtSearch , "get");
    setLoading(false);
    if (res && !res.error) {
      setList(res.list);
    } else if (res?.error) {
      message.error(res.error);
    }
  };

  const getBrands = async () => {
    setBrandLoading(true);
    const res = await request("brand?txtSearch=" + brandSearchText, "get");
    setBrandLoading(false);
    if (res && !res.error) {
      setBrandList(res.list);
    } else if (res?.error) {
      message.error(res.error);
    }
  };

  const onclickEdit =(data,index) => {
    setState({
      ...state,
      visibleModal: true,
    })
    formRef.setFieldsValue({
      Id: data.Id,
      Name:data.Name,
      Description:data.Description,
      Status:data.Status,
    })   
  };

  const onclickdelete = async (data,index) => {
    Modal.confirm({
      title:"Remove Category",
      content:"Are you sure you want to delete this category?",
      okText: "Yes",
      okType: "danger",
      onOk: async () => {
        const res = await request("category", "delete",{
          Id: data.Id,
        });
        if(res && !res.error){
          message.success(res.message);
          const newList = List.filter((Item)=>Item.Id != data.Id);
          setList(newList);
          
        } else if (res?.error) {
          message.error(res.error);
        }
      },
      
    });
  };

  const onclickAddBtn = () => {
    formRef.resetFields();
    setState({
      ...state,
      visibleModal: true,
      Id: null,
    });
  };

  const oncloseModal = () => {
    formRef.resetFields();
    setState({
      ...state,
      visibleModal: false,
      Id: null,
    });
  };

  const onFinish = async (Item) =>{
    const data = {
      Id: formRef.getFieldValue("Id"),
      Name: Item.Name,
      Description: Item.Description,
      Status: Item.Status,
      ParentId: 1, // Assuming ParentId is always 1 for categories
    }; 
    const method = formRef.getFieldValue("Id") ? "put" : "post";
    const endpoint = formRef.getFieldValue("Id") ? "category/update" : "category/create";

    const res = await request(endpoint, method, data);
    if (res && !res.error){
      message.success(res.message);
      oncloseModal();
      getList();
    } else if (res?.error) {
      message.error(res.error);
    }
  };

  // Brand Functions
  const onclickBrandAddBtn = () => {
    brandFormRef.resetFields();
    setBrandVisibleModal(true);
  };

  const oncloseBrandModal = () => {
    brandFormRef.resetFields();
    setBrandVisibleModal(false);
  };

  const onBrandFinish = async (values) => {
    const data = {
      id: brandFormRef.getFieldValue("id"),
      label: values.label,
      country: values.country,
      note: values.note,
    };
    const method = brandFormRef.getFieldValue("id") ? "put" : "post";
    const endpoint = brandFormRef.getFieldValue("id") ? "brand/update" : "brand/create";

    const res = await request(endpoint, method, data);
    if (res && !res.error) {
      message.success(res.message);
      oncloseBrandModal();
      getBrands();
    } else if (res?.error) {
      message.error(res.error);
    }
  };

  const onclickBrandEdit = (item) => {
    brandFormRef.setFieldsValue({
      id: item.id,
      label: item.label,
      country: item.country,
      note: item.note,
    });
    setBrandVisibleModal(true);
  };

  const onclickBrandDelete = (item) => {
    Modal.confirm({
      title:"Remove Brand",
      content:"Are you sure you want to delete this brand?",
      okText: "Yes",
      okType: "danger",
      onOk: async () => {
        const res = await request("brand", "delete",{ id: item.id });
        if(res && !res.error){
          message.success(res.message);
          getBrands();
        } else if (res?.error) {
          message.error(res.error);
        }
      },
    });
  };


  return (
    <MainPage loading={loading || brandLoading}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" style={{ marginBottom: 24 }}>
        <TabPane tab={<Title level={4} style={{ margin: 0 }}>Categories</Title>} key="categories">
          <div className="pageHeader">
            <Space>
              <Input.Search 
                onChange={(value)=>
                  setState(p=>({...p,txtSearch:value.target.value}))
                } 
                allowClear
                onSearch={getList}
                placeholder="Search Categories"/>
            </Space>
            <Button type="primary" icon={<MdAdd />} onClick={onclickAddBtn}>
                  New Category
            </Button>
          </div>
          <Modal 
            open={state.visibleModal}
            title={formRef.getFieldValue("Id") ? "Edit Category" : "New Category"} 
            footer={null} onCancel={oncloseModal}>
              <Form form={formRef} layout="vertical" onFinish={onFinish}>
                <Form.Item name="Name" label="Category Name" rules={[{required:true, message: "Please fill category name"}]}> 
                  <Input placeholder="Input Category Name" />
                </Form.Item>
                <Form.Item name="Description" label="Description"> 
                  <Input.TextArea placeholder="Input Description" />
                </Form.Item>
                <Form.Item name="Status" label="Status" rules={[{required:true, message: "Please select status"}]}> 
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

                <Space>
                  <Button onClick={oncloseModal}>Cancel</Button>
                  <Button type="primary" htmlType="submit" >
                    {formRef.getFieldValue("Id") ? "Update" : "Save"}
                  </Button>
                </Space>
              </Form>
          </Modal>
          <Table
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
          />
        </TabPane>
        <TabPane tab={<Title level={4} style={{ margin: 0 }}>Brands</Title>} key="brands">
          <div className="pageHeader">
            <Space>
              <Input.Search 
                onChange={(value)=>
                  setBrandSearchText(value.target.value)
                } 
                allowClear
                onSearch={getBrands}
                placeholder="Search Brands"/>
            </Space>
            <Button type="primary" icon={<MdAdd />} onClick={onclickBrandAddBtn}>
                  New Brand
            </Button>
          </div>
          <Modal 
            open={brandVisibleModal}
            title={brandFormRef.getFieldValue("id") ? "Edit Brand" : "New Brand"} 
            footer={null} onCancel={oncloseBrandModal}>
              <Form form={brandFormRef} layout="vertical" onFinish={onBrandFinish}>
                <Form.Item name="label" label="Brand Name" rules={[{required:true, message: "Please fill brand name"}]}> 
                  <Input placeholder="Input Brand Name" />
                </Form.Item>
                <Form.Item name="country" label="Country" rules={[{required:true, message: "Please fill country"}]}> 
                  <Input placeholder="Input Country" />
                </Form.Item>
                <Form.Item name="note" label="Note"> 
                  <Input.TextArea placeholder="Input Note" />
                </Form.Item>

                <Space>
                  <Button onClick={oncloseBrandModal}>Cancel</Button>
                  <Button type="primary" htmlType="submit" >
                    {brandFormRef.getFieldValue("id") ? "Update" : "Save"}
                  </Button>
                </Space>
              </Form>
          </Modal>
          <Table
            dataSource={brandList}
            columns={[
              {
                key: "No",
                title: "No",
                render: (Item,data,index) => index + 1
              },
              {
                key: "label",
                title: "Name",
                dataIndex: "label",
              },
              {
                key: "country",
                title: "Country",
                dataIndex: "country",
              },
              {
                key: "note",
                title: "Note",
                dataIndex: "note",
              },
              {
                key: "Action",
                title: "Action",
                align: "center",
                render : (Item,data,index) => (
                  <Space>
                    <Button type="primary" icon={<MdEdit/>}onClick={()=>onclickBrandEdit(data,index)}/>
                    <Button type="primary" danger icon={ <MdDelete/>}onClick={()=>onclickBrandDelete(data,index)}/>
                  </Space>

                )
              },
            ]}
          />
        </TabPane>
      </Tabs>
    </MainPage>
  );
}

export default CategoryPage;
