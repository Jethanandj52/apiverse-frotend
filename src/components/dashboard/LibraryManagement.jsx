import React, { useEffect, useState, useRef } from "react";
import Nav from "../home/Nav";
import SideBar from "./SideBar";
import { FaBox, FaTrash } from "react-icons/fa";
import AddLib from "./popup/Lib/AddLib";
import ConfirmDeletePopup from "../popups/ConfirmDeletePopup";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import ViewDocLib from "./popup/Lib/ViewDocLib";

const LibraryManagement = () => {
  const [sideBar, setSidebar] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [libraries, setLibraries] = useState([]);
  const [libraryToDelete, setLibraryToDelete] = useState(null);
  const [viewLibId, setViewLibId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categorySearch, setCategorySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
const BASE_URL = import.meta.env.BASE_URL;
  const fetchLibraries = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/lib/getlibraries`);
      setLibraries(res.data);
    } catch (err) {
      console.error("Failed to fetch libraries:", err);
    }
  };

  const confirmDelete = async () => {
    if (!libraryToDelete) return;
    try {
      await axios.delete(`${BASE_URL}/lib/deletelibrary/${libraryToDelete}`);
      setLibraryToDelete(null);
      fetchLibraries();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get unique categories
  const categories = ["All", ...new Set(libraries.map((lib) => lib.category))];
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter libraries by category + search
  let filteredLibraries = libraries;
  if (selectedCategory !== "All") {
    filteredLibraries = filteredLibraries.filter(
      (lib) => lib.category === selectedCategory
    );
  }
  if (searchQuery.trim() !== "") {
    filteredLibraries = filteredLibraries.filter(
      (lib) =>
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

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
          <div className="flex items-center gap-5 text-3xl font-bold">
            <FaBox /> Library Management
          </div>

          <div
            onClick={() => setShowModal(true)}
            className="bg-blue-900 text-white rounded text-center py-2 px-4 font-semibold cursor-pointer mt-6 hover:bg-blue-700 active:scale-95 transition-all w-fit"
          >
            Add LIB
          </div>

          <AnimatePresence>
            {showModal && <AddLib setShowModal={setShowModal} onLibraryAdded={fetchLibraries} />}
          </AnimatePresence>

          <AnimatePresence>
            {viewLibId && <ViewDocLib setShowModal={setViewLibId} id={viewLibId} />}
          </AnimatePresence>

          {/* Filter + Search */}
          <div className="mt-6 flex flex-col md:flex-row justify-between gap-4 items-center bg-gray-100 dark:bg-gray-900 py-2">
            {/* Category Filter */}
            <div className="w-full md:w-64 relative" ref={dropdownRef}>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
                  Filter by Category:
                </label>
              <input
                type="text"
                placeholder="Filter by category..."
                value={categorySearch}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onChange={(e) => {
                  setCategorySearch(e.target.value);
                  setDropdownOpen(true);
                }}
                className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {dropdownOpen && (
                <div className="absolute z-50 w-full max-h-48 overflow-auto mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <div
                        key={cat}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCategorySearch(cat);
                          setDropdownOpen(false);
                        }}
                      >
                        {cat}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                      No categories found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-64">
               <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
                  Search Library:
                </label>
              <input
                type="text"
                placeholder="Search libraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Library Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {filteredLibraries.length > 0 ? (
              filteredLibraries.map((lib) => (
                <div
                  key={lib._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-3"
                >
                  <div className="flex justify-between items-center border-b-1 pb-4 border-blue-400">
                    <h3 className="font-bold text-blue-400 text-2xl">{lib.name}</h3>
                    <FaTrash
                      onClick={() => setLibraryToDelete(lib._id)}
                      className="text-red-600 cursor-pointer hover:scale-110 transition"
                      title="Delete"
                    />
                  </div>
                  <p className="text-sm">{lib.description}</p>
                  <div className="leading-8">
                    <strong>Language:</strong> {lib.language} <br />
                    <strong>Category:</strong> {lib.category} <br />
                    <strong>Security:</strong> {lib.security} <br />
                    <strong>License:</strong> {lib.license}
                  </div>
                  <div className="flex justify-center items-center mt-4">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 cursor-pointer active:scale-90 transition-all"
                      onClick={() => setViewLibId(lib._id)}
                    >
                      View Docs
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No libraries found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Popup */}
      <AnimatePresence>
        {libraryToDelete && (
          <ConfirmDeletePopup
            onCancel={() => setLibraryToDelete(null)}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LibraryManagement;
