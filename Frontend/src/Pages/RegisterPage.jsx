import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted:", formData);
      // TODO: API integration - POST /api/auth/register
      alert(
        `Registration attempt with:\nName: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}`
      );
    }
  };

  const handleSocialRegister = (provider) => {
    console.log(`Social registration with ${provider}`);
    // TODO: API integration - GET /api/auth/${provider}
    alert(`Redirecting to ${provider} authentication...`);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      style={{
        background: "linear-gradient(135deg, #222227 0%, #303133 100%)",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(187, 140, 75, 0.1) 35px, rgba(187, 140, 75, 0.1) 70px)",
          }}
        ></div>
      </div>

      {/* Register Container */}
      <div className="relative w-full max-w-md my-8">
        {/* Logo & Header */}
        <div className="mb-8 text-center">
          <h1
            className="mb-2 text-3xl font-bold md:text-4xl"
            style={{
              background: "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Diamond Trim
          </h1>
          <p className="text-sm" style={{ color: "#999999" }}>
            Beauty Studio
          </p>
        </div>

        {/* Register Card */}
        <div
          className="overflow-hidden shadow-2xl rounded-2xl"
          style={{
            backgroundColor: "#303133",
            borderWidth: "1px",
            borderColor: "rgba(187, 140, 75, 0.2)",
          }}
        >
          {/* Golden Top Border */}
          <div
            className="h-1"
            style={{
              background:
                "linear-gradient(90deg, #BB8C4B 0%, #DDDDDD 50%, #BB8C4B 100%)",
            }}
          ></div>

          <div className="p-8">
            <h2
              className="mb-2 text-2xl font-bold"
              style={{ color: "#FFFFFF" }}
            >
              Create Account
            </h2>
            <p className="mb-6 text-sm" style={{ color: "#999999" }}>
              Join Diamond Trim Beauty Studio
            </p>

            {/* Register Form */}
            <div className="space-y-4">
              {/* Full Name Input */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "#DDDDDD" }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2"
                    style={{ color: "#777777" }}
                  />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-12 py-3 transition-colors rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: "#222227",
                      borderWidth: "1px",
                      borderColor: errors.fullName ? "#ef4444" : "#777777",
                      color: "#FFFFFF",
                    }}
                    placeholder="John Doe"
                    onFocus={(e) => (e.target.style.borderColor = "#BB8C4B")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = errors.fullName
                        ? "#ef4444"
                        : "#777777")
                    }
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "#DDDDDD" }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2"
                    style={{ color: "#777777" }}
                  />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-12 py-3 transition-colors rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: "#222227",
                      borderWidth: "1px",
                      borderColor: errors.email ? "#ef4444" : "#777777",
                      color: "#FFFFFF",
                    }}
                    placeholder="your@email.com"
                    onFocus={(e) => (e.target.style.borderColor = "#BB8C4B")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = errors.email
                        ? "#ef4444"
                        : "#777777")
                    }
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Input */}
              <div>
                <label
                  htmlFor="phone"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "#DDDDDD" }}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2"
                    style={{ color: "#777777" }}
                  />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-12 py-3 transition-colors rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: "#222227",
                      borderWidth: "1px",
                      borderColor: errors.phone ? "#ef4444" : "#777777",
                      color: "#FFFFFF",
                    }}
                    placeholder="+1 (555) 000-0000"
                    onFocus={(e) => (e.target.style.borderColor = "#BB8C4B")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = errors.phone
                        ? "#ef4444"
                        : "#777777")
                    }
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "#DDDDDD" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2"
                    style={{ color: "#777777" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-12 py-3 transition-colors rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: "#222227",
                      borderWidth: "1px",
                      borderColor: errors.password ? "#ef4444" : "#777777",
                      color: "#FFFFFF",
                    }}
                    placeholder="••••••••"
                    onFocus={(e) => (e.target.style.borderColor = "#BB8C4B")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = errors.password
                        ? "#ef4444"
                        : "#777777")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute transition-colors transform -translate-y-1/2 right-3 top-1/2"
                    style={{ color: "#777777" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#BB8C4B")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#777777")
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-2 text-sm font-medium"
                  style={{ color: "#DDDDDD" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2"
                    style={{ color: "#777777" }}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-12 py-3 transition-colors rounded-lg focus:outline-none"
                    style={{
                      backgroundColor: "#222227",
                      borderWidth: "1px",
                      borderColor: errors.confirmPassword
                        ? "#ef4444"
                        : "#777777",
                      color: "#FFFFFF",
                    }}
                    placeholder="••••••••"
                    onFocus={(e) => (e.target.style.borderColor = "#BB8C4B")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = errors.confirmPassword
                        ? "#ef4444"
                        : "#777777")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute transition-colors transform -translate-y-1/2 right-3 top-1/2"
                    style={{ color: "#777777" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#BB8C4B")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#777777")
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded mt-0.5 focus:ring-2 cursor-pointer"
                    style={{
                      accentColor: "#BB8C4B",
                      backgroundColor: "#222227",
                      borderColor: errors.agreeToTerms ? "#ef4444" : "#777777",
                    }}
                  />
                  <span className="ml-2 text-sm" style={{ color: "#999999" }}>
                    I agree to the{" "}
                    <a
                      href="#terms"
                      className="transition-colors"
                      style={{ color: "#BB8C4B" }}
                      onMouseEnter={(e) => (e.target.style.color = "#DDDDDD")}
                      onMouseLeave={(e) => (e.target.style.color = "#BB8C4B")}
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Navigate to /terms route");
                      }}
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="#privacy"
                      className="transition-colors"
                      style={{ color: "#BB8C4B" }}
                      onMouseEnter={(e) => (e.target.style.color = "#DDDDDD")}
                      onMouseLeave={(e) => (e.target.style.color = "#BB8C4B")}
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Navigate to /privacy route");
                      }}
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)",
                  color: "#222227",
                  boxShadow: "0 10px 25px rgba(187, 140, 75, 0.2)",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background =
                    "linear-gradient(135deg, #DDDDDD 0%, #BB8C4B 100%)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background =
                    "linear-gradient(135deg, #BB8C4B 0%, #DDDDDD 100%)")
                }
              >
                Create Account
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full"
                  style={{ borderTopWidth: "1px", borderColor: "#777777" }}
                ></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className="px-4 text-sm"
                  style={{ backgroundColor: "#303133", color: "#999999" }}
                >
                  Or register with
                </span>
              </div>
            </div>

            {/* Social Register Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialRegister("google")}
                className="flex items-center justify-center gap-2 py-3 transition-all duration-300 rounded-lg"
                style={{
                  backgroundColor: "#222227",
                  borderWidth: "1px",
                  borderColor: "#777777",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#303133";
                  e.currentTarget.style.borderColor = "#BB8C4B";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#222227";
                  e.currentTarget.style.borderColor = "#777777";
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialRegister("facebook")}
                className="flex items-center justify-center gap-2 py-3 transition-all duration-300 rounded-lg"
                style={{
                  backgroundColor: "#222227",
                  borderWidth: "1px",
                  borderColor: "#777777",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#303133";
                  e.currentTarget.style.borderColor = "#BB8C4B";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#222227";
                  e.currentTarget.style.borderColor = "#777777";
                }}
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: "#999999" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: "#BB8C4B" }}
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-center" style={{ color: "#777777" }}>
          <p>© 2025 Diamond Trim Beauty Studio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
