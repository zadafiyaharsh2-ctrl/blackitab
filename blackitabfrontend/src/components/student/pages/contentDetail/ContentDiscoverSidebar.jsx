import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContentDiscoverSidebar = ({ relatedContent, relatedFilter, setRelatedFilter, currentAuthorId }) => {
  const navigate = useNavigate();

  const filteredContent = relatedFilter === 'author' 
    ? relatedContent.filter(p => p.user?._id === currentAuthorId) 
    : relatedContent;

  const filters = [
    { key: 'all', label: 'Feed' },
    { key: 'author', label: 'Author' },
    { key: 'related', label: 'Similar' },
  ];

  return (
    <div className="hidden lg:flex flex-col gap-6 w-full sticky top-[6rem]">
      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight px-1">Discover</h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 px-1">
        {filters.map(f => (
          <button 
            key={f.key}
            onClick={() => setRelatedFilter(f.key)} 
            className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#0061FF]/30 ${
              relatedFilter === f.key 
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="space-y-4 px-1 pb-10">
        {filteredContent.length > 0 ? (
          filteredContent.map((post) => (
            <div
              key={post._id}
              onClick={() => {
                navigate(`/content/${post._id}`);
                window.scrollTo(0, 0);
              }}
              className="flex gap-4 cursor-pointer group bg-white dark:bg-white/[0.02] border border-transparent dark:border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:shadow-md p-2 -mx-2 rounded-2xl transition-all duration-300 items-start"
            >
              <div className="w-[160px] aspect-video bg-black rounded-xl overflow-hidden shrink-0 relative shadow-sm border border-gray-100 dark:border-white/5">
                {post.mediaType === 'video' ? (
                  <video src={post.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <img src={post.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                {post.mediaType === 'video' && (
                  <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest shadow border border-white/10">
                    Vid
                  </div>
                )}
              </div>
              
              <div className="flex flex-col min-w-0 py-1">
                <h4 className="text-[13px] font-bold leading-[1.3] text-gray-900 dark:text-white group-hover:text-[#0061FF] transition-colors line-clamp-2 mb-1.5 text-pretty">
                  {post.title || post.caption || "Untitled Publication"}
                </h4>
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1">{post.user?.name || "Unknown Author"}</div>
                <div className="text-[10px] font-medium text-gray-400 mt-0.5">
                  {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 animate-pulse px-2">
                <div className="w-[160px] aspect-video bg-gray-200 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5"></div>
                <div className="flex-1 space-y-3 py-1.5">
                  <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-full w-[90%]"></div>
                  <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-full w-[60%]"></div>
                  <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full w-[40%] mt-3"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDiscoverSidebar;
