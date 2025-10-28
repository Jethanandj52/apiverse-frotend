import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import background from "../../assets/images/background.jpg";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/auth/reset-password/${token}`, {
        newPassword: password,
      });

      toast.success(res.data.message || "Password reset successful.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 sm:px-6 md:px-8"
      style={{ backgroundImage: `url("${background}")` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <motion.div
        className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/20 backdrop-blur-lg p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
          Reset Password
        </h1>

        {/* New Password */}
        <label className="block mb-2 text-white text-sm sm:text-base">
          New Password
        </label>
        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/80 text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Confirm Password */}
        <label className="block mb-2 text-white text-sm sm:text-base">
          Confirm Password
        </label>
        <div className="relative mb-6">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-white/80 text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-2.5 text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleReset}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 sm:py-3 rounded-lg transition active:scale-95 text-sm sm:text-base"
        >
          Set New Password
        </button>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
