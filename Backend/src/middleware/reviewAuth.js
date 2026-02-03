const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminUser = require("../models/adminUser.model");

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    let user = await User.findById(decoded.id);
    if (!user) {
      user = await AdminUser.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err.message);
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

exports.authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
