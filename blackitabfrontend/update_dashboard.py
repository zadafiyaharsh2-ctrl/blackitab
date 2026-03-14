import re

with open('src/pages/admin/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
import_statement = """import { CustomToast } from '../../utils/CustomToast';
import axios from 'axios';
import API_URL from '../../config';
import DeleteConfirmationModal from '../../components/shared/DeleteConfirmationModal';

// Imported Tab Components
import OverviewTab from '../../components/admin/tabs/OverviewTab';
import UsersTab from '../../components/admin/tabs/UsersTab';
import InstitutesTab from '../../components/admin/tabs/InstitutesTab';
import QuestionsTab from '../../components/admin/tabs/QuestionsTab';
import PostsTab from '../../components/admin/tabs/PostsTab';
import ContestsTab from '../../components/admin/tabs/ContestsTab';
import AnalyticsTab from '../../components/admin/tabs/AnalyticsTab';
import Pagination from '../../components/admin/Pagination';
import AdminTeacherFeedbackModal from '../../components/admin/modals/AdminTeacherFeedbackModal';
"""

content = content.replace("import { CustomToast } from '../../utils/CustomToast';\nimport axios from 'axios';\nimport API_URL from '../../config';\nimport DeleteConfirmationModal from '../../components/shared/DeleteConfirmationModal';", import_statement)

# 2. Extract and replace OverviewTab
overview_pattern = re.compile(r"\{\/\* ── OVERVIEW TAB ── \*\/\}\s*\{activeTab === 'overview' && \(\s*<motion\.div variants=\{containerVariants\} initial=\"hidden\" animate=\"visible\">.*?(?=\{\/\* ── USERS TAB ── \*\/\})", re.DOTALL)
overview_replacement = """{/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <OverviewTab 
             statCards={statCards} 
             stats={stats} 
             loading={loading} 
             containerVariants={containerVariants} 
             itemVariants={itemVariants} 
          />
        )}

        """
content = overview_pattern.sub(overview_replacement, content)

# 3. Extract and replace UsersTab
users_pattern = re.compile(r"\{\/\* ── USERS TAB ── \*\/\}\s*\{activeTab === 'users' && \(\s*<motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\}>.*?(?=\{\/\* ── INSTITUTES TAB \(\+ EDIT MODAL\) ── \*\/\})", re.DOTALL)
users_replacement = """{/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <UsersTab 
             userSearch={userSearch} setUserSearch={setUserSearch} fetchUsers={fetchUsers}
             setShowCreateUser={setShowCreateUser} showCreateUser={showCreateUser}
             newUser={newUser} setNewUser={setNewUser} handleCreateUser={handleCreateUser}
             editUserModal={editUserModal} setEditUserModal={setEditUserModal}
             editUserTab={editUserTab} setEditUserTab={setEditUserTab} handleEditUser={handleEditUser}
             filteredUsers={filteredUsers} handleRoleChange={handleRoleChange} handleBan={handleBan}
             setSelectedTeacherForFeedback={setSelectedTeacherForFeedback} setIsFeedbackModalOpen={setIsFeedbackModalOpen}
             openDeleteModal={openDeleteModal} Pagination={Pagination} userPagination={userPagination}
             userPage={userPage} setUserPage={setUserPage}
          />
        )}

        """
content = users_pattern.sub(users_replacement, content)


# 4. Extract and replace InstitutesTab
institutes_pattern = re.compile(r"\{\/\* ── INSTITUTES TAB \(\+ EDIT MODAL\) ── \*\/\}\s*\{activeTab === 'institutes' && \(\s*<motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\}>.*?(?=\{\/\* ── QUESTIONS TAB \(NEW\) ── \*\/\})", re.DOTALL)
institutes_replacement = """{/* ── INSTITUTES TAB (+ EDIT MODAL) ── */}
        {activeTab === 'institutes' && (
          <InstitutesTab 
            institutes={institutes} showCreateInstitute={showCreateInstitute}
            setShowCreateInstitute={setShowCreateInstitute} newInstitute={newInstitute}
            setNewInstitute={setNewInstitute} handleCreateInstitute={handleCreateInstitute}
            selectedInstitute={selectedInstitute} setSelectedInstitute={setSelectedInstitute}
            instituteMembers={instituteMembers} instituteMembersLoading={instituteMembersLoading}
            editInstituteModal={editInstituteModal} setEditInstituteModal={setEditInstituteModal}
            editInstituteTab={editInstituteTab} setEditInstituteTab={setEditInstituteTab}
            handleEditInstitute={handleEditInstitute} openDeleteModal={openDeleteModal}
            fetchInstituteMembers={fetchInstituteMembers}
          />
        )}

        """
content = institutes_pattern.sub(institutes_replacement, content)


# 5. Extract and replace QuestionsTab
questions_pattern = re.compile(r"\{\/\* ── QUESTIONS TAB \(NEW\) ── \*\/\}\s*\{activeTab === 'questions' && \(\s*<motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\}>.*?(?=\{\/\* ── POSTS TAB \(NEW\) ── \*\/\})", re.DOTALL)
questions_replacement = """{/* ── QUESTIONS TAB (NEW) ── */}
        {activeTab === 'questions' && (
          <QuestionsTab 
             questions={questions} questionFilter={questionFilter} setQuestionFilter={setQuestionFilter}
             showCreateQuestion={showCreateQuestion} setShowCreateQuestion={setShowCreateQuestion}
             newQuestion={newQuestion} setNewQuestion={setNewQuestion} handleCreateQuestion={handleCreateQuestion}
             setQuestionPreview={setQuestionPreview} handleApprove={handleApprove}
             setRejectModal={setRejectModal} handleDeleteQuestion={handleDeleteQuestion}
             Pagination={Pagination} questionPagination={questionPagination}
             questionPage={questionPage} setQuestionPage={setQuestionPage} fetchQuestions={fetchQuestions}
          />
        )}

        """
content = questions_pattern.sub(questions_replacement, content)

# 6. Extract and replace PostsTab
posts_pattern = re.compile(r"\{\/\* ── POSTS TAB \(NEW\) ── \*\/\}\s*\{activeTab === 'posts' && \(\s*<motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\}>.*?(?=\{\/\* ── CONTESTS TAB \(NEW\) ── \*\/\})", re.DOTALL)
posts_replacement = """{/* ── POSTS TAB (NEW) ── */}
        {activeTab === 'posts' && (
          <PostsTab 
             posts={posts} handleDeletePost={handleDeletePost} postPagination={postPagination}
             postPage={postPage} setPostPage={setPostPage} Pagination={Pagination} fetchPosts={fetchPosts}
          />
        )}

        """
content = posts_pattern.sub(posts_replacement, content)

# 7. Extract and replace ContestsTab
contests_pattern = re.compile(r"\{\/\* ── CONTESTS TAB \(NEW\) ── \*\/\}\s*\{activeTab === 'contests' && \(\s*<motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\}>.*?(?=\{\/\* ── ANALYTICS TAB \(NEW - GLOBAL PARITY\) ── \*\/\})", re.DOTALL)
contests_replacement = """{/* ── CONTESTS TAB (NEW) ── */}
        {activeTab === 'contests' && (
          <ContestsTab 
             contests={contests} showCreateContest={showCreateContest} setShowCreateContest={setShowCreateContest}
             newContest={newContest} setNewContest={setNewContest} handleCreateContest={handleCreateContest}
             setEditContestModal={setEditContestModal} handleDeleteContest={handleDeleteContest}
          />
        )}

        """
content = contests_pattern.sub(contests_replacement, content)


# 8. Extract and replace AnalyticsTab
analytics_pattern = re.compile(r"\{\/\* ── ANALYTICS TAB \(NEW - GLOBAL PARITY\) ── \*\/\}\s*\{activeTab === 'analytics' && \(\s*<motion\.div initial=\{\{ opacity: 0 \}\} animate=\{\{ opacity: 1 \}\}>.*?(?=\{\/\* ── REJECT MODAL ── \*\/\})", re.DOTALL)
analytics_replacement = """{/* ── ANALYTICS TAB (NEW - GLOBAL PARITY) ── */}
        {activeTab === 'analytics' && (
          <AnalyticsTab globalAnalytics={globalAnalytics} teacherAnalytics={teacherAnalytics} />
        )}
      </div>

      """
content = analytics_pattern.sub(analytics_replacement, content)

# Remove the internal Pagination component
pagination_pattern = re.compile(r"// ── Pagination Component ──[\s\S]*?(?=return \(\n    <div className=\"admin-theme)", re.DOTALL)
content = pagination_pattern.sub("
