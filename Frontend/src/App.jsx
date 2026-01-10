import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";
import Home from "./pages/Home";
import Services from "./components/Services";
import ServiceDetails from "./components/ServiceDetails";

export default function App() {
  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Routes content */}
      <div>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/services" element={<Services />} />
            <Route path="/servicedetail/:slug" element={<ServiceDetails />} />
        </Routes>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
