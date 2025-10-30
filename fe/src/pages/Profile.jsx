import { useState, useEffect } from "react";
import { Form, Input, Button, message, Spin, Card } from "antd";
import axios from "axios";

export default function Profile() {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState(false);

  const token = localStorage.getItem("token");
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : null;

  // Fetch profile
  const fetchProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/auth/profile", config);
      if (res.data.success) {
        setProfile(res.data.data);
        form.setFieldsValue({
          name: res.data.data.name || '',
          email: res.data.data.email || ''
        });
      } else {
        message.error("Failed to load profile");
      }
    } catch (err) {
      console.error(err);
      message.error("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (values) => {
    if (!token) {
      message.error("You must login first");
      return;
    }

    try {
      setSaving(true);
      const payload = { name: values.name };

      // Nếu đang đổi mật khẩu
      if (showPasswordFields && currentPasswordValid && values.newPassword) {
        payload.currentPassword = values.currentPassword;
        payload.newPassword = values.newPassword;
      }

      const res = await axios.put("http://localhost:5000/api/auth/profile", payload, config);

      if (res.data.success) {
        message.success("Profile updated successfully!");
        form.resetFields(['currentPassword', 'newPassword']);
        setShowPasswordFields(false);
        setCurrentPasswordValid(false);
        fetchProfile();
      } else {
        message.error(res.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      message.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const checkCurrentPassword = async () => {
    const currentPassword = form.getFieldValue('currentPassword');
    if (!currentPassword) return;

    try {
      // Gọi API login tạm thời để kiểm tra password
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: profile.email,
        password: currentPassword
      });

      if (res.data.success) {
        setCurrentPasswordValid(true);
        message.success("Current password correct. You can enter new password now.");
      }
    } catch (err) {
      console.error(err);
      setCurrentPasswordValid(false);
      message.error("Current password is incorrect");
    }
  };

  if (loading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
  if (!profile) return <p style={{ textAlign: "center", marginTop: 50 }}>No profile data</p>;

  return (
    <div style={{ maxWidth: 500, margin: "50px auto" }}>
      <Card title="My Profile">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input />
          </Form.Item>

          {!showPasswordFields && (
            <Form.Item>
              <Button type="default" onClick={() => setShowPasswordFields(true)}>
                Change Password
              </Button>
            </Form.Item>
          )}

          {showPasswordFields && (
            <>
              <Form.Item label="Current Password" name="currentPassword">
                <Input.Password placeholder="Enter current password" />
              </Form.Item>

              {currentPasswordValid && (
                <Form.Item label="New Password" name="newPassword">
                  <Input.Password placeholder="Enter new password" />
                </Form.Item>
              )}

              <Form.Item>
                {!currentPasswordValid ? (
                  <Button type="primary" onClick={checkCurrentPassword}>
                    Verify Current Password
                  </Button>
                ) : (
                  <Button type="primary" htmlType="submit" loading={saving}>
                    Save Changes
                  </Button>
                )}
              </Form.Item>
            </>
          )}

          {profile.isAdmin && <p style={{ color: "green" }}>You are an Admin</p>}
          {profile.isDeleted && (
            <p style={{ color: "red" }}>Account locked: {profile.deleteReason || "Unknown"}</p>
          )}
        </Form>
      </Card>
    </div>
  );
}
