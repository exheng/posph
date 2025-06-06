import React, { useEffect, useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  SettingFilled,
  SmileOutlined,
  TeamOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Dropdown, Input, Layout, Menu, theme} from "antd";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import "./MainLayout.css";
import logo from "../../assets/Shop-logo.png";
import  imguser from "../../assets/imguser.jpg"
import { IoIosNotifications } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";
import { getProfile, setAccessToken, setProfile } from "../../store/profile.store";
import { request } from "../../util/helper";
import { configStore } from "../../store/configStore";
const { Header, Content, Footer, Sider } = Layout;

const items = [
  {
    key: "/",
    label: "Dashabord",
    icon: <PieChartOutlined />,
    children: null,
  },
  {
    key: "pos",
    label: "POS",
    icon: <PieChartOutlined />,
    children: null,
  },
  {
    key: "Costomer",
    label: "Costomer",
    icon: <UserAddOutlined />,
    children: null,
  },
  {
    key: "order",
    label: "Order",
    icon: <PieChartOutlined />,
    children: null,
  },
  {
    key: "Product",
    label: "Product",
    icon: <PieChartOutlined />,
    children: [
      {
        key: "product",
        label: "List Product",
        icon: <PieChartOutlined />,
        children: null,
      },
      {
        key: "category",
        label: "Category",
        icon: <PieChartOutlined />,
        children: null,
      },
      
    ],
  },

  {
    key: "purchase",
    label: "Purchase",
    icon: <PieChartOutlined />,
    children: [
      {
        key: "supplier",
        label: "Supplier",
        icon: <PieChartOutlined />,
        children: null,
      },
      {
        key: "purchase",
        label: "List Purchase",
        icon: <PieChartOutlined />,
        children: null,
      },
      {
        key: "purchase_product",
        label: "Purchase Product",
        icon: <PieChartOutlined />,
        children: null,
      },
    ],
  },

  {
    key: "expanse",
    label: "Expanse",
    icon: <PieChartOutlined />,
    children: [
      {
        key: "expanse_type",
        label: "Expanse Type",
        icon: <PieChartOutlined />,
        children: null,
      },
      {
        key: "expanse",
        label: "Expanse",
        icon: <PieChartOutlined />,
        children: null,
      },
    ],
  },

  {
    key: "employee",
    label: "Employee",
    icon: <UserOutlined />,
    children: [
      {
        key: "employee",
        label: "Employee",
        icon: <PieChartOutlined />,
        children: null,
      },
      {
        key: "payroll",
        label: "Payroll",
        icon: <PieChartOutlined />,
        children: null,
      },
    ],
  },
   {
    key: "user",
    label: "User",
    icon: <UserOutlined />,
    children: [
      {
        key: "user",
        label: "User",
        icon: <UsergroupAddOutlined />,
        children: null,
      },
      {
        key: "role",
        label: "Role",
        icon: <PieChartOutlined />,
        children: null,
      },
      {
        key: "role_permission",
        label: "Role Permission",
        icon: <PieChartOutlined />,
        children: null,
      },
    ],
  },
  {
    key: "setting",
    label: "Setting",
    icon: <SettingFilled />,
    children: [
      {
        key: "language",
        label: "Langguage",
        icon: <PieChartOutlined />,
        children: null,
      },
      {
        key: "currency",
        label: "Currency",
        icon: <PieChartOutlined />,
        children: null,
      },
      
    ],
  },

];
const MainLayout = () => {
  const {setConfig} = configStore();
  const profile = getProfile();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  useEffect(()=>{
    getConfig();
    if (!profile){
    navigate("/login");
  }
  },[])
 

  const navigate = useNavigate();
  const onClickMenu = (item) => {
    navigate(item.key);
  };

  const getConfig = async () => {
    const res = await request ("config","get");
    if (res){
      setConfig(res);
    }
  };

  const onLogOut = () =>{
    setProfile();
    setAccessToken();
    navigate("/login");
  }
  
  if (!profile){
    return null;
  }
const itemsDropdown = [
  {
    key: '1',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
        Profile
      </a>
    ),
  },
  {
    key: '2',
    label: (
      <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
        Change Password
      </a>
    ),
    icon: <SmileOutlined />,
    disabled: true,
  },
  {
  key: 'logout',
  danger: true,
  label: 'Logout',
  onClick: () => onLogOut(),
  },
];
  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={items}
          onClick={onClickMenu}
        />
      </Sider>
      <Layout>
        <div className="admin-header">
          <div className="admin-header-g1">
            <div>
              <img className="admin-img" src={logo} alt="logo" />
            </div>
            <div>
              <div className="header-title">Pos System</div>
              <div>Cumputer & PhoneShop</div>
            </div>
            <div>
              <Input.Search
                style={{ width: 200, marginLeft: 15, marginTop: 15 }}
                size="laege"
                placeholder="Search"
              />
            </div>
          </div>
          
          <div className="admin-header-g2">            
            <IoIosNotifications className="icon-notif" />
            <MdOutlineMail className="icon-email" /> 
            <div>    
              <div className="name-user">{profile?.name}</div>
              <div>{profile?.role_name}</div>
            </div>
            <Dropdown menu={{ items:itemsDropdown ,
              onClick: (event) => {
                if (event.key == "logout"){
                  onLogOut();
                }
              }
            }}>
              <img className="user-img" src={imguser} alt="logo" />
            </Dropdown>
              
            </div>   
        </div>
        <Content
          style={{
            margin: "10px",
          }}
        >
          <div
            className="main-body"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default MainLayout;
