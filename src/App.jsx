import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

const App = () => {
  useEffect(() => {
    // Intercept bad links locally when Vite servers index.html as a fallback
    const path = window.location.pathname;
    const base = import.meta.env.BASE_URL;
    if (path !== base && path !== base + 'index.html' && path.length > base.length) {
      window.location.replace(base + '#/404');
    }
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
