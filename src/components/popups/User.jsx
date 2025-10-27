import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from 'react-icons/fa';

const User = () => {
  const [userData, setUserData] = useState({ firstName: "", lastName: "", email: "" });
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/user`, { withCredentials: true });
        setUserData(res.data);

        // ✅ userId localStorage me save
        if (res.data._id) {
          localStorage.setItem("userId", res.data._id);
        }
      } catch (err) {
        console.error("User not authenticated", err);
        navigate("/");
      }
    };
    getUser();
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/auth/logout`, { email: userData.email }, { withCredentials: true });
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err.message);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className='fixed top-20 right-8 w-80 bg-black/10 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg text-white overflow-hidden z-50'
        >
          {/* Top Header */}
          <div className='flex justify-between items-center border-b border-gray-500 p-4'>
            <div className='flex items-center gap-3'>
              <i className='fas fa-user text-3xl text-blue-600 dark:text-blue-400'></i>
              <div>
                <div className='text-lg font-semibold text-blue-600 dark:text-blue-400'>
                  {userData.firstName} {userData.lastName}
                </div>
                <div className='text-sm text-gray-700 dark:text-gray-200'>{userData.email}</div>
              </div>
            </div>
            <FaTimes
              className='text-white text-lg cursor-pointer hover:text-red-500 transition'
              onClick={() => setVisible(false)}
              title="Close"
            />
          </div>

          {/* Body Options */}
          <div className='p-3 space-y-2'>
            <div className='flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-blue-300 dark:hover:bg-blue-900 hover:text-white transition'>
              <i className="fas fa-gear text-blue-600 dark:text-blue-400"></i>
              <span className='text-black dark:text-white'>Settings</span>
            </div>

            <div className='flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-blue-300 dark:hover:bg-blue-900 transition'>
              <i className="fas fa-info-circle text-blue-600 dark:text-blue-400"></i>
              <span className='text-black dark:text-white'>About</span>
            </div>

            <div
              className='flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-red-400 hover:text-red-600 hover:bg-red-100 transition'
              onClick={logout}
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default User;
