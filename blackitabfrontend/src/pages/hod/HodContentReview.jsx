import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaBookOpen, FaQuestionCircle, FaSearch, FaUser, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import PageShimmer from '../../components/shared/PageShimmer';
import toast from 'react-hot-toast';

const HodContentReview = () => {
  const [activeTab, setActiveTab] = useState('theories');
  const [theories, setTheories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/department/content').catch(() => ({ data: { success: true, data: { theories: [], questions: [] } } }));
      if (res.data.success) {
        const d = res.data.data;
        setTheories(d.theories || d.content || []);
        setQuestions(d.questions || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };


  const getBadge = (s) => {
    const cls = s === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
      : s === 'rejected' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
      : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20';
    return <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${cls}`}>{s || 'pending'}</span>;
  };

  const filteredT = theories.filter(t => (t.title||'').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredQ = questions.filter(q => (q.questionText||q.question||'').toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <PageShimmer variant="list" />;

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-white relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[150px] mix-blend-screen" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        <div className="glass-panel p-6 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-transparent dark:border-blue-500/30">
              <FaBookOpen className="text-3xl text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Content Review</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review theories and questions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{v:theories.length,l:'Theories',c:'text-blue-500'},{v:questions.length,l:'Questions',c:'text-emerald-500'},
            {v:theories.filter(t=>!t.status||t.status==='pending').length,l:'Pending T.',c:'text-yellow-500'},
            {v:questions.filter(q=>!q.status||q.status==='pending').length,l:'Pending Q.',c:'text-yellow-500'}
          ].map((s,i)=>(
            <div key={i} className="glass-panel p-4 border border-gray-200 dark:border-white/10 rounded-2xl text-center">
              <div className={`text-2xl font-black ${s.c}`}>{s.v}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            {['theories','questions'].map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${activeTab===tab?(tab==='theories'?'bg-blue-500 border-blue-500':'bg-emerald-500 border-emerald-500')+' text-white shadow-lg':'bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                {tab==='theories'?<FaBookOpen className="inline mr-2"/>:<FaQuestionCircle className="inline mr-2"/>}{tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></div>
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {(activeTab==='theories'?filteredT:filteredQ).length===0?(
            <div className="text-center py-16 glass-panel border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
              {activeTab==='theories'?<FaBookOpen className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3"/>:<FaQuestionCircle className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3"/>}
              <p className="text-gray-500">No {activeTab} found.</p>
            </div>
          ):(activeTab==='theories'?filteredT:filteredQ).map(item=>(
            <div key={item._id} className="glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getBadge(item.status)}
                    <span className="text-xs text-gray-500 flex items-center gap-1"><FaUser className="text-[10px]"/>{item.createdBy?.name||'Unknown'}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><FaClock className="text-[10px]"/>{item.createdAt?new Date(item.createdAt).toLocaleDateString():''}</span>
                  </div>
                  <h4 className="font-bold text-base">{item.title||item.questionText||item.question||'Untitled'}</h4>
                  {item.description&&<p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HodContentReview;
