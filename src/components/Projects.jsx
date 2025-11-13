import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

import adatechImg from "../assets/adatech.png";
import nextgenImg from "../assets/nextgen.png";
import skyglowImg from "../assets/skyglow.png";
import logitransportImg from "../assets/logitransport.png";
import retromanagerImg from "../assets/retromanager.png";

const projects = [
  {
    title: "Ada Technical Institute",
    description:
      "A corporate learning and assessment platform for a technical institute, focusing on user experience and performance.",
    imageUrl: adatechImg,
    liveUrl: "https://adatech.infy.uk/?i=1",
    githubUrl: "#",
  },
  {
    title: "Nextgen CFO",
    description:
      "A modern financial dashboard for CFOs, built with React and a modern UI library to provide key insights.",
    imageUrl: nextgenImg,
    liveUrl: "https://nextgencfo.netlify.app/",
    githubUrl: "#",
  },
  {
    title: "SkyGlow Construction",
    description:
      "A professional website for a construction company, showcasing their portfolio and services.",
    imageUrl: skyglowImg,
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    title: "Logi Transport Hub",
    description:
      "A logistics and transportation management system for tracking shipments and managing fleets.",
    imageUrl: logitransportImg,
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    title: "Feedback Hub System",
    description:
      "A centralized system for collecting, managing, and analyzing user feedback for various applications.",
    imageUrl:
      "https://via.placeholder.com/400x250/10B981/FFFFFF?text=Feedback+Hub",
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    title: "JAKE Retro Download Manager",
    description:
      "A desktop application built with Python for managing and accelerating file downloads with a retro UI.",
    imageUrl: retromanagerImg,
    liveUrl: "#",
    githubUrl: "#",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const Projects = () => {
  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-4xl font-bold mb-12">My Work</h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
              variants={cardVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex justify-center space-x-4">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <FaExternalLinkAlt /> Live Demo
                  </a>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <FaGithub /> GitHub
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
