// src/api/authApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Đăng nhập thông thường
export const loginUser = (data) => axios.post(`${API_URL}/login`, data);

// Đăng ký
export const registerUser = (data) => axios.post(`${API_URL}/register`, data);

// Quên mật khẩu
export const forgotPassword = (data) => axios.post(`${API_URL}/forgot-password`, data);

// 🆕 Đăng nhập bằng Google
export const loginWithGoogle = (tokenId) => {
  return axios.post(`${API_URL}/google-login`, { tokenId });
};

// 🆕 Verify token (optional - để check user còn đăng nhập không)
export const verifyToken = (token) => {
  return axios.get(`${API_URL}/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};