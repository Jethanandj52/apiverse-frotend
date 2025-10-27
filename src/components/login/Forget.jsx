import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import background from "../../assets/images/background.jpg";
import { toast } from "react-toastify";
import { motion } from "framer-motion";


const Forget = () => {
  const [forgetEmail, setForgetEmail] = useState("");
  const navigate = useNavigate();

  async function forgetPassword() {
    if (forgetEmail === "") {
      toast.warning("Please Enter Email", { autoClose: 2000 });
    } else {
      try {
        const res = await axios.post("/api/auth/forget-password", {
          email: forgetEmail,
        });

        toast.success(res.data.message, { autoClose: 2000 });

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err) {
        toast.error("❌ " + (err.response?.data.message || err.message), {
          autoClose: 2000,
          className: "bg-red-600 text-white font-bold text-sm border border-red-800 shadow-lg",
        });
      }
    }
  }

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex items-center justify-center p-4 sm:p-6 md:p-8"
      style={{ backgroundImage: `url("${background}")` }}
    >
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm px-4">
        <motion.div
         className="bg-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-white border border-white/20"
         initial={{opacity:0,scale:0.3}}
         animate={{opacity:1,scale:1}}
         transition={{duration:1,ease:"easeOut"}}
         >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">🔐 Reset Password</h2>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 mb-4 rounded bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-md"
            onChange={(e) => setForgetEmail(e.target.value)}
          />

          <button
            onClick={forgetPassword}
            className="w-full py-2 rounded bg-blue-800 hover:bg-blue-700 transition-all duration-200 text-white font-semibold"
          >
            Send Reset Link
          </button>

          <div className="text-center text-sm mt-6">
            Back to login? {" "}
            <Link to="/" className="text-blue-300 underline hover:text-blue-100 transition">
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Forget;
