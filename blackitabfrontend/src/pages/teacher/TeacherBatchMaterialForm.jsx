import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaSave, FaSpinner, FaPlus, FaTrash, FaLink, FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../../config';
import PageShimmer from '../../components/shared/PageShimmer';

const TeacherBatchMaterialForm = () => {
  const { batchId, materialId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(materialId);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [batch, setBatch] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    links: [],
    files: []
  });

  useEffect(() => {
    fetchBatchDetails();
    if (isEditing) {
      fetchMaterialDetails();
    }
  }, [batchId, materialId]);

  const fetchBatchDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/teacher/batch/${batchId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBatch(res.data.data);
    } catch (error) {
      toast.error('Failed to load batch details');
    }
  };

  const fetchMaterialDetails = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/teacher/batch/${batchId}/materials`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const materials = res.data.data;
      const material = materials.find(m => m._id === materialId);
      if (material) {
        setFormData({
          title: material.title || '',
          description: material.description || '',
          content: material.content || '',
          links: material.links || [],
          files: material.files || []
        });
      } else {
        toast.error('Material not found');
        navigate(`/teacher/batch/${batchId}`);
      }
    } catch (error) {
      toast.error('Failed to load material details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      return toast.error('Title is required');
    }

    // Clean up empty links/files
    const cleanedData = {
      ...formData,
      links: formData.links.filter(l => l.trim() !== ''),
      files: formData.files.filter(f => f.trim() !== '')
    };

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await axios.put(`${API_URL}/api/teacher/material/${materialId}`, cleanedData, { headers });
        toast.success('Material updated successfully');
      } else {
        await axios.post(`${API_URL}/api/teacher/batch/${batchId}/materials`, cleanedData, { headers });
        toast.success('Material created successfully');
      }
      navigate(`/teacher/batch/${batchId}`);
    } catch (error) {
      console.error('Save material error:', error);
      toast.error(error.response?.data?.message || 'Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageShimmer variant="form" />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/teacher/batch/${batchId}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
      >
        <FaArrowLeft /> Back to Classroom
      </button>

      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Material' : 'Add New Material'}
          </h1>
          {batch && (
            <p className="text-sm text-gray-500 mt-1">
              For class: <span className="font-semibold text-gray-700 dark:text-gray-300">{batch.name}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Material Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Chapter 1 Resources"
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief summary or instructions..."
              rows="2"
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>

          {/* Content Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
              <FaFileAlt className="text-gray-400" /> Text Notes
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write detailed notes here..."
              rows="4"
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* External Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FaLink className="text-blue-500" /> External Links
              </label>
              <button
                type="button"
                onClick={() => addArrayItem('links')}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                <FaPlus /> Add Link
              </button>
            </div>
            
            {formData.links.length === 0 && (
              <p className="text-sm text-gray-400 italic mb-2">No links added. Click 'Add Link' to add one.</p>
            )}
            
            <div className="space-y-2">
              {formData.links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleArrayChange('links', idx, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('links', idx)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Document Files */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FaFileAlt className="text-emerald-500" /> Document URLs
              </label>
              <button
                type="button"
                onClick={() => addArrayItem('files')}
                className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <FaPlus /> Add Document
              </button>
            </div>
            
            {formData.files.length === 0 && (
              <p className="text-sm text-gray-400 italic mb-2">No documents added. Provide URLs to PDFs or drive files.</p>
            )}
            
            <div className="space-y-2">
              {formData.files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={file}
                    onChange={(e) => handleArrayChange('files', idx, e.target.value)}
                    placeholder="Document URL (Google Drive, Dropbox, etc.)"
                    className="flex-1 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('files', idx)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/teacher/batch/${batchId}`)}
              className="px-5 py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mr-3 font-medium text-sm"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {isEditing ? 'Save Changes' : 'Create Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherBatchMaterialForm;
