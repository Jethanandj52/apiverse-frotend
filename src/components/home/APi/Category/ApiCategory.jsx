import React, { useEffect, useState, useTransition } from "react";
import { useParams, Link } from "react-router-dom";
// import { getFirestore, collection, getDocs } from "../../../Firebase/Firebase-config";
import Nav from "../../Nav";
import SideBar from "../../SideBar";

const ApiCategory = ({ setShowDoc, setSelectedId }) => {
  const { category } = useParams();
  const [apiData, setApiData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sideBar, setSidebar] = useState(true);
  const [isPending, startTransition] = useTransition();

  // const db = getFirestore();

  // useEffect(() => {
  //   const fetchApiData = async () => {
  //     const data = await getDocs(collection(db, "apis"));
  //     const allData = data.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     const unique = [...new Set(allData.map(item => item.category?.toLowerCase() || "unknown"))];
  //     setAllCategories(unique);

  //     const filtered = category && category !== "allapi"
  //       ? allData.filter(api => api.category?.toLowerCase() === category.toLowerCase())
  //       : allData;

  //     setApiData(filtered);

  //     const stored = JSON.parse(localStorage.getItem("favorites")) || [];
  //     setFavorites(stored.map(item => item.id));
  //   };

  //   fetchApiData();
  //   startTransition(() => setTimeout(() => {}, 1000));
  // }, [category]);

  const toggleFavorite = (item) => {
    let stored = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFav = stored.some(api => api.id === item.id);

    if (isFav) {
      stored = stored.filter(api => api.id !== item.id);
    } else {
      stored.push(item);
    }

    localStorage.setItem("favorites", JSON.stringify(stored));
    setFavorites(stored.map(api => api.id));
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <Nav sideBar={sideBar} setSidebar={setSidebar} />
      <SideBar sideBar={sideBar} />

      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out ${
          sideBar ? "pl-[220px]" : "pl-[60px]"
        } h-screen overflow-y-auto px-4`}
      >
        <div className="text-blue-500 dark:text-blue-400 font-bold text-4xl text-center mt-5 capitalize">
          {category === "allapi" || !category ? "All APIs" : `${category} APIs`}
        </div>

        {isPending ? (
          <div className="flex justify-center items-center h-full py-20">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
            {apiData.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl p-5 hover:scale-[1.02] transition-transform duration-300 space-y-4 shadow"
              >
                <div className="flex justify-between items-center border-b pb-2 border-blue-400">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <i
                    className={`fas fa-heart cursor-pointer ${favorites.includes(item.id) ? "text-red-500" : "text-gray-400"}`}
                    onClick={() => toggleFavorite(item)}
                  ></i>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.description || "No description provided."}</p>
                <div><b>Language:</b> {Array.isArray(item.language) ? item.language.join(", ") : item.language}</div>
                <div><b>Security:</b> {item.security || "N/A"}</div>
                <div><b>License:</b> {item.license || "N/A"}</div>
                <div className="flex justify-between pt-2 gap-2">
                  <button
                    className="bg-green-500 text-white rounded px-4 py-1 font-bold hover:bg-green-700 active:scale-90 transition-all cursor-pointer w-full"
                    onClick={() => {
                      setSelectedId(item.id);
                      setTimeout(() => setShowDoc(true), 10);
                    }}
                  >
                    📖 View Docs
                  </button>
                  <button
                    className="bg-blue-500 text-white rounded px-2 py-1 font-bold hover:bg-blue-700 active:scale-90 transition-all cursor-pointer w-full"
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

        {/* 🔹 Categories */}
        <div className="mt-10 p-6">
          <h2 className="text-3xl text-blue-500 dark:text-blue-400 font-bold mb-4">🗂️ API Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {allCategories.map((cat, i) => (
              <Link
                key={i}
                to={`/api/apiCategory/${cat}`}
                className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white py-8 px-4 rounded shadow hover:bg-blue-300 dark:hover:bg-blue-500 hover:text-black transition-all text-center font-semibold text-lg capitalize"
              >
                {cat}
              </Link>
            ))}
            <Link
              to="/api/apiCategory/allapi"
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white py-8 px-4 rounded shadow hover:bg-blue-300 dark:hover:bg-blue-500 hover:text-black transition-all text-center font-semibold text-lg"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiCategory;
