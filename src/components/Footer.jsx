import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 py-6 -mx-8 px-8">
      <div className="text-center text-gray-400">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="https://github.com/jake-dev-official" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-primary transition-colors">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/jerry-anane-0abbb1263/" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-primary transition-colors">
            <FaLinkedin />
          </a>
        </div>
        <p>&copy; {currentYear} JAKE. All Rights Reserved.</p>
        <Link to="/admin" className="text-xs text-gray-600 mt-2 block hover:underline">Admin Login</Link>
      </div>
    </footer>
  );
};

export default Footer;
