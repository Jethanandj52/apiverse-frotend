import React, { useEffect, useState, useTransition } from "react";
import { Link } from "react-router-dom";
// import { getFirestore, collection, getDocs } from "../../Firebase/Firebase-config";

const PopularApi = ({ setShowDoc, setSelectedId }) => {
  const [popularApis, setPopularApis] = useState([]);
  const [allApis, setAllApis] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isPending, startTransition] = useTransition();

  // const db = getFirestore();

  // 🔁 Load APIs and favorites
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const snapshot = await getDocs(collection(db, "apis"));
  //     const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  //     setAllApis(data);
  //     setPopularApis(data.filter((api) => api.popular === true));

  //     const existing = JSON.parse(localStorage.getItem("favorites")) || [];
  //     setFavorites(existing.map((item) => item.id));
  //   };

  //   fetchData();
  //   startTransition(() => setTimeout(() => {}, 1000));
  // }, []);

  // ❤️ Add or remove from favorites
  const handleToggleFavorite = (item) => {
    const existing = JSON.parse(localStorage.getItem("favorites")) || [];
    const isAlreadySaved = existing.some((api) => api.id === item.id);

    let updatedFavorites;
    if (isAlreadySaved) {
      updatedFavorites = existing.filter((api) => api.id !== item.id);
    } else {
      updatedFavorites = [...existing, item];
    }

    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites.map((i) => i.id));
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white min-h-screen transition-colors duration-300">
      {/* 🔹 Title */}
      <h2 className="text-center text-4xl font-bold text-blue-500 dark:text-blue-400 py-6">🔥 Popular APIs</h2>

      {/* 🔄 Loading Spinner */}
      {isPending ? (
        <div className="flex justify-center items-center h-full py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 pb-10">
          {popularApis.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl p-5 hover:scale-[1.01] transition-transform duration-300 space-y-4 shadow-lg"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-blue-400 pb-2">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <i
                  className={`fas fa-heart cursor-pointer ${
                    favorites.includes(item.id) ? "text-red-500" : "text-gray-400"
                  }`}
                  onClick={() => handleToggleFavorite(item)}
                ></i>
              </div>

              {/* Description */}
              <p className="text-sm">{item.description || "No description provided."}</p>
              <div><b>Language:</b> {Array.isArray(item.language) ? item.language.join(", ") : item.language}</div>
              <div><b>Security:</b> {item.security || "N/A"}</div>
              <div><b>License:</b> {item.license || "N/A"}</div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-3 pt-2">
                <button
                  className="w-full bg-green-500 text-white font-bold py-2 rounded hover:bg-green-600 active:scale-95 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedId(item.id);
                    setTimeout(() => setShowDoc(true), 10);
                  }}
                >
                  📖 View Docs
                </button>
                <button
                  className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedId(item.id);
                    setTimeout(() => setShowDoc(true), 10);
                  }}
                >
                  ⚙️ Integration
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 API Categories */}
      <div className="mt-10 px-6 pb-20">
        <h2 className="text-3xl text-blue-500 dark:text-blue-400 font-bold mb-5">🗂️ API Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...new Set(allApis.map((item) => item.category?.toLowerCase() || "uncategorized"))].map((cat, idx) => (
            <Link
              key={idx}
              to={`/api/apiCategory/${cat}`}
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white py-8 px-4 rounded-lg shadow hover:bg-blue-300 dark:hover:bg-blue-500 hover:text-black transition-all text-center font-semibold text-lg capitalize"
            >
              {cat}
            </Link>
          ))}
          <Link
            to="/api/apiCategory/allapi"
            className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white py-8 px-4 rounded-lg shadow hover:bg-blue-300 dark:hover:bg-blue-500 hover:text-black transition-all text-center font-semibold text-lg"
          >
            View All
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PopularApi;
