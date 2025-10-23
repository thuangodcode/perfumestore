const express = require("express");
const router = express.Router();
const Collector = require("../models/Collector");
const bcrypt = require("bcryptjs");

// 🧱 Middleware kiểm tra login
function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    req.session.successMessage = "⚠️ Bạn cần đăng nhập trước!";
    return res.redirect("/login");
  }
  next();
}

// 🧭 GET /profile — Hiển thị trang hồ sơ
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = await Collector.findById(req.session.user._id).select("-password");

    if (!user) {
      req.session.destroy();
      return res.redirect("/login");
    }

    const successMessage = req.session.successMessage || null;
    req.session.successMessage = null; // xoá sau khi render

    res.render("profile", {
      title: "Hồ sơ cá nhân",
      user,
      successMessage
    });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin user:", err);
    res.status(500).send("Lỗi server");
  }
});

// 📝 POST /profile/update — Cập nhật thông tin cá nhân
router.post("/update", isAuthenticated, async (req, res) => {
  try {
    const { name, YOB, gender } = req.body;

    // ✅ Cập nhật thông tin trong MongoDB
    await Collector.findByIdAndUpdate(req.session.user._id, {
      name,
      YOB,
      gender,
    });

    // ✅ Lấy lại bản mới để đồng bộ session (chuyển sang plain object)
    const updatedUser = await Collector.findById(req.session.user._id)
      .select("-password")
      .lean();

    // ✅ Cập nhật session user
    req.session.user = updatedUser;

    // ✅ Hiển thị thông báo (toast)
    req.session.successMessage = "✅ Cập nhật thông tin thành công!";
    res.redirect("/profile");
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật thông tin:", err);
    req.session.successMessage = "❌ Có lỗi khi cập nhật thông tin!";
    res.redirect("/profile");
  }
});

// 📝 POST /profile/change-password — Đổi mật khẩu
router.post("/change-password", isAuthenticated, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Collector.findById(req.session.user._id);

    if (!user) {
      req.session.successMessage = "❌ Không tìm thấy người dùng!";
      return res.redirect("/profile");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      req.session.successMessage = "⚠️ Mật khẩu cũ không chính xác!";
      return res.redirect("/profile");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    req.session.successMessage = "🔒 Đổi mật khẩu thành công!";
    res.redirect("/profile");
  } catch (err) {
    console.error("❌ Lỗi đổi mật khẩu:", err);
    req.session.successMessage = "❌ Có lỗi khi đổi mật khẩu!";
    res.redirect("/profile");
  }
});


module.exports = router;
