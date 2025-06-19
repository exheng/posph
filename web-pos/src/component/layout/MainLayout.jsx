import React, { useEffect, useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  SettingFilled,
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
  ToolOutlined,
  TeamOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  TagsOutlined,
  UsergroupAddOutlined,
  ShoppingOutlined,
  SettingOutlined,
  LogoutOutlined,
  UploadOutlined,
  LoadingOutlined,
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
  Divider,
  Tooltip,
  Spin,
  Modal,
  Form,
  Upload,
  Image,
} from "antd";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import "./MainLayout.css";
import logo from "../../assets/Shop-logo.png";
import imguser from "../../assets/imguser.jpg";
import { getProfile, setAccessToken, setProfile } from "../../store/profile.store";
import { request, getStoreLogoUrl } from "../../util/helper";
import { configStore } from "../../store/configStore";
import { notificationStore } from "../../store/notification.store";
import NotificationPanel from "./NotificationPanel";
import MessagePanel from "./MessagePanel";
import { MdNotifications, MdMessage, MdPerson, MdTrendingUp } from "react-icons/md";
import { useAuth } from "../../context/AuthContext.jsx";

const { Header, Content, Footer, Sider } = Layout;
const { Text, Title } = Typography;

const getMenuItems = (role) => {
  const allItems = [
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
      key: "customer",
      label: "Customers",
      icon: <CustomerServiceOutlined />,
    },
    {
      key: "order",
      label: "Orders",
      icon: <ShoppingCartOutlined />,
    },
    {
      key: "inventory",
      label: "Inventory",
      icon: <ShopOutlined />,
      children: [
        {
          key: "product",
          label: "Products",
          icon: <TagsOutlined />,
        },
        {
          key: "category",
          label: "Categories",
          icon: <FileOutlined />,
        },
        {
          key: "stock-alerts",
          label: "Stock Alerts",
          icon: <BellOutlined />,
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
        },
        {
          key: "purchase",
          label: "Purchase Orders",
          icon: <FileTextOutlined />,
        },
      ],
    },
    {
      key: "reports",
      label: "Reports & Analytics",
      icon: <BarChartOutlined />,
      children: [
        {
          key: "performance",
          label: "Performance",
          icon: <MdTrendingUp />,
        },
        {
          key: "sales-report",
          label: "Sales Reports",
          icon: <DollarOutlined />,
        },
        {
          key: "inventory-report",
          label: "Inventory Reports",
          icon: <ShopOutlined />,
        },
        {
          key: "purchase-order-report",
          label: "Purchase Order Reports",
          icon: <ShoppingOutlined />,
        },
        {
          key: "performance-report",
          label: "Performance Report",
          icon: <MdTrendingUp />,
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
        },
        {
          key: "role",
          label: "Roles",
          icon: <SafetyOutlined />,
        },
      ],
    },
    {
      key: "setting",
      label: "Settings",
      icon: <SettingOutlined />,
      children: [
        {
          key: "general",
          label: "General Settings",
          icon: <SettingOutlined />,
        },
        {
          key: "payment",
          label: "Payment Methods",
          icon: <DollarOutlined />,
        },
        {
          key: "notification",
          label: "Notifications",
          icon: <BellOutlined />,
        },
      ],
    },
  ];

  // Filter menu items based on role
  if (role?.toLowerCase() === 'cashier') {
    return allItems.filter(item => 
      ['pos', 'customer', 'order', 'inventory'].includes(item.key)
    ).map(item => {
      if (item.key === 'inventory') {
        return {
          ...item,
          children: item.children?.filter(child => 
            ['product', 'stock-alerts'].includes(child.key)
          )
        };
      }
      return item;
    });
  }

  return allItems;
};

