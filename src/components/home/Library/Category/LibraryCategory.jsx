import React, { useEffect, useState, useTransition } from "react";
import { useParams, Link } from "react-router-dom";
// import { getFirestore, collection, getDocs } from "../../../Firebase/Firebase-config";
import Nav from "../../Nav";
import SideBar from "../../SideBar";

const LibraryCategory = ({ setShowDocLib, setSelectedId }) => {
  const { category } = useParams();
  const [apiData, setApiData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [sideBar, setSidebar] = useState(true);

  const db = getFirestore();

  // useEffect(() => {
  //   const fetchApiData = async () => {
  //     const data = await getDocs(collection(db, "libraries"));
  //     const allData = data.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     const unique = [...new Set(allData.map(item => item.category?.toLowerCase() || "unknown"))];
  //     setAllCategories(unique);

  //     const filtered = category && category !== "allLibrary"
  //       ? allData.filter(api => api.category?.toLowerCase() === category.toLowerCase())
  //       : allData;

  //     startTransition(() => {
  //       setApiData(filtered);
  //     });
  //   };

  //   fetchApiData();
  // }, [category]);

  return (
    <div className="h-screen overflow-hidden relative bg-white text-black dark:bg-gray-900 dark:text-white">
      {/* Navbar */}
      <Nav sideBar={sideBar} setSidebar={setSidebar} />

      {/* Sidebar */}
      <SideBar sideBar={sideBar} />

      {/* Main Content */}
      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out ${
          sideBar ? "pl-[220px]" : "pl-[60px]"
        } h-screen overflow-y-auto p-4`}
      >
        {/* Heading */}
        <div className="text-blue-600 dark:text-blue-400 font-bold text-4xl text-center mt-5 capitalize">
          {category === "allapi" || !category ? "All APIs" : `${category} APIs`}
        </div>

        {/* Loader */}
        {isPending ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-400 mx-auto mb-3"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
            {apiData.map((item, index) => (
              <div
                key={index}
                className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-xl p-5 hover:scale-102 transition-transform duration-300 space-y-4 cursor-pointer"
              >
                <div className="flex justify-between items-center border-b pb-2 border-blue-400">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <i className="fas fa-heart text-red-500"></i>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.description || "No description provided."}</p>
                <div><b>Language:</b> {Array.isArray(item.language) ? item.language.join(", ") : item.language}</div>
                <div><b>Security:</b> {item.security}</div>
                <div><b>License:</b> {item.license}</div>
                <div className="flex justify-between">
                  <button
                    className="bg-green-500 rounded px-4 py-1 font-bold hover:bg-green-700 active:scale-90 transition-all cursor-pointer w-full"
                    onClick={() => {
                      setSelectedId(item.id);
                      setTimeout(() => setShowDocLib(true), 10);
                    }}
                  >
                    View Docs
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Buttons */}
        <div className="mt-10 p-6">
          <h2 className="text-3xl font-bold mb-4">API Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {allCategories.map((cat, i) => (
              <Link
                key={i}
                to={`/Library/LibraryCategory/${cat}`}
                className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-semibold py-10 px-4 rounded shadow hover:bg-gray-400 dark:hover:bg-gray-500 hover:text-black active:scale-95 transition-all text-center text-2xl capitalize"
              >
                {cat}
              </Link>
            ))}
            <Link
              to="/Library/LibraryCategory/allLibrary"
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-semibold py-10 px-4 rounded shadow hover:bg-gray-400 dark:hover:bg-gray-500 hover:text-black active:scale-95 transition-all text-center text-2xl"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryCategory;
