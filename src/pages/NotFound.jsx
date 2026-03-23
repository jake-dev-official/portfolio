import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-9xl font-bold text-gray-800 mb-4 tracking-tighter shadow-none">404</h1>
                <h2 className="text-4xl font-bold mb-6 underline decoration-blue-500 decoration-4 underline-offset-8">Page Not Found</h2>
                <p className="text-gray-400 max-w-md mb-10 text-lg leading-relaxed">
                    The project or page you are looking for has been moved, deleted, or is temporarily unavailable.
                </p>

                <Link
                    to="/"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-lg font-bold transition-all transform hover:scale-105 inline-block shadow-lg border border-blue-400/20"
                >
                    Return to Portfolio
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
