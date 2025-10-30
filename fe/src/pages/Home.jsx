import { useState, useEffect, useMemo } from "react"
import { Input, Select, Spin, Button } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../perfume.css"

const { Option } = Select

export default function Home() {
  const navigate = useNavigate()
  const [perfumes, setPerfumes] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)

  const [q, setQ] = useState("")
  const [brand, setBrand] = useState(undefined)
  const [gender, setGender] = useState(undefined)
  const [sortPrice, setSortPrice] = useState(undefined)
  const [concentration, setConcentration] = useState(undefined)


  // Fetch all perfumes once
  const fetchPerfumes = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/perfumes")
      const data = res.data?.data || []
      setPerfumes(data)

      // Lấy danh sách brand duy nhất
      setBrands([...new Set(data.map((p) => p.brand?.brandName).filter(Boolean))])
    } catch (err) {
      console.error("Error fetching perfumes:", err)
      setPerfumes([])
      setBrands([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerfumes()
  }, [])

  const concentrations = useMemo(() => {
  return [...new Set(perfumes.map((p) => p.concentration).filter(Boolean))]
}, [perfumes])


  // Filter & sort trên front-end
const filteredPerfumes = useMemo(() => {
  let result = [...perfumes]

  if (q) result = result.filter((p) => p.perfumeName.toLowerCase().includes(q.toLowerCase()))
  if (brand) result = result.filter((p) => p.brand?.brandName === brand)
  if (gender) result = result.filter((p) => p.targetAudience === gender)
  if (concentration) result = result.filter((p) => p.concentration === concentration)

  if (sortPrice) {
    result.sort((a, b) => {
      if (!a.price) return 1
      if (!b.price) return -1
      return sortPrice === "asc" ? a.price - b.price : b.price - a.price
    })
  }

  return result
}, [perfumes, q, brand, gender, concentration, sortPrice])


  return (
    <div className="perfume-home">
      {/* Filters Section */}
      <div className="filters-section" style={{ padding: "1rem 0" }}>
        <div className="filters-container" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Input
            placeholder="Search perfume..."
            prefix={<SearchOutlined />}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 2, minWidth: 200 }}
            allowClear
          />

          <Select
            placeholder="All Brands"
            value={brand}
            onChange={setBrand}
            allowClear
            style={{ flex: 1, minWidth: 150 }}
            popupMatchSelectWidth={false}
          >
            {brands.map((b) => (
              <Option key={b} value={b}>
                {b}
              </Option>
            ))}
          </Select>

          <Select
  placeholder="All Concentrations"
  value={concentration}
  onChange={setConcentration}
  allowClear
  style={{ flex: 1, minWidth: 150 }}
  popupMatchSelectWidth={false}
>
  {concentrations.map((c) => (
    <Option key={c} value={c}>
      {c}
    </Option>
  ))}
</Select>


          <Select
            placeholder="All Genders"
            value={gender}
            onChange={setGender}
            allowClear
            style={{ flex: 1, minWidth: 120 }}
            popupMatchSelectWidth={false}
          >
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
            <Option value="LGBT">LGBT</Option>
          </Select>

          <Select
            placeholder="Sort by Price"
            value={sortPrice}
            onChange={setSortPrice}
            allowClear
            style={{ flex: 1, minWidth: 150 }}
            popupMatchSelectWidth={false}
          >
            <Option value="asc">Low → High</Option>
            <Option value="desc">High → Low</Option>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-section">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : filteredPerfumes.length === 0 ? (
          <div className="empty-state">
            <p>No perfumes found</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredPerfumes.map((p) => (
              <div key={p._id} className="product-card" onClick={() => navigate(`/perfumes/${p._id}`)}>
                <div className="product-image-wrapper">
                  <img
                    src={p.uri || "https://via.placeholder.com/300x400?text=Perfume"}
                    alt={p.perfumeName}
                    className="product-image"
                  />
                  {p.concentration && <div className="concentration-badge">{p.concentration}</div>}
                  <div className="product-overlay">
                    <Button className="view-button">View Details</Button>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{p.perfumeName}</h3>
                  <p className="product-brand">{p.brand?.brandName || "Premium Brand"}</p>
                  <div className="product-meta">
                    <span className="product-gender">{p.targetAudience || "Unisex"}</span>
                  </div>
                  <p className="product-price">{p.price?.toLocaleString() || "N/A"}₫</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
