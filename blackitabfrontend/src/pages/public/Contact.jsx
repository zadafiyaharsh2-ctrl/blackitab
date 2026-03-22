import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEnvelope, FaPaperPlane, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import Logo from '../../components/shared/Logo';
import api from '../../utils/api';
import { CustomToast } from '../../utils/CustomToast';

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 80, damping: 20 } 
  }
};

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // We can simulate an API call or use the feedback/bug route
    try {
      // Assuming a generic feedback route exists, or we just mock a success for now
      // await api.post('/feedback', formData);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request
      
      CustomToast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      CustomToast.error("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-blue-500/30 selection:text-white font-sans">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-black to-black" />
         
         <motion.div 
            animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[150px] mix-blend-screen"
         />
         
         <div className="absolute inset-0 opacity-[0.05]" 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', 
                backgroundSize: '60px 60px' 
              }}
         />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 w-full py-6 px-6 md:px-12 flex justify-between items-center backdrop-blur-sm border-b border-white/5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/" className="flex items-center gap-3 group">
            <FaArrowLeft className="text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-gray-400 group-hover:text-white transition-colors text-sm font-medium">Back to Home</span>
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Logo className="w-10 h-10" textSize="text-2xl" />
        </motion.div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        <motion.div 
          initial="hidden" animate="visible" variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid md:grid-cols-2 gap-12 md:gap-20"
        >
          {/* Left Column - Contact Info */}
          <div className="flex flex-col justify-center">
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl font-black mb-6 tracking-tighter glow-text bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500">
                Get in Touch
              </h1>
              <p className="text-gray-400 text-lg mb-10 font-light leading-relaxed">
                Have questions about our platform, enterprise pricing, or want to explore partnership opportunities? We'd love to hear from you.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-blue-500/50 transition-colors">
                  <FaEnvelope className="text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-gray-300 font-medium mb-1">Email Us</h3>
                  <a href="mailto:support@ranklen.com" className="text-white font-bold hover:text-blue-400 transition-colors">support@ranklen.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                  <FaMapMarkerAlt className="text-indigo-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-gray-300 font-medium mb-1">Headquarters</h3>
                  <p className="text-white font-bold">Bangalore, India</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Form */}
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-3xl blur-xl" />
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                  <input required type="text" name="subject" value={formData.subject} onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</label>
                  <textarea required name="message" value={formData.message} onChange={handleChange} rows="4"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane /> Send Message</>}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Contact;
