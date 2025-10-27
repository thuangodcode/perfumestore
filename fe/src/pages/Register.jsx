import { useState } from "react"
import { Form, Input, Button, Typography, message } from "antd"
import { registerUser } from "../api/authApi"
import { useNavigate, Link } from "react-router-dom"
import "../index.css"

export default function Register() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await registerUser(values);
      message.success("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err) {
      message.error(err.response?.data?.message || "Đăng ký thất bại!");
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
            Đăng Ký
          </Typography.Title>
          <p className="auth-subtitle">Tham gia cộng đồng yêu thích hương thơm</p>
        </div>

        <Form layout="vertical" onFinish={onFinish} className="auth-form">
          <Form.Item name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input
              placeholder="Họ và tên"
              className="auth-input"
              prefix={<span className="auth-input-icon">👤</span>}
            />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}>
            <Input
              placeholder="Email của bạn"
              className="auth-input"
              prefix={<span className="auth-input-icon">✉</span>}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
            <Input.Password
              placeholder="Mật khẩu"
              className="auth-input"
              prefix={<span className="auth-input-icon">🔒</span>}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block className="auth-button">
            ĐĂNG KÝ
          </Button>
        </Form>

        <div className="auth-links">
          <span>Đã có tài khoản?</span>
          <Link to="/login" className="auth-link">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
      <div className="auth-decorative-bottom">✦</div>
    </div>
  )
}
