import { useState } from "react"
import { Form, Input, Button, Typography, message } from "antd"
import { forgotPassword } from "../api/authApi"
import { Link } from "react-router-dom"
import "../index.css"

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)

const onFinish = async (values) => {
  setLoading(true);
  try {
    await forgotPassword(values);
    message.success("Nếu email tồn tại, hướng dẫn đã được gửi!");
  } catch {
    message.error("Không thể gửi yêu cầu, thử lại sau");
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
            Quên Mật Khẩu
          </Typography.Title>
          <p className="auth-subtitle">Chúng tôi sẽ giúp bạn khôi phục tài khoản</p>
        </div>

        <Form layout="vertical" onFinish={onFinish} className="auth-form">
          <Form.Item name="email" rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}>
            <Input
              placeholder="Nhập email đã đăng ký"
              className="auth-input"
              prefix={<span className="auth-input-icon">✉</span>}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block className="auth-button">
            GỬI YÊU CẦU
          </Button>
        </Form>

        <div className="auth-links">
          <Link to="/login" className="auth-link">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
      <div className="auth-decorative-bottom">✦</div>
    </div>
  )
}
