import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User,
  TrendingUp,
  Shield,
  Users,
  Check,
  X,
} from "lucide-react";
import BASE_URL from "../../assets/assests";
import axios from "axios";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    role: "borrower", // ✅ Added role field (default borrower)
  });

  const [loading, setLoading] = useState(false);

  // OTP states
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Simulated send OTP (replace with API call)
  const sendEmailOtp = () => {
    setEmailOtpSent(true);
    alert("OTP sent to Email!");
  };

  const sendPhoneOtp = () => {
    setPhoneOtpSent(true);
    alert("OTP sent to Phone!");
  };

  // Simulated verify OTP (replace with API call)
  const verifyEmailOtp = () => {
    if (emailOtp === "1234") {
      setEmailVerified(true);
      alert("Email Verified ✅");
    } else {
      alert("Invalid OTP ❌");
    }
  };

  const verifyPhoneOtp = () => {
    if (phoneOtp === "1234") {
      setPhoneVerified(true);
      alert("Phone Verified ✅");
    } else {
      alert("Invalid OTP ❌");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailVerified || !phoneVerified) {
      setError("Please verify both Email and Phone first!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // ✅ Choose endpoint based on selected role
      const endpoint =
        formData.role === "borrower"
          ? `${BASE_URL}/api/auth/register/borrower`
          : `${BASE_URL}/api/auth/register/lender`;

      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Registration Successful 🎉");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
            Start Your Journey <br /> Towards Financial Freedom
          </h2>
          <p className="text-gray-600 mb-8">
            Create your Peer Mint account to explore lending and borrowing
            opportunities, grow your investments, and take the first step toward
            a secure and empowered financial future.
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

      {/* Right Section (Register Card) */}
      <div className="flex flex-1 justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Fill in the details to get started
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Selector ✅ */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="borrower">Borrower</option>
                <option value="lender">Lender</option>
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email + OTP */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={sendEmailOtp}
                  className="px-3 bg-indigo-600 text-white rounded-lg"
                >
                  Send OTP
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`text-sm font-medium flex items-center space-x-1 ${
                    emailVerified ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {emailVerified ? <Check size={16} /> : <X size={16} />}
                  <span>{emailVerified ? "Verified" : "Not Verified"}</span>
                </span>
              </div>

              {emailOtpSent && !emailVerified && (
                <div className="flex space-x-2 mt-2">
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    className="px-3 bg-green-600 text-white rounded-lg"
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>

            {/* Phone + OTP */}
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={sendPhoneOtp}
                  className="px-3 bg-indigo-600 text-white rounded-lg"
                >
                  Send OTP
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`text-sm font-medium flex items-center space-x-1 ${
                    phoneVerified ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {phoneVerified ? <Check size={16} /> : <X size={16} />}
                  <span>{phoneVerified ? "Verified" : "Not Verified"}</span>
                </span>
              </div>

              {phoneOtpSent && !phoneVerified && (
                <div className="flex space-x-2 mt-2">
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={verifyPhoneOtp}
                    className="px-3 bg-green-600 text-white rounded-lg"
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Re-enter Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-lg font-medium shadow disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-indigo-700 font-medium hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
