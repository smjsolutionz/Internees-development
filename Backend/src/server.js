const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
require("./utils/cleanupJobs");
require("./utils/attendanceCron");

const connectDB = require("./config/db");

// 🔹 IMPORT ROUTES
const serviceRoutes = require("./routes/service.routes");
const customerServicesRoutes = require("./routes/customerservices");
const authRoutes = require("./routes/authRoutes");
const galleryRoutes = require("./routes/adminGalleryRoutes");
const CustomerGalleryRoutes = require("./routes/customerGalleryRoutes");
const packageRoutes = require("./routes/packageRoutes");
const adminUsersProfileRoutes = require("./routes/adminUsers.routes");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminProfileRoutes = require("./routes/adminProfile");
const walkInRoutes = require("./routes/receptionist/walkInRoutes");

const adminTeamRoutes = require("./routes/adminTeamRoutes");
const customerTeamRoutes = require("./routes/customerTeamRoutes");
const customerProfileRoutes = require("./routes/customerProfile");
const adminUsersRoutes = require("./routes/adminUserProfile");

const reviewCustomerRoutes = require("./routes/reviewCustomerRoutes");

const receptionistRoutes = require("./routes/receptionist/receptionistRoutes");
const billRoutes = require("./routes/receptionist/billRoutes");

const appointmentRoutes = require("./routes/appointmentRoutes");
const adminappointment = require("./routes/adminAppointmentRoutes");
const reviewAdminRoutes = require("./routes/reviewAdminRoutes");
const staffAppointmentRoutes = require("./routes/staff/staffAppointmentRoutes");
const AttendanceRoutes = require("./routes/attendanceRoutes");

// ✅ Missing imports FIXED
const inventoryRoutes = require("./routes/inventoryRoutes");
const revenueRoutes = require("./routes/revenueRoutes");

const app = express();

// 🔹 Connect DB
connectDB();

// 🔹 Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// 🔹 Static uploads
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads")
);

// 🔹 Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running 🚀",
  });
});

/* =========================
   🔹 ADMIN ROUTES
   ========================= */
app.use("/api/services", serviceRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminUsersRoutes);
app.use("/api/appointment/admin", adminappointment);
app.use("/api/attendance", AttendanceRoutes);
app.use("/api/inventory", inventoryRoutes);

/* =========================
   🔹 CUSTOMER ROUTES
   ========================= */
app.use("/api/customer/services", customerServicesRoutes);

/* =========================
   🔹 AUTH ROUTES
   ========================= */
app.use("/api/auth", authRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/gallery/Customer", CustomerGalleryRoutes);
app.use("/api/customer", customerProfileRoutes);
app.use("/api/admin", adminUsersProfileRoutes);

app.use("/api/admin", adminProfileRoutes);
app.use("/admin", adminTeamRoutes);
app.use("/api/admin/reviews", reviewAdminRoutes);
app.use("/customer", customerTeamRoutes);

app.use("/api/appointment/receptionist", receptionistRoutes);
app.use("/api/receptionist/walkin", walkInRoutes);
app.use("/api/staff/appointments", staffAppointmentRoutes);

app.use("/api/bill", billRoutes);
app.use("/api/admin/revenue", revenueRoutes);

/* =========================
   🔹 GLOBAL ERROR HANDLER (FIXED)
   ========================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

/* =========================
   🔹 SERVER START (FIXED)
   ========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});