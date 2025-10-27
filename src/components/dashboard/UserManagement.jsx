import React, { useEffect, useState } from "react";
import Nav from "../home/Nav";
import SideBar from "./SideBar";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaUsers } from "react-icons/fa";

const UserManagement = () => {
  const [sideBar, setSidebar] = useState(true);
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
const BASE_URL = import.meta.env.BASE_URL;
  // ✅ Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/admin/users`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  // ✅ Handle delete click
  const confirmDelete = (userId) => {
    setSelectedUserId(userId);
    setShowPopup(true);
  };

  // ✅ Confirm and delete
  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/user/admin/user/${selectedUserId}`, {
        withCredentials: true,
      });
      setUsers((prev) => prev.filter((user) => user._id !== selectedUserId));
      setShowPopup(false);
      setSelectedUserId(null);
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white overflow-hidden">
      <Nav sideBar={sideBar} setSidebar={setSidebar} />
      <SideBar sideBar={sideBar} />

      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out ${
          sideBar ? "pl-[300px]" : "pl-[60px]"
        } min-h-screen overflow-y-auto p-4`}
      >
        <div className="pt-10 px-5 pb-10">
          <div className="flex items-center text-center gap-5 text-3xl mb-5 font-bold">
            <FaUsers className="text-4xl" />
            <h2>User Management</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 cursor-pointer hover:scale-105 transition-all"
              >
                {/* ✅ Delete Button */}
                <button
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 cursor-pointer active:scale-90"
                  onClick={() => confirmDelete(user._id)}
                  title="Delete User"
                >
                  <Trash2 size={18} />
                </button>

                {/* ✅ Profile Image with Status Dot */}
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
                      user.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                    title={user.isActive ? "Active" : "Inactive"}
                  ></span>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold text-lg">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {user.email}
                  </p>
                  {user.gender && (
                    <p className="text-sm mt-1 capitalize text-gray-500 dark:text-gray-400">
                      Gender: {user.gender}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <p className="text-center text-gray-500 mt-6">No users found.</p>
          )}
        </div>
      </div>

      {/* ✅ Delete Confirmation Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-sm shadow-lg text-center"
            >
              <h2 className="text-xl font-semibold mb-4 text-red-600">
                Confirm Deletion
              </h2>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this user?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 active:scale-95 cursor-pointer transition-all"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-700 active:scale-95 cursor-pointer transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
