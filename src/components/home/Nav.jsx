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
import ChatPopUp from "./ChatPopUp";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Nav = ({ sideBar, setSidebar }) => {
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState({
    _id: "demoGroupId",
    name: "Community Chat",
  });

  const userId = localStorage.getItem("userId");
  const notifRef = useRef();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${BASE_URL}/notifications/${userId}`, {
        withCredentials: true,
      });
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching notifications", err);
        setNotifications([]);
      }
    };
    fetchNotifications();
    if (showNotifications) fetchNotifications();
  }, [userId, showNotifications]);

  useEffect(() => {
    const fetchSavedCount = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${BASE_URL}/store/${userId}`, {
        withCredentials: true,
      });
        const total =
          (res.data.apis?.length || 0) + (res.data.libraries?.length || 0);
        setSavedCount(total);
      } catch (err) {
        console.error("Error fetching saved count:", err);
      }
    };
    fetchSavedCount();
  }, [userId]);

  const iconWrapperStyle =
    "relative w-9 h-9 flex justify-center items-center cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition";
  const iconStyle = "text-blue-500 text-lg sm:text-xl";

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 text-black dark:text-white flex flex-wrap items-center justify-between px-3 sm:px-5 py-2 z-50 shadow-md">
      {/* Sidebar + Logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSidebar(!sideBar)}
          className={`${iconWrapperStyle} shrink-0`}
        >
          <FaBars className={iconStyle} />
        </button>

        <div className="flex items-center gap-2 text-blue-500 font-semibold text-lg sm:text-xl md:text-2xl ml-2">
          <img
            src={logo}
            alt="logo"
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full"
          />
          <span className="hidden sm:block">APIVerse</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end mt-2 sm:mt-0">
        {/* ❤️ Favorites */}
        <div
          className={`${iconWrapperStyle} relative`}
          onClick={() => setShowSaved(true)}
          title="Favorites"
        >
          <FaHeart className={iconStyle} />
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full px-[5px] py-[1px] border border-white shadow">
              {savedCount}
            </span>
          )}
        </div>

        {/* 💬 Chat */}
        <div
          className={iconWrapperStyle}
          onClick={() => setShowChat(true)}
          title="Messages"
        >
          <FaComments className={iconStyle} />
        </div>

        {/* 🌙 Mode Toggle — hidden on mobile */}
        <div className={`${iconWrapperStyle} hidden sm:flex`}>
          <ModeToggle />
        </div>

        {/* 🔔 Notifications */}
        <div ref={notifRef} className={`${iconWrapperStyle} relative`}>
          <FaBell
            title="Notifications"
            className={iconStyle}
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-[5px] py-[1px] border border-white shadow">
              {notifications.filter((n) => !n.read).length ||
                notifications.length}
            </span>
          )}

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                key="notif-dropdown"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed sm:absolute top-14 sm:top-12 left-1/2 sm:left-auto sm:right-0 transform -translate-x-1/2 sm:translate-x-0 mt-2 
                w-[90vw] sm:w-80 md:w-96 max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-2xl rounded-xl z-[9999] p-3 border border-gray-200 dark:border-gray-700"
              >
                {notifications.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-5">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((notif) => {
                    const isUnread = !notif.read;
                    return (
                      <div
                        key={notif._id}
                        className={`flex justify-between items-start p-3 mb-2 rounded-lg transition-all duration-200
                          ${
                            isUnread
                              ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500"
                              : "bg-gray-50 dark:bg-gray-700/40 border border-transparent"
                          }
                          hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-start justify-between">
                            <p
                              className={`text-sm ${
                                isUnread
                                  ? "font-semibold text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {notif.message}
                            </p>
                            {isUnread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-1 shrink-0"></span>
                            )}
                          </div>
                          <small className="text-gray-500 dark:text-gray-400 text-xs mt-1 block">
                            {new Date(notif.createdAt).toLocaleString()}
                          </small>
                        </div>

                        <FaTimes
                          className="text-gray-400 hover:text-red-500 cursor-pointer text-xs transition"
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.filter((n) => n._id !== notif._id)
                            )
                          }
                        />
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 👤 User — hidden on mobile */}
        <div
          className={`${iconWrapperStyle} hidden sm:flex`}
          onClick={() => setShowUserPopup(!showUserPopup)}
        >
          <FaUser className={iconStyle} />
        </div>
      </div>

      {/* Popups */}
      {showUserPopup && <User />}
      {showSaved && (
        <SavedItemsPopup
          onClose={() => setShowSaved(false)}
          onUpdateCount={(count) => setSavedCount(count)}
        />
      )}
      {showChat && (
        <ChatPopUp
          group={selectedGroup}
          userId={localStorage.getItem("userId")}
          onClose={() => setShowChat(false)}
        />
      )}
    </nav>
  );
};

export default Nav;
