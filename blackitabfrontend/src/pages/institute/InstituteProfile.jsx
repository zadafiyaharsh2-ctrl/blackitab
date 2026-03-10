import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CameraIcon, PlusIcon, XMarkIcon, MapPinIcon, PhoneIcon, BuildingOfficeIcon, UserGroupIcon, IdentificationIcon, BookOpenIcon, InformationCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CustomToast } from '../../utils/CustomToast';

const InstituteProfile = () => {
    const userDataStr = localStorage.getItem('user');
    const user = userDataStr ? JSON.parse(userDataStr) : null;
    const [institute, setInstitute] = useState(null);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State for Edit Modal
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contactPhone: '',
        address: '',
        bannerImage: ''
    });
    const [bannerFile, setBannerFile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/institute/my');
            if (res.data.success) {
                const inst = res.data.data;
                setInstitute(inst);
                setFormData({
                    name: inst.name || '',
                    description: inst.description || '',
                    contactPhone: inst.contactPhone || '',
                    address: inst.address || '',
                    bannerImage: inst.bannerImage || ''
                });
            }
        } catch (error) {
            CustomToast.error('Failed to load institute profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setBannerFile(e.target.files[0]);
            setFormData({ ...formData, bannerImage: URL.createObjectURL(e.target.files[0]) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('contactPhone', formData.contactPhone);
            submitData.append('address', formData.address);
            
            if (bannerFile) {
                submitData.append('bannerImage', bannerFile);
            } else if (formData.bannerImage) {
                submitData.append('bannerImage', formData.bannerImage);
            }

            const res = await api.put('/institute/profile', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (res.data.success) {
                setInstitute(res.data.data);
                CustomToast.success('Profile updated successfully');
                setShowEditModal(false);
            }
        } catch (error) {
            CustomToast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const isEditable = user?.role === 'institute';

    if (loading) return <LoadingSpinner />;

    if (!institute) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans">
                <BuildingOfficeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Institute Profile Not Found</h2>
                <p className="text-gray-500 text-sm mt-2">You don't seem to be linked to an active institute.</p>
            </div>
        );
    }

    return (
        <div className="min-h-[90vh] text-gray-900 dark:text-white p-4 py-8 relative font-sans">

            <div className="max-w-5xl mx-auto relative z-10 space-y-8">
                
                {/* Headers & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300">
                            Institute Profile
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Details and departments of your registered institute</p>
                    </div>
                    {isEditable && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2 text-sm self-start sm:self-auto"
                        >
                            <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                        </button>
                    )}
                </div>

                {/* Profile Banner Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl lg:shadow-2xl relative group">
                    {/* Banner Image / Gradient Fallback */}
                    <div className="h-48 md:h-64 w-full relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
                        {institute.bannerImage && (
                            <img src={institute.bannerImage} alt={institute.name} className="w-full h-full object-cover opacity-90 mix-blend-overlay" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                        
                        {/* Overlay Content */}
                        <div className="absolute bottom-6 left-6 md:left-10 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight mb-3">
                                    {institute.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-white text-sm font-semibold tracking-wide shadow-sm">
                                        <IdentificationIcon className="w-4 h-4" /> Code: {institute.instituteCode}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details Content */}
                    <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white dark:bg-gray-900">
                        
                        {/* Left Column: About & Description */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
                                    <InformationCircleIcon className="w-6 h-6 text-orange-500" /> About Institute
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-light whitespace-pre-wrap text-[15px]">
                                    {institute.description || "No description provided. The institute admin can add details here to describe the campus, vision, and mission."}
                                </p>
                            </div>

                            {/* Departments Section */}
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
                                    <BookOpenIcon className="w-6 h-6 text-orange-500" /> Departments
                                </h3>
                                {institute.departments && institute.departments.length > 0 ? (
                                    <div className="flex flex-wrap gap-2.5">
                                        {institute.departments.map((dept, index) => (
                                            <span 
                                                key={index}
                                                className="px-4 py-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-300 rounded-xl text-sm font-medium shadow-sm transition-transform hover:-translate-y-0.5"
                                            >
                                                {dept}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-[15px]">No departments have been added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Contact & Location */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
                                Contact Info
                            </h3>
                            
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 space-y-6">
                                <div className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm">
                                        <MapPinIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Address</p>
                                        <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-snug">
                                            {institute.address || <span className="italic opacity-60">Not provided</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gray-200 dark:bg-white/5"></div>

                                <div className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">
                                        <PhoneIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Contact Phone</p>
                                        <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-snug">
                                            {institute.contactPhone || <span className="italic opacity-60">Not provided</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal for Institute Admin */}
            {isEditable && showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowEditModal(false)}>
                    <div 
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>

                        {/* Banner Preview in Modal */}
                        <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-6 border border-gray-200 dark:border-white/10 group flex items-center justify-center">
                            {formData.bannerImage ? (
                                <img src={formData.bannerImage} alt="Banner Preview" className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <CameraIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-medium text-sm backdrop-blur-sm bg-black/50 px-3 py-1.5 rounded-lg border border-white/20">Preview</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">Institute Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">Banner Image</label>
                                    <input
                                        type="file"
                                        name="bannerImage"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-500/10 dark:file:text-orange-400 dark:hover:file:bg-orange-500/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">Contact Phone</label>
                                    <input
                                        type="text"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ml-1">Description / About</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none resize-y transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 flex-wrap sm:flex-nowrap">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstituteProfile;
