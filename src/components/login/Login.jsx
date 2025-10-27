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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordType, setShowPasswordType] = useState("password");
  const [showWelcome, setShowWelcome] = useState(false);
  const show = useRef(null);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
        
      );
 
 

      // toast.success("Login Successful!", { autoClose: 1000 });

      const emailFromRes = res.data.email || res.data.user?.email;
      localStorage.setItem("firstName", res.data.firstName || res.data.user?.firstName);
      localStorage.setItem("lastName", res.data.lastName || res.data.user?.lastName);
      localStorage.setItem("email", emailFromRes);
      localStorage.setItem("token", res.data.token || res.data.user?.token);
  
      localStorage.setItem("userId", res.data.id || res.data.user?._id);
      localStorage.setItem("isLoggedIn", "true");

      setShowWelcome(true);

      setTimeout(() => {
        if (emailFromRes === "admin@gmail.com") {
          navigate("/Dashboard");
        } else {
          navigate("/Home");
        }
      }, 2000);
    } catch (err) {
      toast.error("Login Failed: " + (err.response?.data || err.message), {
        autoClose: 2000,
      });
    }
  };

  const togglePasswordVisibility = () => {
    if (showPasswordType === "password") {
      setShowPasswordType("text");
      show.current.src = hidepassword;
    } else {
      setShowPasswordType("password");
      show.current.src = showpassword;
    }
  };

  // Welcome Animation
if (showWelcome) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-600 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Bouncing Emoji */}
      <motion.div
        className="text-6xl mb-6"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        🚀
      </motion.div>

      {/* Glowing Text */}
      <motion.h1
        className="text-3xl md:text-4xl font-extrabold text-center drop-shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6, 1] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        Welcome to <span className="text-yellow-300">APIverse</span> 🌐
      </motion.h1>

      {/* Subtext */}
      <motion.p
        className="text-sm md:text-base mt-3 text-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Setting up your experience...
      </motion.p>
    </motion.div>
  );
}


  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 bg-white/20 rounded-xl p-6 md:p-8 shadow-2xl backdrop-blur-xl w-full max-w-sm md:max-w-md lg:max-w-lg"
      >
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">
          Sign In to APIverse
        </h2>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <input
            type={showPasswordType}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 pr-10 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <img
            src={showpassword}
            alt="toggle password"
            onClick={togglePasswordVisibility}
            ref={show}
            className="absolute top-2.5 right-3 w-5 md:w-6 cursor-pointer"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between text-sm text-blue-200 mb-4 gap-2 sm:gap-0">
          <Link to="/Forget" className="underline text-center sm:text-left">
            Forgot password?
          </Link>
          <span className="text-center sm:text-right">
            No account? <Link to="/SignUp" className="underline">Sign Up</Link>
          </span>
        </div>

        <button
          onClick={login}
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-all cursor-pointer active:scale-90"
        >
          Sign In
        </button>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-white/30" />
          <span className="mx-2 text-white text-sm">OR</span>
          <hr className="flex-grow border-t border-white/30" />
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button className="flex items-center justify-center gap-2 border border-white/30 text-white px-4 py-2 rounded hover:bg-white/10 w-full sm:w-auto">
            <img src={google} alt="google" className="w-5" /> Google
          </button>
          <button className="flex items-center justify-center gap-2 border border-white/30 text-white px-4 py-2 rounded hover:bg-white/10 w-full sm:w-auto">
            <img src={linkedin} alt="linkedin" className="w-5" /> Linkedin
          </button>
          <button className="flex items-center justify-center gap-2 border border-white/30 text-white px-4 py-2 rounded hover:bg-white/10 w-full sm:w-auto">
            <img src={github} alt="github" className="w-5" /> Github
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
