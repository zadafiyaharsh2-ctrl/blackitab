import React from 'react';
import { 
  FaBookOpen,
  FaDollarSign,
  FaExclamationTriangle,
  FaLightbulb,
  FaRobot,
  FaChalkboardTeacher
} from 'react-icons/fa';

const coreFeatures = [
  {
    icon: FaBookOpen,
    title: 'Post Educational Content & Courses',
    description: 'Create and share any type of educational content—from simple study notes to comprehensive video courses.',
    gradient: 'from-blue-500 to-cyan-500',
    color: 'blue'
  },
  {
    icon: FaDollarSign,
    title: 'Monetize Your Content',
    description: 'Teachers have two ways to earn: Create premium paid courses, or post free content and earn revenue through advertisements.',
    gradient: 'from-green-500 to-emerald-500',
    color: 'green'
  },
  {
    icon: FaExclamationTriangle,
    title: 'AI Identifies Student Mistakes',
    description: 'Our intelligent AI analyzes student results to identify where they struggle. Get detailed reports showing common error patterns.',
    gradient: 'from-red-500 to-orange-500',
    color: 'red'
  },
  {
    icon: FaLightbulb,
    title: 'AI Suggests Topics to Add',
    description: 'Based on learning patterns, our AI recommends specific subtopics to add to your courses before students even ask.',
    gradient: 'from-purple-500 to-pink-500',
    color: 'purple'
  },
  {
    icon: FaRobot,
    title: 'Analytics-Aware AI Copilot',
    description: 'An intelligent learning assistant providing personalized guidance and hints tailored to each student\'s unique history.',
    gradient: 'from-indigo-500 to-violet-500',
    color: 'indigo'
  },
  {
    icon: FaChalkboardTeacher,
    title: 'One-Click Paper Generation',
    description: 'Instantly generate complete exam papers properly calibrated to the exact sub-topics where students struggle the most.',
    gradient: 'from-teal-500 to-cyan-500',
    color: 'teal'
  }
];

const FeatureGrid = () => (
  <div className="max-w-7xl mx-auto mb-24">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-gray-200 gap-4">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
          Core Capabilities
        </h2>
        <p className="text-sm tracking-wide text-gray-500">
          Powerful features designed to modernize educational creation and execution.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
);

export default FeatureGrid;
