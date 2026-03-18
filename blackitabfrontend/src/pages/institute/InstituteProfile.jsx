import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CameraIcon, XMarkIcon, MapPinIcon, PhoneIcon, BuildingOfficeIcon, UserGroupIcon, IdentificationIcon, BookOpenIcon, InformationCircleIcon, PencilSquareIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';

const InstituteProfile = () => {
    const userDataStr = localStorage.getItem('user');
    const user = userDataStr ? JSON.parse(userDataStr) : null;
    const [institute, setInstitute] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contactPhone: '',
        address: '',
        bannerImage: ''
    });
    const [bannerFile, setBannerFile] = useState(null);
    const [showCode, setShowCode] = useState(false);

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
                headers: { 'Content-Type': 'multipart/form-data' }
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

    if (loading) return <PageShimmer variant="form" />;

    if (!institute) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <BuildingOfficeIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Institute Profile Not Found</h2>
                <p className="text-gray-500 text-sm mt-1">You don't seem to be linked to an active institute.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                        Institute Profile
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Details and departments of your registered institute</p>
                </div>
                {isEditable && (
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                    </button>
                )}
            </div>

            {/* Banner */}
            <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
                <div className="h-36 w-full relative bg-gray-100 dark:bg-white/5">
                    {institute.bannerImage ? (
                        <img src={institute.bannerImage} alt={institute.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <BuildingOfficeIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 opacity-50" />
                        </div>
                    )}
                    {institute.bannerImage && <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />}
                    <div className="absolute bottom-4 left-5">
                        <h2 className={`text-lg font-bold ${institute.bannerImage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {institute.name}
                        </h2>
                        <div className="flex items-center gap-1 mt-1">
                            <span className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded border ${institute.bannerImage ? 'text-white border-white/30 bg-black/30' : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/30'}`}>
                                <IdentificationIcon className="w-3.5 h-3.5" />
                                {showCode ? institute.instituteCode : '••••••'}
                                <button onClick={() => setShowCode(!showCode)} className="ml-0.5">
                                    {showCode ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: About + Departments */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <InformationCircleIcon className="w-3.5 h-3.5" /> About Institute
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                {institute.description || 'No description provided. The institute admin can add details here.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <BookOpenIcon className="w-3.5 h-3.5" /> Departments
                            </h3>
                            {institute.departments && institute.departments.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {institute.departments.map((dept, index) => (
                                        <span
                                            key={index}
                                            className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                                        >
                                            {dept}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No departments have been added yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Contact Info */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-0.5">Address</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {institute.address || <span className="italic text-gray-400">Not provided</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-gray-100 dark:bg-white/5" />
                            <div className="flex items-start gap-3">
                                <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-0.5">Contact Phone</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {institute.contactPhone || <span className="italic text-gray-400">Not provided</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditable && showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={() => setShowEditModal(false)}>
                    <div
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 w-full max-w-2xl shadow-xl relative my-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5 border-b border-gray-100 dark:border-white/5 pb-4">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Banner Preview */}
                        <div className="relative h-28 bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden mb-5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                            {formData.bannerImage ? (
                                <img src={formData.bannerImage} alt="Banner Preview" className="w-full h-full object-cover opacity-80" />
                            ) : (
                                <CameraIcon className="w-7 h-7 text-gray-400" />
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institute Name</label>
                                    <input
                                        type="text" name="name" value={formData.name} onChange={handleChange} required
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Image</label>
                                    <input
                                        type="file" name="bannerImage" accept="image/*" onChange={handleFileChange}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-200 dark:file:bg-white/10 file:text-gray-700 dark:file:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                                    <input
                                        type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                    <input
                                        type="text" name="address" value={formData.address} onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description / About</label>
                                    <textarea
                                        name="description" value={formData.description} onChange={handleChange} rows={4}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3">
                                <button
                                    type="button" onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={saving}
                                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-50"
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
