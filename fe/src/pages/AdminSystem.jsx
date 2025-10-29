"use client"

import { useState, useEffect } from "react";
import { Tabs, Table, Button, message, Space, Popconfirm } from "antd";
import axios from "axios";

export default function AdminSystem() {
  const [perfumes, setPerfumes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem("token")); // assuming token is stored in localStorage

  const config = { headers: { Authorization: `Bearer ${token}` } };

  // -------------------- Fetch Perfumes --------------------
  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/dashboard", config);
      setPerfumes(res.data.perfumes || []);
    } catch (err) {
      console.error(err);
      message.error("Error fetching perfumes");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Fetch Brands --------------------
  const fetchBrands = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/", config);
      setBrands(res.data.brands || []);
    } catch (err) {
      console.error(err);
      message.error("Error fetching brands");
    }
  };

  // -------------------- Fetch Collectors --------------------
  const fetchCollectors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/", config);
      setCollectors(res.data.data?.activeCollectors || []);
    } catch (err) {
      console.error(err);
      message.error("Error fetching collectors");
    }
  };

  useEffect(() => {
    fetchPerfumes();
    fetchBrands();
    fetchCollectors();
  }, []);

  // -------------------- Table Columns --------------------
  const perfumeColumns = [
    { title: "Name", dataIndex: "perfumeName", key: "name" },
    { title: "Brand", dataIndex: ["brand", "brandName"], key: "brand" },
    { title: "Price", dataIndex: "price", key: "price", render: (p) => `${p?.toLocaleString()}₫` },
    { title: "Actions", key: "actions", render: (_, record) => (
      <Space>
        <Button size="small" onClick={() => message.info(`Edit perfume ${record._id}`)}>Edit</Button>
        <Popconfirm
          title="Are you sure to delete?"
          onConfirm={async () => {
            try {
              await axios.delete(`http://localhost:5000/api/admin/${record._id}`, config);
              message.success("Deleted successfully");
              fetchPerfumes();
            } catch (err) {
              message.error("Delete failed");
            }
          }}
        >
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  const brandColumns = [
    { title: "Brand Name", dataIndex: "brandName", key: "name" },
    { title: "Actions", key: "actions", render: (_, record) => (
      <Space>
        <Button size="small" onClick={() => message.info(`Edit brand ${record._id}`)}>Edit</Button>
        <Popconfirm
          title="Are you sure to delete?"
          onConfirm={async () => {
            try {
              await axios.delete(`http://localhost:5000/api/admin/${record._id}`, config);
              message.success("Deleted successfully");
              fetchBrands();
            } catch (err) {
              message.error("Delete failed");
            }
          }}
        >
          <Button size="small" danger>Delete</Button>
        </Popconfirm>
      </Space>
    )}
  ];

  const collectorColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Status", dataIndex: "isDeleted", key: "status", render: (val) => val ? "Banned" : "Active" },
    { title: "Actions", key: "actions", render: (_, record) => (
      <Space>
        {record.isDeleted ? (
          <Button size="small" onClick={async () => {
            try {
              await axios.patch(`http://localhost:5000/api/admin/${record._id}/restore`, {}, config);
              message.success("Collector restored");
              fetchCollectors();
            } catch (err) {
              message.error("Restore failed");
            }
          }}>Restore</Button>
        ) : (
          <Popconfirm
            title="Ban this collector?"
            onConfirm={async () => {
              try {
                await axios.patch(`http://localhost:5000/api/admin/${record._id}/ban`, {}, config);
                message.success("Collector banned");
                fetchCollectors();
              } catch (err) {
                message.error("Ban failed");
              }
            }}
          >
            <Button size="small" danger>Ban</Button>
          </Popconfirm>
        )}
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin System Dashboard</h2>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Perfumes" key="1">
          <Table dataSource={perfumes} columns={perfumeColumns} rowKey="_id" loading={loading} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Brands" key="2">
          <Table dataSource={brands} columns={brandColumns} rowKey="_id" />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Collectors" key="3">
          <Table dataSource={collectors} columns={collectorColumns} rowKey="_id" />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
