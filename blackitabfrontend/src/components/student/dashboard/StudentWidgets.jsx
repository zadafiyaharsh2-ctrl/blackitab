import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Users, Trophy, Medal, ArrowRight, Code, Clock
} from 'lucide-react';

const StudentDailyChallenge = ({ problemOfTheDay }) => {
  return (
    <div className="lg:col-span-2 group relative border-2 border-transparent rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg dark:hover:shadow-black/20"
      style={{
        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899) border-box',
      }}
    >
      {/* Dark mode gradient border override */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent dark:block hidden pointer-events-none"
        style={{
          background: 'linear-gradient(rgb(0 0 0 / 0.95), rgb(0 0 0 / 0.95)) padding-box, linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899) border-box',
        }}
      />
      <div className="relative p-5 bg-white dark:bg-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Code className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Daily Challenge</h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            problemOfTheDay.difficulty === 'Easy'
              ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10'
              : problemOfTheDay.difficulty === 'Hard'
                ? 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-500/30 dark:bg-red-500/10'
                : 'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10'
          }`}>
            {problemOfTheDay.difficulty}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">{problemOfTheDay.title}</p>
        <Link to={problemOfTheDay.link} className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-4 py-2.5 hover:from-blue-700 hover:to-purple-700 shadow-sm transition-all duration-200 group-hover:shadow-md">
          Solve now
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const StudentQuickActions = ({ joinedBatchCount, onJoinClick }) => {
  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {[
          joinedBatchCount > 0
            ? { title: 'My Classes', icon: Users, link: '/classes' }
            : { title: 'Join Class', icon: Users, onClick: onJoinClick },
          { title: 'Practice', icon: Target, link: '/problems' },
          { title: 'Profile', icon: Medal, link: '/profile' },
          { title: 'Contest', icon: Trophy, link: '/contest' }
        ].map((action) => {
          const Icon = action.icon;
          const content = (
            <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] text-gray-700 dark:text-gray-300">
              <Icon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">{action.title}</span>
              <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 ml-auto" />
            </div>
          );

          return action.link ? (
            <Link key={action.title} to={action.link}>{content}</Link>
          ) : (
            <button key={action.title} onClick={action.onClick} className="w-full text-left">{content}</button>
          );
        })}
      </div>
    </div>
  );
};

const StudentUpcomingExams = ({ upcomingExams, isExamStartingSoon, getExamCountdownLabel }) => {
  if (!upcomingExams.length) return null;

  return (
    <div className="relative border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-blue-200/40 dark:bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-cyan-200/40 dark:bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Upcoming Scheduled Exams
          </h3>
          <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 rounded-full px-2.5 py-1">
            {upcomingExams.length} planned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingExams.map((exam) => {
            const soon = isExamStartingSoon(exam.scheduledAt);

            return (
              <Link
                key={exam._id}
                to={`/classes/${exam.batchId._id}/exam/${exam._id}`}
                className="block border border-gray-200 dark:border-white/10 bg-white/85 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 dark:hover:border-cyan-400/30 group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[160px]">
                      {exam.batchId?.name || 'Your Class'}
                    </p>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white capitalize truncate max-w-[190px] group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
                      {exam.title}
                    </h4>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleString() : 'Schedule pending'}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      soon
                        ? 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10'
                        : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5'
                    }`}>
                      {getExamCountdownLabel(exam.scheduledAt)}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-cyan-300">Open →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { StudentDailyChallenge, StudentQuickActions, StudentUpcomingExams };
