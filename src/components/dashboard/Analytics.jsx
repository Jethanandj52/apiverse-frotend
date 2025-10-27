import React, { useEffect, useState } from "react";
import Nav from "../home/Nav";
import SideBar from "./SideBar";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FaChartLine, FaChartPie, FaCode, FaLine } from "react-icons/fa";

const COLORS = ["#10b981", "#f43f5e"]; // Active/Inactive

const Analytics = () => {
  const [sideBar, setSidebar] = useState(true);
  const [countUser, setCountUser] = useState([]);
  const [countApi, setCountApi] = useState([]);
  const [countLib, setCountLib] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    fetchApi();
  }, []);

  const fetchApi = async () => {
    try {
      const resUser = await axios.get(`${BASE_URL}/user/admin/users` );
      const resApi = await axios.get(`${BASE_URL}/rApi/showApi`);
      const resLib = await axios.get(`${BASE_URL}/lib/getLibraries`);

      const users = resUser.data;
      const apis = resApi.data;
      const libs = resLib.data;

      setCountUser(users);
      setCountApi(apis);
      setCountLib(libs);

      const languageCount = {};
      apis.forEach((api) => {
        const lang = api.language || "Unknown";
        languageCount[lang] = (languageCount[lang] || 0) + 1;
      });

      setChartData(
        Object.entries(languageCount).map(([name, value]) => ({
          name,
          value,
        }))
      );

    const active = users.filter((u) => u.isActive === true || u.isActive === "true" || u.isActive === 1).length;

    const inactive = users.length - active;

setPieData([
  { name: "Active", value: active },
  { name: "Inactive", value: inactive },
]);

    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white overflow-hidden">
      <Nav sideBar={sideBar} setSidebar={setSidebar} />
      <SideBar sideBar={sideBar} />

 
      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out ${
          sideBar ? "pl-[300px]" : "pl-[60px]"
        } min-h-screen overflow-y-auto p-6`}

      >
        <div className="flex items-center text-center gap-5 text-3xl font-bold  p-5">
          <FaChartLine className="text-4xl"/> 
          <h2 >  Analytics</h2>
          </div>
        <div className="grid gap-6 md:grid-cols-2 m-5">
          {/* 📊 Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-3 text-xl font-semibold mb-4">
              <FaCode className="text-blue-500" />
              <h2>Top API Languages</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="url(#barColor)"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
                <defs>
                  <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🥧 Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-3 text-xl font-semibold mb-4">
              <FaChartPie className="text-green-500" />
              <h2>User Activity</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
