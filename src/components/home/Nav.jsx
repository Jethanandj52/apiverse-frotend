import React, { useState, useEffect, useRef } from "react";
import {
  FaBars,
  FaBell,
  FaHeart,
  FaUser,
  FaTimes,
  FaComments,
} from "react-icons/fa";
import { ModeToggle } from "../mode-toggle";
import logo from "../../assets/images/logo.png";
import User from "../popups/User";
import SavedItemsPopup from "../popups/SavedItemsPopup";
import ChatPopUp from "./ChatPopUp"; // ✅ Import ChatPopUp
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Nav = ({ sideBar, setSidebar }) => {
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [favorites, setFavorites] = useState({ apis: [], libraries: [] });
  const [showSaved, setShowSaved] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ Chat states
  const [showChat, setShowChat] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState({
    _id: "demoGroupId",
    name: "Community Chat",
  });

  const userId = localStorage.getItem("userId");
  const notifRef = useRef();

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`/api/notifications/${userId}`);
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setNotifications([]);
      }
    };
    if (showNotifications) fetchNotifications();
  }, [userId, showNotifications]);

  const iconWrapperStyle =
    "relative w-9 h-9 flex justify-center items-center cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition";
  const iconStyle = "text-blue-500 text-lg sm:text-xl";

  const notifVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 text-black dark:text-white flex items-center px-3 sm:px-5 py-2 z-50 shadow-md">
      {/* Sidebar Toggle */}
      <button onClick={() => setSidebar(!sideBar)} className={iconWrapperStyle}>
        <FaBars className={iconStyle} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 text-blue-500 font-semibold text-lg sm:text-xl md:text-2xl ml-2">
        <img
          src={logo}
          alt="logo"
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full"
        />
        <span className="hidden sm:block">APIVerse</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Notifications */}
        <div ref={notifRef} className={iconWrapperStyle}>
          <FaBell
            title="Notifications"
            className={iconStyle}
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {notifications.some((n) => !n.read) && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full px-1">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                key="notif-dropdown"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={notifVariants}
                transition={{ duration: 0.3 }}
                className="absolute top-11 right-0 mt-2 w-72 sm:w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-700 shadow-xl rounded-md z-50 p-2 border border-gray-200 dark:border-gray-600"
              >
                {notifications.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-300 text-sm text-center py-4">
                    No notifications
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className="flex justify-between items-start p-2 my-1 rounded-md bg-gray-50 dark:bg-gray-600 hover:shadow"
                    >
                      <div>
                        <p className="text-sm">{notif.message}</p>
                        <small className="text-gray-500">
                          {new Date(notif.createdAt).toLocaleString()}
                        </small>
                      </div>
                      <FaTimes
                        className="text-gray-400 cursor-pointer"
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.filter((n) => n._id !== notif._id)
                          )
                        }
                      />
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Favorites */}
        <div
          className={iconWrapperStyle}
          onClick={() => setShowSaved(true)}
          title="Favorites"
        >
          <FaHeart className={iconStyle} />
        </div>

        {/* ✅ Chat Icon */}
        <div
          className={iconWrapperStyle}
          onClick={() => setShowChat(true)}
          title="Messages"
        >
          <FaComments className={iconStyle} />
        </div>

        {/* Dark/Light Mode */}
        <div className={iconWrapperStyle}>
          <ModeToggle />
        </div>

        {/* User */}
        <div
          className={iconWrapperStyle}
          onClick={() => setShowUserPopup(!showUserPopup)}
        >
          <FaUser className={iconStyle} />
        </div>
      </div>

      {/* Popups */}
      {showUserPopup && <User />}
      {showSaved && <SavedItemsPopup onClose={() => setShowSaved(false)} />}

      {/* ✅ Chat Popup */}
      {showChat && (
        <ChatPopUp
          group={selectedGroup}
          userId={localStorage.getItem("userId")}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default Nav;
