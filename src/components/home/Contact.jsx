import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import SideBar from "./SideBar";
import axios from "axios";

const Contact = () => {
  const [sideBar, setSidebar] = useState(true);
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [wholeProblem, setWholeProblem] = useState("");
  const [message, setMessage] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://apiverse-backend-one.vercel.app";

  useEffect(() => {
    const storedName = localStorage.getItem("firstName") || "";
    const storedEmail = localStorage.getItem("email") || "";
    setName(storedName);
    setUserEmail(storedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !wholeProblem.trim()) {
      setMessage("❌ Please fill all fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ Please log in first to send feedback.");
        return;
      }

      const payload = {
        name,
        email: userEmail,
        subject,
        message: wholeProblem,
      };

       const res = await axios.post(
  `${BASE_URL}/feedback/sendFeedback`,
  payload,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  }
);


      if (res.data.success) {
        setMessage("✅ Feedback sent successfully!");
        setSubject("");
        setWholeProblem("");
      } else {
        setMessage("❌ Something went wrong.");
      }
    } catch (err) {
      console.error("Feedback Error:", err.response?.data || err.message);
      setMessage("❌ Failed to send feedback.");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 px-10">
      <Nav sideBar={sideBar} setSidebar={setSidebar} />
      <SideBar sideBar={sideBar} />

      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out ${
          sideBar ? "sm:pl-[220px]" : "sm:pl-[60px]"
        } min-h-screen overflow-y-auto`}
      >
        <div className="max-w-7xl mx-auto ">
          <h2 className="text-center text-3xl font-bold text-blue-500 mb-8 mt-6">
            Contact Us
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-gray-800 dark:text-gray-300">
            {/* Left Info */}
            <div className="dark:bg-gray-800 bg-gray-200 p-5 rounded-2xl space-y-4 shadow">
              <h3 className="text-blue-500 text-2xl font-bold text-center mb-3">
                Contact Info
              </h3>

              <div className="flex gap-4 items-center dark:bg-gray-700 bg-gray-300 rounded-xl p-4">
                <i className="fas fa-envelope text-blue-400 text-xl"></i>
                <div>
                  <h4 className="text-lg font-bold text-blue-500">Email</h4>
                  <p className="text-sm">apiverse@gmail.com</p>
                </div>
              </div>

              <div className="flex gap-4 items-center dark:bg-gray-700 bg-gray-300 rounded-xl p-4">
                <i className="fas fa-phone text-blue-400 text-xl"></i>
                <div>
                  <h4 className="text-lg font-bold text-blue-500">Phone</h4>
                  <p className="text-sm">+92304-2507846</p>
                </div>
              </div>

              <div className="flex gap-4 items-center dark:bg-gray-700 bg-gray-300 rounded-xl p-4">
                <i className="fas fa-map-marker-alt text-blue-400 text-xl"></i>
                <div>
                  <h4 className="text-lg font-bold text-blue-500">Address</h4>
                  <p className="text-sm">
                    Benazir Bhutto Shaheed University, Lyari, Karachi
                  </p>
                </div>
              </div>
            </div>

            {/* Right Feedback Form */}
            <div className="dark:bg-gray-800 bg-gray-200 p-5 rounded-2xl shadow">
              <h3 className="text-blue-500 text-xl font-bold text-center mb-5">
                Send us a Message
              </h3>

              {message && (
                <p className="text-center mb-3 font-semibold">{message}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-blue-400 font-semibold text-[15px]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    readOnly
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-blue-400 font-semibold text-[15px]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-blue-400 font-semibold text-[15px]">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white outline-none"
                    placeholder="Enter subject"
                  />
                </div>

                <div>
                  <label className="text-blue-400 font-semibold text-[15px]">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    value={wholeProblem}
                    onChange={(e) => setWholeProblem(e.target.value)}
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white outline-none"
                    placeholder="Write your message..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded transition-all active:scale-95"
                >
                  <i className="fas fa-paper-plane"></i> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
