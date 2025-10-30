import { useState, useEffect } from "react"
import {
  Tabs,
  Table,
  Button,
  message,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Layout,
  Menu,
} from "antd"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  BgColorsOutlined,
  TeamOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons"
import axios from "axios"
import "../admin.css"

const { Header, Sider, Content } = Layout

export default function AdminSystem() {
  const [perfumes, setPerfumes] = useState([])
  const [brands, setBrands] = useState([])
  const [collectors, setCollectors] = useState([])
  const [loading, setLoading] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editType, setEditType] = useState("")
  const [editData, setEditData] = useState(null)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [addType, setAddType] = useState("")
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("1")
  const [form] = Form.useForm()

  const token = localStorage.getItem("token")
  const config = { headers: { Authorization: `Bearer ${token}` } }

  const fetchPerfumes = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/admin/dashboard", config)
      setPerfumes(res.data.perfumes || [])
    } catch (err) {
      console.error(err)
      message.error("Error fetching perfumes")
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/brands", config)
      setBrands(res.data.brands || [])
    } catch (err) {
      console.error(err)
      message.error("Error fetching brands")
    }
  }

  const fetchCollectors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/collectors", config)
      setCollectors(res.data.data?.activeCollectors || [])
    } catch (err) {
      console.error(err)
      message.error("Error fetching collectors")
    }
  }

  useEffect(() => {
    fetchPerfumes()
    fetchBrands()
    fetchCollectors()
  }, [])

  useEffect(() => {
    if (editData && editType === "perfume") {
      form.setFieldsValue({
        ...editData,
        brand: editData.brand?._id,
        ingredients: Array.isArray(editData.ingredients) ? editData.ingredients.join(", ") : editData.ingredients,
      })
    }
  }, [editData, editType, form])

  const openEditModal = (type, record) => {
    setEditType(type)
    setEditData(record)
    form.setFieldsValue(record)
    setEditModalVisible(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editType === "perfume") {
        await axios.put(`http://localhost:5000/api/admin/perfumes/${editData._id}`, values, config)
        message.success("Perfume updated successfully")
        fetchPerfumes()
      } else if (editType === "brand") {
        await axios.put(`http://localhost:5000/api/admin/brands/${editData._id}`, values, config)
        message.success("Brand updated successfully")
        fetchBrands()
      }

      setEditModalVisible(false)
      setEditData(null)
      setEditType("")
      form.resetFields()
    } catch (err) {
      console.error(err)
      message.error("Update failed")
    }
  }

  const handleDelete = async (type, id) => {
    try {
      if (type === "perfume") {
        await axios.delete(`http://localhost:5000/api/admin/perfumes/${id}`, config)
        fetchPerfumes()
      } else if (type === "brand") {
        await axios.delete(`http://localhost:5000/api/admin/brands/${id}`, config)
        fetchBrands()
      }
      message.success("Deleted successfully")
    } catch (err) {
      console.error(err)
      message.error("Delete failed")
    }
  }

  const openAddModal = (type) => {
    setAddType(type)
    form.resetFields()
    setAddModalVisible(true)
  }

  const handleAddSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (addType === "perfume") {
        if (values.ingredients && Array.isArray(values.ingredients)) {
          values.ingredients = values.ingredients.join(", ")
        }

        if (values.image) {
          values.uri = values.image
          delete values.image
        }

        await axios.post("http://localhost:5000/api/admin/perfumes", values, config)
        message.success("Perfume added successfully")
        fetchPerfumes()
      } else if (addType === "brand") {
        await axios.post("http://localhost:5000/api/admin/brands", values, config)
        message.success("Brand added successfully")
        fetchBrands()
      }

      setAddModalVisible(false)
      form.resetFields()
    } catch (err) {
      console.error("Add failed:", err.response?.data || err)
      message.error(err.response?.data?.message || "Add failed")
    }
  }

  const perfumeColumns = [
    {
      title: "Perfume Name",
      dataIndex: "perfumeName",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Brand",
      dataIndex: ["brand", "brandName"],
      key: "brand",
      render: (text) => <span className="text-muted-foreground">{text}</span>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (p) => <span className="font-semibold text-accent">{p?.toLocaleString()}₫</span>,
    },
    {
      title: "Concentration",
      dataIndex: "concentration",
      key: "concentration",
      render: (text) => <span className="px-2 py-1 bg-primary/10 text-primary rounded">{text}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal("perfume", record)}
            className="text-blue-500 hover:text-blue-700"
          />
          <Popconfirm
            title="Delete Perfume"
            description="Are you sure to delete this perfume?"
            onConfirm={() => handleDelete("perfume", record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} className="text-red-500 hover:text-red-700" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const brandColumns = [
    {
      title: "Brand Name",
      dataIndex: "brandName",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal("brand", record)}
            className="text-blue-500 hover:text-blue-700"
          />
          <Popconfirm
            title="Delete Brand"
            description="Are you sure to delete this brand?"
            onConfirm={() => handleDelete("brand", record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} className="text-red-500 hover:text-red-700" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const collectorColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-muted-foreground">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "isDeleted",
      key: "status",
      render: (val) => (
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${val ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {val ? "Deleted" : "Active"}
        </span>
      ),
    },
  ]

  const menuItems = [
    {
      key: "1",
      icon: <ShoppingOutlined />,
      label: "Perfumes",
      onClick: () => setActiveTab("1"),
    },
    {
      key: "2",
      icon: <BgColorsOutlined />,
      label: "Brands",
      onClick: () => setActiveTab("2"),
    },
    {
      key: "3",
      icon: <TeamOutlined />,
      label: "Collectors",
      onClick: () => setActiveTab("3"),
    },
  ]

  return (
    <Layout className="admin-layout">
      <Header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="admin-toggle-btn"
            />
            <h1 className="admin-title">Perfume Admin</h1>
          </div>
          {/* <Button
            type="text"
            icon={<LogoutOutlined />}
            className="admin-logout-btn"
            onClick={() => {
              localStorage.removeItem("token")
              window.location.href = "/login"
            }}
          >
            Logout
          </Button> */}
        </div>
      </Header>

      <Layout className="admin-body">
        <Sider trigger={null} collapsible collapsed={collapsed} className="admin-sider" width={250}>
          <Menu mode="inline" selectedKeys={[activeTab]} items={menuItems} className="admin-menu" />
        </Sider>

        <Content className="admin-content">
          <div className="admin-content-wrapper">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="admin-tabs"
              items={[
                {
                  key: "1",
                  label: (
                    <span>
                      <ShoppingOutlined /> Perfumes
                    </span>
                  ),
                  children: (
                    <div className="tab-content">
                      <div className="tab-header">
                        <h2>Manage Perfumes</h2>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => openAddModal("perfume")}
                          className="add-btn"
                        >
                          Add Perfume
                        </Button>
                      </div>
                      <Table
                        dataSource={perfumes}
                        columns={perfumeColumns}
                        rowKey="_id"
                        loading={loading}
                        className="admin-table"
                        pagination={{ pageSize: 10 }}
                      />
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <span>
                      <BgColorsOutlined /> Brands
                    </span>
                  ),
                  children: (
                    <div className="tab-content">
                      <div className="tab-header">
                        <h2>Manage Brands</h2>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => openAddModal("brand")}
                          className="add-btn"
                        >
                          Add Brand
                        </Button>
                      </div>
                      <Table
                        dataSource={brands}
                        columns={brandColumns}
                        rowKey="_id"
                        className="admin-table"
                        pagination={{ pageSize: 10 }}
                      />
                    </div>
                  ),
                },
                {
                  key: "3",
                  label: (
                    <span>
                      <TeamOutlined /> Collectors
                    </span>
                  ),
                  children: (
                    <div className="tab-content">
                      <div className="tab-header">
                        <h2>Active Collectors</h2>
                      </div>
                      <Table
                        dataSource={collectors}
                        columns={collectorColumns}
                        rowKey="_id"
                        className="admin-table"
                        pagination={{ pageSize: 10 }}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Content>
      </Layout>

      <Modal
        open={addModalVisible}
        title={addType === "perfume" ? "Add New Perfume" : "Add New Brand"}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddSubmit}
        className="admin-modal"
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" className="admin-form">
          {addType === "perfume" && (
            <>
              <Form.Item
                label="Perfume Name"
                name="perfumeName"
                rules={[{ required: true, message: "Enter perfume name" }]}
              >
                <Input placeholder="e.g., Eau de Parfum" />
              </Form.Item>

              <Form.Item label="Brand" name="brand" rules={[{ required: true, message: "Select a brand" }]}>
                <Select placeholder="Select brand">
                  {brands.map((b) => (
                    <Select.Option key={b._id} value={b._id}>
                      {b.brandName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Price (₫)" name="price" rules={[{ required: true, message: "Enter price" }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Concentration"
                name="concentration"
                rules={[{ required: true, message: "Enter concentration" }]}
              >
                <Select placeholder="Select concentration">
                  <Select.Option value="EDT">EDT (Eau de Toilette)</Select.Option>
                  <Select.Option value="EDP">EDP (Eau de Parfum)</Select.Option>
                  <Select.Option value="Parfum">Parfum</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Ingredients" name="ingredients">
                <Input placeholder="e.g., Bergamot, Jasmine, Musk" />
              </Form.Item>

              <Form.Item label="Volume (ml)" name="volume" rules={[{ required: true, message: "Enter volume" }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Target Audience"
                name="targetAudience"
                rules={[{ required: true, message: "Select audience" }]}
              >
                <Select placeholder="Select audience">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Unisex">Unisex</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Description" name="description">
                <Input.TextArea rows={3} placeholder="Describe the perfume..." />
              </Form.Item>

              <Form.Item label="Image URL" name="image">
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>
            </>
          )}

          {addType === "brand" && (
            <Form.Item label="Brand Name" name="brandName" rules={[{ required: true, message: "Enter brand name" }]}>
              <Input placeholder="e.g., Chanel, Dior, Guerlain" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        open={editModalVisible}
        title={editType === "perfume" ? "Edit Perfume" : "Edit Brand"}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        className="admin-modal"
        okText="Update"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" className="admin-form">
          {editType === "perfume" && editData && (
            <>
              <Form.Item
                label="Perfume Name"
                name="perfumeName"
                rules={[{ required: true, message: "Enter perfume name" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Brand" name="brand" rules={[{ required: true, message: "Select a brand" }]}>
                <Select placeholder="Select brand">
                  {brands.map((b) => (
                    <Select.Option key={b._id} value={b._id}>
                      {b.brandName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Price (₫)" name="price" rules={[{ required: true, message: "Enter price" }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Concentration"
                name="concentration"
                rules={[{ required: true, message: "Enter concentration" }]}
              >
                <Select placeholder="Select concentration">
                  <Select.Option value="EDT">EDT (Eau de Toilette)</Select.Option>
                  <Select.Option value="EDP">EDP (Eau de Parfum)</Select.Option>
                  <Select.Option value="Parfum">Parfum</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Ingredients" name="ingredients">
                <Input />
              </Form.Item>

              <Form.Item label="Volume (ml)" name="volume" rules={[{ required: true, message: "Enter volume" }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Target Audience"
                name="targetAudience"
                rules={[{ required: true, message: "Select audience" }]}
              >
                <Select placeholder="Select audience">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Unisex">Unisex</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Description" name="description">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item label="Image URL" name="uri">
                <Input />
              </Form.Item>
            </>
          )}

          {editType === "brand" && (
            <Form.Item label="Brand Name" name="brandName" rules={[{ required: true, message: "Enter brand name" }]}>
              <Input />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Layout>
  )
}
