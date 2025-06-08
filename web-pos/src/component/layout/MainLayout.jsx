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
  ShoppingCartOutlined,
  ShopOutlined,
  DollarOutlined,
  BankOutlined,
  FileTextOutlined,
  GlobalOutlined,
  SafetyOutlined,
  BellOutlined,
  MailOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { 
  Breadcrumb, 
  Dropdown, 
  Input, 
  Layout, 
  Menu, 
  theme, 
  Avatar, 
  Badge, 
  Space, 
  Typography,
  Button,
  Divider 
} from "antd";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import "./MainLayout.css";
import logo from "../../assets/Shop-logo.png";
import imguser from "../../assets/imguser.jpg";
import { IoIosNotifications } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";
import { getProfile, setAccessToken, setProfile } from "../../store/profile.store";
import { request } from "../../util/helper";
import { configStore } from "../../store/configStore";

const { Header, Content, Footer, Sider } = Layout;
const { Text, Title } = Typography;

// Enhanced menu items with better icons and organization
const items = [
  {
    key: "/",
    label: "Dashboard",
    icon: <PieChartOutlined />,
    children: null,
  },
  {
    key: "pos",
    label: "Point of Sale",
    icon: <ShoppingCartOutlined />,
    children: null,
  },
  {
    key: "customer", // Fixed typo: Costomer -> Customer
    label: "Customers",
    icon: <UserAddOutlined />,
    children: null,
  },
  {
    key: "order",
    label: "Orders",
    icon: <FileTextOutlined />,
    children: null,
  },
  {
    key: "Product",
    label: "Products",
    icon: <ShopOutlined />,
    children: [
      {
        key: "product",
        label: "Product List",
        icon: <ShopOutlined />,
        children: null,
      },
      {
        key: "category",
        label: "Categories",
        icon: <FileOutlined />,
        children: null,
      },
    ],
  },
  {
    key: "purchase",
    label: "Purchasing",
    icon: <BankOutlined />,
    children: [
      {
        key: "supplier",
        label: "Suppliers",
        icon: <TeamOutlined />,
        children: null,
      },
      {
        key: "purchase",
        label: "Purchase Orders",
        icon: <FileTextOutlined />,
        children: null,
      },
      {
        key: "purchase_product",
        label: "Purchase Products",
        icon: <ShopOutlined />,
        children: null,
      },
    ],
  },
  {
    key: "expense", // Fixed typo: expanse -> expense
    label: "Expenses",
    icon: <DollarOutlined />,
    children: [
      {
        key: "expense_type", // Fixed typo
        label: "Expense Types",
        icon: <FileOutlined />,
        children: null,
      },
      {
        key: "expense", // Fixed typo
        label: "Expense Records",
        icon: <DollarOutlined />,
        children: null,
      },
    ],
  },
  {
    key: "employee",
    label: "Employees",
    icon: <TeamOutlined />,
    children: [
      {
        key: "employee",
        label: "Employee List",
        icon: <UserOutlined />,
        children: null,
      },
      {
        key: "payroll",
        label: "Payroll",
        icon: <DollarOutlined />,
        children: null,
      },
    ],
  },
  {
    key: "user",
    label: "User Management",
    icon: <UsergroupAddOutlined />,
    children: [
      {
        key: "user",
        label: "Users",
        icon: <UserOutlined />,
        children: null,
      },
      {
        key: "role",
        label: "Roles",
        icon: <SafetyOutlined />,
        children: null,
      },
      {
        key: "role_permission",
        label: "Permissions",
        icon: <SafetyOutlined />,
        children: null,
      },
    ],
  },
  {
    key: "setting",
    label: "Settings",
    icon: <SettingFilled />,
    children: [
      {
        key: "language",
        label: "Language", // Fixed typo: Langguage -> Language
        icon: <GlobalOutlined />,
        children: null,
      },
      {
        key: "currency",
        label: "Currency",
        icon: <DollarOutlined />,
        children: null,
      },
    ],
  },
];

