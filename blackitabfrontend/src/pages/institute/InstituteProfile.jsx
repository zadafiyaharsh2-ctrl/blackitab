import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

import { CameraIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CustomToast } from '../../utils/CustomToast';

const InstituteProfile = () => {
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactPhone: '',
    address: '',
    bannerImage: '',
    departments: []
  });
  const [newDept, setNewDept] = useState('');

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
          bannerImage: inst.bannerImage || '',
          departments: inst.departments || []
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

  const handleAddDepartment = () => {
    if (!newDept.trim()) return;
    if (formData.departments.includes(newDept.trim())) {
      CustomToast.error('Department already exists');
      return;
    }
    setFormData({
      ...formData,
      departments: [...formData.departments, newDept.trim()]
    });
    setNewDept('');
  };

  const handleRemoveDepartment = (deptToRemove) => {
    setFormData({
      ...formData,
      departments: formData.departments.filter(d => d !== deptToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/institute/profile', formData);
      if (res.data.success) {
        setInstitute(res.data.data);
        CustomToast.success('Profile updated successfully');
      }
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const isEditable = user?.role === 'institute';

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Institute Profile</h1>
          <p className="text-gray-500 text-sm">Manage your institute's public details and departments</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-4 py-2 rounded-xl text-orange-600 dark:text-orange-400 font-mono text-sm self-start md:self-auto shadow-sm">
          Institute Code: {institute?.instituteCode}
        </div>
      </div>

      <div className="glass-panel border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden p-6 lg:p-8 relative shadow-sm">
        {/* Banner Preview */}
        <div className="relative h-40 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden mb-8 border border-gray-200 dark:border-white/10 group flex items-center justify-center">
            {formData.bannerImage ? (
                <img src={formData.bannerImage} alt="Banner" className="w-full h-full object-cover opacity-80 dark:opacity-60" />
            ) : (
                <CameraIcon className="w-10 h-10 text-gray-400 dark:text-gray-600" />
            )}
            <div className="absolute inset-0 bg-black/5 dark:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-gray-900 dark:text-white font-medium text-sm px-4 py-2 bg-white/80 dark:bg-black/50 rounded-lg backdrop-blur-sm shadow-sm dark:shadow-none">Banner Image Preview</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Institute Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:opacity-50 transition-colors"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Banner Image URL</label>
              <input
                type="url"
                name="bannerImage"
                value={formData.bannerImage}
                onChange={handleChange}
                disabled={!isEditable}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:opacity-50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:opacity-50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:opacity-50 transition-colors"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditable}
                rows={4}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:opacity-50 resize-y transition-colors"
              />
            </div>
            
            {/* Departments Management */}
            <div className="space-y-4 md:col-span-2 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Departments</label>
                {isEditable && (
                  <span className="text-xs text-gray-500">Press Add to include new departments</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.departments.map((dept, index) => (
                  <span 
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  >
                    {dept}
                    {isEditable && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveDepartment(dept)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-1 p-0.5"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </span>
                ))}
                {formData.departments.length === 0 && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 italic">No departments configured</span>
                )}
              </div>

              {isEditable && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDepartment())}
                    placeholder="E.g. Computer Science"
                    className="flex-1 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddDepartment}
                    className="bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-gray-300 dark:border-white/10"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add
                  </button>
                </div>
              )}
            </div>

          </div>

          {isEditable && (
            <div className="pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default InstituteProfile;
