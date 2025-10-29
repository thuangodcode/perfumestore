"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Rate, Button, Modal, Form, Input, notification, Spin } from "antd"
import { ArrowLeftOutlined } from "@ant-design/icons"
import axios from "axios"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import "../perfume.css";

const { TextArea } = Input

export default function Detail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [perfume, setPerfume] = useState(null)
    const [loading, setLoading] = useState(false)
    const [commentModal, setCommentModal] = useState({ visible: false, mode: "add", comment: null })
    const { user, token } = useContext(AuthContext)
    const [form] = Form.useForm()

    const fetchPerfume = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`http://localhost:5000/api/perfumes/${id}`)
            setPerfume(res.data?.data)
        } catch (err) {
            console.error(err)
            notification.error({ message: "Error loading perfume details" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPerfume()
    }, [id])

    if (!perfume && loading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
            </div>
        )
    }

    if (!perfume) return null

    const averageRating = perfume?.comments?.length
        ? perfume.comments.reduce((sum, c) => sum + c.rating, 0) / perfume.comments.length
        : 0

    const hasCommented = user ? perfume.comments?.some((c) => c.author?._id.toString() === user._id.toString()) : false

    const openCommentModal = (mode = "add", comment = null) => {
        setCommentModal({ visible: true, mode, comment })
        if (comment) {
            form.setFieldsValue({ content: comment.content, rating: comment.rating })
        } else {
            form.resetFields()
        }
    }

    const handleCommentSubmit = async () => {
        try {
            const values = await form.validateFields()
            const config = { headers: { Authorization: `Bearer ${token}` } }

            if (commentModal.mode === "add") {
                await axios.post(
                    `http://localhost:5000/api/perfumes/${id}/comments`,
                    { ...values, rating: Number.parseInt(values.rating) },
                    config,
                )
                notification.success({ message: "Review added successfully" })
            } else if (commentModal.mode === "edit") {
                await axios.put(
                    `http://localhost:5000/api/perfumes/${id}/comments/${commentModal.comment._id}`,
                    { ...values, rating: Number.parseInt(values.rating) },
                    config,
                )
                notification.success({ message: "Review updated successfully" })
            }

            setCommentModal({ visible: false, mode: "add", comment: null })
            form.resetFields()
            fetchPerfume()
        } catch (err) {
            console.error(err)
            notification.error({ message: err.response?.data?.message || "An error occurred" })
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } }

            console.log('Deleting comment:', commentId)
            console.log('Current user:', user)
            console.log('Perfume ID:', id)

            await axios.delete(`http://localhost:5000/api/perfumes/${id}/comments/${commentId}`, config)

            notification.success({ message: "Review deleted successfully" })
            fetchPerfume()
        } catch (err) {
            console.error('Delete comment error:', err)
            console.error('Response data:', err.response?.data)
            notification.error({ message: err.response?.data?.message || "An error occurred" })
        }
    }



    return (
        <div className="perfume-detail">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/")} className="back-button">
                Back to Collection
            </Button>

            <div className="detail-container">
                <div className="detail-image-section">
                    <img
                        src={perfume.uri || "https://via.placeholder.com/500x600?text=Perfume"}
                        alt={perfume.perfumeName}
                        className="detail-image"
                    />
                </div>

                <div className="detail-info-section">
                    <h1 className="detail-title">{perfume.perfumeName}</h1>
                    <p className="detail-brand">{perfume.brand?.brandName || "Premium Brand"}</p>

                    <div className="detail-specs">
                        <div className="spec-item">
                            <span className="spec-label">Concentration</span>
                            <span className="spec-value">{perfume.concentration || "N/A"}</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Volume</span>
                            <span className="spec-value">{perfume.volume ? perfume.volume + "ml" : "N/A"}</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">For</span>
                            <span className="spec-value">{perfume.targetAudience || "Unisex"}</span>
                        </div>
                    </div>

                    <p className="detail-price">{perfume.price?.toLocaleString() || "N/A"}₫</p>

                    <p className="detail-description">{perfume.description}</p>

                    {perfume.ingredients && (
                        <div className="detail-ingredients">
                            <h4>Key Ingredients</h4>
                            <p>{perfume.ingredients}</p>
                        </div>
                    )}

                    <div className="detail-rating">
                        <h4>Customer Reviews</h4>
                        <div className="rating-display">
                            <Rate allowHalf disabled value={averageRating} count={3} />
                            <span className="rating-count">
                                ({perfume.comments?.length || 0} {perfume.comments?.length === 1 ? "review" : "reviews"})
                            </span>
                        </div>

                        {user ? (
                            user.isAdmin ? (
                                <p style={{ color: "#888", fontStyle: "italic", marginTop: 8 }}>
                                    Admin cannot add comments
                                </p>
                            ) : !hasCommented ? (
                                <Button type="primary" className="review-button" onClick={() => openCommentModal("add")}>
                                    Leave a Review
                                </Button>
                            ) : null
                        ) : (
                            <p className="login-prompt">Sign in to leave a review</p>
                        )}
                    </div>


                    <div className="reviews-list">
                        {perfume.comments?.map((c) => (
                            <div key={c._id} className="review-item">
                                <div className="review-header">
                                    <div>
                                        <strong className="review-author">{c.author?.name || "Anonymous"}</strong>
                                        <Rate disabled value={c.rating} count={3} className="review-rating" />
                                    </div>

                                    {user && (
                                        <div className="review-actions">
                                            {/* Nút Edit chỉ hiển thị cho tác giả comment */}
                                            {c.author?._id?.toString() === user._id.toString() && (
                                                <Button size="small" onClick={() => openCommentModal("edit", c)}>
                                                    Edit
                                                </Button>
                                            )}
                                            {/* Nút Delete hiển thị cho tác giả hoặc admin */}
                                            {(c.author?._id?.toString() === user._id.toString() || user.isAdmin) && (
                                                <Button size="small" danger onClick={() => handleDeleteComment(c._id)}>
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                </div>
                                <p className="review-content">{c.content}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            <Modal
                title={commentModal.mode === "add" ? "Share Your Experience" : "Edit Your Review"}
                open={commentModal.visible}
                onOk={handleCommentSubmit}
                onCancel={() => setCommentModal({ visible: false, mode: "add", comment: null })}
                className="review-modal"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="rating" label="Rating" rules={[{ required: true, message: "Please select a rating" }]}>
                        <Rate count={3} />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="Your Review"
                        rules={[{ required: true, message: "Please enter your review" }]}
                    >
                        <TextArea rows={4} placeholder="Share your thoughts about this perfume..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
