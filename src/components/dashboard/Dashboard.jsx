import React, { useState, useEffect, useRef } from "react";
import Nav from "../home/Nav";
import SideBar from "./SideBar";
import { FaHome } from "react-icons/fa";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion, useInView } from "framer-motion";

const Dashboard = () => {
  const [sideBar, setSidebar] = useState(true);

  const [countUser, setCountUser] = useState([]);
  const [countApi, setCountApi] = useState([]);
  const [countLib, setCountLib] = useState([]);

  const [callsToday, setCallsToday] = useState(0);
  const [libCallsToday, setLibCallsToday] = useState(0);
  const [securityAlerts, setSecurityAlerts] = useState(0);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch data function
  const fetchApi = async () => {
    try {
      // Users (admin route)
      const resUser = await axios.get(`${BASE_URL}/user/admin/users`, {
        withCredentials: true, // ✅ important for cookie auth
      });
      setCountUser(resUser.data);

      // APIs
      const resApi = await axios.get(`${BASE_URL}/rApi/showApi`, {
        withCredentials: true,
      });
      setCountApi(resApi.data);

      // Libraries
      const resLib = await axios.get(`${BASE_URL}/lib/getLibraries`, {
        withCredentials: true,
      });
      setCountLib(resLib.data);

    } catch (error) {
      console.log("❌ Error fetching data:", error.response?.data || error.message);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchApi();

    setCallsToday(Math.floor(Math.random() * 10) + 1);
    setLibCallsToday(Math.floor(Math.random() * 10) + 1);
    setSecurityAlerts(Math.floor(Math.random() * 20) + 1);
  }, []);

  // Chart data
  const chartData = [
    { name: "Users", value: countUser.length },
    { name: "APIs", value: countApi.length },
    { name: "Libraries", value: countLib.length },
  ];

  const statsRef = useRef(null);
  const chartRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });
  const isChartInView = useInView(chartRef, { once: true });

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
            <FaHome /> Dashboard Overview
          </div>

          {/* Stats Cards */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 40 }}
            animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5 text-center"
          >
            {[
              { title: "Users", value: countUser.length },
              { title: "Total APIs", value: countApi.length },
              { title: "Total Libraries", value: countLib.length },
              { title: "API Calls Today", value: callsToday },
              { title: "Library Calls Today", value: libCallsToday },
              { title: "Security Alerts", value: securityAlerts },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="dark:bg-gray-700 bg-white rounded py-4 cursor-pointer transition-all hover:shadow-2xl"
              >
                <div className="text-2xl font-bold text-blue-400 pb-1">{item.title}</div>
                <div className="text-[24px] font-bold">{item.value}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Chart Section */}
          <motion.div
            ref={chartRef}
            initial={{ opacity: 0, y: 60 }}
            animate={isChartInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 bg-white dark:bg-gray-800 rounded p-5 shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Platform Data Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4B5563" />
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 14 }} axisLine={{ stroke: "#6B7280" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF", fontSize: 14 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "8px" }} labelStyle={{ color: "#93C5FD" }} itemStyle={{ color: "#E5E7EB" }} />
                <Bar dataKey="value" fill="url(#barColor)" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
