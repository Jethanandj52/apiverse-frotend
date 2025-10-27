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
const BASE_URL = import.meta.env.BASE_URL;
  // ✅ Load user data from localStorage once on mount
  useEffect(() => {
    const storedName = localStorage.getItem("firstName") || "";
    const storedEmail = localStorage.getItem("email") || "";
    setName(storedName);
    setUserEmail(storedEmail);
  }, []);

  let phone = "+92304-2507846";
  let email = "apiverse@gmail.com";
  let address = "Benazir Bhutto Shaheed University, Lyari, Karachi";

  // ✅ Submit Feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !wholeProblem.trim()) {
      setMessage("❌ Please fill all fields.");
      return;
    }

    try {
      const res = await axios.post("/api/feedback/sendFeedback", {
        name,
        email: userEmail,
        subject,
        message: wholeProblem,
      });

      if (res.data.success) {
        setMessage("✅ Feedback sent successfully!");
        setSubject("");
        setWholeProblem("");
      } else {
        setMessage("❌ Something went wrong. Try again!");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to send feedback.");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ✅ Navbar */}
      <Nav sideBar={sideBar} setSidebar={setSidebar} />

      {/* ✅ Sidebar */}
      <SideBar sideBar={sideBar} />

      {/* ✅ Main Content */}
      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out ${
          sideBar ? "pl-[220px]" : "pl-[60px]"
        } min-h-screen overflow-y-auto dark:bg-gray-900 bg-gray-100 text-black dark:text-white p-4`}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold text-blue-500 mb-8 mt-6">
            Contact Us
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-gray-800 dark:text-gray-300">
            {/* Left Contact Info Panel */}
            <div className="dark:bg-gray-800 bg-gray-200 p-5 rounded-2xl space-y-4 shadow">
              <div className="text-blue-500 text-2xl font-bold text-center mb-3">
                <i className="fas fa-message"></i> Contact Us
              </div>
              <p className="text-gray-700 dark:text-gray-200 text-[15px] font-medium mb-3 text-center md:text-left">
                Have a question or feedback? We'd love to hear from you!
              </p>

              {/* Email */}
              <div className="flex gap-4 items-center dark:bg-gray-700 bg-gray-300 rounded-xl p-4">
                <i className="fas fa-envelope text-blue-400 text-xl"></i>
                <div>
                  <h4 className="text-lg font-bold text-blue-500">Email</h4>
                  <p className="text-sm break-words">{email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 items-center dark:bg-gray-700 bg-gray-300 rounded-xl p-4">
                <i className="fas fa-phone text-blue-400 text-xl"></i>
                <div>
                  <h4 className="text-lg font-bold text-blue-500">Phone</h4>
                  <p className="text-sm">{phone}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-4 items-center dark:bg-gray-700 bg-gray-300 rounded-xl p-4">
                <i className="fas fa-map-marker-alt text-blue-400 text-xl"></i>
                <div>
                  <h4 className="text-lg font-bold text-blue-500">Address</h4>
                  <p className="text-sm">{address}</p>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex justify-center md:justify-around items-center mt-6 text-2xl text-blue-400 gap-6">
                <a href="#"><i className="fab fa-github hover:text-blue-200 active:scale-90 transition-all"></i></a>
                <a href="#"><i className="fab fa-linkedin hover:text-blue-200 active:scale-90 transition-all"></i></a>
                <a href="#"><i className="fab fa-facebook hover:text-blue-200 active:scale-90 transition-all"></i></a>
                <a href="#"><i className="fab fa-instagram hover:text-blue-200 active:scale-90 transition-all"></i></a>
              </div>
            </div>

            {/* Right Message Form */}
            <div className="dark:bg-gray-800 bg-gray-200 p-5 rounded-2xl shadow">
              <div className="text-blue-500 text-xl font-bold text-center mb-5">
                Send us a Message
              </div>

              {message && (
                <p className="text-center mb-3 font-semibold">
                  {message}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (readonly) */}
                <div>
                  <label className="text-blue-400 font-semibold text-[15px]">Name</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white outline-none cursor-not-allowed"
                    value={name}
                    readOnly
                  />
                </div>

                {/* Email (readonly) */}
                <div>
                  <label className="text-blue-400 font-semibold text-[15px]">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white outline-none cursor-not-allowed"
                    value={userEmail}
                    readOnly
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="text-blue-400 font-semibold text-[15px]">Subject</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white outline-none"
                    placeholder="Enter Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-blue-400 font-semibold text-[15px]">Message</label>
                  <textarea
                    rows="4"
                    className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white outline-none"
                    placeholder="Write your message..."
                    value={wholeProblem}
                    onChange={(e) => setWholeProblem(e.target.value)}
                  />
                </div>

                {/* Submit */}
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
