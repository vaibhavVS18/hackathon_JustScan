import React from 'react'
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Layout from '../components/Layout.jsx';
import Home from "../pages/Home.jsx";
import Scan from "../pages/Scan.jsx";
import Portal from "../pages/Portal.jsx";
import StudentList from "../pages/StudentList.jsx";
import EntryHistory from "../pages/EntryHistory.jsx";
import SetupEntry from "../pages/SetupEntry.jsx";
import Profile from "../pages/Profile.jsx";
import Members from "../pages/Members.jsx";
import ProtectedPortalRoute from '../components/ProtectedPortalRoute.jsx';

import TestIdCard from "../pages/TestIdCard.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      {/* scroll to top when route changes */}
      {/* <ScrollToTop/>    */}
      <Routes>
        <Route path="/test-id" element={<TestIdCard />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />

          {/* Protected Portal Routes */}
          <Route element={<ProtectedPortalRoute />}>
            <Route path="/portal" element={<Portal />} />
            <Route path="/portal/scan" element={<Scan />} />
            <Route path="/portal/students" element={<StudentList />} />
            <Route path="/portal/history" element={<EntryHistory />} />
            <Route path="/portal/setup" element={<SetupEntry />} />
            <Route path="/portal/members" element={<Members />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
