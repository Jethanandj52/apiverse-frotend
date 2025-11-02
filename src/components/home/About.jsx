import React, { useState } from "react";
import Nav from "./Nav";
import SideBar from "./SideBar";
import {
  FaCheckCircle,
  FaRocket,
  FaBug,
  FaClock,
  FaTools,
  FaLock,
  FaChartLine,
  FaFileCode,
} from "react-icons/fa";

const About = () => {
  const [sideBar, setSidebar] = useState(true);

  return (
    <div className="h-screen overflow-hidden ">
      {/* ✅ Navbar */}
      <Nav sideBar={sideBar} setSidebar={setSidebar} />

      {/* ✅ Sidebar */}
      <SideBar sideBar={sideBar} />

      {/* ✅ Main Content */}
      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out  ${
          sideBar ? "pl-[220px]" : "pl-[60px]"
        } h-screen overflow-y-auto bg-gray-200 dark:bg-gray-900 text-black dark:text-white p-4`}
      >
        <div className="bg-gray-100 dark:bg-[#1e293b] p-8 rounded-xl shadow-2xl space-y-6 border border-blue-400 border-l-8 m-5">
          {/* Header */}
          <h1 className="text-2xl md:text-3xl font-bold text-blue-400">
            <i className="fa fa-info-circle"></i> About APIVerse
          </h1>
          <p className="text-sm md:text-base leading-8">
            APIVerse is an all-in-one platform made to help developers work easily with APIs.
            Whether you're building a small app or a full system, APIVerse gives you all the tools
            you need to find, test, understand, and integrate APIs smoothly. It saves time, reduces
            errors, and improves the development experience.
          </p>

          {/* What is APIVerse */}
          <div>
            <h2 className="text-blue-300 font-semibold text-xl mb-2">🔹 What is APIVerse?</h2>
            <ul className="list-disc list-inside space-y-5 pl-2">
              <li>
                <strong className="text-blue-400 leading-8">Find Trusted APIs:</strong> A smart assistant for developers. Instead of searching for APIs everywhere,
                dealing with poor documentation, or struggling with integration, APIVerse brings
                everything in one place.
              </li>
              <li>
                <strong className="text-blue-400 leading-8">Read Clean Docs:</strong> Browse a library of useful, verified APIs with ratings, tags, and categories.
              </li>
              <li>
                <strong className="text-blue-400 leading-8">Real Clean Docs:</strong> Access structured and crowd-rated API documentation, with real examples and how-to guides.
              </li>
              <li>
                <strong className="text-blue-400 leading-8">Integrate Easily:</strong> Use ready-made code snippets, SDKs, and tools that help you speed up development.
              </li>
              <li>
                <strong className="text-blue-400 leading-8">Stay Secure:</strong> Manage API keys, set limits, and monitor requests to keep your app safe.
              </li>
            </ul>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="text-blue-300 font-semibold text-xl mb-2">🔹 Key Features</h2>
            <ul className="list-none space-y-5 pl-1">
              <li className="flex items-start gap-2">
                <FaClock className="text-blue-400 mt-1" />
                <span>
                  <strong className="text-blue-400 leading-8">Live Monitoring:</strong> Check API performance, speed, errors, and usage in real-time.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaRocket className="text-blue-400 mt-1" />
                <span>
                  <strong className="text-blue-400 leading-8">Version Control:</strong> Keep track of all API versions and manage your apps smoothly with updates.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaChartLine className="text-blue-400 mt-1" />
                <span>
                  <strong className="text-blue-400 leading-8">Analytics:</strong> Get clear charts and reports on how your APIs are used, by whom, and how often.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaBug className="text-blue-400 mt-1" />
                <span>
                  <strong className="text-blue-400 leading-8">Built-in Testing:</strong> Test APIs inside the platform without writing extra code or using third-party tools.
                </span>
              </li>
            </ul>
          </div>

          {/* Why Developers Love APIVerse */}
          <div>
            <h2 className="text-blue-300 font-semibold text-xl mb-2">🔹 Why Developers Love APIVerse</h2>
            <ul className="list-disc list-inside space-y-5 pl-2">
              <li>Speeds up API development and integration process</li>
              <li>Reduces confusion with clean documentation and examples</li>
              <li>Makes APIs more discoverable and usable</li>
              <li>Helps students, freelancers, and professional developers equally</li>
            </ul>
          </div>

          {/* Footer Quote */}
          <p className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700 pt-4 italic">
            “APIVerse is not just a tool — it's a full solution for modern developers. We've built
            it by understanding the real struggles developers face when working with APIs. Whether
            you're working on college projects, startup apps, or enterprise systems — APIVerse gives
            you the tools to build faster, better, and smarter.”
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
