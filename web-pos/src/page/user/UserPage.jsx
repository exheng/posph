import React, { useEffect, useState } from 'react';
import { request } from '../../util/helper';
import { Button, Form, Input, message, Modal, Select, Space, Table, Tag } from 'antd';

function UserPage() {
    const [state, setState] = useState({
        list: [],
        role: [],
        loading : false,
        visible : false,
    });
    const [form] = Form.useForm ();
    useEffect (() =>{
        getList();
    },[]);

    const getList=async () =>{
        const res = await request("auth", "get");
        if (res && !res.error) {
            setState((prv)=>({ 
                ...prv,
                list: res.list,
                role: res.role,
            }));
        };
    };

    const clickBtnEdit = (item) =>{
        form.setFieldsValue({
            ...item,
            
        });
        handleOpenModal();
    };
    const clickBtnDelete = (item) => {
        Modal.confirm({
            title: "Delete",
            content: "Are you sure?",
            onOk() {
            return request(`auth/${item.id}`, "delete")
                .then(res => {
                if (res && !res.error) {
                    message.success(res.message);
                    const newList = state.list.filter((item1) => item1.id !== item.id);
                    setState((prv) => ({
                    ...prv,
                    list: newList,
                    }));
                }
                });
            }
        });
    };

    const handleOpenModal = () =>{
        setState((prv)=>({
                ...prv,
                visible:true,
            }));
    };
    const handleCloseModal = () =>{
        setState((prv)=>({
                ...prv,
                visible:false,
            }));
        form.resetFields();
    };

    const onFinish = async (item) =>{
        if (item.password !== item.confirm_password){
            message.warning("Password Not Match !");
            return;
        }
        var data = {
            ...item,
        };
        var method = "post";
        if (form.getFieldValue("id")) {
            method = "put";
        }
        const res = await request("auth/register", method, data);
        if (res && !res.error) {
            message.success(res.message);
            getList();
            handleCloseModal();
        } else{
            message.warning(res.error);
        }
    };


    return (
        <div>
            <div style={{
                display : "flex",
                justifyContent:"space-between",
                paddingBottom: 10,
            }}>
                <div style={{display:"flex", alignItems:"center"}}>
                    <div>User</div>
                    <Input.Search style={{ marginLeft:10}} placeholder="Search"/>
                </div>
                <Button type="primary" onClick={handleOpenModal}>New</Button>
            </div>

            <Modal title={form.getFieldValue("id") ? "Edit User" : "Add User"} open={state.visible} onCancel={handleCloseModal} footer={null}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="Name" rules={[
                        {
                            required : true,
                            message : "Please fill in name."
                        }
                    ]}>
                        <Input placeholder="Name"/>
                    </Form.Item>
                    <Form.Item name="username" label="Email" rules={[
                        {
                            required : true,
                            message : "Please fill in Email."
                        }
                    ]}>
                        <Input placeholder="Email"/>
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[
                        {
                            required : true,
                            message : "Please input password."
                        }
                    ]}>
                        <Input.Password placeholder="password"/>
                    </Form.Item>
                    <Form.Item name="confirm_password" label="Confirm Password" rules={[
                        {
                            required : true,
                            message : "Please confirm your password."
                        }
                    ]}>
                        <Input.Password placeholder="confirm password"/>
                    </Form.Item>
                    <Form.Item name="role_id" label="Role" rules={[
                        {
                            required : true,
                            message : "Please select role."
                        }
                    ]}>
                        <Select 
                            placeholder="Select Role"
                            options={state.role}
                        />
                    </Form.Item>
                    <Form.Item name="is_active" label="Status" rules={[
                        {
                            required : true,
                            message : "Please select status."
                        }
                    ]}>
                        <Select 
                            placeholder="Select Status"
                            options={[
                                {
                                    label:"Active",
                                    value:1,
                                },
                                {
                                    label:"InActive",
                                    value:0,
                                },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item style={{ textAlign:"right"}}>
                        <Space>
                            <Button onClick={handleCloseModal}>Cancel</Button>
                            <Button type="primary" htmlType="submit" >{form.getFieldValue("id") ? "Update" : "Save"}</Button>
                        </Space>
                    </Form.Item>
                </Form> 
            </Modal>

            <Table
                dataSource={state.list}
                columns={[
                    {
                        key: "no",
                        title: "No",
                        render:(value,data,index) =>index + 1,
                    },
                    {
                        key: "name",
                        title: "Name",
                        dataIndex:"name",
                    },
                    {
                        key: "username",
                        title: "Username",
                        dataIndex:"username",
                    },
                    {
                        key: "role_name",
                        title: "Role Name",
                        dataIndex:"role_name",
                    },
                    {
                        key: "is_active",
                        title: "Status",
                        dataIndex: "is_active",
                        render : (value) => 
                            value ? (
                                <Tag color="green">Active</Tag>
                            ) : (
                                <Tag color="red">InActive</Tag>),
                    },
                    {
                        key: "create_by",
                        title: "Create By",
                        dataIndex:"create_by",
                    },
                    {
                        key: "action",
                        title: "Action",
                        align: "center",
                        render: (value, data) => (
                            <Space>
                            <Button onClick={() => clickBtnEdit(data)} type="primary">Edit</Button>
                            <Button onClick={() => clickBtnDelete(data)} danger type="primary">Delete</Button>
                            </Space>
                        )
                    }
                ]}
            />
        </div>
    );
}

export default UserPage;