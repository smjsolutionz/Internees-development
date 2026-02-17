const { verifyAccessToken } = require("../utils/generateToken");
const User = require("../models/adminUser.model");

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select("-password_hash");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (req.user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account is inactive" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    next();
  };
};
