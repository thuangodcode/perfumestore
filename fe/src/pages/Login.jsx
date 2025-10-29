import { useState, useContext } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { loginUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../index.css";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // lấy hàm login từ context

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await loginUser(values);
      message.success(res.data.message);

      // Lưu user và token vào AuthContext + localStorage
      login(res.data.user, res.data.token);

      // Chuyển hướng về Home sau login
      navigate("/");
    } catch (err) {
      message.error(err.response?.data?.message || "Login thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-decorative-top">✦</div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✦</div>
          <Typography.Title level={2} className="auth-title">
            Đăng Nhập
          </Typography.Title>
          <p className="auth-subtitle">Khám phá thế giới hương thơm cao cấp</p>
        </div>

        <Form layout="vertical" onFinish={onFinish} className="auth-form">
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input
              placeholder="Email của bạn"
              className="auth-input"
              prefix={<span className="auth-input-icon">✉</span>}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              placeholder="Mật khẩu"
              className="auth-input"
              prefix={<span className="auth-input-icon">🔒</span>}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="auth-button"
          >
            ĐĂNG NHẬP
          </Button>
        </Form>

        <div className="auth-links">
          <Link to="/register" className="auth-link">
            Đăng ký tài khoản mới
          </Link>
          <span className="auth-divider">•</span>
          <Link to="/forgot-password" className="auth-link">
            Quên mật khẩu?
          </Link>
        </div>
      </div>
      <div className="auth-decorative-bottom">✦</div>
    </div>
  );
}
