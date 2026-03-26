import React from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

const EditInstituteModal = ({
    showEditModal,
    setShowEditModal,
    formData,
    handleChange,
    handleFileChange,
    handleSubmit,
    saving
}) => {
    if (!showEditModal) return null;

    return (
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
    );
};

export default EditInstituteModal;
