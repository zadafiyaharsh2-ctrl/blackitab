import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaCamera, FaSpinner, FaSave } from 'react-icons/fa';

const ProfileSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const u = response.data.user;
                setUser(u);
                setName(u.name || '');
                setBio(u.bio || '');
                setIsPrivate(u.isPrivate || false);
                setPreviewImage(u.profileImage || null);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile details');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            return toast.error("Name is required");
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('name', name);
            formData.append('bio', bio);
            formData.append('isPrivate', isPrivate);
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const res = await axios.put(`${API_URL}/api/user/update-profile`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                toast.success('Profile updated successfully!');
                // Update local storage
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data.user }));
                navigate('/profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex justify-center items-center">
                <FaSpinner className="animate-spin text-blue-500 text-3xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8 relative overflow-hidden flex justify-center">
            {/* BACKGROUND GLOW */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="mb-6 flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="p-3 mr-2 rounded-full bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-colors border border-gray-300 dark:border-white/10 shadow-sm">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Profile Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Update your personal details and preferences.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md">
                    <form onSubmit={handleSave} className="space-y-8">
                        
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-lg flex items-center justify-center">
                                    {previewImage ? (
                                        <img src={previewImage.startsWith('blob:') || previewImage.startsWith('http') ? previewImage : `${API_URL}${previewImage}`} alt="Profile Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl font-bold text-gray-300 dark:text-gray-600">
                                            {name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                    <FaCamera size={24} className="mb-1" />
                                    <span className="text-xs font-semibold">Change</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                            />
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                                <textarea 
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none min-h-[120px] resize-y"
                                    placeholder="Tell the world about yourself..."
                                />
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 p-4 rounded-xl">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Private Account</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">If private, users must request to follow you.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={isPrivate}
                                        onChange={(e) => setIsPrivate(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-6 py-3 mr-4 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
