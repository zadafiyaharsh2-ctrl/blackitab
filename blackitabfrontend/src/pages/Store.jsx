import { useTheme } from '../context/useTheme';
import { 
  FaStore, 
  FaLaptop, 
  FaTshirt, 
  FaClock, 
  FaRunning, 
  FaHeadphones, 
  FaMobileAlt, 
  FaTabletAlt,
  FaShoppingBag,
  FaTruck,
  FaShieldAlt,
  FaTag,
  FaRobot
} from 'react-icons/fa';

const Store = () => {
  const { isDark } = useTheme();

  const categories = [
    {
      icon: FaLaptop,
      title: 'Electronics & Gadgets',
      description: 'Upgrade your study setup with the latest tech. From high-performance laptops for coding to noise-canceling earbuds for focus, tablets for note-taking, and essential accessories like power banks and chargers.',
      items: ['Laptops', 'Tablets', 'Smartphones', 'Earbuds', 'Power Banks'],
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaTshirt,
      title: 'Fashion & Apparel',
      description: 'Style that speaks your vibe. Explore our collection of trendy t-shirts, comfortable hoodies for late-night study sessions, casual wear, and college essentials designed for comfort and style.',
      items: ['Hoodies', 'T-Shirts', 'Jeans', 'Jackets', 'Caps'],
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: FaClock,
      title: 'Watches & Wearables',
      description: 'Stay on time and track your health. Discover a range of smartwatches to monitor your fitness and sleep, classic analog watches for interviews, and stylish eyewear including blue-light blocking glasses.',
      items: ['Smartwatches', 'Analog Watches', 'Fitness Bands', 'Sunglasses', 'Blue-light Glasses'],
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: FaRunning,
      title: 'Footwear & Lifestyle',
      description: 'Step up your game with our curated footwear collection. From comfortable sneakers for daily campus life to sports shoes for your workout sessions and formal shoes for presentations.',
      items: ['Sneakers', 'Running Shoes', 'Formal Shoes', 'Sandals', 'Sports Gear'],
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const benefits = [
    {
      icon: FaTruck,
      title: 'Fast Delivery',
      description: 'Quick shipping directly to your campus or home.'
    },
    {
      icon: FaShieldAlt,
      title: 'Student Warranty',
      description: 'Extended warranty plans on electronic devices.'
    },
    {
      icon: FaTag,
      title: 'Student Discounts',
      description: 'Exclusive prices verified with your student ID.'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Coming Soon Banner */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className={`${isDark ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-700/50' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'} rounded-xl p-4 border backdrop-blur-md text-center`}>
          <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'} mb-1 flex items-center justify-center gap-2`}>
            🚀 Coming Soon!
          </h2>
          <p className={`${isDark ? 'text-yellow-200' : 'text-yellow-700'} font-medium`}>
            The Student Marketplace is currently under development.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-br from-pink-900/40 via-purple-900/40 to-indigo-900/40 border-pink-700/50' : 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-pink-200'} rounded-3xl p-8 md:p-12 border backdrop-blur-md shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg">
                <FaStore className="text-4xl text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                  Student Marketplace
                </h1>
                <p className={`text-lg ${isDark ? 'text-pink-300' : 'text-pink-600'} font-semibold mt-1`}>
                  Everything You Need, All in One Place
                </p>
              </div>
            </div>
            
            <p className={`text-xl ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-8 leading-relaxed max-w-4xl`}>
              Your exclusive destination for student essentials. From the latest tech gadgets to trendy fashion, 
              we've curated a collection that fits your lifestyle and budget. Shop confidently with student-only 
              discounts and fast delivery.
            </p>

            {/* Benefits Badges */}
            <div className="flex flex-wrap gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${isDark ? 'bg-gray-50 dark:bg-gray-800/60 border-gray-300 dark:border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-sm`}>
                    <Icon className={`text-xl ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                    <div>
                      <h3 className={`font-bold text-sm ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>{benefit.title}</h3>
                      <p className={`text-xs ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Personalized Pickups Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-700/50' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'} rounded-2xl p-8 border backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-6">
            <FaRobot className="text-4xl text-purple-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
              AI Personalized Pickups
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'} text-lg mb-6 leading-relaxed`}>
                Stop scrolling endlessly. Our intelligent AI analyzes your student profile, course requirements, 
                and interests to curate a personalized shopping feed just for you.
              </p>
              <ul className="space-y-4">
                <li className={`flex items-start gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaLaptop className="text-blue-500 text-xl mt-1" />
                  <span><strong>Tech Match:</strong> CS student? We'll recommend high-RAM laptops. Design student? We'll show you the best tablets for drawing.</span>
                </li>
                <li className={`flex items-start gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaTshirt className="text-pink-500 text-xl mt-1" />
                  <span><strong>Style Sense:</strong> Our AI learns your fashion taste over time to suggest outfits you'll actually love.</span>
                </li>
                <li className={`flex items-start gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaTag className="text-green-500 text-xl mt-1" />
                  <span><strong>Smart Budgeting:</strong> Set your budget, and we'll find the best quality gear that fits your wallet.</span>
                </li>
              </ul>
            </div>

            {/* AI Visual Representation */}
            <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200'} shadow-lg`}>
              <div className="flex items-center gap-2 mb-4 text-purple-500 font-bold uppercase text-sm tracking-wide">
                <FaRobot /> AI Recommendation
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-2`}>
                "Hey Alex! Since you're starting your Coding Bootcamp..."
              </h3>
              <div className="flex gap-4 mt-4">
                <div className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <FaLaptop className="text-3xl mx-auto mb-2 text-blue-400" />
                  <p className={`text-xs font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>Pro Laptop</p>
                  <p className="text-xs text-green-500">98% Match</p>
                </div>
                <div className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <FaHeadphones className="text-3xl mx-auto mb-2 text-pink-400" />
                  <p className={`text-xs font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>Focus Buds</p>
                  <p className="text-xs text-green-500">95% Match</p>
                </div>
                <div className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <FaClock className="text-3xl mx-auto mb-2 text-orange-400" />
                  <p className={`text-xs font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>Smart Watch</p>
                  <p className="text-xs text-green-500">92% Match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-4`}>
            Shop by Category
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Explore our wide range of products tailored for students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="text-3xl text-gray-900 dark:text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-2`}>
                      {category.title}
                    </h3>
                    <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Popular Items Tags */}
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item, idx) => (
                    <span 
                      key={idx}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDark 
                          ? 'bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-600' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center">
        <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 md:p-12 border backdrop-blur-md shadow-xl`}>
          <FaShoppingBag className={`text-5xl ${isDark ? 'text-pink-400' : 'text-pink-600'} mx-auto mb-4`} />
          <h2 className={`text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-4`}>
            Get Ready to Shop
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl mx-auto leading-relaxed`}>
            The ultimate student store is coming soon. Sign up for notifications to get early access 
            and exclusive launch discounts.
          </p>
          <button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg">
            Notify Me When Live
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store;
