// src/api/authApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const loginUser = (data) => axios.post(`${API_URL}/login`, data);
export const registerUser = (data) => axios.post(`${API_URL}/register`, data);
export const forgotPassword = (data) => axios.post(`${API_URL}/forgot-password`, data);
