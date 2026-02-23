import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSearch, FaUserPlus, FaBell, FaCheck, FaBan, FaReply } from 'react-icons/fa';

const ModalBackdrop = ({ children, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    {children}
  </motion.div>
);

const ModalContent = ({ children, title, onClose, maxWidth = "max-w-md" }) => (
  <motion.div 
    initial={{ scale: 0.95, opacity: 0, y: 20 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.95, opacity: 0, y: 20 }}
    onClick={(e) => e.stopPropagation()}
    className={`w-full ${maxWidth} bg-white dark:bg-gray-900/90 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`}
  >
    <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
      <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{title}</h2>
      <button 
        onClick={onClose} 
        className="p-2 rounded-full hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
      >
        <FaTimes />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {children}
    </div>
  </motion.div>
);

export const SearchModal = ({ isOpen, onClose, query, setQuery, onSearch, results, onFollow, currentUserId }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop onClose={onClose}>
          <ModalContent title="Discover People" onClose={onClose} maxWidth="max-w-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900/95 z-10 backdrop-blur">
               <form onSubmit={onSearch} className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full bg-black/40 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
               </form>
            </div>
            
            <div className="p-2">
               {results.length === 0 && query && (
                   <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                       <FaSearch size={40} className="mb-4 opacity-20" />
                       <p>No users found matching "{query}"</p>
                   </div>
               )}
               {results.length === 0 && !query && (
                   <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                       <FaUserPlus size={40} className="mb-4 opacity-20" />
                       <p>Type to search for friends</p>
                   </div>
               )}
               
               <div className="space-y-1">
                 {results.map(u => (
                   <motion.div 
                     layout
                     key={u._id} 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:bg-white/5 transition-colors group"
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm shadow-md overflow-hidden">
                            {u.profileImage ? (
                                <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                                u.name.charAt(0).toUpperCase()
                            )}
                         </div>
                         <div>
                            {/* If we had handle or bio, show here */}
                            <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{u.followerCount || 0} followers</div> 
                         </div>
                      </div>
                      
                       {currentUserId !== u._id && (
                         u.isFollowing ? (
                            <button className="px-4 py-1.5 rounded-full border border-gray-600 text-gray-600 dark:text-gray-400 text-sm font-medium transition-all cursor-default">
                                Following
                            </button>
                         ) : u.isRequested ? (
                            <button className="px-4 py-1.5 rounded-full border border-gray-600 text-gray-500 text-sm font-medium transition-all cursor-not-allowed">
                                Requested
                            </button>
                         ) : (
                            <button 
                                 onClick={() => onFollow(u._id)}
                                 className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-blue-600 text-sm font-medium transition-all text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 hover:border-transparent"
                            >
                                Follow
                            </button>
                         )
                       )}
                   </motion.div>
                 ))}
               </div>
            </div>
          </ModalContent>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};

export const NotificationModal = ({ isOpen, onClose, notifications, onAccept, onReject, onFollowBack }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <ModalBackdrop onClose={onClose}>
            <ModalContent title="Notifications" onClose={onClose}>
               {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <FaBell size={24} className="opacity-40" />
                        </div>
                        <p>No notifications yet</p>
                    </div>
               ) : (
                   <div className="divide-y divide-gray-800">
                       {notifications.map((note) => (
                           <motion.div 
                                layout
                                key={note._id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 hover:bg-gray-100 dark:bg-white/5 transition-colors flex gap-4"
                           >
                                <div className="mt-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${note.type === 'follow_request' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {note.type === 'follow_request' ? <FaUserPlus size={16} /> : <FaCheck size={16} />}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm leading-relaxed text-gray-200">
                                        <span className="font-bold text-gray-900 dark:text-white hover:underline cursor-pointer">
                                            {note.sender ? note.sender.name : 'Unknown'}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {note.type === 'follow_request' 
                                                ? ' requested to follow you.' 
                                                : ' accepted your follow request.'}
                                        </span>
                                    </p>
                                    <div className="text-xs text-gray-500 mt-1">2m ago</div> {/* Placeholder time */}

                                    {/* Action Buttons for Request */}
                                    {note.type === 'follow_request' && note.sender && (
                                        <div className="mt-3 flex gap-3">
                                            {!note.isAccepted ? (
                                                <>
                                                    <button 
                                                        onClick={() => onAccept(note.sender._id, note._id)}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <FaCheck size={12} /> Confirm
                                                    </button>
                                                    <button 
                                                        onClick={() => onReject(note.sender._id)}
                                                        className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold py-2 px-4 rounded-lg transition-colors border border-gray-300 dark:border-gray-700 flex items-center justify-center gap-2"
                                                    >
                                                        <FaBan size={12} /> Delete
                                                    </button>
                                                </>
                                            ) : (
                                                /* Show Follow Back ONLY if NOT already following */
                                                !note.isFollowing ? (
                                                    <button 
                                                        onClick={() => onFollowBack(note.sender._id)}
                                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-gray-900 dark:text-white text-xs font-bold py-2 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                                                    >
                                                         <FaReply size={12} /> Follow Back
                                                    </button>
                                                ) : (
                                                    <div className="w-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-default border border-gray-300 dark:border-gray-700">
                                                        <FaCheck size={12} /> Friends
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                           </motion.div>
                       ))}
                   </div>
               )}
            </ModalContent>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    );
};

export const UserListModal = ({ isOpen, onClose, title, users, currentUserId, onFollow, onUnfollow, isLoading, onUserClick }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <ModalBackdrop onClose={onClose}>
            <ModalContent title={title} onClose={onClose}>
               {isLoading ? (
                   <div className="flex justify-center items-center py-10">
                       <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                   </div>
               ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                        <p>No users found</p>
                    </div>
               ) : (
                   <div className="divide-y divide-gray-800">
                       {users.map((u) => (
                           <motion.div 
                                layout
                                key={u._id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-between p-3 hover:bg-gray-100 dark:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => onUserClick && onUserClick(u._id)}
                           >
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-gray-900 dark:text-white font-bold text-sm shadow-md overflow-hidden">
                                      {u.profileImage ? (
                                          <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                                      ) : (
                                          u.name.charAt(0).toUpperCase()
                                      )}
                                   </div>
                                   <div>
                                      <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">{u.followerCount || 0} followers</div>
                                   </div>
                                </div>
                                
                                {currentUserId !== u._id && (
                                    <div onClick={(e) => e.stopPropagation()}> 
                                    {/* Stop propagation so clicking button doesn't navigate */}
                                    {u.isFollowing ? (
                                        <button 
                                            onClick={() => onUnfollow(u._id)}
                                            className="px-4 py-1.5 rounded-full border border-gray-600 hover:border-red-500 hover:text-red-500 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
                                        >
                                            Following
                                        </button>
                                    ) : u.isRequested ? (
                                         <button 
                                            className="px-4 py-1.5 rounded-full border border-gray-600 text-gray-500 text-sm font-medium transition-all cursor-not-allowed"
                                        >
                                            Requested
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => onFollow(u._id)}
                                            className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white text-sm font-medium transition-all shadow-lg"
                                        >
                                            Follow
                                        </button>
                                    )}
                                    </div>
                                )}
                           </motion.div>
                       ))}
                   </div>
               )}
            </ModalContent>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    );
};
