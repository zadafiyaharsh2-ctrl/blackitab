import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCamera, FaSave, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(user?.profileImage || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setBio(user.bio || '');
            setIsPrivate(user.isPrivate || false);
            // Append API_URL if profileImage is a relative path
            if (user.profileImage && !user.profileImage.startsWith('http')) {
                setPreview(`${API_URL}${user.profileImage}`);
            } else {
                setPreview(user.profileImage);
            }
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('bio', bio);
            formData.append('isPrivate', isPrivate);
            if (image) {
                formData.append('profileImage', image);
            }

            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/user/update-profile`, formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.success) {
                onUpdate(res.data.user);
                onClose();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                            <button onClick={onClose} className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white rounded-full hover:bg-white/10 transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Image Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full border-2 border-gray-300 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-600 bg-gray-50 dark:bg-gray-800">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                                        <FaCamera className="text-gray-900 dark:text-white text-xl" />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <span className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">Change Profile Photo</span>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Display Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Bio</label>
                                    <textarea 
                                        rows="3"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-black/40 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                        placeholder="Tell us about yourself..."
                                        maxLength={160}
                                    />
                                    <div className="text-right text-xs text-gray-500 mt-1">{bio.length}/160</div>
                                </div>
                                
                                <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-gray-300 dark:border-gray-700">
                                    <div>
                                        <h3 className="text-gray-900 dark:text-white font-medium">Private Account</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Only followers can see your posts and message you.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={isPrivate}
                                            onChange={(e) => setIsPrivate(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EditProfileModal;
