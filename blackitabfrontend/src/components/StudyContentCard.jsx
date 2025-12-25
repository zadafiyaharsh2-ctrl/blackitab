import { FaPlay, FaHeart, FaComment, FaRupeeSign, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const StudyContentCard = ({ content }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group cursor-pointer flex flex-col gap-3"
      onClick={() => navigate(`/content/${content._id}`)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-white/10 group-hover:border-white/30 transition-all">
        {content.mediaType === 'video' ? (
          <video 
            src={content.mediaUrl} 
            className="w-full h-full object-cover"
            muted
            onMouseOver={e => e.target.play()}
            onMouseOut={e => {
              e.target.pause();
              e.target.currentTime = 0;
            }}
          />
        ) : (
          <img src={content.mediaUrl} alt={content.title} className="w-full h-full object-cover" />
        )}
        
        {/* Overlays */}
        {content.mediaType === 'video' && (
           <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1">
             <FaPlay size={10} /> Video
           </div>
        )}
        
        {/* Paid Content Overlay */}
        {content.contentType === 'paid-content' && (
           <div className="absolute top-2 right-2 bg-amber-600 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-lg">
             <FaRupeeSign size={10} /> {content.price}
           </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex gap-3">
        {/* User Avatar (Optional, effectively hidden if on own profile, but good for general use) */}
        {/* <div className="w-9 h-9 rounded-full bg-gray-700 shrink-0 overflow-hidden">
             <img src={content.user?.profileImage} className="w-full h-full object-cover" />
        </div> */}

        <div className="flex-1">
          <h3 className="text-white font-bold leading-tight mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {content.title}
          </h3>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            {content.contentType === 'paid-content' ? (
                <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    <FaLock size={10} /> Premium
                </span>
            ) : (
                <span>{content.likes?.length || 0} likes</span>
            )}
            <span>•</span>
            <span>{new Date(content.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Quick Menu (Optional) */}
        {/* <button className="text-gray-400 hover:text-white"><FaEllipsisV /></button> */}
      </div>
    </motion.div>
  );
};

export default StudyContentCard;
