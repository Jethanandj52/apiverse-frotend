import React, { useState, useEffect, useRef } from "react";
import Nav from "../home/Nav";
import SideBar from "./SideBar";
import {
  FaPlug,
  FaHeart,
  FaRegHeart,
  FaPlus,
  FaExternalLinkSquareAlt,
  FaCopy,
  FaUser,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ViewDocApi from "./APi/ViewDocApi";
import ViewUserApi from "./ViewUserApi";
import axios from "axios";
import SavedItemsPopup from "../popups/SavedItemsPopup";
import { toast } from "react-toastify";

const HomeApi = () => {
 const [publicUserApis, setPublicUserApis] = useState([]); // ✅ new

  const [sideBar, setSidebar] = useState(false);
  const [viewApiId, setViewApiId] = useState(null);
  const [api, setApi] = useState([]);
  const [userApis, setUserApis] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserApiModal, setShowUserApiModal] = useState(false);
  const [createdApiUrl, setCreatedApiUrl] = useState(null);

  const [shareApi, setShareApi] = useState(null);
  const [groups, setGroups] = useState([]);
  const [shareGroupId, setShareGroupId] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [sharing, setSharing] = useState(false);
const [isUserApi, setIsUserApi] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const dropdownRef = useRef(null);

  const [apiForm, setApiForm] = useState({
    name: "",
    description: "",
    data: "",
    visibility: "public",
    category: "General",
    version: "v1",
    parameters: "",
    endpoints: "",
    file: null,
  });

  // Fetch user info + favorites
  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      try {
        const userRes = await axios.get(`${BASE_URL}/user/user`, {
          withCredentials: true,
        });
        setUserId(userRes.data._id);

        const favRes = await axios.get(`${BASE_URL}/store/${userRes.data._id}`);
        const apiFavorites = [
  ...(favRes.data?.apis?.map((item) => String(item._id)) || []),
  ...(favRes.data?.userApis?.map((item) => String(item._id)) || [])
];
setFavorites(apiFavorites);
      } catch (err) {
        setFavorites([]);
        console.error("Error fetching user/favorites:", err.message);
      }
    };
    fetchUserAndFavorites();
  }, []);
 
  // Fetch public APIs
  useEffect(() => {
    const fetchApi = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/rApi/showApi`, {
          withCredentials: true,
        });
        setApi(res.data);
      } catch (err) {
        toast.error("Failed to fetch APIs");
        console.error("Fetch API error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApi();
  }, []);

const fetchUserApis = async () => {
  try {
    if (!userId) return;
    const myRes = await axios.get(`${BASE_URL}/userapi/myApis`, {
      withCredentials: true,
    });
    const myApis = (myRes.data || []).map((item) => ({
      ...item,
      isUserApi: true,
    }));
    setUserApis(myApis);
  } catch (err) {
    console.error("User API fetch error:", err.message);
  }
};

useEffect(() => {
  fetchUserApis();
}, [userId]);
// dependency me userId rakho taki jab userId set ho fetch ho


  // Fetch user APIs (private + public)
  useEffect(() => {
    const fetchPublicUserApis = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/userapi/public`, {
          withCredentials: true,
        });
        const formatted = (res.data.data || []).map((item) => ({
          ...item,
          isUserApi: true, // treat them as user APIs
        }));
        setPublicUserApis(formatted);
      } catch (err) {
        console.error("Public user APIs fetch error:", err.message);
      }
    };
    fetchPublicUserApis();
  }, []);

 

  // Fetch user groups
  const fetchMyGroups = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/groups/myGroups`, {
        withCredentials: true,
      });
      setGroups(res.data);
    } catch {
      toast.error("Failed to fetch your groups");
    }
  };

  useEffect(() => {
    if (shareApi) fetchMyGroups();
  }, [shareApi]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Merge APIs (User first, then Public)
    const mergedApis = [
    ...userApis,
    ...publicUserApis.filter(
      (p) => !userApis.some((u) => u._id === p._id) // avoid duplicates
    ),
    ...api,
  ];

  // Categories
  const categories = ["Popular", "All", ...new Set(mergedApis.map((i) => i.category))];

  // Filter by category
  let filteredApis =
    selectedCategory === "Popular"
      ? mergedApis.filter((item) => item.popular)
      : selectedCategory === "All"
      ? mergedApis
      : mergedApis.filter((item) => item.category === selectedCategory);

  // Search filter
  if (searchQuery.trim() !== "") {
    filteredApis = filteredApis.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Toggle Favorite
  const toggleFavorite = async (apiItem) => {
    if (!userId) return;
    const apiId = String(apiItem._id);

    try {
      if (favorites.includes(apiId)) {
        await axios.delete(`${BASE_URL}/store/removeApi`, {
          data: { userId, apiId },
          withCredentials: true,
        });
        setFavorites((prev) => prev.filter((id) => id !== apiId));
      } else {
        await axios.post(
          `${BASE_URL}/store/addApi`,
          { userId, apiId, isUserApi: apiItem.isUserApi || false },
          { withCredentials: true }
        );
        setFavorites((prev) => [...prev, apiId]);
      }
    } catch (err) {
      toast.error("Failed to update favorites");
      console.error("Toggle favorite error:", err.message);
    }
  };

  // Share modal
  const openShareModal = (apiItem) => {
    setShareApi(apiItem);
    setShareGroupId("");
    setShareTitle(`${apiItem.name} - ${apiItem.category}`.slice(0, 80));
  };

  const shareToGroup = async (e) => {
    e && e.preventDefault();
    if (!shareApi || !shareGroupId)
      return toast.error("Select group to share into");

    setSharing(true);
    try {
      const payload = {
        title: shareTitle,
        request: {
          apiId: shareApi._id,
          name: shareApi.name,
          category: "API",
          description: shareApi.description,
          language: shareApi.language,
          version: shareApi.version,
          license: shareApi.license,
        },
        response: null,
      };

      const res = await axios.post(
        `${BASE_URL}/sharedRequests/groups/${shareGroupId}/share`,
        payload,
        { withCredentials: true }
      );

      const shareId = res.data.shareId;
      if (shareId) {
        await navigator.clipboard.writeText(
          `${window.location.origin}/home?sharedId=${shareId}`
        );
      }

      toast.success("Shared to group! Link copied to clipboard");
      setShareApi(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to share API");
    } finally {
      setSharing(false);
    }
  };

  // Create API
 const handleCreateApi = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();

    // Append all normal fields
    ["name", "description", "category", "version", "parameters", "endpoints", "visibility"].forEach(
      (key) => {
        if (apiForm[key]) formData.append(key, apiForm[key]);
      }
    );

    // Append file if chosen
    if (apiForm.inputType === "file" && apiForm.file) {
      formData.append("file", apiForm.file);
    }

    // Append manual JSON if chosen
    if (apiForm.inputType === "manual" && apiForm.jsonData) {
      try {
        // Validate JSON
        const parsed = JSON.parse(apiForm.jsonData);
        formData.append("data", JSON.stringify(parsed));
      } catch (err) {
        alert("Invalid JSON! Please fix it before submitting.");
        return;
      }
    }

    const res = await axios.post(`${BASE_URL}/userapi/create`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.status === 201 || res.status === 200) {
      const apiUrl = res.data.api?.url;
      setCreatedApiUrl(apiUrl || null);
      alert("✅ API created successfully!");
      setShowCreateModal(false);
      fetchUserApis();
    }
  } catch (err) {
    alert("Error while creating API. Check console.");
    console.error("API creation failed:", err);
  }
};


  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdApiUrl);
    alert("✅ API URL copied!");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <SideBar sideBar={sideBar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Nav sideBar={sideBar} setSidebar={setSidebar} />

        <div
          className={`pt-[70px] transition-all duration-300 ease-in-out 
          ${sideBar ? "sm:pl-[220px]" : "sm:pl-[60px]"} 
          pl-0 min-h-screen overflow-y-auto p-6`}
        >
          <div className="pt-4 px-4 md:px-8 pb-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex text-2xl md:text-3xl font-bold text-blue-400 items-center gap-2">
                <FaPlug /> API's Management
              </div>
<div className="flex gap-10">
  <button
                onClick={() => setShowUserApiModal(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
              >
                <FaUser /> User API
              </button> 
               <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
              >
                <FaPlus /> Create API
              </button>
  </div>              
            
            </div>

            {/* Search & Category */}
            <div className="mt-6 flex flex-col md:flex-row justify-between gap-4 items-center bg-gray-100 dark:bg-gray-900 py-2">
              <div className="w-full md:w-64 relative" ref={dropdownRef}>
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
                  Filter by Category:
                </label>
                <input
                  type="text"
                  placeholder="Select Category..."
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

              <div className="w-full md:w-64">
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
                  Search API:
                </label>
                <input
                  type="text"
                  placeholder="Search in list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* API Cards */}
            <div className="grid justify-center md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-10">
  {filteredApis.length > 0 ? (
    filteredApis.map((Api) => {
      const isFavorite = favorites.map(String).includes(String(Api._id));
      return (
        <div
          key={Api._id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
        >
          <div className="flex justify-between items-center border-b pb-3 border-blue-400">
            <h3 className="font-bold text-blue-500 text-2xl">
              {Api.name}
            </h3>
            <button onClick={() => toggleFavorite(Api)}>
              {isFavorite ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-gray-400 text-xl hover:text-red-500" />
              )}
            </button>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            {Api.description}
          </p>

          {Api.isUserApi ? (
            <div className="text-gray-700 dark:text-gray-300">
              <strong>Visibility:</strong> {Api.visibility}
            </div>
          ) : (
            <div className="leading-8 text-gray-700 dark:text-gray-300">
              <strong>Language:</strong> {Api.language} <br />
              <strong>Category:</strong> {Api.category} <br />
              <strong>Version:</strong> {Api.version} <br />
              <strong>License:</strong> {Api.license}
            </div>
          )}

          <div className="flex justify-center items-center mt-4 gap-4">
            {/* View Docs Button */}
            {Api.isUserApi ? (
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 active:scale-95 transition-transform"
                onClick={() => {
                  setViewApiId(Api._id);  // User API ka ID
                  setIsUserApi(true);      // User API flag true
                }}
              >
                View User API
              </button>
            ) : (
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 active:scale-95 transition-transform"
                onClick={() => {
                  setViewApiId(Api._id);  // Public API ka ID
                  setIsUserApi(false);     // User API flag false
                }}
              >
                View Docs
              </button>
            )}

            {/* Share Button */}
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
              onClick={() => openShareModal(Api)}
            >
              Share
            </button>
          </div>
        </div>
      );
    })
  ) : (
    <div className="col-span-full text-center py-10">
      <p className="text-gray-500 dark:text-gray-400 text-lg">
        No APIs available
      </p>
    </div>
  )}
</div>

          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className=" fixed inset-0 flex justify-center items-center bg-black/50 z-50 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="  bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-[90%] md:w-[600px] max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-blue-500 mb-4">
                Create New API
              </h2>
         <form onSubmit={handleCreateApi} className="space-y-3">
  {["name", "description", "category", "version", "parameters", "endpoints"].map(
    (key) => (
      <div key={key}>
        <label className="font-semibold capitalize">{key}:</label>
        <input
          type="text"
          value={apiForm[key]}
          onChange={(e) =>
            setApiForm({ ...apiForm, [key]: e.target.value })
          }
          className="w-full border p-2 rounded-md bg-gray-100 dark:bg-gray-700"
        />
      </div>
    )
  )}

  {/* ✅ Visibility Dropdown */}
  <div>
    <label className="font-semibold">Visibility:</label>
    <select
      value={apiForm.visibility || "public"}
      onChange={(e) => setApiForm({ ...apiForm, visibility: e.target.value })}
      className="w-full border p-2 rounded-md bg-gray-100 dark:bg-gray-700"
    >
      <option value="public">Public</option>
      <option value="private">Private</option>
    </select>
  </div>

  {/* ✅ File Upload or Manual JSON Option */}
  <div>
    <label className="font-semibold">Add API Data:</label>
    <div className="flex items-center gap-4 mt-2">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="inputType"
          value="file"
          checked={apiForm.inputType === "file"}
          onChange={() => setApiForm({ ...apiForm, inputType: "file" })}
        />
        Upload File
      </label>
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="inputType"
          value="manual"
          checked={apiForm.inputType === "manual"}
          onChange={() => setApiForm({ ...apiForm, inputType: "manual" })}
        />
        Enter JSON Manually
      </label>
    </div>

    {/* ✅ If File Upload Selected */}
    {apiForm.inputType === "file" && (
      <div className="mt-2">
        <input
          type="file"
          accept=".json,.csv,.xlsx,.xls"
          onChange={(e) =>
            setApiForm({ ...apiForm, file: e.target.files[0] || null })
          }
          className="w-full border p-2 rounded-md bg-gray-100 dark:bg-gray-700"
        />
      </div>
    )}

    {/* ✅ If Manual JSON Selected */}
    {apiForm.inputType === "manual" && (
      <div className="mt-2">
        <textarea
          rows="6"
          placeholder='Enter JSON data here... Example: {"name": "APIverse", "version": "1.0"}'
          value={apiForm.jsonData || ""}
          onChange={(e) => setApiForm({ ...apiForm, jsonData: e.target.value })}
          className="w-full border p-2 rounded-md bg-gray-100 dark:bg-gray-700 font-mono text-sm"
        />
      </div>
    )}
  </div>

  <div className="flex justify-end gap-3 mt-4">
    <button
      type="button"
      onClick={() => setShowCreateModal(false)}
      className="px-4 py-2 rounded-md bg-gray-400 hover:bg-gray-500 text-white"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
    >
      Create
    </button>
  </div>
</form>


            </motion.div>
          </motion.div>
        )}

{showUserApiModal && (
  <motion.div
    className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onKeyDown={(e) => e.key === "Escape" && setShowUserApiModal(false)}
    tabIndex={0} // taake keydown work kare
  >
    <motion.div
      className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-[900px] max-h-[90vh] overflow-y-auto"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
    >
      {/* Close Button */}
      <button
        onClick={() => setShowUserApiModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
      >
        ✕
      </button>

      <h2 className="text-3xl font-extrabold text-center text-blue-600 mb-6">
        Your APIs
      </h2>

      <div className="grid justify-center sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userApis.length > 0 ? (
          userApis.map((Api) => {
            const isFavorite = favorites.map(String).includes(String(Api._id));
            return (
              <div
                key={Api._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 space-y-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-blue-500 line-clamp-1">
                      {Api.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 line-clamp-2">
                      {Api.description}
                    </p>
                  </div>
                  <button onClick={() => toggleFavorite(Api)}>
                    {isFavorite ? (
                      <FaHeart className="text-red-500 text-2xl" />
                    ) : (
                      <FaRegHeart className="text-gray-400 text-2xl hover:text-red-500 transition-colors" />
                    )}
                  </button>
                </div>

                {/* Visibility */}
                <div className="text-gray-700 dark:text-gray-300 font-medium">
                  <span className="font-semibold">Visibility:</span> {Api.visibility}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-3 mt-3">
                  <button
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 active:scale-95 transition-transform font-semibold"
                    onClick={() => {
                      setViewApiId(Api._id);
                      setIsUserApi(true);
                    }}
                  >
                    View API
                  </button>
                  <button
                    className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 font-semibold"
                    onClick={() => openShareModal(Api)}
                  >
                    Share
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No User APIs available
            </p>
          </div>
        )}
      </div>
    </motion.div>
  </motion.div>
)}


  {viewApiId && (
  isUserApi ? (
    <ViewUserApi
      id={viewApiId}
      setShowModal={setViewApiId}
      onUpdate={() => fetchUserApis()} // <-- yaha callback
    />
  ) : (
    <ViewDocApi
      id={viewApiId}
      setShowModal={setViewApiId}
      userId={userId}
    />
  )
)}




        {showSavedPopup && (
          <SavedItemsPopup
            setShowSavedPopup={setShowSavedPopup}
            favorites={favorites}
          />
        )}

        {/* Share API Modal */}
        {shareApi && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-[600px] shadow-lg"
            >
              <h3 className="text-lg font-bold text-purple-600 mb-4">
                Share API to Group
              </h3>
              <form onSubmit={shareToGroup} className="space-y-3">
                <label className="block">
                  <div className="text-sm mb-1">Select Group</div>
                  <select
                    value={shareGroupId}
                    onChange={(e) => setShareGroupId(e.target.value)}
                    className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-700"
                  >
                    <option value="">-- choose group --</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <div className="text-sm mb-1">Title (optional)</div>
                  <input
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    className="w-full p-3 rounded border"
                  />
                </label>
                <div className="flex gap-2 justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShareApi(null)}
                    className="px-4 py-2 bg-gray-300 rounded w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sharing}
                    className="px-4 py-2 bg-purple-600 text-white rounded w-full sm:w-auto"
                  >
                    {sharing ? "Sharing..." : "Share"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeApi;
