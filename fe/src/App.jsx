import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Detail from "./pages/Detail"; 
import AdminRoute from "./components/AdminRoute";
import AdminSystem from "./pages/AdminSystem";
import Profile from "./pages/Profile";

import { Toaster } from "react-hot-toast";

const { Content } = Layout;

export default function App() {
  // Lấy Google Client ID từ environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Kiểm tra nếu không có Google Client ID
  if (!googleClientId) {
    console.error('⚠️ VITE_GOOGLE_CLIENT_ID is not defined in .env file');
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Layout style={{ minHeight: "100vh" }}>
          <Navbar />

          {/* Toaster hiển thị toast toàn app */}
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            toastOptions={{
              // Styling cho toast
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Content style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/perfumes/:id" element={<Detail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile" element={<Profile />} /> 

              <Route path="/admin/system" element={
                <AdminRoute>
                  <AdminSystem />
                </AdminRoute>
              }/>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Content>
          <Footer />
        </Layout>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}