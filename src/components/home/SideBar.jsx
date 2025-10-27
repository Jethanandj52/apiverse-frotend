import React, { useEffect, useRef } from "react";
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
} from "react-icons/fa";

const SideBar = ({ sideBar, setSidebar }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  function logout() {
    // signOut(auth);
    // navigate('/');
  }

  // ✅ click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebar(false); // hide sidebar
      }
    }

    if (sideBar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sideBar, setSidebar]);

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-13 left-0 h-[calc(100vh-50px)] 
      bg-white dark:bg-gray-900 border-r dark:border-gray-700 
      text-black dark:text-white z-40 transition-all duration-300 
      flex flex-col justify-between
      ${sideBar ? "w-[220px]" : "w-[60px]"} 
      max-sm:${sideBar ? "translate-x-0" : "-translate-x-full"} 
      sm:translate-x-0`}
    >
      <div className="flex flex-col justify-between h-full p-2">
        {/* Links */}
        <div className="space-y-2 text-blue-400 text-xl">
          <Link to="/home" className="flex items-center gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
            <FaHome /> {sideBar && <span>Home</span>}
          </Link>

          <Link to="/homeApi" className="flex items-center gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
            <FaPlug /> {sideBar && <span>API</span>}
          </Link>

          <Link to="/library" className="flex items-center gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
            <FaBox /> {sideBar && <span>Library</span>}
          </Link>

          <Link to="/groupInvites" className="flex items-center gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
            <FaUsers /> {sideBar && <span>Group Invites</span>}
          </Link>

          <Link to="/geminiAi" className="flex items-center gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
            <FaStar /> {sideBar && <span>Gemini AI</span>}
          </Link>

          <Link to="/postman" className="flex items-center gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
            <FaTools /> {sideBar && <span>API Tester</span>}
          </Link>

          <Link to="/team" className="flex items-center gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
            <FaUsers /> {sideBar && <span>Team</span>}
          </Link>

          <Link to="/about" className="flex items-center gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
            <FaInfoCircle /> {sideBar && <span>About</span>}
          </Link>

          <Link to="/contact" className="flex items-center gap-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
            <FaBook /> {sideBar && <span>Contact</span>}
          </Link>
        </div>

        {/* Logout */}
        <div
          onClick={logout}
          className="flex items-center gap-4 p-2 hover:bg-red-200 
          dark:hover:bg-red-700 text-red-600 dark:text-red-400 
          rounded cursor-pointer mb-3 transition"
        >
          <FaSignOutAlt />
          {sideBar && <span>Logout</span>}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
