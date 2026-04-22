import React from 'react';
import { motion } from 'framer-motion';
import SpinningShape from '../scenes/SpinningShape';

const Hero = () => {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
  };

  return (
    <section id="hero" className="min-h-screen flex items-center">
      <div className="container mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-3/5 text-center md:text-left mb-10 md:mb-0">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-4"
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            JAKE
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8"
            initial="hidden"
            animate="visible"
            variants={{ ...textVariants, transition: { ...textVariants.transition, delay: 0.3 } }}
          >
            Full-Stack Developer & UI/UX Enthusiast
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ ...textVariants, transition: { ...textVariants.transition, delay: 0.6 } }}
          >
            <a
              href="resume-placeholder.pdf"
              download
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
            >
              Download CV
            </a>
          </motion.div>
        </div>
        <div className="md:w-2/5 h-96 md:h-auto">
          <SpinningShape />
        </div>
      </div>
    </section>
  );
};

export default Hero;
