const jwt = require("jsonwebtoken");
const AdminUser = require("../models/adminUser.model.js");

// Auth middleware to verify JWT and attach user to req
const adminRequireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await AdminUser.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.status !== "ACTIVE")
      return res.status(403).json({ message: "Account inactive" });

    // Attach user info to request
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Optional: only allow ADMIN role for certain routes
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { adminRequireAuth, adminOnly };
