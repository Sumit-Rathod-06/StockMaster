import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Shield, Users, TrendingUp } from "lucide-react";
import BASE_URL from  "../../assets/assests";
import axios from "axios";
import { useNavigate, useLocation  } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/"; // fallback
  const [activeTab, setActiveTab] = useState("Lender");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let url = "";

      if (activeTab.toLowerCase() === "borrower") {
        url = `${BASE_URL}/api/auth/login/borrower`;
      } else if (activeTab.toLowerCase() === "lender") {
        url = `${BASE_URL}/api/auth/login/lender`;
      } else {
        throw new Error("Invalid role");
      }

      // ✅ Axios request
      const response = await axios.post(url, {
        email,
        password,
      });

      // Axios automatically gives you parsed data
      const data = response.data;

      // ✅ Successfully logged in
      console.log("Login successful:", data);

      // Example: save token & redirect
      localStorage.setItem("token", data.token);
      navigate(from, { replace: true });
    } catch (err) {
      // Axios errors are in err.response
      const message = err.response?.data?.message || err.message || "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-indigo-50 px-10">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="bg-indigo-600 p-4 rounded-lg mb-6">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Peer Mint</h1>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Welcome Back to <br /> Your Financial Future
          </h2>
          <p className="text-gray-600 mb-8">
            Log in to manage your loans, track your investment portfolio, and
            continue your journey towards achieving your financial goals with
            confidence and security.
          </p>

          <div className="flex items-center space-x-8 text-gray-700 text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>10k+ Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section (Login Card) */}
      <div className="flex flex-1 justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-md bg-indigo-50 rounded-xl shadow-lg p-6">
          {/* Tabs */}
          <div className="flex justify-between bg-indigo-100 rounded-lg mb-6">
            {["Lender", "Borrower"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                  activeTab === tab
                    ? "bg-white text-indigo-700 shadow"
                    : "text-gray-600 hover:text-indigo-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {activeTab} Login
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Sign in to your account to continue
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-700">
                <input type="checkbox" className="h-4 w-4 text-indigo-600" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-indigo-700 hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-lg font-medium shadow transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <a href="/register" className="text-indigo-700 font-medium hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
