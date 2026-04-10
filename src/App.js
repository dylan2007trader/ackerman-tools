import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainHubPage from "./pages/MainHubPage";
import ResumeToolPage from "./pages/ResumeToolPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainHubPage />} />
        <Route path="/resume-builder" element={<ResumeToolPage />} />
      </Routes>
    </Router>
  );
}