import "antd/dist/reset.css"; // cho AntD v5+
import { message } from "antd";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Cấu hình message toàn cục
message.config({
  top: 100,
  duration: 2,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
