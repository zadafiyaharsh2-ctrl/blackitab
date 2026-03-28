import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CustomToast } from '../../utils/CustomToast';
import { 
    FlagIcon, 
    ShieldExclamationIcon, 
    InformationCircleIcon 
} from '@heroicons/react/24/outline';

const SubmitComplaint = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Other',
        isAnonymous: false
    });
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [fetchingHistory, setFetchingHistory] = useState(true);

    const categories = ['Infrastructure', 'Teacher/Harassment', 'Curriculum', 'Peer Issue', 'Other'];

    useEffect(() => {
        // Students don't currently have an API to fetch their OWN complaints (as per backend),
        // but if they did, we could fetch here. For now, we just present the form.
        setFetchingHistory(false);
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim() || !formData.description.trim()) {
            return CustomToast.error('Title and description are required');
        }

        try {
            setLoading(true);
            const res = await api.post('/institute/complaints', formData);
            if (res.data.success) {
                CustomToast.success('Complaint submitted successfully');
                setFormData({ title: '', description: '', category: 'Other', isAnonymous: false });
            }
        } catch (error) {
            CustomToast.error(error.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldExclamationIcon className="w-6 h-6 text-red-500" />
                    Submit a Complaint
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Report any issues directly to your Institute Administration.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        Your complaint goes directly to the Institute Admins. Valid complaints are taken very seriously. Please provide descriptive facts to help them investigate.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Category</label>
                        <select 
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brief Title</label>
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="E.g., Broken projector in Room 402"
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all placeholder:text-gray-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detailed Description</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Provide all context, exact times, people involved, etc..."
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all placeholder:text-gray-400 resize-y"
                            required
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input 
                            type="checkbox" 
                            id="isAnonymous"
                            name="isAnonymous"
                            checked={formData.isAnonymous}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
                            Submit Anonymously
                            <span className="text-xs text-gray-400 font-normal">(Admins will only see 'Anonymous Student')</span>
                        </label>
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        <FlagIcon className="w-4 h-4" />
                        Submit Complaint
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitComplaint;
