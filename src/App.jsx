import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';

const App = () => {
  console.log("Current Hash Path:", window.location.hash);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<div className="bg-black text-white p-10">404 - Not Found in Router (Hash: {window.location.hash})</div>} />
      </Routes>
    </Router>
  );
};

export default App;
