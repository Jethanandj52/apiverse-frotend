import React, { useState } from "react";
import { FaHome, FaInfoCircle, FaBars } from "react-icons/fa";

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen overflow-hidden">
      {/* ✅ Navbar */}
      <div className="fixed top-0 left-0 right-0 h-[70px] bg-gray-800 text-white flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
        >
          <FaBars />
        </button>
        <div>Navbar</div>
      </div>

      {/* ✅ Sidebar */}
      <div
        className={`fixed top-[70px] left-0 h-[calc(100vh-70px)] bg-gray-900 text-white transition-all duration-300 ease-in-out z-40
        ${isSidebarOpen ? "w-[220px]" : "w-[60px]"}`}
      >
        <div className="flex flex-col gap-2 p-2">
          {/* Sidebar Item */}
          <div className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded cursor-pointer">
            <FaHome />
            {isSidebarOpen && <span>Home</span>}
          </div>

          <div className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded cursor-pointer">
            <FaInfoCircle />
            {isSidebarOpen && <span>About</span>}
          </div>

          {/* Add more items here */}
        </div>
      </div>

      {/* ✅ Main Content */}
      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "pl-[220px]" : "pl-[60px]"
        } h-screen overflow-y-auto bg-gray-100 text-gray-800 p-4`}
      >
        <h1 className="text-2xl font-bold mb-4">Main Content</h1>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded shadow border border-gray-200 mb-2"
          >
            Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
