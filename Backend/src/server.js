const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
require("./utils/cleanupJobs"); // Import cleanup jobs
const connectDB = require("./config/db");

// 🔹 IMPORT ROUTES
const serviceRoutes = require("./routes/service.routes");
const customerServicesRoutes = require("./routes/customerservices");
const authRoutes = require("./routes/authRoutes"); // path to your auth routes file
const galleryRoutes = require("./routes/adminGalleryRoutes");
const CustomerGalleryRoutes = require("./routes/customerGalleryRoutes");
const packageRoutes = require("./routes/packageRoutes");
const adminUsersRoutes = require("./routes/adminUsers.routes");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminProfileRoutes = require("./routes/adminProfile");
const walkInRoutes = require("./routes/receptionist/walkInRoutes");

const adminTeamRoutes = require("./routes/adminTeamRoutes");
const customerTeamRoutes = require("./routes/customerTeamRoutes");
const customerProfileRoutes = require("./routes/customerProfile");

const reviewCustomerRoutes=require("./routes/reviewCustomerRoutes")

const receptionistRoutes = require("./routes/receptionist/receptionistRoutes");


const appointmentRoutes = require("./routes/appointmentRoutes");
const  adminappointment =require("./routes/adminAppointmentRoutes")
const reviewAdminRoutes=require("./routes/reviewAdminRoutes")
const staffAppointmentRoutes = require("./routes/staff/staffAppointmentRoutes");
const AttendanceRoutes = require("./routes/attendanceRoutes");
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
  }),
);

// 🔹 Static uploads (images)
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads"),
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
app.use("/api/services", serviceRoutes); // Services (Admin)
app.use("/api/packages", packageRoutes); // ✅ Packages (Admin)
app.use("/api/admin/auth", adminAuthRoutes); // Admin login
app.use("/api/admin", adminUsersRoutes); // Admin users CRUD
app.use("/api/appointment/admin",adminappointment)
app.use("/api/attendance",AttendanceRoutes)

/* =========================
   🔹 CUSTOMER ROUTES
   ========================= */
app.use("/api/customer/services", customerServicesRoutes);
app.use("/api/customer/reviews", reviewCustomerRoutes); // customer review routes


app.use("/api/appointments", appointmentRoutes);

/* =========================
   🔹 AUTH ROUTES
   ========================= */
app.use("/api/auth", authRoutes);
app.use("/api/gallery", galleryRoutes);

app.use("/api/gallery/Customer", CustomerGalleryRoutes);
app.use("/api/customer", customerProfileRoutes);

app.use("/api/admin", adminProfileRoutes);
app.use("/admin", adminTeamRoutes);
app.use("/api/admin/reviews", reviewAdminRoutes); 
app.use("/customer", customerTeamRoutes);

app.use("/api/appointment/receptionist", receptionistRoutes);
// Prefix all walk-in routes under /api/receptionist/walkin
app.use("/api/receptionist/walkin", walkInRoutes);
app.use("/api/staff/appointments", staffAppointmentRoutes);



// 🔹 Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
