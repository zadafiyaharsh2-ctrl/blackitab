import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import usePageTitle from '../../hooks/usePageTitle';
import PageShimmer from '../../components/shared/PageShimmer';
import ProblemsHero from '../../components/student/pages/problems/ProblemsHero';
import ProblemsExamGrid from '../../components/student/pages/problems/ProblemsExamGrid';

const Problems = () => {
  usePageTitle('Practice Problems');
  const [globalExams, setGlobalExams] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global');
  const [instituteExams, setInstituteExams] = useState([]);
  const [instituteLoading, setInstituteLoading] = useState(false);

  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const hasInstitute = !!(user?.instituteId);

  useEffect(() => {
    const fetchGlobalExams = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/problems/global-subjects`);
        if (res.data.success) {
          setGlobalExams(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } catch (err) {
        console.error('Error fetching global exam list:', err);
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchGlobalExams();
  }, []);

  useEffect(() => {
    if (activeTab === 'institute' && hasInstitute) {
      const fetchInstituteExams = async () => {
        setInstituteLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/api/problems/institute-subjects`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) setInstituteExams(res.data.data);
        } catch (err) {
          console.error('Error fetching institute exams:', err);
        } finally {
          setInstituteLoading(false);
        }
      };
      fetchInstituteExams();
    }
  }, [activeTab, hasInstitute]);

  if (globalLoading) return <PageShimmer variant="cards" />;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] transition-colors font-sans overflow-x-hidden">
      <ProblemsHero />
      <ProblemsExamGrid
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        globalExams={globalExams}
        instituteExams={instituteExams}
        instituteLoading={instituteLoading}
        hasInstitute={hasInstitute}
      />
    </div>
  );
};

export default Problems;
