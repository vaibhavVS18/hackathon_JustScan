import React, { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "../../config/axios";
import { UserContext } from "../../context/user.context";
import { FcGoogle } from "react-icons/fc";

const LoginModal = ({ isOpen, onClose, onSignupClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useContext(UserContext);
  //   const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    axios
      .post("/api/users/login", { email, password })
      .then((res) => {
        console.log(res.data.token);
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        // navigate("/");
        onClose();
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        setError(
          err.response?.data ||
          err.response?.data?.errors ||
          "Something went wrong. Please try again."
        );
      })
      .finally(() => setLoading(false));
  };

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
      {/* Modal Container */}
      <div
        className="glass-panel w-full max-w-md rounded-2xl relative flex flex-col shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-in fade-in zoom-in-95 duration-200 border border-white/10 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Login
        </h2>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-5">
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
              type="email"
              id="email"
              placeholder="Enter your email"
              required
              className={`w-full py-3 px-4 rounded-xl bg-black/20 border text-white placeholder-gray-500 text-sm sm:text-base
                            ${error ? "border-red-500/50" : "border-white/10"} focus:outline-none focus:ring-2
                            ${error ? "focus:ring-red-500/50" : "focus:ring-indigo-500/50"} transition-all 
                        `}
            />
          </div>

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
              type="password"
              id="password"
              placeholder="Enter your password"
              required
              className={`w-full py-3 px-4 rounded-xl bg-black/20 border text-white placeholder-gray-500 text-sm sm:text-base
                            ${error ? "border-red-500/50" : "border-white/10"} focus:outline-none focus:ring-2
                            ${error ? "focus:ring-red-500/50" : "focus:ring-indigo-500/50"} transition-all 
                        `}
            />

            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all text-sm sm:text-base ${loading
              ? "bg-white/10 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-indigo-600/30 text-white"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-1 border-white/10" />
          <span className="px-3 text-gray-500 text-sm">or</span>
          <hr className="flex-1 border-white/10" />
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-5 flex items-center justify-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all text-sm sm:text-base"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>
        </div>

        {/* Signup Link */}
        <p className="text-gray-400 mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSignupClick();
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
