/**
 * Role-based authorization middleware
 * Usage: authorize("ADMIN", "MANAGER") - allows ADMIN or MANAGER
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }
    res.status(403).json({ message: "Access denied" });
  };
};

module.exports = { authorize };
