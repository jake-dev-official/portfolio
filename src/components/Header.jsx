import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { motion, useScroll } from 'framer-motion';
import logo from '../assets/logo.png';

const Header = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-1 transition-all duration-300"
      animate={{
        backgroundColor: isScrolled ? 'rgba(17, 24, 39, 0.8)' : 'rgba(17, 24, 39, 0)',
        backdropFilter: isScrolled ? 'blur(10px)' : 'blur(0px)',
      }}
    >
      <div className="flex items-center">
        <Link to="hero" smooth={true} duration={500} className="cursor-pointer">
          <img
            src={logo}
            alt="JAKE"
            className="h-24 w-auto hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>
      <nav className="flex h-full items-center mt-1.5">
        <ul className="flex items-center space-x-8 text-lg font-medium">
          <li className="cursor-pointer hover:text-primary transition-colors">
            <Link to="about" smooth={true} duration={500} offset={-70}>
              About
            </Link>
          </li>
          <li className="cursor-pointer hover:text-primary transition-colors">
            <Link to="projects" smooth={true} duration={500} offset={-70}>
              Projects
            </Link>
          </li>
          <li className="cursor-pointer hover:text-primary transition-colors">
            <Link to="contact" smooth={true} duration={500} offset={-70}>
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </motion.header>
  );
};

export default Header;
