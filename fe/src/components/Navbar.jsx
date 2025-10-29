import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, Menu, Button, Dropdown, Avatar, Typography, message, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext.jsx";

const { Header } = Layout;
const { Text } = Typography;

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
      message.success("Đăng xuất thành công!");
      navigate("/");
    } catch (err) {
      message.error("Đăng xuất thất bại!");
    }
  };

const menu = {
  items: [
    ...(user?.isAdmin
      ? [
          {
            key: "system",
            label: "System",
            onClick: () => navigate("/admin/system"),
          },
        ]
      : []),
    {
      key: "logout",
      label: "Logout",
      onClick: handleLogout,
    },
  ],
};


  return (
    <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "bold" }}>
        <Link to="/" style={{ color: "#fff" }}>Perfume Store</Link>
      </div>

      <div>
        {!user ? (
          <>
            <Link to="/login">
              <Button type="primary" style={{ marginRight: 10 }}>
                Đăng Nhập
              </Button>
            </Link>
            <Link to="/register">
              <Button>Đăng Ký</Button>
            </Link>
          </>
        ) : (
          <Space>
            {/* Nút System chỉ hiển thị cho admin */}
            {user.isAdmin && (
              <Button type="default" onClick={() => navigate("/admin/system")}>
                System
              </Button>
            )}

            <Dropdown menu={menu} placement="bottomRight">
              <div style={{ cursor: "pointer", display: "flex", alignItems: "center", color: "#fff" }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                <Text style={{ color: "#fff" }}>{user.name}</Text>
              </div>
            </Dropdown>
          </Space>
        )}
      </div>
    </Header>
  );
}
