const express = require("express");
const router = express.Router();
const Collector = require("../models/Collector");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("../middlewares/verifyToken");

// ✅ Lấy thông tin cá nhân
// GET /api/profile
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await Collector.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Cập nhật thông tin cá nhân
// PUT /api/profile/update
router.put("/update", verifyToken, async (req, res) => {
  try {
    const { name, YOB, gender } = req.body;

    const updatedUser = await Collector.findByIdAndUpdate(
      req.user.id,
      { name, YOB, gender },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Đổi mật khẩu
// PUT /api/profile/change-password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await Collector.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Old password is incorrect" });

    if (!newPassword || newPassword.length < 6)
      return res
        .status(400)
        .json({ success: false, message: "New password must be at least 6 characters" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
