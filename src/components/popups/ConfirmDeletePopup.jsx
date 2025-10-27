import React from "react";
import { motion } from "framer-motion";

const ConfirmDeletePopup = ({ onConfirm, onCancel }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-96 space-y-4"
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.7 }}
      >
        <h2 className="text-xl font-bold text-red-600 text-center">Delete Confirmation</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this library?
        </p>
        <div className="flex justify-center gap-3 mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer active:scale-90 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer active:scale-90 transition-all"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmDeletePopup;
