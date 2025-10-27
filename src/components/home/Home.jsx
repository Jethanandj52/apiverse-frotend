import React, { useState } from "react";
import Nav from "./Nav";
import SideBar from "./SideBar";
import AnimatedSection from "../../components/AnimatedSection";

const Home = () => {
  const [sideBar, setSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState("api"); // 👈 Tabs state

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white overflow-hidden">
      {/* Navbar */}
      <Nav sideBar={sideBar} setSidebar={setSidebar} />
      {/* Sidebar */}
      <SideBar sideBar={sideBar} />

      <div
        className={`pt-[70px] transition-all duration-300 ease-in-out
          ${
            sideBar
              ? "pl-[60px] sm:pl-[60px] md:pl-[180px] lg:pl-[220px]"
              : "pl-[60px]"
          }
          min-h-screen overflow-y-auto px-4 sm:px-6 md:px-10`}
      >
        <div className="pt-10 px-2 sm:px-5 pb-10 max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-5 border-b border-gray-400 dark:border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab("api")}
              className={`pb-2 px-4 font-semibold transition ${
                activeTab === "api"
                  ? "border-b-4 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-blue-400"
              }`}
            >
              API
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`pb-2 px-4 font-semibold transition ${
                activeTab === "library"
                  ? "border-b-4 border-green-500 text-green-500"
                  : "text-gray-500 hover:text-green-400"
              }`}
            >
              Library
            </button>
          </div>

          {/* ================== API TAB ================== */}
          {activeTab === "api" && (
            <>
              {/* 👇 Tumhara original API wala content - NO CHANGES */}
             <AnimatedSection> <section> <h2 className="text-blue-500 text-3xl font-bold mb-5">📘 What is an API?</h2> <p className="leading-8"> API stands for <strong>Application Programming Interface</strong>. It’s a way for two different software programs to talk to each other and share data or functions. </p> <p className="leading-8"> Think of an API as a <strong>middleman</strong> or <strong>messenger</strong> that delivers your request to a system and brings back the result — without you needing to know what’s happening behind the scenes. </p> <p className="leading-8"> In simple words: An API is like a bridge that connects your app to another app or service, and helps them exchange data securely. </p> </section> </AnimatedSection> <AnimatedSection delay={0.2}> <section> <h2 className="text-blue-500 text-3xl font-bold mb-5 mt-10">🛠️ Real-Life Example of an API</h2> <p className="leading-8"> Imagine you're in a restaurant. You place an order with the waiter... </p> <p className="mt-2 leading-10"> <strong>You:</strong> The user or client<br /> <strong>Waiter:</strong> The API<br /> <strong>Kitchen:</strong> The server or database </p> <p> The waiter (API) knows how to talk to the kitchen (server), and you just get the result (your food or data) without worrying about how it was made. </p> </section> </AnimatedSection> <AnimatedSection delay={0.3}> <section> <h2 className="text-blue-500 text-3xl font-bold mb-5 mt-10">🧭 How APIs Work (Step-by-Step)</h2> <ol className="list-decimal list-inside space-y-1 pl-2 leading-8"> <li>You (the user) make a request — e.g., weather info.</li> <li>Your app sends this request to a weather API.</li> <li>The API checks permissions and sends it to the server.</li> <li>The server prepares the data and sends it back through the API.</li> <li>Your app receives the result and shows it to you.</li> </ol> </section> </AnimatedSection> <AnimatedSection delay={0.4}> <section> <h2 className="text-blue-500 text-3xl font-bold mb-5 mt-10">📚 Common API Terms Explained</h2> <ul className="list-disc list-inside space-y-1 pl-2 leading-8"> <li><strong>Endpoint:</strong> A specific URL for a resource (like /users).</li> <li><strong>Request:</strong> The action your app sends to the API (e.g. GET, POST).</li> <li><strong>Response:</strong> The data returned by the API.</li> <li><strong>API Key:</strong> A unique code to authenticate your app.</li> <li><strong>Rate Limit:</strong> The allowed number of API calls per time period.</li> </ul> </section> </AnimatedSection> <AnimatedSection delay={0.5}> <section> <h2 className="text-blue-500 text-3xl font-bold mb-5 mt-10">💡 Why APIs are Important</h2> <ul className="list-disc list-inside space-y-1 pl-2 leading-8"> <li><strong>Saves Time:</strong> Use existing tools instead of building from scratch.</li> <li><strong>Reusability:</strong> Same API used across many apps.</li> <li><strong>Global Connection:</strong> Apps and devices communicate easily.</li> <li><strong>Security:</strong> Access can be controlled with tokens, keys, OAuth.</li> <li><strong>Improved UX:</strong> APIs make apps smarter, faster, and more useful.</li> </ul> </section> </AnimatedSection> <AnimatedSection delay={0.6}> <section> <h2 className="text-blue-500 text-3xl font-bold mb-5 mt-10">🔍 Types of APIs</h2> <table className="w-full text-left border border-gray-400 dark:border-gray-600 rounded overflow-hidden"> <thead className="bg-blue-800 text-white"> <tr> <th className="p-2 border-r border-white">Type</th> <th className="p-2">Description</th> </tr> </thead> <tbody className="bg-blue-100 dark:bg-gray-800 dark:text-white"> <tr className="hover:bg-blue-200 dark:hover:bg-gray-700 cursor-pointer"> <td className="p-2 border-r border-gray-300 dark:border-gray-600">REST API</td> <td className="p-2">Most common. Uses HTTP methods (GET, POST, etc.).</td> </tr> <tr className="hover:bg-blue-200 dark:hover:bg-gray-700 cursor-pointer"> <td className="p-2 border-r border-gray-300 dark:border-gray-600">SOAP API</td> <td className="p-2">XML-based. Strict & secure, often used in enterprise systems.</td> </tr> <tr className="hover:bg-blue-200 dark:hover:bg-gray-700 cursor-pointer"> <td className="p-2 border-r border-gray-300 dark:border-gray-600">GraphQL API</td> <td className="p-2">Flexible querying system made by Facebook.</td> </tr> <tr className="hover:bg-blue-200 dark:hover:bg-gray-700 cursor-pointer"> <td className="p-2 border-r border-gray-300 dark:border-gray-600">Web APIs</td> <td className="p-2">APIs that run over the internet (e.g., browser APIs).</td> </tr> </tbody> </table> </section> </AnimatedSection> <AnimatedSection delay={0.7}> <section> <h2 className="text-blue-500 text-3xl font-bold mb-5 mt-10">🌐 Real-World Uses of APIs</h2> <ul className="list-disc list-inside space-y-1 pl-2 leading-8"> <li>Weather Apps → Use weather APIs for forecasts.</li> <li>Login Systems → Use Google/Facebook APIs for auth.</li> <li>Online Payments → Use Stripe/PayPal APIs.</li> <li>Maps & Navigation → Use Google Maps API.</li> <li>Social Media → Use Instagram/Twitter APIs for posts & comments.</li> <li>Chat Apps → Use messaging APIs for real-time chats.</li> </ul> </section> </AnimatedSection> <AnimatedSection delay={0.8}> <section> <h2 className="text-blue-500 text-3xl font-bold mb-5 mt-10">👨‍💻 How Developers Use APIs</h2> <p className="leading-8"> Developers write code to connect their apps with APIs. They send requests, get responses, and show that data in their apps — like products, user data, or weather info. </p> <p className="mt-2 leading-8"> Most APIs have official documentation that explains usage, endpoints, request/response format, and authentication (like API keys or OAuth). </p> </section> </AnimatedSection>

              {/* baki API sections same as tumhare original code */}
              {/* ... */}
            </>
          )}

          {/* ================== LIBRARY TAB ================== */}
          {activeTab === "library" && (
            <>
              <AnimatedSection>
                <section>
                  <h2 className="text-green-500 text-3xl font-bold mb-5">📚 What is a Library?</h2>
                  <p className="leading-8">
                    A <strong>Library</strong> is a collection of pre-written code that developers can
                    use directly in their projects to save time and effort.
                  </p>
                  <p className="leading-8">
                    Think of a library as a <strong>toolbox</strong> filled with ready-to-use tools.
                    Instead of building everything from scratch, you pick the tool you need and use it.
                  </p>
                  <p className="leading-8">
                    In simple words: A Library helps developers by providing solutions for common tasks
                    like data formatting, UI design, or database handling.
                  </p>
                </section>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <section>
                  <h2 className="text-green-500 text-3xl font-bold mb-5 mt-10">🛠️ Real-Life Example of a Library</h2>
                  <p className="leading-8">
                    Imagine you want to build a house. Instead of making bricks, cement, and tools by
                    yourself, you buy them ready-made from the market. These ready-made items are like
                    <strong> libraries</strong>.
                  </p>
                  <p className="mt-2 leading-10">
                    <strong>You:</strong> The developer<br />
                    <strong>Library:</strong> The ready-made materials<br />
                    <strong>Project:</strong> The final house (your app)
                  </p>
                  <p>
                    Libraries save time and effort by giving you reliable building blocks.
                  </p>
                </section>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <section>
                  <h2 className="text-green-500 text-3xl font-bold mb-5 mt-10">🧭 How Libraries Work (Step-by-Step)</h2>
                  <ol className="list-decimal list-inside space-y-1 pl-2 leading-8">
                    <li>You install or import the library into your project.</li>
                    <li>You call its functions or use its components.</li>
                    <li>The library executes pre-written code.</li>
                    <li>Your project shows the result without extra effort.</li>
                  </ol>
                </section>
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <section>
                  <h2 className="text-green-500 text-3xl font-bold mb-5 mt-10">📚 Common Library Terms Explained</h2>
                  <ul className="list-disc list-inside space-y-1 pl-2 leading-8">
                    <li><strong>Module:</strong> A single file or unit inside a library.</li>
                    <li><strong>Package:</strong> A collection of modules or libraries.</li>
                    <li><strong>Dependency:</strong> Other libraries your project needs to run.</li>
                    <li><strong>Import:</strong> Bringing library functions into your code.</li>
                    <li><strong>Version:</strong> The release number of the library (e.g., v1.2.3).</li>
                  </ul>
                </section>
              </AnimatedSection>

              <AnimatedSection delay={0.5}>
                <section>
                  <h2 className="text-green-500 text-3xl font-bold mb-5 mt-10">💡 Why Libraries are Important</h2>
                  <ul className="list-disc list-inside space-y-1 pl-2 leading-8">
                    <li><strong>Saves Time:</strong> No need to write common features again.</li>
                    <li><strong>Reusability:</strong> Same library used in many projects.</li>
                    <li><strong>Community Support:</strong> Documentation and tutorials are widely available.</li>
                    <li><strong>Efficiency:</strong> Libraries are tested and optimized.</li>
                    <li><strong>Focus:</strong> Developers focus on main logic instead of repeating basics.</li>
                  </ul>
                </section>
              </AnimatedSection>

              <AnimatedSection delay={0.6}>
                <section>
                  <h2 className="text-green-500 text-3xl font-bold mb-5 mt-10">🔍 Types of Libraries</h2>
                  <table className="w-full text-left border border-gray-400 dark:border-gray-600 rounded overflow-hidden">
                    <thead className="bg-green-800 text-white">
                      <tr>
                        <th className="p-2 border-r border-white">Type</th>
                        <th className="p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-green-100 dark:bg-gray-800 dark:text-white">
                      <tr className="hover:bg-green-200 dark:hover:bg-gray-700 cursor-pointer">
                        <td className="p-2 border-r border-gray-300 dark:border-gray-600">UI Libraries</td>
                        <td className="p-2">For building interfaces (React, Bootstrap).</td>
                      </tr>
                      <tr className="hover:bg-green-200 dark:hover:bg-gray-700 cursor-pointer">
                        <td className="p-2 border-r border-gray-300 dark:border-gray-600">Utility Libraries</td>
                        <td className="p-2">For extra functions (Lodash, Moment.js).</td>
                      </tr>
                      <tr className="hover:bg-green-200 dark:hover:bg-gray-700 cursor-pointer">
                        <td className="p-2 border-r border-gray-300 dark:border-gray-600">Data Libraries</td>
                        <td className="p-2">For handling data & requests (Axios, D3.js).</td>
                      </tr>
                      <tr className="hover:bg-green-200 dark:hover:bg-gray-700 cursor-pointer">
                        <td className="p-2 border-r border-gray-300 dark:border-gray-600">ML/AI Libraries</td>
                        <td className="p-2">For machine learning (TensorFlow, PyTorch).</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </AnimatedSection>

              <AnimatedSection delay={0.7}>
                <section>
                  <h2 className="text-green-500 text-3xl font-bold mb-5 mt-10">🌐 Real-World Uses of Libraries</h2>
                  <ul className="list-disc list-inside space-y-1 pl-2 leading-8">
                    <li>React → Building web interfaces.</li>
                    <li>Axios → Fetching data from APIs.</li>
                    <li>Chart.js → Creating interactive charts.</li>
                    <li>Lodash → Simplifying complex JavaScript tasks.</li>
                    <li>TensorFlow → Machine learning applications.</li>
                    <li>Tailwind CSS → Quick and responsive styling.</li>
                  </ul>
                </section>
              </AnimatedSection>

              <AnimatedSection delay={0.8}>
                <section>
                  <h2 className="text-green-500 text-3xl font-bold mb-5 mt-10">👨‍💻 How Developers Use Libraries</h2>
                  <p className="leading-8">
                    Developers install libraries (via npm, yarn, pip, etc.), import them into their
                    projects, and directly use the functions, classes, or components provided.
                  </p>
                  <p className="mt-2 leading-8">
                    Most libraries come with official documentation that explains installation,
                    usage, available methods, and version updates.
                  </p>
                </section>
              </AnimatedSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
