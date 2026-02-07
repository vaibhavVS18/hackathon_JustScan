import React, { useState, useContext, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/user.context";
import axios from "../../config/axios";
import { FcGoogle } from "react-icons/fc";

const RegisterModal = ({ isOpen, onClose, onLoginClick }) => {
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  const { setUser } = useContext(UserContext);
  // const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEmail("");
      setPassword("");
      setOtp("");
      setError("");
      setSuccessMessage("");
      setCountdown(0);
    }
  }, [isOpen]);

  // Step 1: Send OTP
  function sendOTPHandler(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    axios
      .post("/api/users/send-otp", { email })
      .then((res) => {
        setSuccessMessage(res.data.message || "OTP sent successfully!");
        setStep(2);
        setCountdown(60); // 60 seconds countdown
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          "Failed to send OTP. Please try again."
        );
      })
      .finally(() => setLoading(false));
  }

  // Resend OTP
  function resendOTPHandler() {
    if (countdown > 0) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    axios
      .post("/api/users/send-otp", { email })
      .then((res) => {
        setSuccessMessage("OTP resent successfully!");
        setCountdown(60);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
          "Failed to resend OTP. Please try again."
        );
      })
      .finally(() => setLoading(false));
  }

  // Step 2: Complete Registration with OTP
  function submitHandler(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    axios
      .post("/api/users/register", { email, password, otp })
      .then((res) => {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        setSuccessMessage("Registration successful!");
        setTimeout(() => {
          onClose();
        }, 1000);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          err.response?.data ||
          "Registration failed. Please try again."
        );
      })
      .finally(() => setLoading(false));
  }

  // Google OAuth
  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL;
    const redirectPage = window.location.pathname;
    window.location.href = `${backendUrl}/api/auth/google?state=${encodeURIComponent(
      redirectPage
    )}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-md rounded-2xl relative flex flex-col shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-in fade-in zoom-in-95 duration-200 border border-white/10 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Create Account
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 text-sm text-center font-medium">{successMessage}</p>
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={sendOTPHandler} className="space-y-5">
            <div>
              <label
                className="block text-gray-400 mb-2 text-sm font-medium"
                htmlFor="email"
              >
                Email
              </label>
              <input
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                value={email}
                type="email"
                id="email"
                placeholder="Enter your email"
                required
                className={`w-full py-3 px-4 rounded-xl bg-black/20 border text-white placeholder-gray-500 text-sm sm:text-base
                            ${error ? "border-red-500/50" : "border-white/10"} focus:outline-none focus:ring-2
                            ${error ? "focus:ring-red-500/50" : "focus:ring-indigo-500/50"} transition-all 
                        `}
              />
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all text-sm sm:text-base 
              ${loading
                  ? "bg-white/10 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-indigo-600/30 text-white"
                }`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP & Password */}
        {step === 2 && (
          <form onSubmit={submitHandler} className="space-y-5">
            {/* Email Display */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm font-medium">
                Email
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="flex-1 py-3 px-4 rounded-xl bg-black/20 border border-white/10 text-gray-400 text-sm sm:text-base cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-medium whitespace-nowrap transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            {/* OTP Input */}
            <div>
              <label
                className="block text-gray-400 mb-2 text-sm font-medium"
                htmlFor="otp"
              >
                OTP Code
              </label>
              <input
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError("");
                }}
                value={otp}
                type="text"
                id="otp"
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className={`w-full py-3 px-4 rounded-xl bg-black/20 border text-white placeholder-gray-500 text-sm sm:text-base tracking-widest text-center font-bold font-mono
                            ${error ? "border-red-500/50" : "border-white/10"} focus:outline-none focus:ring-2
                            ${error ? "focus:ring-red-500/50" : "focus:ring-indigo-500/50"} transition-all 
                        `}
              />
              <div className="flex justify-between items-center mt-2 px-1">
                <p className="text-xs text-gray-500">Check your email for OTP</p>
                <button
                  type="button"
                  onClick={resendOTPHandler}
                  disabled={countdown > 0 || loading}
                  className={`text-xs font-medium transition-colors ${countdown > 0 || loading
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-indigo-400 hover:text-indigo-300"
                    }`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                className="block text-gray-400 mb-2 text-sm font-medium"
                htmlFor="password"
              >
                Password
              </label>
              <input
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                value={password}
                type="password"
                id="password"
                placeholder="Enter your password"
                required
                className={`w-full py-3 px-4 rounded-xl bg-black/20 border text-white placeholder-gray-500 text-sm sm:text-base
                            ${error ? "border-red-500/50" : "border-white/10"} focus:outline-none focus:ring-2
                            ${error ? "focus:ring-red-500/50" : "focus:ring-indigo-500/50"} transition-all 
                        `}
              />
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all text-sm sm:text-base 
              ${loading
                  ? "bg-white/10 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-indigo-600/30 text-white"
                }`}
            >
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-1 border-white/10" />
          <span className="px-3 text-gray-500 text-sm">or</span>
          <hr className="flex-1 border-white/10" />
        </div>

        {/* Google Signup */}
        <div className="flex justify-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-5 flex items-center justify-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all text-sm sm:text-base"
          >
            <FcGoogle className="text-xl" />
            Sign up with Google
          </button>
        </div>

        {/* Login Redirect */}
        <p className="text-gray-400 mt-6 text-center text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => {
              onClose();
              onLoginClick();
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