const MainLayout = () => {
  const { config, setConfig } = configStore();
  const { notifications } = notificationStore();
  const profile = getProfile();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePic, setProfilePic] = useState(profile?.profile_pic || null);
  const { setUser } = useAuth ? useAuth() : { setUser: () => {} };

  useEffect(() => {
    const initializeApp = async () => {
      await getConfig();
      if (!profile) {
        navigate("/login");
      }
      setConfigLoading(false);
    };
    initializeApp();
  }, []);

  // Add event listener for config updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      getConfig();
    };

    window.addEventListener('configUpdated', handleConfigUpdate);
    return () => {
      window.removeEventListener('configUpdated', handleConfigUpdate);
    };
  }, []);

  const navigate = useNavigate();
  const onClickMenu = (item) => {
    navigate(item.key);
  };

  const getConfig = async () => {
    try {
      const res = await request("config", "get");
      if (res && !res.error) {
        setConfig(res);
      } else {
        console.error("Failed to load config:", res?.details || res?.error);
      }
    } catch (error) {
      console.error("Error loading config:", error);
    }
  };

  const onLogOut = () => {
    setProfile(null);
    setAccessToken(null);
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
      onClick: () => setProfileModalVisible(true)
    },
    {
      key: "settings",
      label: "Account Settings",
      icon: <SettingOutlined />,
      onClick: () => navigate("/settings")
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      danger: true,
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: onLogOut
    },
  ];

  // Handle profile picture upload
  const handleProfilePicUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("profile_pic", file);
    try {
      const response = await request("auth/upload-profile-pic", "post", formData);
      if (response && !response.error) {
        // Fetch latest profile
        const profileRes = await request("auth/profile", "get");
        if (profileRes && profileRes.profile) {
          setProfile(profileRes.profile);
          setUser && setUser(profileRes.profile);
          setProfilePic(profileRes.profile.profile_pic);
        }
        onSuccess(response, file);
      } else {
        onError(new Error(response?.error || "Failed to upload profile picture"));
      }
    } catch (error) {
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
            src={config?.store?.logo ? getStoreLogoUrl(config.store.logo) : logo}
            alt="logo"
            style={{
              height: "40px",
              width: "40px",
              objectFit: "contain",
              marginRight: collapsed ? 0 : "12px",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = logo;
            }}
          />
          {!collapsed && (
            <div>
              <Title level={4} style={{ color: "white", margin: 0, fontSize: "16px" }}>
                {config?.store?.name || "PhoneShop POS"}
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "12px" }}>
                Management System
              </Text>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          defaultSelectedKeys={["/"]}
          mode="inline"
          items={getMenuItems(profile?.role_name)}
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
                {config?.store?.name || "PhoneShop POS"}
              </Title>
              <Text style={{ color: "#8c8c8c", fontSize: "14px" }}>
                Point of Sale Management System
              </Text>
            </div>
          </div>

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

          <Space size="large" align="center">
            <Tooltip title="Notifications">
              <Badge count={notifications.filter(n => !n.read).length} size="small">
                <Button
                  type="text"
                  icon={<MdNotifications />}
                  style={{
                    fontSize: "18px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                  }}
                  onClick={() => {
                    setNotificationVisible(!notificationVisible);
                    setMessageVisible(false);
                  }}
                />
              </Badge>
            </Tooltip>

            <Tooltip title="Messages">
              <Badge count={notifications.filter(n => n.read).length} size="small">
                <Button
                  type="text"
                  icon={<MdMessage />}
                  style={{
                    fontSize: "18px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                  }}
                  onClick={() => {
                    setMessageVisible(!messageVisible);
                    setNotificationVisible(false);
                  }}
                />
              </Badge>
            </Tooltip>

            <Divider type="vertical" style={{ height: "30px" }} />

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
                  items: itemsDropdown
                }}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
                trigger={['click']}
              >
                <Avatar
                  size={40}
                  src={profile?.profile_pic ? `http://localhost:8081/pos_img/${profile.profile_pic}` : imguser}
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

          {notificationVisible && (
            <div
              style={{
                position: 'absolute',
                top: '80px',
                right: '24px',
                zIndex: 1000,
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)'
              }}
            >
              <NotificationPanel />
            </div>
          )}

          {messageVisible && (
            <div
              style={{
                position: 'absolute',
                top: '80px',
                right: '24px',
                zIndex: 1000,
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px 0 rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)'
              }}
            >
              <MessagePanel />
            </div>
          )}
        </div>

        <Content
          style={{
            margin: "24px",
            minHeight: "calc(100vh - 128px)",
          }}
        >
          {configLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Spin size="large" tip="Loading Application..." />
            </div>
          ) : (
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
          )}
        </Content>

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
          PhoneShop POS System ©{new Date().getFullYear()} - All rights reserved
        </div>
      </Layout>
      <Modal
        title="User Profile"
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Avatar
            size={80}
            src={profilePic ? `http://localhost:8081/pos_img/${profilePic}` : imguser}
            style={{ marginBottom: 16 }}
          />
          <Upload
            showUploadList={false}
            customRequest={handleProfilePicUpload}
            accept="image/*"
          >
            <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} loading={uploading} style={{ marginBottom: 16 }}>
              {uploading ? "Uploading..." : "Upload New Picture"}
            </Button>
          </Upload>
        </div>
        <Form layout="vertical">
          <Form.Item label="Name">
            <Input value={profile?.name} disabled />
          </Form.Item>
          <Form.Item label="Username">
            <Input value={profile?.username} disabled />
          </Form.Item>
          <Form.Item label="Role">
            <Input value={profile?.role_name} disabled />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MainLayout;
