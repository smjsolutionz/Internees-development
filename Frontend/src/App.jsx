import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoutes";
// Auth
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Admin
import Dashboard from "./pages/admin/Dashboard";
import ProfilePage from "./pages/admin/Profile";
import AdminReviews from "./pages/admin/AdminReviews";

// Customer
import Profile from "./pages/Profile";

// Services
import ServicePage from "./pages/ServicePage";
import ServicesDetailPage from "./pages/ServicesDetailPage";

// Services Admin
import ServicesAdmin from "./pages/admin/AllServicesAdmin";
import CreateService from "./pages/admin/CreateService";
import UpdateService from "./pages/admin/UpdateService";
import ServiceDetailsAdmin from "./pages/admin/ServiceDetail";

// Packages
import PackageDetailPage from "./pages/PackageDetailPage";

// Packages Admin
import AllPackagesAdmin from "./pages/admin/AllPackages";
import CreatePackage from "./pages/admin/CreatePackage";
import UpdatePackage from "./pages/admin/UpdatePackage";
import PackageDetails from "./pages/admin/PackageDetail";

// Gallery
import Addgalleryimage from "./pages/admin/Addgalleryimage";
import AllGalleryimageAdmin from "./pages/admin/AllGalleryimagesAdmin";
import UpdateGalleryAdmin from "./pages/admin/UpdateGalleryAdmin";
import CustomerGallerypage from "./pages/CustomerGallerypage";

// Team
import AllTeam from "./pages/admin/AllTeam";
import AddTeam from "./pages/admin/Addteam";
import EditTeam from "./pages/admin/EditTeam";
import Reception from "./pages/receptionist/reception";
import Inventory from "./pages/inventory/inventory";
import Manager from "./pages/manager/manager";
import Staff from "./pages/staff/staff";
import ReceptionDashboard from "./components/receptionist/Dashboardreceptionist";

// Users
import CreateUser from "./pages/admin/CreateUser";
import UpdateUser from "./pages/admin/UpdateUser";
import ReceptionistAppointments from "./pages/receptionist/Appointmentreceptionist";

// Appointments
import AllAppointmentsAdmin from "./pages/admin/AllAppointmentsAdmin";
import EnhancedMyAppointments from "./components/MyAppointments";
import WalkInAppointmentForm from "./pages/receptionist/Walkinappointment";
import ReceptionistBills from "./pages/receptionist/ReceptionistBills";

import StaffShiftPage from "./pages/staff/StaffShiftPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import MyAttendancePage from "./pages/attendance/MyAttendancePage";
import UpdateServiceAdmin from "./components/admin/UpdateServiceAdmin";
import AddGalleryImage from "./components/admin/AddGalleryImage";
const isAuth = () => !!localStorage.getItem("accessToken");

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
          success: {
            iconTheme: { primary: "#BB8C4B", secondary: "#fff" },
          },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Dashboard */}
       <Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Dashboard />
    </ProtectedRoute>
  }
/>

        {/* Services (User) */}
        <Route
  path="/services"
  element={
    <ProtectedRoute allowedRoles={["customer", "user"]}>
      <ServicePage />
    </ProtectedRoute>
  }
/>
<Route
  path="/servicedetail/:id"
  element={
    <ProtectedRoute allowedRoles={["customer", "user"]}>
      <ServicesDetailPage />
    </ProtectedRoute>
  }
/>

        {/* Services Admin */}
        <Route
  path="/services-admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <ServicesAdmin />
    </ProtectedRoute>
  }
/>

<Route
  path="/create-service"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <CreateService />
    </ProtectedRoute>
  }
/>

<Route
  path="/update-service/:id"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <UpdateService />
    </ProtectedRoute>
  }
/>

<Route
  path="/service-details/:id"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <ServiceDetailsAdmin />
    </ProtectedRoute>
  }
/>

        {/* Packages */}
        <Route
  path="/packages/:id"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <PackageDetailPage />
    </ProtectedRoute>
  }
/>

        {/* Packages Admin */}
        <Route
  path="/create-package"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <CreatePackage />
    </ProtectedRoute>
  }
