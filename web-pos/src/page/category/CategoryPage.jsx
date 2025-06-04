import React, { useEffect, useState } from "react";
import { request } from "../../util/helper";
import { Space, Table, Tag ,Modal,Input, Select, message, List,Form} from "antd";
import { MdAdd, MdDelete , MdEdit } from "react-icons/md";
import { Button } from 'antd';
import MainPage from "../../component/layout/Mainpage";
import { configStore } from "../../store/configStore";


function CategoryPage() {
  const {config} = configStore
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

  useEffect(() => {
    getList();
  }, []);
  


  const getList = async () => {
    setLoading(true);
    const res = await request("category" , "get");
    setLoading(false);
    if (res) {
      setList(res.list);
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
      title:"Remove",
      content:"Are you sure?",
      okText: "Yes",
      onOk: async () => {
        const res = await request("category", "delete",{
          Id: data.Id,
        });
        if(res && !res.error){
          message.success(res.message);
          const newList = List.filter((Item)=>Item.Id != data.Id);
          setList(newList);
          
        }
      },
      
    });
  };

  const onclickAddBtn = () => {
    setState({
      ...state,
      visibleModal: true,
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
      ParentId: 1,
    }; 
    var method ="post";
    if (formRef.getFieldValue("Id")){
        method ="put";
    }
    const res = await request("category", method, data);
    if (res && !res.error){
      message.success(res.message);
      oncloseModal();
      getList();
    };
  }

  return (
    <MainPage loading ={loading}>
      
      <div className="pageHeader">
              <Space>
                <div>
                  Catagory
                </div>
                <Input.Search 
                  onChange={(value)=>
                    setState(p=>({...p,txtSearch:value.target.value}))
                    } 
                    allowClear
                    onSearch={getList}
                    placeholder="Search"/>
              </Space>
              <Button type="primary" icon={<MdAdd />} onClick={onclickAddBtn}>
                    New
              </Button>
            </div>
      <Modal 
        open={state.visibleModal}
        title={formRef.getFieldValue("Id") ? "Edit Category" : "New Category"} 
        footer={null} onCancel={oncloseModal}>
          <Form form={formRef} layout="vertical" onFinish={onFinish}>
            <Form.Item name="Name" label="Category Name"> 
              <Input placeholder="Input Category Name" />
            </Form.Item>
            <Form.Item name="Description" label="Description"> 
              <Input.TextArea placeholder="Input Description" />
            </Form.Item>
            <Form.Item name="Status" label="Status"> 
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
                <Button>Cancel</Button>
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
    </MainPage>
  );
}

export default CategoryPage;
