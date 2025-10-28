import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBook,
  FaUsers,
  FaPlug,
  FaBox,
  FaInfoCircle,
  FaHome,
  FaSignOutAlt,
  FaStar,
  FaTools,
  FaUser,
} from "react-icons/fa";
import axios from "axios";
import { ModeToggle } from "../mode-toggle";
import User from "../popups/User";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SideBar = ({ sideBar, setSidebar }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [showUserPopup, setShowUserPopup] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/user`, {
          withCredentials: true,
        });
        setUserData(res.data);
        if (res.data._id) localStorage.setItem("userId", res.data._id);
      } catch (err) {
        console.error("User not authenticated", err);
        navigate("/");
      }
    };
    getUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/auth/logout`,
        { email: userData.email },
        { withCredentials: true }
      );
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebar(false);
      }
    };
    if (sideBar) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sideBar, setSidebar]);

  return (
    <>
      {/* ✅ Sidebar (Responsive for mobile/tablet/desktop) */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen pt-[50px]
        bg-white dark:bg-gray-900 border-r dark:border-gray-700
        text-black dark:text-white z-40 transition-all duration-300 ease-in-out
        flex flex-col justify-between shadow-md
        ${
          sideBar
            ? "w-[230px]" // expanded mode
            : "w-[70px]"   // collapsed mode (tablet/desktop)
        }
        ${sideBar ? "translate-x-0" : "-translate-x-full"} 
        sm:translate-x-0
        sm:fixed sm:top-0 sm:left-0 sm:h-screen`}
      >
        <div className="flex flex-col justify-between h-full p-3">
          {/* ✅ Nav Links */}
          <div className="space-y-1 text-blue-400 text-[18px] flex-1">
            <NavItem to="/home" icon={<FaHome />} label="Home" sideBar={sideBar} />
            <NavItem to="/homeApi" icon={<FaPlug />} label="API" sideBar={sideBar} />
            <NavItem to="/library" icon={<FaBox />} label="Library" sideBar={sideBar} />
            <NavItem to="/groupInvites" icon={<FaUsers />} label="Group Invites" sideBar={sideBar} />
            <NavItem to="/geminiAi" icon={<FaStar />} label="Gemini AI" sideBar={sideBar} />
            <NavItem to="/postman" icon={<FaTools />} label="API Tester" sideBar={sideBar} />
            <NavItem to="/team" icon={<FaUsers />} label="Team" sideBar={sideBar} />
            <NavItem to="/about" icon={<FaInfoCircle />} label="About" sideBar={sideBar} />
            <NavItem to="/contact" icon={<FaBook />} label="Contact" sideBar={sideBar} />
          </div>

          {/* ✅ Bottom Options */}
          <div className="flex flex-col gap-2 mt-4">
            {/* 🌙 Theme Toggle (mobile only) */}
         {/* 🌙 Theme Toggle (mobile only) */}
<div
  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-200 
    dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer
    sm:hidden"
>
  <span className="flex items-center justify-center min-w-[24px] text-blue-500">
    <ModeToggle />
  </span>
  <span className={`${sideBar ? "opacity-100 w-auto" : "opacity-0 w-0"} transition-all duration-300`}>
    Theme
  </span>
</div>

{/* 👤 User (mobile only) */}
<div
  onClick={() => setShowUserPopup(!showUserPopup)}
  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-200 
    dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer
    sm:hidden"
>
  <span className="flex items-center justify-center min-w-[24px] text-blue-500">
    <FaUser size={18} />
  </span>
  <span className={`${sideBar ? "opacity-100 w-auto" : "opacity-0 w-0"} transition-all duration-300`}>
    Profile
  </span>
</div>


            {/* 🚪 Logout */}
            <div
              onClick={logout}
              className="flex items-center gap-3 p-3 hover:bg-red-200 
                dark:hover:bg-red-700 text-red-600 dark:text-red-400 
                rounded cursor-pointer mb-2 transition-all duration-200"
            >
              <FaSignOutAlt size={20} />
              {sideBar && <span className="text-sm font-medium">Logout</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Overlay Background (mobile only) */}
      {sideBar && (
        <div
          onClick={() => setSidebar(false)}
          className="fixed inset-0 bg-black/40 sm:hidden z-30"
        ></div>
      )}

      {showUserPopup && <User onClose={() => setShowUserPopup(false)} />}
    </>
  );
};

const NavItem = ({ to, icon, label, sideBar }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-200 
      dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 
      dark:text-gray-200 text-[15px] font-medium"
  >
    <span className="flex items-center justify-center min-w-[24px] text-blue-500">
      {React.cloneElement(icon, { size: 18 })}
    </span>
    <span
      className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
        sideBar ? "opacity-100 w-auto" : "opacity-0 w-0"
      }`}
    >
      {label}
    </span>
  </Link>
);

export default SideBar;
