import React from "react";
import { FaPhone, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-5 px-6 absolute bottom-0 border-t ">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* 🔵 APIVerse Info */}
        <div>
          <h1 className="text-blue-400 text-2xl font-bold flex items-center gap-2">
            <span>Apiverse</span>
          </h1>
          <p className="text-sm mt-2">
            Your gateway to the world of APIs. <br />
            Discover, integrate, and innovate.
          </p>
        </div>

        {/* 🔗 Quick Links */}
        <div>
          <h2 className="text-white font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-1 text-sm">
            <li><a href="/home" className="hover:text-blue-400">Home</a></li>
            <li><a href="/api" className="hover:text-blue-400">API</a></li>
            <li><a href="/library" className="hover:text-blue-400">Libraries</a></li>
            <li><a href="/team" className="hover:text-blue-400">Team</a></li>
            <li><a href="/about" className="hover:text-blue-400">About</a></li>
          </ul>
        </div>

        {/* 📚 Resources */}
        <div>
          <h2 className="text-white font-semibold mb-2">Resources</h2>
          <ul className="space-y-1 text-sm">
            <li><a href="/tutorials" className="hover:text-blue-400">Tutorials</a></li>
            <li><a href="/blog" className="hover:text-blue-400">Blog</a></li>
            <li><a href="/support" className="hover:text-blue-400">Support</a></li>
          </ul>
        </div>

        {/* 📞 Contact */}
        <div>
          <h2 className="text-white font-semibold mb-2">Connect With Us</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-blue-400" />
              <a href="mailto:support@apiverse.com" className="hover:text-blue-400">support@apiverse.com</a>
            </li>
            <li className="flex items-center gap-2">
              <FaPhone className="text-blue-400" />
              <a href="tel:+923042507846" className="hover:text-blue-400">+92 304 2507846</a>
            </li>
          </ul>
        </div>
      </div>

      {/* 🔻 Bottom Strip */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center gap-4">
        <span>© 2025 Apiverse. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-blue-400">Privacy Policy</a>
          <a href="/terms" className="hover:text-blue-400">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
