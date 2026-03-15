import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaClipboardList, FaLink, FaFileAlt, FaArrowLeft, FaSpinner, FaCalendarAlt, FaPlus, FaTrash, FaSave, FaCheckCircle
} from 'react-icons/fa';
import API_URL from '../../config';
import toast from 'react-hot-toast';

const StudentAssignmentDetail = () => {
  const { classId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    content: '',
    links: [],
    files: []
  });

  useEffect(() => {
    fetchAssignment();
  }, [classId, assignmentId]);

  const fetchAssignment = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/user/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setAssignment(res.data.data.assignment);
        const sub = res.data.data.submission;
        setSubmission(sub);
        if (sub) {
          setFormData({
            content: sub.content || '',
            links: sub.links || [],
            files: sub.files || []
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assignment details');
      navigate(`/classes/${classId}`);
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
    
    const cleanedData = {
      ...formData,
      links: formData.links.filter(l => l.trim() !== ''),
      files: formData.files.filter(f => f.trim() !== '')
    };

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/user/assignments/${assignmentId}/submit`, cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success(submission ? 'Submission updated successfully' : 'Assignment submitted successfully');
        setSubmission(res.data.data);
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-3xl text-gray-400" />
      </div>
    );
  }

  if (!assignment) return null;

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : 'No Due Date';

  const isGraded = submission?.gradedAt != null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pt-20">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(`/classes/${classId}`)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors self-start bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10"
      >
        <FaArrowLeft className="text-xs" /> Back to Class
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Card (Assignment Details) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                <FaClipboardList className="text-xl" />
              </div>
              <div className="flex-1 pt-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {assignment.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {assignment.teacherId?.name && (
                    <span className="flex items-center gap-1.5">
                      Teacher: <span className="text-gray-900 dark:text-gray-200">{assignment.teacherId.name}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                    Total Marks: {assignment.totalMarks}
                  </span>
                  <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-md">
                    <FaCalendarAlt /> Due {dueDate}
                  </span>
                </div>
              </div>
            </div>

            {assignment.description && (
              <p className="text-base text-gray-600 dark:text-gray-300 mt-6 leading-relaxed">
                {assignment.description}
              </p>
            )}

            {/* Instruction Content */}
            {assignment.content && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-white/10 pb-2">
                  Instructions
                </h3>
                <div className="prose prose-orange dark:prose-invert max-w-none prose-p:leading-relaxed text-gray-700 dark:text-gray-300 text-sm">
                  <div className="whitespace-pre-wrap">
                    {assignment.content}
                  </div>
                </div>
              </div>
            )}

            {/* Attachments & Links */}
            {(assignment.links?.length > 0 || assignment.files?.length > 0) && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-white/10 pb-2">
                  Reference Materials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Embedded Links */}
                  {assignment.links?.map((link, idx) => {
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
                        className="flex items-start gap-3 p-3 rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                          <FaLink className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform text-sm" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-blue-900 dark:text-blue-100 truncate">External Link</p>
                          <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 truncate">{displayUrl}</p>
                        </div>
                      </a>
                    );
                  })}

                  {/* Uploaded Files */}
                  {assignment.files?.map((file, idx) => {
                    let filename = `Document ${idx + 1}`;
                    if (typeof file === 'string' && file.includes('/')) {
                      const parts = file.split('/');
                      const lastPart = parts[parts.length - 1];
                      if (lastPart) filename = lastPart.split('?')[0]; 
                    }
                    if(filename.length > 25) {
                        filename = filename.substring(0, 10) + '...' + filename.substring(filename.length - 10);
                    }

                    return (
                      <a 
                        key={`file-${idx}`} 
                        href={file} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-start gap-3 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <FaFileAlt className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform text-sm" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100 truncate">Attached File</p>
                          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 truncate">{filename}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Submission Card) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8 sticky top-24">
            
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex justify-between items-center">
              Your Work
              {submission ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <FaCheckCircle /> Submitted
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 font-semibold">
                  Assigned
                </span>
              )}
            </h2>

            {isGraded ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl text-center">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Grade</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{submission.score} <span className="text-lg text-emerald-500/70 font-medium">/ {assignment.totalMarks}</span></p>
                </div>
                {submission.teacherRemarks && (
                  <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Teacher Feedback</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{submission.teacherRemarks}"</p>
                  </div>
                )}
                <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-sm">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Submission:</p>
                  {submission.content && <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">{submission.content}</p>}
                  <div className="text-xs text-blue-500 space-y-1">
                    {submission.links?.map((l, i) => <div key={i} className="truncate"><FaLink className="inline mr-1" />{l}</div>)}
                    {submission.files?.map((f, i) => <div key={i} className="truncate"><FaFileAlt className="inline mr-1" />File {i+1}</div>)}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Text Content */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">Add Text</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Enter submission text..."
                    rows="3"
                    className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-sm transition-shadow"
                  />
                </div>

                {/* External Links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Add Links</label>
                    <button type="button" onClick={() => addArrayItem('links')} className="text-xs text-blue-600 font-bold hover:underline bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="url" value={link} onChange={(e) => handleArrayChange('links', idx, e.target.value)}
                          placeholder="https://..."
                          className="flex-1 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        />
                        <button type="button" onClick={() => removeArrayItem('links', idx)} className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Links */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Add Files (URLs)</label>
                    <button type="button" onClick={() => addArrayItem('files')} className="text-xs text-blue-600 font-bold hover:underline bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="url" value={file} onChange={(e) => handleArrayChange('files', idx, e.target.value)}
                          placeholder="File Drive Link..."
                          className="flex-1 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                        />
                        <button type="button" onClick={() => removeArrayItem('files', idx)} className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit / Resubmit Button */}
                <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? <FaSpinner className="animate-spin" /> : (submission ? <FaSave /> : <FaPlus />)}
                    {submission ? 'Update Submission' : 'Turn In'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentDetail;
