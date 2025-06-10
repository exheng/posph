import { Space, Table, Tag ,Modal,Input, Select, message, List,Form,Button} from "antd";
import React, { useEffect, useState } from 'react'
import { MdAdd, MdDelete , MdEdit } from "react-icons/md";
import { request } from '../../util/helper';
import MainPage from '../../component/layout/Mainpage';



function SupplierPage() {
    const [form] = Form.useForm();
    const [state,setState] = useState({
        list:[],
        visible : false,
        loading: false,
        txtSearch: "",
    });
    useEffect(() =>{
        getList();
    }, []);
    const getList = async () => {
      setState((p) =>({
          ...p,
          loading : true,
        }));
      const res = await request("supplier?txtSearch="+state.txtSearch, "get");
      if (res && !res.error){
        setState((p) =>({
          ...p,
          list:res.list,
          loading : false,
        }));
      }
    };
    const openModel =() =>{
      setState(p=>({
        ...p,
        visible:true,
      }))
    }
    const closeModel =() =>{
      setState(p=>({
        ...p,
        visible:false,
      }))
      form.resetFields();
    }
    const onFinish = async(items) =>{
      const method = form.getFieldValue("id") ? "put" : "post";
      const endpoint = form.getFieldValue("id") ? "supplier/update" : "supplier/create";
      var params = {
        ...items,
        id : form.getFieldValue("id")
      }
      const res   = await request(endpoint, method, params);
      if (res && !res.error){
        getList();
        closeModel();
        message.success(res.message);
      }
    };
    const onclickEdit = (items) =>{
      form.setFieldsValue({
        ...items,
        id: items.id
      });
      openModel();
    };

    const onclickdelete = (items) => {
        Modal.confirm({
          title:"Remove",
          content:"Are you sure?",
          okText: "Yes",
          onOk: async () => {
          setState((p) =>({
          ...p,
          loading : true,
          }));   
          const res   = await request("supplier", "delete", {id:items.id});
            if (res && !res.error){
              const newList = state.list.filter((item) => item.id !== items.id);
              setState((p) =>({
              ...p,
              list : newList,
              loading : false,
              }));
              message.success(res.message);
            }
          },
        });
      };
  

 return (
    <MainPage loading={state.loading}>

      <div className="pageHeader">
        <Space>
          <div>
            Supplier
          </div>
          <Input.Search 
            onChange={(value)=>
              setState(p=>({...p,txtSearch:value.target.value}))
              } 
              allowClear
              onSearch={getList}
              placeholder="Search"/>
        </Space>
        <Button type="primary" icon={<MdAdd />} onClick={openModel}>
              New
        </Button>
      </div>

      <Modal 
        open={state.visible}
        title={form.getFieldValue("id") ? "Edit Supplier" : "New Supplier"}
        onCancel={closeModel}
        footer={null}
        >
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="name" label="Name" rules={[
              {
                required : true,
                message : "Please fill in name."
              }
            ]}>
              <Input placeholder="Name"/>
            </Form.Item>
            <Form.Item name="code" label="Code" rules={[
              {
                required : true,
                message : "Please fill in code."
              }
            ]}>
              <Input placeholder="code"/>
            </Form.Item> 
            <Form.Item name="tel" label="Phone number" rules={[
              {
                required : true,
                message : "Please fill in Phone number."
              }
            ]}>
              <Input placeholder="Phone number"/>
            </Form.Item> 
            <Form.Item name="email" label="Email" rules={[
              {
                required : true,
                message : "Please fill in Email."
              }
            ]}>
              <Input placeholder="Email"/>
            </Form.Item> 
            <Form.Item name="address" label="Address" rules={[
              {
                required : true,
                message : "Please fill in Address."
              }
            ]}>
              <Input placeholder="Address"/>
            </Form.Item> 
            <Form.Item name="website" label="Website">
              <Input placeholder="Website"/>
            </Form.Item>  
            <Form.Item name="note" label="Remark">
              <Input.TextArea placeholder="Remark"/>
            </Form.Item>  
            <Form.Item>       
              <Space>
                <Button>Cancel</Button>
                <Button type="primary" htmlType="submit" >
                  Save
                </Button>
              </Space>
            </Form.Item>  
            </Form>
      </Modal>

      <Table
        dataSource={state.list}
        columns={[
          {
            key: "name",
            title: "Name",
            dataIndex: "name",
          },
          {
            key: "code",
            title: "Code",
            dataIndex: "code",
          },
          {
            key: "tel",
            title: "Phone Number",
            dataIndex: "tel",
          },
          {
            key: "email",
            title: "Email",
            dataIndex: "email",
          },
          {
            key: "address",
            title: "Address",
            dataIndex: "address",
          },
          {
            key: "website",
            title: "Website",
            dataIndex: "website",
          },
          {
            key: "note",
            title: "Remark",
            dataIndex: "note",
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
    </MainPage>
  );
}
export default SupplierPage;