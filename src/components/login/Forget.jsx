import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import background from "../../assets/images/background.jpg";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Forget = () => {
  const [forgetEmail, setForgetEmail] = useState("");
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  async function forgetPassword() {
    if (forgetEmail === "") {
      toast.warning("Please Enter Email", { autoClose: 2000 });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/auth/forget-password`, {
        email: forgetEmail,
      });

      toast.success(res.data.message, { autoClose: 2000 });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error("❌ " + (err.response?.data.message || err.message), {
        autoClose: 2000,
        className:
          "bg-red-600 text-white font-bold text-sm border border-red-800 shadow-lg",
      });
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4 sm:px-6 md:px-8 relative"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <motion.div
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl 
                   w-full max-w-[420px] sm:max-w-md md:max-w-lg p-6 sm:p-8 text-white"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Title */}
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6">
          🔐 Reset Password
        </h2>

        {/* Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={forgetEmail}
            onChange={(e) => setForgetEmail(e.target.value)}
            className="w-full px-4 py-2 sm:py-3 rounded-lg bg-white/20 text-white 
                       placeholder-gray-300 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        {/* Button */}
        <button
          onClick={forgetPassword}
          className="w-full py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 transition 
                     rounded-lg font-semibold text-sm sm:text-base"
        >
          Send Reset Link
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-white/20" />
          <span className="mx-2 text-white/70 text-xs sm:text-sm">OR</span>
          <hr className="flex-grow border-white/20" />
        </div>

        {/* Back to login */}
        <p className="text-center text-sm sm:text-base">
          Back to login?{" "}
          <Link
            to="/"
            className="text-blue-300 underline hover:text-blue-100 transition"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Forget;
