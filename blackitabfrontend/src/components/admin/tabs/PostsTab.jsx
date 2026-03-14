import React from 'react';
import { FaTrash, FaNewspaper } from 'react-icons/fa';

const PostsTab = ({ posts, handleDeletePost, postPagination, postPage, setPostPage, Pagination, fetchPosts }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Content Moderation — Posts ({postPagination.total})</h2>
      <div className="space-y-3">
        {posts.map(p => (
          <div key={p._id} className="glass-panel p-5 border border-white/10 rounded-2xl flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {p.userId?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{p.userId?.name || 'Unknown'}</p>
                  <p className="text-gray-500 text-xs">{p.userId?.email || '—'} · {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm line-clamp-3">{p.content || p.text || p.title || 'No content'}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>❤️ {p.likes?.length || 0}</span>
                <span>💬 {p.comments?.length || 0}</span>
                {p.type && <span className="px-2 py-0.5 bg-white/5 rounded-full">{p.type}</span>}
              </div>
            </div>
            <button onClick={() => handleDeletePost(p._id)}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0" title="Delete post">
              <FaTrash />
            </button>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <FaNewspaper className="text-4xl mx-auto mb-3 opacity-30" />
            <p>No posts yet</p>
          </div>
        )}
      </div>
      <Pagination pagination={postPagination} current={postPage} onPageChange={p => { setPostPage(p); fetchPosts(p); }} />
    </div>
  );
};

export default PostsTab;
