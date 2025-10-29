// components/AdminRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user || !user.isAdmin) return <Navigate to="/" />;
  return children;
}
