import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../../config/axios";
import { UserContext } from "../../context/user.context";
import { User, LogOut, ScanLine } from "lucide-react";

const Navbar = ({ onLoginClick }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post("/api/users/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("portal-session-id");
      localStorage.removeItem("current-org-id");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Logs", path: "/portal/history" },
    { name: "Registry", path: "/portal/students" },
  ];

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-4">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg ring-1 ring-white/10">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300">
            <ScanLine className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            JustScan
          </span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-lg font-semibold text-gray-400 hover:text-white transition-colors">
            Home
          </button>

          <a href="/#features" className="text-lg font-semibold text-gray-400 hover:text-white transition-colors">
            Features
          </a>

          <a href="/#org-section" className="text-lg font-semibold text-gray-400 hover:text-white transition-colors">
            Organizations
          </a>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Profile Circle Only */}
              <button
                onClick={() => navigate('/profile')}
                className="relative group"
              >
                <img
                  src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                  title={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/10 group-hover:border-purple-500/50 transition-colors"
                />
                <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-purple-500/50 transition-all"></div>
              </button>

              {/* Text Logout Button */}

              <button
                onClick={handleLogout}
                className="px-3 sm:px-6 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all text-sm font-medium flex items-center gap-2 group"
                title="Logout"
              >
                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg border border-white/10"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
