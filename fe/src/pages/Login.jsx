import { useState, useContext } from "react";
import { Form, Input, Button, Typography, Divider } from "antd";
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, loginWithGoogle } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../index.css";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Đăng nhập bằng Email/Password
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await loginUser(values);
      toast.success(res.data.message);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập bằng Google - Thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      
      toast.success(res.data.message || "Đăng nhập Google thành công!");
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      toast.error(err.response?.data?.message || "Đăng nhập Google thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập bằng Google - Thất bại
  const handleGoogleError = () => {
    toast.error("Đăng nhập Google thất bại. Vui lòng thử lại!");
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

        {/* Google Login Button */}
        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            
          />
        </div>

        <Divider style={{ margin: "24px 0" }}>
          <span style={{ color: "#999", fontSize: "14px" }}>Hoặc</span>
        </Divider>

        {/* Email/Password Login Form */}
        <Form layout="vertical" onFinish={onFinish} className="auth-form">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" }
            ]}
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