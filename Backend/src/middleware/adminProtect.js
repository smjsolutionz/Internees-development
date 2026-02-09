// middleware/adminProtect.js
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/adminUser.model");

const adminProtect = async (req, res, next) => {
  try {
    // 1️⃣ Get token
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Authentication required. Please login." });

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // 3️⃣ Find user in DB
    const user = await AdminUser.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    if (!["ADMIN", "MANAGER"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account inactive" });
    }

    // 4️⃣ Attach user info
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminProtect;
