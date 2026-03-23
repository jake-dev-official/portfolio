import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const NotFound = () => {
    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-9xl font-bold text-gray-800 mb-4 tracking-tighter shadow-none">404</h1>
                <h2 className="text-4xl font-bold mb-6 text-gray-100">Page Not Found</h2>
                <p className="text-gray-400 max-w-md mb-12 text-lg">
                    The page you are looking for is unavailable.
                </p>

                <Link
                    to="/"
                    className="group inline-flex flex-col items-center justify-center transition-transform hover:scale-105"
                    title="Return to Portfolio"
                >
                    <img
                        src={logo}
                        alt="JAKE"
                        className="h-20 opacity-80 group-hover:opacity-100 drop-shadow-xl transition-opacity duration-300"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </Link>
            </motion.div>

            {/* Subtle background decoration */}
            <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-[120px]"></div>
            </div>
        </div>
    );
};

export default NotFound;
