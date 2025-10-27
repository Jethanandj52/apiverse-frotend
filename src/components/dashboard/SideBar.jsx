import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBook,
  FaUsers,
  FaPlug,
  FaBox,
  FaHome,
  FaChartLine,
  FaArrowAltCircleLeft,
  FaCommentDots, // ✅ New icon for feedback
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const SideBar = ({ sideBar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sideBarVariants = {
    open: { width: 300, transition: { type: 'spring', stiffness: 200, damping: 25 } },
    closed: { width: 60, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  };

  const menuItems = [
    { icon: <FaHome />, label: 'Overview', to: '/dashboard' },
    { icon: <FaPlug />, label: 'API Management', to: '/managementApi' },
    { icon: <FaBox />, label: 'Library Management', to: '/libraryManagement' },
    { icon: <FaUsers />, label: 'User Management', to: '/userManagement' },
    { icon: <FaChartLine />, label: 'Analytics', to: '/analytics' },
    { icon: <FaCommentDots />, label: 'Feedback', to: '/feedbacks' }, // ✅ Added feedback menu
    { icon: <FaArrowAltCircleLeft />, label: 'Back To Home', to: '/home' },
  ];

  return (
    <motion.div
      initial={false}
      animate={sideBar ? 'open' : 'closed'}
      variants={sideBarVariants}
      className="fixed top-[55px] left-0 h-screen bg-white dark:bg-gray-800 text-black dark:text-white z-40 pt-5 shadow-lg"
    >
      <div className="flex flex-col gap-2 p-2 text-[18px] text-blue-400 font-bold">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={index}
              to={item.to}
              className="flex items-center gap-4 p-2 rounded transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer mb-2 relative"
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="relative"
              >
                {item.icon}
                {isActive && (
                  <span className="absolute -top-1 -right-2 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </motion.div>
              {sideBar && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}

        {/* 🚪 Logout */}
        <div
          className="flex items-center gap-4 p-2 mt-4 rounded text-red-600 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 cursor-pointer absolute bottom-20 w-[90%]"
        >
          <FaBook className="text-[20px]" />
          {sideBar && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Logout
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SideBar;
