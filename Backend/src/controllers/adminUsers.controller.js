const bcrypt = require("bcryptjs");
const AdminUser = require("../models/adminUser.model");
const User = require("../models/User");
const AdminAuditLog = require("../models/adminAuditLog.model");

/* =========================
   CREATE ADMIN USER
========================= */
/* =========================
   CREATE USER (ADMIN OR CUSTOMER)
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

    // password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase and special character",
      });
    }

    // check duplicate email
    const emailExistsInAdmin = await AdminUser.findOne({ email });
    const emailExistsInUser = await User.findOne({ email });

    if (emailExistsInAdmin || emailExistsInUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // ===============================
    // CUSTOMER CREATION
    // ===============================

    if (role === "CUSTOMER") {

      const customer = await User.create({
        name,
        username,
        email,
        password,
        role: "CUSTOMER",
        isVerified: true,
      });

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        user: customer,
      });

    }

    // ===============================
    // ADMIN / STAFF CREATION
    // ===============================

    const password_hash = await bcrypt.hash(password, 12);

    const admin = await AdminUser.create({
      name,
      username,
      email,
      password_hash,
      role,
      created_by_admin_id: req.user?.id,
    });

    const adminResponse = admin.toObject();
    delete adminResponse.password_hash;

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      admin: adminResponse,
    });

  } catch (error) {
    console.error("adminCreateUser error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const adminListUsers = async (req, res) => {
  try {
    const { search, role, isVerified } = req.query;

    console.log("📥 Admin List Users - Query params:", {
      search,
      role,
      isVerified,
    });

    const adminFilter = { name: { $ne: "Super Admin" } };
    const userFilter = { isVerified: true };

    // ✅ Handle isVerified filter
    if (isVerified === "false") {
      userFilter.isVerified = false;
    } else if (isVerified === "all") {
      delete userFilter.isVerified;
    }

    // ✅ Handle search filter
    if (search) {
      const regex = { $regex: search, $options: "i" };
      adminFilter.$or = [
        { name: regex },
        { username: regex },
        { email: regex },
      ];
      userFilter.$or = [{ name: regex }, { username: regex }, { email: regex }];
    }

    // ✅ FIX: Handle role filter with proper collection targeting
    let queryAdminUsers = true;
    let queryCustomers = true;

    if (role && role !== "ALL") {
      if (role === "CUSTOMER") {
        // Only query User collection, don't add role filter (all users in User collection are customers)
        queryAdminUsers = false;
        // Don't add userFilter.role = role because User model has CUSTOMER as default
      } else if (
        [
          "ADMIN",
          "MANAGER",
          "INVENTORY_MANAGER",
          "RECEPTIONIST",
          "STAFF",
        ].includes(role)
      ) {
        // Only query AdminUser collection
        queryCustomers = false;
        adminFilter.role = role;
      }
    }

    console.log(
      "🔍 Query AdminUsers:",
      queryAdminUsers,
      "Filter:",
      adminFilter,
    );
    console.log("🔍 Query Customers:", queryCustomers, "Filter:", userFilter);

    // ✅ Conditionally query based on role
    const adminUsers = queryAdminUsers
      ? await AdminUser.find(adminFilter).select("-password_hash")
      : [];

    const customers = queryCustomers
      ? await User.find(userFilter).select(
          "-password -refreshTokens -verificationOTP -verificationOTPExpire -resetPasswordToken -resetPasswordExpire",
        )
      : [];

    console.log(
      `✅ Found ${adminUsers.length} admin users, ${customers.length} customers`,
    );

    const users = [
      ...adminUsers.map((u) => ({
        ...u.toObject(),
        status: u.status,
        userType: "ADMIN",
        isVerified: true,
      })),
      ...customers.map((u) => ({
        ...u.toObject(),
        status: u.isActive ? "ACTIVE" : "INACTIVE",
        userType: "CUSTOMER",
        isVerified: u.isVerified,
      })),
    ];

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ adminListUsers error:", error);
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
        status:
          userType === "CUSTOMER"
            ? user.isActive
              ? "ACTIVE"
              : "INACTIVE"
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
   UPDATE USER
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

    Object.assign(user, rest);

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
