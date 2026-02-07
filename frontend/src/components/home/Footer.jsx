import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Bell } from "lucide-react";

const Footer = ({ onLoginClick }) => {
  return (
    <footer className="bg-[#050511] text-gray-300 border-t border-white/5">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-16 text-center md:text-left">

        {/* Logo + Tagline */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            JustScan
          </h2>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-400 max-w-sm mx-auto md:mx-0 ">
            Next-generation campus security and identity management platform. Secure, fast, and reliable.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Quick Links</h3>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-blue-400 transition-colors text-gray-400"
              >
                Features
              </button>
            </li>
            <li>
              <button
                onClick={() => document.getElementById('org-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-blue-400 transition-colors text-gray-400"
              >
                Organizations
              </button>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onLoginClick(); }}
                className="hover:text-blue-400 transition-colors text-gray-400"
              >
                Login
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Follow Us</h3>
          <div className="flex justify-center md:justify-start space-x-4 sm:space-x-5 text-gray-400">
            <a href="#" className="hover:text-blue-400 transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
            <a href="#" className="hover:text-blue-400 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-blue-400 transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6 text-center text-xs sm:text-sm text-gray-500 bg-[#050511]">
        © {new Date().getFullYear()} JustScan. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
