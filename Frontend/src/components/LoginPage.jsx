import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      // TODO: API integration - POST /api/auth/login
      alert(
        `Login attempt with:\nEmail: ${formData.email}\nRemember Me: ${formData.rememberMe}`
      );
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
    // TODO: API integration - GET /api/auth/${provider}
    alert(`Redirecting to ${provider} authentication...`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
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

      {/* Login Container */}
      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          {/* <div
            className="inline-block p-1 rounded-full mb-4"
            style={{
              background: "linear-gradient(135deg, #BB8C4B 0%, #BB8C4B 100%)",
            }}
          >
            <div
              className="rounded-full p-4"
              style={{ backgroundColor: "#222227" }}
            >
              <div className="text-4xl">💎</div>
            </div>
          </div> */}
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
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

        {/* Login Card */}
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
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
              className="text-2xl font-bold mb-2"
              style={{ color: "#FFFFFF" }}
            >
              Welcome Back
            </h2>
            <p className="text-sm mb-6" style={{ color: "#999999" }}>
              Sign in to your account
            </p>

            {/* Login Form */}
            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#DDDDDD" }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: "#777777" }}
                  />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg py-3 px-12 focus:outline-none transition-colors"
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
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#DDDDDD" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: "#777777" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg py-3 px-12 focus:outline-none transition-colors"
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
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
                  <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded focus:ring-2 cursor-pointer"
                    style={{
                      accentColor: "#BB8C4B",
                      backgroundColor: "#222227",
                      borderColor: "#777777",
                    }}
                  />
                  <span className="ml-2 text-sm" style={{ color: "#999999" }}>
                    Remember me
                  </span>
                </label>
                <a
                  href="#forgot"
                  className="text-sm transition-colors"
                  style={{ color: "#BB8C4B" }}
                  onMouseEnter={(e) => (e.target.style.color = "#DDDDDD")}
                  onMouseLeave={(e) => (e.target.style.color = "#BB8C4B")}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Forgot password functionality - Navigate to /forgot-password"
                    );
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
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
                Sign In
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
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300"
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
                onClick={() => handleSocialLogin("facebook")}
                className="flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300"
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

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: "#999999" }}>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: "#BB8C4B" }}
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs" style={{ color: "#777777" }}>
          <p>© 2025 Diamond Trim Beauty Studio. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
