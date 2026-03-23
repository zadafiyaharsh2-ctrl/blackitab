import { 
  FaUsers, 
  FaChalkboardTeacher, 
  FaBrain, 
  FaExclamationTriangle,
  FaLightbulb,
  FaDollarSign,
  FaBookOpen,
  FaRobot,
  FaChartLine,
  FaGraduationCap
} from 'react-icons/fa';

const Socialfeatures = () => {
  const coreFeatures = [
    {
      icon: FaBookOpen,
      title: 'Post Educational Content & Courses',
      description: 'Create and share any type of educational content—from simple study notes to comprehensive video courses. Whether you\'re a student sharing your knowledge or a professional educator, our platform supports all formats including videos, PDFs, presentations, and interactive materials.',
      gradient: 'from-blue-500 to-cyan-500',
      color: 'blue'
    },
    {
      icon: FaDollarSign,
      title: 'Monetize Your Content',
      description: 'Teachers have two ways to earn: Create premium paid courses with your own pricing, or post free content and earn revenue through advertisements. With free content, you reach a wider audience while we share ad revenue with you based on views and engagement. Choose the model that works best for you—or use both!',
      gradient: 'from-green-500 to-emerald-500',
      color: 'green'
    },
    {
      icon: FaExclamationTriangle,
      title: 'AI Identifies Student Mistakes',
      description: 'Our intelligent AI system analyzes student quiz results, assignment submissions, and practice problems to identify exactly where students are making mistakes. Get detailed reports showing common error patterns, misconceptions, and challenging topics that need your attention.',
      gradient: 'from-red-500 to-orange-500',
      color: 'red'
    },
    {
      icon: FaLightbulb,
      title: 'AI Suggests Topics to Add',
      description: 'Based on student questions, performance gaps, and learning patterns, our AI recommends specific topics and subtopics you should add to your courses. Stay ahead by understanding what students need before they even ask for it.',
      gradient: 'from-purple-500 to-pink-500',
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 transition-colors duration-300 bg-[#f8f9fa] text-gray-900">
      
      {/* Coming Soon Banner */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="rounded-xl p-4 border flex items-center justify-center gap-3 transition-colors bg-white border-gray-200 text-gray-600 shadow-sm">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[#0061FF]">
            <span className="text-xs">🚀</span>
          </div>
          <p className="text-sm font-medium tracking-wide">
            <span className="text-gray-900 font-bold">Coming Soon</span> — This feature is currently under active development.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-[#0061FF] animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Social Learning Platform</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-gray-900">
          Share, Teach, and Improve <br className="hidden md:block"/>
          <span className="text-[#0061FF]">with AI Intelligence</span>
        </h1>
        
        <p className="text-lg md:text-xl font-medium tracking-tight mx-auto max-w-3xl text-gray-500">
          Our platform empowers both students and teachers. Share educational content freely, 
          build advanced courses, and leverage AI insights to identify struggles and optimize learning.
        </p>
      </div>

      {/* Main Features */}
      <div className="max-w-7xl mx-auto mb-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-gray-200 gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
              Core Capabilities
            </h2>
            <p className="text-sm tracking-wide text-gray-500">
              Four powerful features designed to modernize educational creation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group rounded-2xl p-8 border transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-col gap-6">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl border bg-gray-50 border-gray-200 text-[#0061FF]">
                    <Icon className="text-xl opacity-80" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed font-medium text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How AI Helps Teachers Section */}
      <div className="max-w-7xl mx-auto mb-24">
        <div className="rounded-3xl p-8 md:p-12 border transition-colors bg-white border-gray-200 shadow-sm">
          <div className="flex flex-col mb-12">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
              Intelligent Analytics for Teachers
            </h2>
            <p className="text-sm tracking-wide text-gray-500">
              A continuous feedback loop that automatically isolates student friction points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Step 1 */}
            <div className="flex gap-5">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono border bg-gray-100 border-gray-200 text-gray-900">
                  01
                </div>
              </div>
              <div>
                <h3 className="font-bold tracking-tight text-lg mb-2 text-gray-900">
                  AI Analyzes Mistakes
                </h3>
                <p className="text-sm leading-relaxed font-medium text-gray-500">
                  Our AI tracks errors across assignments, parsing patterns to identify exactly where concepts break down for cohorts.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-5">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono border bg-gray-100 border-gray-200 text-gray-900">
                  02
                </div>
              </div>
              <div>
                <h3 className="font-bold tracking-tight text-lg mb-2 text-gray-900">
                  Detailed Micro-Reports
                </h3>
                <p className="text-sm leading-relaxed font-medium text-gray-500">
                  Access comprehensive metrics highlighting topics with the highest error rates and specific misconception triggers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-5">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono border bg-gray-100 border-gray-200 text-gray-900">
                  03
                </div>
              </div>
              <div>
                <h3 className="font-bold tracking-tight text-lg mb-2 text-gray-900">
                  Automated Content Suggestions
                </h3>
                <p className="text-sm leading-relaxed font-medium text-gray-500">
                  Based on gaps, the platform proactively recommends exact subtopics to inject into your coursework.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-5">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono border bg-gray-100 border-gray-200 text-gray-900">
                  04
                </div>
              </div>
              <div>
                <h3 className="font-bold tracking-tight text-lg mb-2 text-gray-900">
                  Continuous Maturation
                </h3>
                <p className="text-sm leading-relaxed font-medium text-gray-500">
                  Monitor iterative improvements as your content evolves aligned exactly to measured student needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Teachers Section */}
      <div className="max-w-7xl mx-auto mb-24">
        <div className="rounded-3xl p-8 md:p-12 border transition-colors bg-white border-gray-200 shadow-sm">
          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
              Educator Monetization Models
            </h2>
            <p className="text-sm tracking-wide text-gray-500">
              Deploy your courses freely or natively monetize via strict paywalls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Option 1: Paid Courses */}
            <div className="p-8 rounded-2xl border transition-colors bg-[#f8f9fa] border-gray-100">
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-widest font-black text-[#0061FF] mb-2 block">Direct Revenue</span>
                <h3 className="text-xl font-bold tracking-tight mb-2 text-gray-900">
                  Premium Licensing
                </h3>
              </div>
              <ul className="text-sm space-y-4 font-medium text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0061FF] mt-1.5 shrink-0" />
                  <span><strong className="text-gray-800">Set Independent Pricing:</strong> Retain full control over licensing costs—structure it as flat rate or tier access.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0061FF] mt-1.5 shrink-0" />
                  <span><strong className="text-gray-800">Immediate ROI:</strong> Receive payouts with zero intermediary delay. Target specialized professionals.</span>
                </li>
              </ul>
            </div>

            {/* Option 2: Free Content with Ads */}
            <div className="p-8 rounded-2xl border transition-colors bg-[#f8f9fa] border-gray-100">
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-widest font-black text-indigo-500 mb-2 block">Ad-Supported</span>
                <h3 className="text-xl font-bold tracking-tight mb-2 text-gray-900">
                  Ad-Share Delivery
                </h3>
              </div>
              <ul className="text-sm space-y-4 font-medium text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong className="text-gray-800">Limitless Reach:</strong> Bypass paywalls entirely to scale distribution to millions of low-barrier students.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong className="text-gray-800">Automated RPM Share:</strong> Revenue streams dynamically calculate based on dwell times and strict metric tracking.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-black tracking-tighter mb-6 text-gray-900">
          Initialize Your Journey
        </h2>
        <p className="text-lg font-medium tracking-tight mb-10 max-w-2xl mx-auto text-gray-500">
          Join the ecosystem redefining pedagogical infrastructure for students and professional educators alike.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold bg-[#0061FF] text-white hover:opacity-90 transition-opacity whitespace-nowrap shadow-[0_4px_14px_rgba(0,97,255,0.2)]">
            Launch Platform
          </button>
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold border transition-colors whitespace-nowrap border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm">
            View Documentation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Socialfeatures;

