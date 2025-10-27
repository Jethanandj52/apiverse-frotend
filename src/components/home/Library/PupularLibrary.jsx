import React, { useEffect, useState, useTransition } from "react";
import { Link } from "react-router-dom";
import ViewDocLib from "./ViewDocLib";
// import { getFirestore, collection, getDocs } from "../../Firebase/Firebase-config";

const PopularLibrary = ({ setShowDocLib, setSelectedId }) => {
  const [popularLibraries, setPopularLibraries] = useState([]);
  const [allLibraries, setAllLibraries] = useState([]);
  const [isPending, startTransition] = useTransition();

  // const db = getFirestore();

  // useEffect(() => {
  //   const fetchLibraryData = async () => {
  //     const data = await getDocs(collection(db, "libraries"));
  //     const all = data.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     setAllLibraries(all);
  //     const popular = all.filter(item => item.popular === true);
  //     setPopularLibraries(popular);
  //   };

  //   fetchLibraryData();

  //   startTransition(async () => {
  //     await new Promise((resolve) => {
  //       setTimeout(resolve, 1000);
  //     });
  //   });
  // }, []);

  return (
    <>
      <div className="text-blue-500 dark:text-blue-400 font-bold text-4xl text-center mt-5">
        Popular Libraries
      </div>

      {isPending ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-400 mx-auto mb-3"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
          {popularLibraries.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl p-5 hover:scale-[1.02] transition-transform duration-300 space-y-4 cursor-pointer shadow"
            >
              <div className="flex justify-between items-center border-b pb-2 border-blue-400">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <i className="fas fa-heart"></i>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {item.description || "No description provided."}
              </p>
              <div><b>Language:</b> {Array.isArray(item.language) ? item.language.join(", ") : item.language}</div>
              <div><b>Security:</b> {item.security}</div>
              <div><b>License:</b> {item.license}</div>
              <div className="flex justify-between">
                <button
                  className="bg-green-500 text-white rounded px-4 py-1 font-bold hover:bg-green-700 active:scale-90 transition-all w-full cursor-pointer"
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

      {/* 🔹 Library Categories */}
      <div className="mt-10 p-6">
        <h2 className="text-black dark:text-white text-3xl font-bold mb-4">
          Library Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
          {[...new Set(allLibraries.map(item => item.category?.toLowerCase() || "unknown"))].map((cat, index) => (
            <Link
              key={index}
              to={`/Library/LibraryCategory/${cat}`}
              className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-semibold py-10 px-4 rounded shadow hover:bg-blue-300 dark:hover:bg-blue-500 hover:text-black active:scale-95 transition-all text-center text-2xl capitalize"
            >
              {cat}
            </Link>
          ))}
          <Link
            to="/Library/LibraryCategory/allLibrary"
            className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white font-semibold py-10 px-4 rounded shadow hover:bg-blue-300 dark:hover:bg-blue-500 hover:text-black active:scale-95 transition-all text-center text-2xl"
          >
            View All
          </Link>
        </div>
      </div>
    </>
  );
};

export default PopularLibrary;
