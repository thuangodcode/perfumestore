import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Detail from "./pages/Detail"; // ← import trang Detail
import AdminRoute from "./components/AdminRoute";
import AdminSystem from "./pages/AdminSystem";

const { Content } = Layout;

export default function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Navbar />
        <Content style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/perfumes/:id" element={<Detail />} /> {/* ← thêm route Detail */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="*" element={<Navigate to="/" />} />
<Route
  path="/admin/system"
  element={
    <AdminRoute>
      <AdminSystem />
    </AdminRoute>
  }
/>


          </Routes>
        </Content>
        <Footer />
      </Layout>
    </BrowserRouter>
  );
}
