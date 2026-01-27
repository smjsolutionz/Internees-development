const bcrypt = require("bcryptjs");
const AdminUser = require("../models/adminUser.model");
const User = require("../models/User"); // ✅ Added User model

/* =========================
   CREATE ADMIN USER
   ✅ Prevent duplicate emails across AdminUser & User
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

    // Check duplicate email in AdminUser and User
    const emailExistsInAdmin = await AdminUser.findOne({ email });
    const emailExistsInUser = await User.findOne({ email });

    if (emailExistsInAdmin || emailExistsInUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check duplicate username in AdminUser only
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
   GET USERS WITH FILTERS
   ✅ Include both AdminUser & User
   ❌ Super Admin excluded
========================= */
const adminListUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    const adminFilter = { name: { $ne: "Super Admin" } };
    const userFilter = {};

    // Search filter
    if (search) {
      const regex = { $regex: search, $options: "i" };
      adminFilter.$or = [
        { name: regex },
        { username: regex },
        { email: regex },
      ];
      userFilter.$or = [
        { name: regex },
        { username: regex },
        { email: regex },
      ];
    }

    // Role filter (optional)
    if (role) {
      adminFilter.role = role;
      userFilter.role = role.toLowerCase(); // match user.role enum
    }

    // Fetch from both collections
    const adminUsers = await AdminUser.find(adminFilter).select("-password_hash");
    const customers = await User.find(userFilter).select("-password");

    // Combine results
    const allUsers = [...adminUsers, ...customers];

    res.status(200).json({
      success: true,
      count: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    console.error("adminListUsers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   GET SINGLE USER
   ❌ Super Admin blocked
========================= */
const adminGetUser = async (req, res) => {
  try {
    const { id } = req.params;

    let user = await AdminUser.findOne({
      _id: id,
      name: { $ne: "Super Admin" },
    }).select("-password_hash");

    if (!user) {
      // Try fetching from User collection
      user = await User.findById(id).select("-password");
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or protected",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("adminGetUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   UPDATE USER
   ❌ Super Admin blocked
========================= */
const adminUpdateUser = async (req, res) => {
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

    Object.assign(user, req.body);
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
   ❌ Super Admin blocked
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

    if (user instanceof AdminUser) {
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
  adminUpdateUser,
  adminDeleteUser,
  adminGetUser,
};