/>
<Route
  path="/packages-admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AllPackagesAdmin />
    </ProtectedRoute>
  }
/>
<Route
  path="/update-package/:id"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <UpdatePackage />
    </ProtectedRoute>
  }
/>
<Route
  path="/package-details/:id"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <PackageDetails />
    </ProtectedRoute>
  }
/>

        {/* Appointments */}
        <Route
  path="/appointments"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AllAppointmentsAdmin />
    </ProtectedRoute>
  }
/>
<Route
  path="/my-appointments"
  element={
    <ProtectedRoute allowedRoles={["customer", "user"]}>
      <EnhancedMyAppointments />
    </ProtectedRoute>
  }
/>

        {/* Gallery */}
        <Route
  path="/gallery-admin/add"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Addgalleryimage />
    </ProtectedRoute>
  }
/><Route
  path="/gallery-admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AllGalleryimageAdmin />
    </ProtectedRoute>
  }
/><Route
  path="/gallery/edit/:id"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <UpdateGalleryAdmin />
    </ProtectedRoute>
  }
/><Route
  path="/customergallery"
  element={
    <ProtectedRoute allowedRoles={["customer", "user"]}>
      <CustomerGallerypage />
    </ProtectedRoute>
  }
/>

        {/* Team */}
        <Route
  path="/admin/team"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AllTeam />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/team/add"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AddTeam />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/team/edit/:id"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <EditTeam />
    </ProtectedRoute>
  }
/>

{/* Users */}
<Route
  path="/create-user"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <CreateUser />
    </ProtectedRoute>
  }
/>
<Route
  path="/edit-user/:id"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <UpdateUser />
    </ProtectedRoute>
  }
/>


      <Route
  path="/inventory"
  element={
    <ProtectedRoute allowedRoles={["inventory_manager"]}>
      <Inventory />
    </ProtectedRoute>
  }
/>
       <Route
  path="/manager"
  element={
    <ProtectedRoute allowedRoles={["manager"]}>
      <Manager />
    </ProtectedRoute>
  }
/>
      <Route
  path="/staff"
  element={
    <ProtectedRoute allowedRoles={["staff"]}>
      <Staff />
    </ProtectedRoute>
  }
/>

<Route
  path="/staff/tasks"
  element={
    <ProtectedRoute allowedRoles={["staff"]}>
      <StaffShiftPage />
    </ProtectedRoute>
  }
/>
        <Route
  path="/reception"
  element={
    <ProtectedRoute allowedRoles={["receptionist"]}>
      <Reception />
    </ProtectedRoute>
  }
/>

<Route
  path="/receptionist/dashboard"
  element={
    <ProtectedRoute allowedRoles={["receptionist"]}>
      <ReceptionDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/receptionist/appointments"
  element={
    <ProtectedRoute allowedRoles={["receptionist"]}>
      <ReceptionistAppointments />
    </ProtectedRoute>
  }
/>

<Route
  path="/receptionist/walkin"
  element={
    <ProtectedRoute allowedRoles={["receptionist"]}>
      <WalkInAppointmentForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/receptionist/bills"
  element={
    <ProtectedRoute allowedRoles={["receptionist", "admin"]}>
      <ReceptionistBills />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/profile"
  element={
    <ProtectedRoute allowedRoles={["admin", "receptionist"]}>
      <ProfilePage />
    </ProtectedRoute>
  }
/>


        {/* Customer Profile */}
<Route
  path="/customer/profile"
  element={
    <ProtectedRoute allowedRoles={["customer", "user"]}>
      <Profile />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/reviews"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminReviews />
    </ProtectedRoute>
  }
/>
          
          
        {/* Attendance */}
       <Route
  path="/attendance"
  element={
    <ProtectedRoute allowedRoles={["admin", "receptionist"]}>
      <AttendancePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/attendance/my"
  element={
    <ProtectedRoute allowedRoles={["staff", "manager", "receptionist", "inventory_manager"]}>
      <MyAttendancePage />
    </ProtectedRoute>
  }
/>
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
