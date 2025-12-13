import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCog, FaTh, FaBookmark, FaUserTag, FaPlus } from 'react-icons/fa';
import API_URL from '../config';

const Profile = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          if (error.response && error.response.status === 401) {
            navigate('/login');
          }
        }
      } else {
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Placeholder data for stats and content
  const posts = Array(9).fill(null).map((_, i) => ({
    id: i,
    image: `https://picsum.photos/400?random=${i}`, // Random placeholder images
    likes: Math.floor(Math.random() * 1000),
    comments: Math.floor(Math.random() * 100)
  }));

  const highlights = [
    { id: 1, title: 'Projects', img: 'https://placehold.co/100/101820/FFF?text=P' },
    { id: 2, title: 'Code', img: 'https://placehold.co/100/101820/FFF?text=C' },
    { id: 3, title: 'Travel', img: 'https://placehold.co/100/101820/FFF?text=T' },
    { id: 4, title: 'Music', img: 'https://placehold.co/100/101820/FFF?text=M' },
  ];

  if (!user) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white font-sans">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full border-4 border-black overflow-hidden bg-gray-800 flex items-center justify-center">
               {/* Replace with user.avatar if available, else placeholder */}
               <span className="text-4xl font-bold text-gray-400">{user.name.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 w-full md:w-auto">
          {/* Row 1: Username & Actions */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
            <h1 className="text-xl md:text-2xl font-light">{user.name}</h1> {/* Using name as username for now */}
            <div className="flex gap-2">
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                Edit profile
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                View archive
              </button>
            </div>
            <button onClick={handleLogout} className="text-white hover:text-gray-300 transition-colors" title="Logout">
              <FaCog size={24} />
            </button>
          </div>

          {/* Row 2: Stats */}
          <div className="flex justify-center md:justify-start gap-10 mb-5 text-base">
            <div className="text-center md:text-left"><span className="font-bold">12</span> posts</div>
            <div className="text-center md:text-left"><span className="font-bold">1.2k</span> followers</div>
            <div className="text-center md:text-left"><span className="font-bold">450</span> following</div>
          </div>

          {/* Row 3: Bio */}
          <div className="text-center md:text-left text-sm md:text-base">
            <div className="font-semibold">{user.name}</div>
            <div className="whitespace-pre-wrap text-gray-300">
              👨‍💻 Full Stack Developer
              🚀 Building the future of EdTech
              📍 Mumbai, India
            </div>
            <a href="#" className="text-blue-400 hover:underline font-semibold">blackitab.com</a>
          </div>
        </div>
      </header>

      {/* HIGHLIGHTS SECTION */}
      <section className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-6 min-w-max px-2">
           {highlights.map((hl) => (
             <div key={hl.id} className="flex flex-col items-center gap-2 cursor-pointer group">
               <div className="w-16 h-16 rounded-full border border-gray-700 p-[3px] group-hover:border-gray-500 transition-colors">
                 <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden">
                    <img src={hl.img} alt={hl.title} className="w-full h-full object-cover opacity-80" />
                 </div>
               </div>
               <span className="text-xs font-medium text-gray-300">{hl.title}</span>
             </div>
           ))}
           <div className="flex flex-col items-center gap-2 cursor-pointer group">
               <div className="w-16 h-16 rounded-full border border-gray-700 flex items-center justify-center p-[3px] group-hover:border-gray-500 transition-colors">
                 <div className="w-full h-full rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <FaPlus className="text-gray-400" />
                 </div>
               </div>
               <span className="text-xs font-medium text-gray-300">New</span>
           </div>
        </div>
      </section>

      {/* TABS SECTION */}
      <div className="border-t border-gray-800 mb-1">
        <div className="flex justify-center gap-12">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-3 text-xs md:text-sm tracking-widest uppercase border-t md:border-t-2 transition-all ${activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <FaTh size={12} /> Posts
          </button>
          <button 
             onClick={() => setActiveTab('saved')}
             className={`flex items-center gap-2 py-3 text-xs md:text-sm tracking-widest uppercase border-t md:border-t-2 transition-all ${activeTab === 'saved' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <FaBookmark size={12} /> Saved
          </button>
          <button 
             onClick={() => setActiveTab('tagged')}
             className={`flex items-center gap-2 py-3 text-xs md:text-sm tracking-widest uppercase border-t md:border-t-2 transition-all ${activeTab === 'tagged' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <FaUserTag size={12} /> Tagged
          </button>
        </div>
      </div>

      {/* CONTENT GRID */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posts.map((post) => (
            <div key={post.id} className="relative aspect-square group cursor-pointer bg-gray-900">
              <img src={post.image} alt="Post" className="w-full h-full object-cover" loading="lazy" />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 transition-opacity duration-200">
                <div className="flex items-center gap-1 font-bold">
                   <span>❤️</span> {post.likes}
                </div>
                <div className="flex items-center gap-1 font-bold">
                   <span>💬</span> {post.comments}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
           <div className="border-2 border-gray-700 rounded-full p-4 mb-4">
             <FaBookmark size={30} />
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">Save</h2>
           <p className="max-w-xs text-center text-sm">Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved.</p>
        </div>
      )}

      {activeTab === 'tagged' && (
         <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="border-2 border-gray-700 rounded-full p-4 mb-4">
              <FaUserTag size={30} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Photos of you</h2>
            <p className="max-w-xs text-center text-sm">When people tag you in photos, they'll appear here.</p>
         </div>
      )}

    </div>
  );
};

export default Profile;

