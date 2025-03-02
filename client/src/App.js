// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from "./components/UploadPage";
import ResultPage from "./components/ResultPage";
import "bootstrap/dist/css/bootstrap.min.css";


const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  </Router>
);

export default App;
