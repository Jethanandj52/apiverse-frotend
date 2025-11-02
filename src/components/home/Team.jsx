import React, { useState } from "react";
import Nav from "./Nav";
import SideBar from "./SideBar";
import jethanand from '../../assets/images/jethanand.png';
import jaiparkash from '../../assets/images/jaiparkash.png';
import dileep from '../../assets/images/dileep.png';

const Team = () => {
  const [sideBar, setSidebar] = useState(true);

  const team = [
    {
      image: jethanand,
      name: "Jethanand",
      role: "Backend Developer",
      discription: "Skilled in Node.js, Express, and MongoDB. Handles server logic and API management.",
      fb: "www.facebook.com",
      linkedin: "www.linkedin.com",
      git: "www.github.com"
    },
    {
      image: jaiparkash,
      name: "Jaiparkash",
      role: "React Developer",
      discription: "Expert in HTML, CSS, and JavaScript. Focused on UI/UX and responsive design.",
      fb: "www.facebook.com",
      linkedin: "www.linkedin.com",
      git: "www.insta.com"
    },
    {
      image: dileep,
      name: "Dileep Singh",
      role: "Documentation & Integration",
      discription: "Organized documentation expert skilled in JavaScript and Firebase. Manages API integration and clear technical writing.",
      fb: "www.facebook.com",
      linkedin: "www.linkedin.com",
      git: "www.insta.com"
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-black dark:text-white ">
      {/* ✅ Navbar */}
      <Nav sideBar={sideBar} setSidebar={setSidebar} />

      {/* ✅ Sidebar */}
      <SideBar sideBar={sideBar} />

      {/* ✅ Main Content */}
     <div
          className={`pt-[70px] transition-all duration-300 ease-in-out 
          ${sideBar ? "sm:pl-[220px]" : "sm:pl-[60px]"} 
          pl-0 min-h-screen overflow-y-auto p-6 h-screen`}
        >
        <div className="px-4 pt-10 pb-10">
          <h2 className="text-center text-3xl font-bold text-blue-500 mb-10">
            👥 Meet Our Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-10">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transition-all hover:scale-[1.02] duration-300"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-72 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-bold text-center text-blue-500">
                    {member.name}
                  </h3>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                    {member.discription}
                  </p>
                  <div className="flex justify-center gap-5 mt-4 text-blue-500">
                    <a
                      href={`https://${member.git}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-300"
                    >
                      <i className="fab fa-github text-xl"></i>
                    </a>
                    <a
                      href={`https://${member.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-300"
                    >
                      <i className="fab fa-linkedin text-xl"></i>
                    </a>
                    <a
                      href={`https://${member.fb}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-300"
                    >
                      <i className="fab fa-facebook text-xl"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
