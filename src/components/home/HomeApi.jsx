import React, { useState, useEffect, useRef } from "react";
import Nav from "../home/Nav";
import SideBar from "./SideBar";
import { FaPlug, FaHeart, FaRegHeart, FaPlus } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import ViewDocApi from "./APi/ViewDocApi";
import axios from "axios";
import SavedItemsPopup from "../popups/SavedItemsPopup";
import { toast } from "react-toastify";

const HomeApi = () => {
  const [sideBar, setSidebar] = useState(false); // 🔹 mobile by default hidden
  const [viewApiId, setViewApiId] = useState(null);
  const [api, setApi] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdApiUrl, setCreatedApiUrl] = useState(null); 

  const [shareApi, setShareApi] = useState(null);
  const [groups, setGroups] = useState([]);
  const [shareGroupId, setShareGroupId] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [sharing, setSharing] = useState(false);

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

  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      try {
        const userRes = await axios.get(`${BASE_URL}/user/user`, { withCredentials: true });
        setUserId(userRes.data._id);

        const favRes = await axios.get(`${BASE_URL}/store/${userRes.data._id}`);
        const apiFavorites = favRes.data?.apis?.map((item) => item._id) || [];
        setFavorites(apiFavorites);
      } catch {
        setFavorites([]);
      }
    };
    fetchUserAndFavorites();
  }, []);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/rApi/showApi`, { withCredentials: true });
        setApi(res.data);
      } catch {
        toast.error("Failed to fetch APIs");
      } finally {
        setLoading(false);
      }
    };
    fetchApi();
  }, []);

  useEffect(() => {
    if (shareApi) fetchMyGroups();
  }, [shareApi]);

    const fetchUserApis = async () => {
    try {
      const publicRes = await axios.get(`${BASE_URL}/userapi/public`);
      let myApis = [];

      if (userId) {
        const myRes = await axios.get(`${BASE_URL}/userapi/myApis`, {
          withCredentials: true,
        });
        myApis = myRes.data || [];
      }

      const combined = [
        ...publicRes.data,
        ...myApis.filter((item) => item.visibility === "private"),
      ];
      setUserApis(combined);
    } catch (err) {
      console.error("User API fetch error:", err.message);
    }
  };

    useEffect(() => {
    fetchUserApis();
  }, [userId]);

  const fetchMyGroups = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/groups/myGroups`, { withCredentials: true });
      setGroups(res.data);
    } catch {
      toast.error("Failed to fetch your groups");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = ["Popular", "All", ...new Set(api.map((item) => item.category))];

  let filteredApis =
    selectedCategory === "Popular"
      ? api.filter((item) => item.popular)
      : selectedCategory === "All"
      ? api
      : api.filter((item) => item.category === selectedCategory);

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

  const toggleFavorite = async (apiId) => {
    if (!userId) return;
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
          { userId, apiId },
          { withCredentials: true }
        );
        setFavorites((prev) => [...prev, apiId]);
      }
    } catch {
      toast.error("Failed to update favorites");
    }
  };

  const openShareModal = (apiItem) => {
    setShareApi(apiItem);
    setShareGroupId("");
    setShareTitle(`${apiItem.name} - ${apiItem.category}`.slice(0, 80));
  };

  const shareToGroup = async (e) => {
    e && e.preventDefault();
    if (!shareApi || !shareGroupId) return toast.error("Select group to share into");

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
        await navigator.clipboard.writeText(`${window.location.origin}/home?sharedId=${shareId}`);
      }

      toast.success("Shared to group! Link copied to clipboard");
      setShareApi(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to share API");
    } finally {
      setSharing(false);
    }
  };

    const handleCreateApi = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(apiForm).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

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
    } catch (error) {
      alert("Error while creating API. Check console.");
      console.error("❌ API creation failed:", error);
    }
  };


  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      {/* Sidebar */}
      <SideBar sideBar={sideBar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Nav sideBar={sideBar} setSidebar={setSidebar} />

        {/* ✅ Responsive wrapper like Library page */}
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
            >
              <FaPlus /> Create API
            </button>
          </div>

  {createdApiUrl && (
            <div className="bg-green-100 dark:bg-green-800 p-4 rounded-xl flex justify-between items-center mb-6">
              <div>
                <p className="font-semibold text-green-700 dark:text-green-200">
                  🎉 Your API is live:
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">{createdApiUrl}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <FaCopy /> Copy
                </button>
                <a
                  href={createdApiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <FaExternalLinkAlt /> Open
                </a>
              </div>
            </div>
          )}
            {/* Category + Search */}
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
              filteredApis.map((Api) => (
                <div
                  key={Api._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-3 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  <div className="flex justify-between items-center border-b pb-3 border-blue-400">
                    <h3 className="font-bold text-blue-500 text-2xl">{Api.name}</h3>
                    <button onClick={() => toggleFavorite(Api._id)}>
                      {favorites.includes(Api._id) ? (
                        <FaHeart className="text-red-500 text-xl" />
                      ) : (
                        <FaRegHeart className="text-gray-400 text-xl hover:text-red-500" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{Api.description}</p>

                  {Api.isUserApi ? (
                    <div className="leading-8 text-gray-700 dark:text-gray-300">
                      <strong>Visibility:</strong> {Api.visibility}
                      <br />
                      <strong>Data Items:</strong>{" "}
                      {Array.isArray(Api.data) ? Api.data.length : 0}
                      <br />
                      <strong>Type:</strong> {Api.fileType?.toUpperCase()}
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
                   <button
  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 active:scale-95 transition-transform"
  onClick={() => setViewApiId(Api._id)}
>
  View Docs
</button>

                  </div>
                </div>
              ))
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
            className="fixed inset-0 flex justify-center items-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-[90%] md:w-[600px]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-blue-500 mb-4">Create New API</h2>
              <form onSubmit={handleCreateApi} className="space-y-3">
                {["name", "description", "category", "version", "parameters", "endpoints"].map(
                  (key) => (
                    <div key={key}>
                      <label className="font-semibold capitalize">{key}:</label>
                      <input
                        type="text"
                        value={apiForm[key]}
                        onChange={(e) => setApiForm({ ...apiForm, [key]: e.target.value })}
                        className="w-full border p-2 rounded-md bg-gray-100 dark:bg-gray-700"
                      />
                    </div>
                  )
                )}
                <div>
                  <label>Upload File:</label>
                  <input
                    type="file"
                    accept=".json,.csv,.xlsx,.xls"
                    onChange={(e) =>
                      setApiForm({ ...apiForm, file: e.target.files[0] || null })
                    }
                    className="w-full border p-2 rounded-md bg-gray-100 dark:bg-gray-700"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-400 text-white px-3 py-1 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {viewApiId && <ViewDocApi setShowModal={() => setViewApiId(null)} id={viewApiId} />}
        {showSavedPopup && (
          <SavedItemsPopup
            onClose={() => setShowSavedPopup(false)}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        )}
        {shareApi && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-[600px] shadow-lg"
            >
              <h3 className="text-lg font-bold text-purple-600 mb-4">Share API to Group</h3>
              <form onSubmit={shareToGroup} className="space-y-3">
                <label className="block">
                  <div className="text-sm mb-1">Select Group</div>
                  <select
                    value={shareGroupId}
                    onChange={(e) => setShareGroupId(e.target.value)}
                    className="w-full p-3 rounded border"
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
