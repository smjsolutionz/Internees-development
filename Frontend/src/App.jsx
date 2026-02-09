import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

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

// Users
import CreateUser from "./pages/admin/CreateUser";
import UpdateUser from "./pages/admin/UpdateUser";

// Appointments
import AllAppointmentsAdmin from "./pages/admin/AllAppointmentsAdmin";
import EnhancedMyAppointments from "./components/MyAppointments";

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
          element={isAuth() ? <Dashboard /> : <Navigate to="/login" replace />}
        />

        {/* Services (User) */}
        <Route path="/services" element={<ServicePage />} />
        <Route path="/servicedetail/:id" element={<ServicesDetailPage />} />

        {/* Services Admin */}
        <Route path="/services-admin" element={<ServicesAdmin />} />
        <Route path="/create-service" element={<CreateService />} />
        <Route path="/update-service/:id" element={<UpdateService />} />
        <Route path="/service-details/:id" element={<ServiceDetailsAdmin />} />

        {/* Packages */}
        <Route path="/packages/:id" element={<PackageDetailPage />} />

        {/* Packages Admin */}
        <Route path="/packages-admin" element={<AllPackagesAdmin />} />
        <Route path="/create-package" element={<CreatePackage />} />
        <Route path="/update-package/:id" element={<UpdatePackage />} />
        <Route path="/package-details/:id" element={<PackageDetails />} />

        {/* Appointments */}
        <Route path="/appointments" element={<AllAppointmentsAdmin />} />
        <Route path="/my-appointments" element={<EnhancedMyAppointments />} />

        {/* Gallery */}
        <Route path="/gallery-admin/add" element={<Addgalleryimage />} />
        <Route path="/gallery-admin" element={<AllGalleryimageAdmin />} />
        <Route path="/gallery/edit/:id" element={<UpdateGalleryAdmin />} />
        <Route path="/cutomergallery" element={<CustomerGallerypage />} />

        {/* Team */}
        <Route path="/admin/team" element={<AllTeam />} />
        <Route path="/admin/team/add" element={<AddTeam />} />
        <Route path="/admin/team/edit/:id" element={<EditTeam />} />

        {/* Users */}
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/edit-user/:id" element={<UpdateUser />} />


        
        {/* Profiles */}
         <Route path="/reception" element={<Reception />} />
       <Route path="/inventory" element={<Inventory />} />
       <Route path="/manager" element={<Manager />} />
       <Route path="/staff" element={<Staff />} />

         <Route
  path="/admin/profile"
  element={
    isAuth()
      ? <ProfilePage />
      : <Navigate to="/login" replace />
  }
/>


        {/* Customer Profile */}
   <Route
  path="/customer/profile"
  element={
    isAuth()
      ? <Profile />   // ← Use the correct imported component
      : <Navigate to="/login" replace />
  }
/>

        {/* Reviews */}
        <Route path="/admin/reviews" element={<AdminReviews />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