const MainLayout = () => {
  const { setConfig } = configStore();
  const profile = getProfile();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    getConfig();
    if (!profile) {
      navigate("/login");
    }
  }, []);

  const navigate = useNavigate();
  const onClickMenu = (item) => {
    navigate(item.key);
  };

  const getConfig = async () => {
    const res = await request("config", "get");
    if (res) {
      setConfig(res);
    }
  };

  const onLogOut = () => {
    setProfile();
    setAccessToken();
    navigate("/login");
  };

  if (!profile) {
    return null;
  }

  const itemsDropdown = [
    {
      key: "profile",
      label: "View Profile",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Account Settings",
      icon: <SettingFilled />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      danger: true,
      label: "Logout",
      icon: <SafetyOutlined />,
      onClick: () => onLogOut(),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Enhanced Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: "linear-gradient(180deg, #001529 0%, #002140 100%)",
          boxShadow: "2px 0 8px 0 rgba(29, 35, 41, 0.05)",
        }}
        width={280}
        collapsedWidth={80}
      >
        {/* Logo Section */}
        <div
          style={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 24px",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <img
            src={logo}
            alt="logo"
            style={{
              height: "40px",
              width: "40px",
              objectFit: "contain",
              marginRight: collapsed ? 0 : "12px",
            }}
          />
          {!collapsed && (
            <div>
              <Title level={4} style={{ color: "white", margin: 0, fontSize: "16px" }}>
                PhoneShop POS
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "12px" }}>
                Management System
              </Text>
            </div>
          )}
        </div>

        {/* Enhanced Menu */}
        <Menu
          theme="dark"
          defaultSelectedKeys={["/"]}
          mode="inline"
          items={items}
          onClick={onClickMenu}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "14px",
          }}
          className="custom-menu"
        />
      </Sider>

      <Layout>
        {/* Enhanced Header */}
        <div
          style={{
            background: "linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "80px",
            boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Left Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "18px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            
            <div>
              <Title level={3} style={{ margin: 0, color: "#1890ff", fontSize: "20px" }}>
                Computer & PhoneShop
              </Title>
              <Text style={{ color: "#8c8c8c", fontSize: "14px" }}>
                Point of Sale Management System
              </Text>
            </div>
          </div>

          {/* Center Section - Search */}
          <div style={{ flex: 1, maxWidth: "400px", margin: "0 40px" }}>
            <Input.Search
              placeholder="Search products, orders, customers..."
              size="large"
              style={{
                borderRadius: "8px",
              }}
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            />
          </div>

          {/* Right Section */}
          <Space size="large" align="center">
            {/* Notifications */}
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  fontSize: "18px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                }}
              />
            </Badge>

            {/* Messages */}
            <Badge count={2} size="small">
              <Button
                type="text"
                icon={<MailOutlined />}
                style={{
                  fontSize: "18px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                }}
              />
            </Badge>

            <Divider type="vertical" style={{ height: "30px" }} />

            {/* User Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <Text strong style={{ display: "block", fontSize: "14px" }}>
                  {profile?.name}
                </Text>
                <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                  {profile?.role_name}
                </Text>
              </div>
              
              <Dropdown
                menu={{
                  items: itemsDropdown,
                  onClick: (event) => {
                    if (event.key === "logout") {
                      onLogOut();
                    }
                  },
                }}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
              >
                <Avatar
                  size={40}
                  src={imguser}
                  style={{
                    cursor: "pointer",
                    border: "2px solid #f0f0f0",
                    transition: "all 0.3s ease",
                  }}
                  className="user-avatar-hover"
                />
              </Dropdown>
            </div>
          </Space>
        </div>

        {/* Enhanced Content Area */}
        <Content
          style={{
            margin: "24px",
            minHeight: "calc(100vh - 128px)",
          }}
        >
          <div
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              padding: "24px",
              minHeight: "100%",
              boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
              border: "1px solid #f0f0f0",
            }}
          >
            <Outlet />
          </div>
        </Content>

        {/* Enhanced Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "16px 24px",
            background: "#fafafa",
            borderTop: "1px solid #f0f0f0",
            color: "#8c8c8c",
            fontSize: "14px",
          }}
        >
          PhoneShop POS System for better business management
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;