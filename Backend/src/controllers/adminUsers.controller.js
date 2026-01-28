const bcrypt = require("bcryptjs");
const AdminUser = require("../models/adminUser.model");
const User = require("../models/User");

/* =========================
   CREATE ADMIN USER
========================= */
const adminCreateUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (name === "Super Admin") {
      return res.status(403).json({
        success: false,
        message: "Super admin already exists",
      });
    }

    const emailExistsInAdmin = await AdminUser.findOne({ email });
    const emailExistsInUser = await User.findOne({ email });

    if (emailExistsInAdmin || emailExistsInUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const usernameExists = await AdminUser.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const admin = await AdminUser.create({
      name,
      username,
      email,
      password_hash,
      role: role || "ADMIN",
    });

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      admin,
    });
  } catch (error) {
    console.error("adminCreateUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   LIST USERS (Admin + Customers)
========================= */
const adminListUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    const adminFilter = { name: { $ne: "Super Admin" } };
    const userFilter = {};

    if (search) {
      const regex = { $regex: search, $options: "i" };
      adminFilter.$or = [{ name: regex }, { username: regex }, { email: regex }];
      userFilter.$or = [{ name: regex }, { username: regex }, { email: regex }];
    }

    if (role) {
      adminFilter.role = role;
      userFilter.role = role.toLowerCase();
    }

    const adminUsers = await AdminUser.find(adminFilter).select("-password_hash");
    const customers = await User.find(userFilter).select("-password");

    // ✅ Normalize status for frontend
    const users = [
      ...adminUsers.map(u => ({
        ...u.toObject(),
        status: u.status,
        userType: "ADMIN",
      })),
      ...customers.map(u => ({
        ...u.toObject(),
        status: u.isActive ? "ACTIVE" : "INACTIVE",
        userType: "CUSTOMER",
      })),
    ];

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("adminListUsers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   GET SINGLE USER
========================= */
const adminGetUser = async (req, res) => {
  try {
    const { id } = req.params;

    let user = await AdminUser.findOne({
      _id: id,
      name: { $ne: "Super Admin" },
    }).select("-password_hash");

    let userType = "ADMIN";

    if (!user) {
      user = await User.findById(id).select("-password");
      userType = "CUSTOMER";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or protected",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        status: userType === "CUSTOMER"
          ? user.isActive ? "ACTIVE" : "INACTIVE"
          : user.status,
        userType,
      },
    });
  } catch (error) {
    console.error("adminGetUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   UPDATE USER (🔥 FIXED)
========================= */
const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...rest } = req.body;

    let user = await AdminUser.findOne({
      _id: id,
      name: { $ne: "Super Admin" },
    });

    let userType = "ADMIN";

    if (!user) {
      user = await User.findById(id);
      userType = "CUSTOMER";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or protected",
      });
    }

    // Common fields update
    Object.assign(user, rest);

    // ✅ Correct status handling
    if (status) {
      if (userType === "CUSTOMER") {
        user.isActive = status === "ACTIVE";
      } else {
        user.status = status;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("adminUpdateUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   DELETE USER
========================= */
const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    let user = await AdminUser.findOne({
      _id: id,
      name: { $ne: "Super Admin" },
    });

    if (!user) {
      user = await User.findById(id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or protected",
      });
    }

    if (user.constructor.modelName === "AdminUser") {
      await AdminUser.findByIdAndDelete(id);
    } else {
      await User.findByIdAndDelete(id);
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("adminDeleteUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  adminCreateUser,
  adminListUsers,
  adminGetUser,
  adminUpdateUser,
  adminDeleteUser,
};
