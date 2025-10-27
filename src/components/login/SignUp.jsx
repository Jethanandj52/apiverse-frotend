import React, { useRef, useState } from "react";
import axios from "axios";
import showpassword from "../../assets/showpassword.svg";
import hidepassword from "../../assets/hidepassword.svg";
import google from "../../images/google.png";
import linkedin from "../../images/linkedin.png";
import github from "../../images/github.png";
import { Link, useNavigate } from "react-router-dom";
import background from "../../assets/images/background.jpg";
import { toast } from "react-toastify";

import { motion } from "framer-motion";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState("password");
  const show = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
   
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function signupSystem() {
    try {
      await axios.post("/api/auth/signup", formData, { withCredentials: true });
      toast.success("Your Account Has Been Registered", { autoClose: 2000 });
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed", {
        autoClose: 2000,
      });
    }
  }

  const hideShow = () => {
    if (showPassword === "password") {
      setShowPassword("text");
      show.current.src = hidepassword;
    } else {
      setShowPassword("password");
      show.current.src = showpassword;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <motion.div
       className="relative z-10 bg-white/20 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl w-full max-w-md"
       initial={{opacity:0,scale:0.3}}
       animate={{opacity:1,scale:1}}
       transition={{duration:1,ease:"easeOut"}}

       >
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">
          Create Account
        </h2>

        {[{ name: "firstName", placeholder: "First Name" }, { name: "lastName", placeholder: "Last Name" }, { name: "email", placeholder: "Email Address", type: "email" }].map(({ name, placeholder, type = "text" }) => (
          <div key={name} className="mb-4">
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              value={formData[name]}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div className="mb-4 relative">
          <input
            type={showPassword}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 pr-10 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <img
            src={showpassword}
            alt="toggle password"
            onClick={hideShow}
            ref={show}
            className="absolute top-2 right-3 w-6 cursor-pointer"
          />
        </div>

        

        <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-blue-200 mb-4 gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-blue-500" />
            Remember Me
          </label>
          <span>
            Already have an account? <Link to="/" className="underline">Sign In</Link>
          </span>
        </div>

        <button
          onClick={signupSystem}
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Sign Up
        </button>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-white/30" />
          <span className="mx-2 text-white text-sm">OR</span>
          <hr className="flex-grow border-t border-white/30" />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button className="flex items-center justify-center gap-2 border border-white/30 text-white px-4 py-2 rounded hover:bg-white/10">
            <img src={google} alt="google" className="w-5" /> Google
          </button>
          <button className="flex items-center justify-center gap-2 border border-white/30 text-white px-4 py-2 rounded hover:bg-white/10">
            <img src={linkedin} alt="linkedin" className="w-5" /> Linkedin
          </button>
          <button className="flex items-center justify-center gap-2 border border-white/30 text-white px-4 py-2 rounded hover:bg-white/10">
            <img src={github} alt="github" className="w-5" /> Github
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
