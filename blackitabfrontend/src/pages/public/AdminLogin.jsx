import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { CustomToast } from '../../utils/CustomToast';
import API_URL from '../../config';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      CustomToast.error('Both fields are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        CustomToast.success('Welcome, Admin');
        navigate('/admin/dashboard');
      } else {
        CustomToast.error(data.message || 'Login failed');
      }
    } catch {
      CustomToast.error('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md glass-panel p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">System Admin</h2>
          <p className="text-gray-400 mt-2 text-sm">Restricted access. Admin credentials required.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-500 group-focus-within:text-red-400 transition-colors" />
              </div>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="admin" className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500/50 text-white placeholder-gray-600 outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-red-400 transition-colors" />
              </div>
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500/50 text-white placeholder-gray-600 outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white" tabIndex="-1">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><span>Access Panel</span><ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-gray-500 text-sm hover:text-gray-400">← Back to user login</a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
