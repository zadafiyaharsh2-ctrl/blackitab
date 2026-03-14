import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaBookOpen, FaLink, FaFileAlt, FaArrowLeft, FaSpinner, FaCalendarAlt
} from 'react-icons/fa';
import API_URL from '../../config';
import toast from 'react-hot-toast';

const StudentMaterialDetail = () => {
  const { classId, materialId } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterial();
  }, [classId, materialId]);

  const fetchMaterial = async () => {
    try {
      const token = localStorage.getItem('token');
      // We can fetch all materials for the class and find the specific one
      const res = await axios.get(`${API_URL}/api/user/batches/${classId}/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        const found = res.data.data.find(m => m._id === materialId);
        if (found) {
          setMaterial(found);
        } else {
          toast.error('Material not found');
          navigate(`/classes/${classId}`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load material details');
      navigate(`/classes/${classId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-3xl text-gray-400" />
      </div>
    );
  }

  if (!material) return null;

  const createdDate = new Date(material.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pt-20">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(`/classes/${classId}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors self-start bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10"
      >
        <FaArrowLeft className="text-xs" /> Back to Class
      </button>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-transparent">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <FaBookOpen className="text-xl" />
            </div>
            <div className="flex-1 pt-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {material.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                {material.teacherId?.name && (
                  <span className="flex items-center gap-1.5">
                    Posted by: <span className="text-gray-900 dark:text-gray-200">{material.teacherId.name}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt /> {createdDate}
                </span>
              </div>
            </div>
          </div>

          {material.description && (
            <p className="text-base text-gray-600 dark:text-gray-300 mt-6 leading-relaxed">
              {material.description}
            </p>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 space-y-8 relative">
          
          {/* Main Text Content */}
          {material.content && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-white/10 pb-2">
                Notes / Instructions
              </h3>
              <div className="prose prose-blue dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400">
                <div className="whitespace-pre-wrap font-medium">
                  {material.content}
                </div>
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {(material.links?.length > 0 || material.files?.length > 0) && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-white/10 pb-2">
                Attachments & Links
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Embedded Links */}
                {material.links?.map((link, idx) => {
                  let displayUrl = link;
                  try {
                    const urlObj = new URL(link);
                    displayUrl = urlObj.hostname + urlObj.pathname;
                    if(displayUrl.length > 40) displayUrl = displayUrl.substring(0, 37) + '...';
                  } catch(e) {}

                  return (
                    <a 
                      key={`link-${idx}`} 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-start gap-4 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                        <FaLink className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-0.5 truncate">External Link</p>
                        <p className="text-xs text-blue-600/80 dark:text-blue-400/80 truncate font-medium">{displayUrl}</p>
                      </div>
                    </a>
                  );
                })}

                {/* Uploaded Files */}
                {material.files?.map((file, idx) => {
                  let filename = `Document ${idx + 1}`;
                  if (typeof file === 'string' && file.includes('/')) {
                    const parts = file.split('/');
                    const lastPart = parts[parts.length - 1];
                    if (lastPart) filename = lastPart.split('?')[0]; 
                  }
                  
                  // Clean up long alphanumeric cloud ids
                  if(filename.length > 30) {
                      filename = filename.substring(0, 15) + '...' + filename.substring(filename.length - 10);
                  }

                  return (
                    <a 
                      key={`file-${idx}`} 
                      href={file} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-start gap-4 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <FaFileAlt className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-0.5 truncate">Attached File</p>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 truncate font-medium">{filename}</p>
                      </div>
                    </a>
                  );
                })}

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentMaterialDetail;
