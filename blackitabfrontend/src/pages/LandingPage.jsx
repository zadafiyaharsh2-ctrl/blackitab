import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCode, 
  FaRobot, 
  FaChartBar, 
  FaLaptopCode, 
  FaStore, 
  FaRocket,
  FaBrain,
  FaVideo,
  FaDollarSign,
  FaChalkboardTeacher,
  FaArrowRight,
  FaUserGraduate,
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb
} from 'react-icons/fa';
import Logo from '../components/Logo';

/**
 * LandingPage Component
 * "Feature Wall" Layout with MAXIMUM DETAIL.
 * 
 * Design Philosophy:
 * - No "Trust/Partnership" sections.
 * - No "Persona Tabs".
 * - Just a massive, high-detail grid of what the platform actually DOES.
 * - Text is restored to the verbose, explanatory version.
 */
const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white pb-20">
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-black via-transparent to-black"></div>

      {/* ==================== NAVBAR ==================== */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 20 ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Logo className="w-10 h-10" textSize="text-xl" />
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="px-5 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-all transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================== HEADER ==================== */}
      <div className="relative z-10 pt-40 pb-16 px-6 container mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-white">
          Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Deep Dive.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          A complete breakdown of every tool, engine, and algorithm powering the ecosystem.
        </p>
      </div>

      {/* ==================== DETAILED FEATURE GRID ==================== */}
      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* --- AI & LEARNING ENGINE --- */}
          <div className="md:col-span-2">
             <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                <FaRobot /> AI Learning Engine
             </h2>
          </div>

          <DetailCard 
             icon={<FaRobot className="text-blue-400"/>}
             title="AI Avatar Teacher"
             desc="It's not just text on a screen. Meet your personal AI tutor—an interactive avatar that explains complex concepts using real-world examples, analogies, and visual aids. The avatar adapts its teaching style to match each student's learning preferences, making education feel personal and engaging."
          />
          <DetailCard 
             icon={<FaVideo className="text-orange-400"/>}
             title="Smart Video Navigation"
             desc="Revolutionary video intelligence that saves hours of watching time. Our AI analyzes video content and instantly jumps to the exact moment where your specific question is answered. It builds a dynamic index of concepts, so you never have to scrub through a 2-hour lecture to find a 2-minute explanation."
          />
          <DetailCard 
             icon={<FaChalkboardTeacher className="text-purple-400"/>}
             title="Automated Content Generation"
             desc="When a student asks a doubt that has no existing video coverage, the AI doesn't just say 'I don't know'. It instantly identifies the gap and assigns a high-priority task to an expert teacher to create the explanation. This ensures the platform's knowledge base grows dynamically to solve every student's problem."
          />
           <DetailCard 
             icon={<FaBrain className="text-pink-400"/>}
             title="Smart Scheduler & Prep"
             desc="AI-powered scheduling that adapts to your learning pace. It creates personalized study plans that optimize learning efficiency while preventing burnout. Includes 'Exam Prep Mode' which analyzes past papers to create custom practice tests targeting your specific weak areas."
          />

          {/* --- INSTITUTIONAL ANALYTICS --- */}
          <div className="md:col-span-2 mt-12">
             <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
                <FaChartBar /> Institutional Analytics
             </h2>
          </div>

          <DetailCard 
             icon={<FaBuilding className="text-red-400"/>}
             title="Institute Dashboard Access"
             desc="A secure, private environment for schools and colleges. Students enter a unique 'Institute Code' to map themselves to their specific division and batch. This gives administration a segmented view of performance across the entire campus."
          />
          <DetailCard 
             icon={<FaMapMarkerAlt className="text-yellow-400"/>}
             title="Division-Level Heatmaps"
             desc="We visualize learning gaps. If 60% of Division A is failing questions related to 'Schema Design', the system generates a critical alert. Teachers can see a heatmap of weak topics for their specific class, allowing them to schedule targeted revision sessions immediately."
          />
          <DetailCard 
             icon={<FaChartBar className="text-red-400"/>}
             title="Behavioral Analysis"
             desc="Our ML algorithms go beyond test scores. We analyze student activity patterns, focus levels during videos, and interaction rates to understand learning behaviors. This helps identify at-risk students who are disengaged before they actually fail an exam."
          />
           <DetailCard 
             icon={<FaUserGraduate className="text-orange-400"/>}
             title="Teacher Command Center"
             desc="A bird's-eye view for educators. Manage attendance, track assignment submissions in real-time, and get suggested topics to cover based on the aggregate doubts raised by students in the past week."
          />

          {/* --- MONETIZATION & ECOSYSTEM --- */}
           <div className="md:col-span-2 mt-12">
             <h2 className="text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
                <FaDollarSign /> User Ecosystem
             </h2>
          </div>

          <DetailCard 
             icon={<FaDollarSign className="text-green-400"/>}
             title="Dual-Mode Monetization"
             desc="Teachers have complete financial freedom. 1) Premium Courses: Create detailed courses and set your own price (e.g., $50). You keep the earnings. 2) Ad Revenue: Post free content to build a following, and we share ad revenue with you based on views and engagement. It's the best of Udemy and YouTube combined."
          />
          <DetailCard 
             icon={<FaStore className="text-blue-400"/>}
             title="AI Personalized Store"
             desc="A marketplace that knows what you need. Our AI analyzes your student profile to recommend the perfect gear. Are you a CS student? It recommends high-RAM laptops and mechanical keyboards. A design student? It highlights drawing tablets and color-accurate monitors."
          />
          <DetailCard 
             icon={<FaLaptopCode className="text-cyan-400"/>}
             title="Professional Cloud IDE"
             desc="A zero-setup development environment in your browser. Supports C++, Java, Python, and React. Features real-time compilation, collaborative coding (Google Docs style), and direct GitHub integration for building your portfolio."
          />
          <DetailCard 
             icon={<FaExclamationTriangle className="text-yellow-400"/>}
             title="AI Mistake Analysis"
             desc="Our intelligent system analyzes your code submissions and quiz answers to identify *why* you got it wrong. It pinpoints specific misconceptions (e.g., 'You seem to be confusing recursion base cases') rather than just marking the answer incorrect."
          />

        </div>
      </div>

       <footer className="py-20 text-center text-gray-600 text-sm border-t border-white/5 bg-black mt-20">
        <p>&copy; {new Date().getFullYear()} Blackitab Inc. Precision Engineering for Education.</p>
      </footer>

    </div>
  );
};

// --- Detailed Card Component ---
// Designed for LONG TEXT.
const DetailCard = ({ icon, title, desc }) => (
  <div className="bg-[#111] p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 flex flex-col gap-6">
    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
       <div className="text-3xl">{icon}</div>
    </div>
    <div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm md:text-base">
        {desc}
      </p>
    </div>
  </div>
);

// Icon Helper
const FaMapMarkerAlt = ({ className }) => (
    <svg 
      stroke="currentColor" 
      fill="currentColor" 
      strokeWidth="0" 
      viewBox="0 0 384 512" 
      className={className} 
      height="1em" 
      width="1em" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
    </svg>
);

export default LandingPage;
