import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEnvelope, FaPaperPlane, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import Logo from '../../components/shared/Logo';
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
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
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
    <div className="min-h-screen font-sans bg-[#f8f9fa] text-gray-900 overflow-hidden relative selection:bg-blue-500/30 selection:text-gray-900">
      
      {/* ==================== BACKGROUND ==================== */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         {/* Subtle Grid Overlay */}
         <div className="absolute inset-0 opacity-[0.04]" 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
              }}
         />
         {/* Top ambient glow */}
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* ==================== NAVBAR ==================== */}
      <nav className="relative z-50 w-full py-5 px-6 md:px-12 flex justify-between items-center border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/" className="flex items-center gap-3 group">
            <FaArrowLeft className="text-gray-400 group-hover:text-[#0061FF] transition-colors" />
            <span className="text-gray-500 group-hover:text-gray-900 transition-colors text-sm font-bold tracking-wide">Back to Home</span>
          </Link>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Logo className="w-8 h-8" textSize="text-xl" />
        </motion.div>
      </nav>

      {/* ==================== MAIN CONTENT ==================== */}
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
              {/* Badge */}
              <div className="mb-6 px-4 py-1.5 w-max rounded-full border border-gray-200 bg-white shadow-sm text-xs font-bold tracking-[0.15em] uppercase text-gray-600 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-[#0061FF] animate-pulse" />
                 Connect With Us
              </div>
              <h1 className="text-5xl md:text-[4rem] font-black mb-6 tracking-tighter leading-[1.1] text-gray-900">
                Get in <span className="text-[#0061FF]">Touch</span>
              </h1>
              <p className="text-gray-500 md:text-lg mb-10 font-medium tracking-tight leading-relaxed max-w-md">
                Have questions about our platform, enterprise pricing, or want to explore partnership opportunities? We'd love to hear from you.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-8">
              <div className="flex items-start gap-5 group">
                <div className="p-4 rounded-2xl bg-white border border-gray-200 group-hover:border-[#0061FF]/50 shadow-sm transition-colors">
                  <FaEnvelope className="text-[#0061FF] text-xl" />
                </div>
                <div className="pt-1">
                  <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Email Us</h3>
                  <a href="mailto:support@ranklen.com" className="text-gray-900 font-bold text-lg hover:text-[#0061FF] transition-colors">support@ranklen.com</a>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="p-4 rounded-2xl bg-white border border-gray-200 group-hover:border-indigo-500/50 shadow-sm transition-colors">
                  <FaMapMarkerAlt className="text-indigo-500 text-xl" />
                </div>
                <div className="pt-1">
                  <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Headquarters</h3>
                  <p className="text-gray-900 font-bold text-lg">Surat,Gujarat, India</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Form */}
          <motion.div variants={itemVariants} className="relative mt-10 md:mt-0">
            <div className="absolute inset-0 bg-[#0061FF]/5 rounded-[2.5rem] blur-xl" />
            <div className="relative bg-white border border-gray-200 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0061FF]/30 focus:bg-white transition-all font-medium hover:bg-gray-100 focus:ring-4 focus:ring-[#0061FF]/10"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0061FF]/30 focus:bg-white transition-all font-medium hover:bg-gray-100 focus:ring-4 focus:ring-[#0061FF]/10"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                  <input required type="text" name="subject" value={formData.subject} onChange={handleChange}
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0061FF]/30 focus:bg-white transition-all font-medium hover:bg-gray-100 focus:ring-4 focus:ring-[#0061FF]/10"
                    placeholder="How can we help?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Message</label>
                  <textarea required name="message" value={formData.message} onChange={handleChange} rows="4"
                    className="w-full bg-gray-50 border border-transparent rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0061FF]/30 focus:bg-white transition-all font-medium resize-y hover:bg-gray-100 focus:ring-4 focus:ring-[#0061FF]/10"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 bg-[#0061FF] text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:bg-[#0061FF]/90 shadow-[0_8px_20px_rgba(0,97,255,0.25)] hover:shadow-[0_8px_25px_rgba(0,97,255,0.35)] disabled:opacity-50 hover:-translate-y-0.5"
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
