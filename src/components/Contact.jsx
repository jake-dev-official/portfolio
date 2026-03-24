import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const DarkSwal = Swal.mixin({
  background: '#1f2937',
  color: '#fff',
  confirmButtonColor: '#3b82f6'
});

const Contact = () => {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    // Extracting data explicitly for JSON transmission
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => (data[key] = value));
    
    setStatus('submitting');
    
    try {
      const response = await fetch("https://formspree.io/f/mkgplakl", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setStatus('success');
        form.reset();
        DarkSwal.fire({
          title: 'Message Sent!',
          text: 'Thanks for reaching out! I will get back to you as soon as possible.',
          icon: 'success'
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      setStatus('error');
      DarkSwal.fire({
        title: 'Oops!',
        text: 'Something went wrong. Please try again or email me directly.',
        icon: 'error'
      });
    }
  };

  return (
    <motion.section 
      id="contact" 
      className="py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto text-center px-4">
        <h2 className="text-4xl font-bold mb-8">Get In Touch</h2>
        <p className="max-w-2xl mx-auto text-gray-300 mb-10 text-sm md:text-base">I'm currently open to new opportunities. If you have a project in mind or just want to say hi, feel free to reach out!</p>
        
        <form 
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto"
        >
          <div className="mb-4">
            <input 
              type="text" 
              name="name" 
              placeholder="Your Name" 
              required 
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white"
            />
          </div>
          <div className="mb-4">
            <input 
              type="email" 
              name="email" 
              placeholder="Your Email" 
              required 
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white"
            />
          </div>
          <div className="mb-4">
            <textarea 
              name="message" 
              placeholder="Your Message" 
              rows="5" 
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white"
            ></textarea>
          </div>
          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </motion.section>
  );
};

export default Contact;
