import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './components/login/Login.jsx';
import SignUp from './components/login/SignUp.jsx';
import Forget from './components/login/Forget.jsx';
import ResetPassword from './components/login/resetPassword.jsx';

import Home from './components/home/Home.jsx';
import About from './components/home/About.jsx';
import Contact from './components/home/Contact.jsx';
import HomeApi from './components/home/HomeApi.jsx';
import Library from './components/home/Library.jsx';
import Team from './components/home/Team.jsx';
 

import ViewDoc from './components/home/APi/ViewDocApi.jsx';
import ViewDocLib from './components/home/Library/ViewDocLibHome.jsx';

import Dashboard from './components/dashboard/Dashboard.jsx';
import ApiManagement from './components/dashboard/ManagementApi.jsx';
import LibraryManagement from './components/dashboard/LibraryManagement.jsx';
import Analytics from './components/dashboard/Analytics.jsx';
import UserManagement from './components/dashboard/UserManagement.jsx';

import PrivateRoute from './components/privateRoute.jsx'; // ✅ Import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Gemini from './components/ai/Gemini.jsx';
import Postman from './components/home/Postman.jsx'; // ✅ Import Postman component
import Feedbacks from './components/dashboard/Feedback.jsx';
import GroupInvite from './components/home/GroupInviteDashbard.jsx';

const App = () => {
  const [showDoc, setShowDoc] = useState(false);
  const [showDocLib, setShowDocLib] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <>
      <Routes>
        {/* 🔓 Public Routes */}
        <Route path='/' element={  <Login />} />
        <Route path='/SignUp' element={<SignUp />} />
        <Route path='/Forget' element={<Forget />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
       
       
       <Route path='/Home' element={<PrivateRoute><Home /></PrivateRoute>} />
<Route path='/about' element={<PrivateRoute><About /></PrivateRoute>} />
<Route path='/contact' element={<PrivateRoute><Contact /></PrivateRoute>} />
<Route path='/homeApi' element={<PrivateRoute><HomeApi /></PrivateRoute>} />
<Route path='/team' element={<PrivateRoute><Team /></PrivateRoute>} />
<Route path='/library' element={<PrivateRoute><Library /></PrivateRoute>} />
 
<Route path='/geminiAi' element={<PrivateRoute><Gemini /></PrivateRoute>} />
<Route path='/Postman' element={<PrivateRoute><Postman /></PrivateRoute>} />  {/* ✅ New Postman Route */}
<Route path='/feedbacks' element={<PrivateRoute allowedForAdminOnly={true}><Feedbacks /></PrivateRoute>} />  {/* ✅ New Feedback Route */}
<Route path='/groupInvites' element={<PrivateRoute><GroupInvite /></PrivateRoute>} />  {/* ✅ New Group Invite Route */}


{/* ✅ Admin-only Routes */}
<Route path='/Dashboard' element={<PrivateRoute allowedForAdminOnly={true}><Dashboard /></PrivateRoute>} />
<Route path='/managementApi' element={<PrivateRoute allowedForAdminOnly={true}><ApiManagement /></PrivateRoute>} />
<Route path='/libraryManagement' element={<PrivateRoute allowedForAdminOnly={true}><LibraryManagement /></PrivateRoute>} />
<Route path='/analytics' element={<PrivateRoute allowedForAdminOnly={true}><Analytics /></PrivateRoute>} />
<Route path='/userManagement' element={<PrivateRoute allowedForAdminOnly={true}><UserManagement /></PrivateRoute>} />

      </Routes>

      {/* 🔍 Documentation Popups */}
      {showDoc && <ViewDoc selectedId={selectedId} setShowDoc={setShowDoc} />}
      {showDocLib && <ViewDocLib selectedId={selectedId} setShowDocLib={setShowDocLib} />}

      {/* 🔔 Toasts */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default App;
