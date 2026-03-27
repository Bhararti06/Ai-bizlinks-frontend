import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import RegisterOrganization from './pages/RegisterOrganization';
import RegisterUser from './pages/RegisterUser';
import CreatePassword from './pages/CreatePassword';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import ManageUsers from './pages/ManageUsers';
import References from './pages/References';
import EventsDashboard from './pages/EventsDashboard';
import Notifications from './pages/Notifications';
import MyPosts from './pages/MyPosts';
import ReferralsSent from './pages/ReferralsSent';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ThankYouNotes from './pages/ThankYouNotes';
import UserDashboard from './pages/UserDashboard';
import Members from './pages/Members';
import Files from './pages/Files';
import SecuritySettings from './pages/SecuritySettings';
import MyProfile from './pages/MyProfile';

import AdminDashboard from './pages/AdminDashboard';
import Training from './pages/Training';
import MemberProfile from './pages/MemberProfile';
import NamingConvention from './pages/NamingConvention';
import ChapterMeetings from './pages/ChapterMeetings';
import Visitors from './pages/Visitors';
import * as AdminPages from './pages/AdminPlaceholders';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import SuperAdminOrganizations from './pages/SuperAdmin/Organizations';
import SuperAdminLogin from './pages/SuperAdmin/Login';
import OrganizationEntry from './pages/OrganizationEntry';
import RenewMembers from './pages/RenewMembers';
import PublicEventPage from './pages/PublicEventPage';
import PublicTrainingPage from './pages/PublicTrainingPage';
import SuperAdminChangePassword from './pages/SuperAdmin/ChangePassword';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { orgCode } = useParams();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'chapter_admin' && !localStorage.getItem('activeRole')) {
    return <Navigate to="/login" replace />;
  }

  // Validate Org Code in URL
  if (user.role !== 'super_admin' && user.email !== 'superadmin@bizlinks.in') {
    const userOrg = user.subDomain || user.organizationName;
    if (orgCode && userOrg && orgCode.toLowerCase() !== userOrg.toLowerCase()) {
      console.warn('Organization mismatch detected. Redirecting to correct organization.');
      return <Navigate to={`/${userOrg}`} replace />;
    }
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { orgCode } = useParams();

  if (loading) return null;

  const activeRole = localStorage.getItem('activeRole');
  const isActingAsChapterAdmin = user?.role === 'chapter_admin' && activeRole !== 'member';
  const isAdmin = user?.role === 'admin' || isActingAsChapterAdmin || user?.role === 'super_admin' || user?.email === 'superadmin@bizlinks.in';

  if (!user || !isAdmin) {
    return <Navigate to={`/${orgCode || user?.subDomain || ''}`} replace />;
  }

  return children;
};

const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || (user.email !== 'superadmin@bizlinks.in' && user.role !== 'super_admin')) {
    if (user) return <Navigate to={`/${user.subDomain || user.organizationName || ''}`} replace />;
    return <Navigate to="/super-admin/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.role === 'chapter_admin' && !localStorage.getItem('activeRole')) {
      return children; // Keep them on the Login page to select role
    }

    if (user.email === 'superadmin@bizlinks.in' || user.role === 'super_admin') {
      return <Navigate to="/super-admin/dashboard" replace />;
    }

    const orgPrefix = user.subDomain || user.organizationName;
    
    const activeRole = localStorage.getItem('activeRole');
    if (user.role === 'chapter_admin' && activeRole === 'member') {
        return <Navigate to={`/${orgPrefix}/userDashboard`} replace />;
    }

    if (user.role === 'admin' || user.role === 'chapter_admin') {
      return <Navigate to={`/${orgPrefix}/admin/dashboard`} replace />;
    }
    return <Navigate to={`/${orgPrefix}`} replace />;
  }

  return children;
};


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register-org" element={
        <PublicRoute>
          <RegisterOrganization />
        </PublicRoute>
      } />
      <Route path="/register-user" element={
        <PublicRoute>
          <RegisterUser />
        </PublicRoute>
      } />
      <Route path="/create-password" element={
        <PublicRoute>
          <CreatePassword />
        </PublicRoute>
      } />
      <Route path="/register-user" element={
        <PublicRoute>
          <RegisterUser />
        </PublicRoute>
      } />

      {/* Public Event and Training Pages */}
      <Route path="/public/event/:id" element={<PublicEventPage />} />
      <Route path="/public/training/:id" element={<PublicTrainingPage />} />

      {/* Protected Routes wrapped with organization context */}
      <Route path="/:orgCode" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<MyPosts />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="events" element={<EventsDashboard />} />
        <Route path="references" element={<References />} />
        <Route path="referrals/sent" element={<ReferralsSent />} />
        <Route path="thank-you" element={<ThankYouNotes />} />
        <Route path="notifications" element={<Notifications />} />

        {/* Member Routes */}
        <Route path="userDashboard" element={<UserDashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="members/:id" element={<MemberProfile />} />
        <Route path="files" element={<Files />} />
        <Route path="security-settings" element={<SecuritySettings />} />
        <Route path="my-profile" element={<MyProfile />} />

        <Route path="referrals/received" element={<References />} />

        <Route path="meetings/member" element={<Meetings />} />
        <Route path="meetings/chapter" element={<ChapterMeetings />} />

        {/* Admin Dashboard & Management */}
        <Route path="admin" element={<AdminRoute><AdminPages.OrganizationSettings /></AdminRoute>} />
        <Route path="admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="admin/settings" element={<AdminRoute><AdminPages.OrganizationSettings /></AdminRoute>} />
        <Route path="admin/gallery" element={<AdminRoute><AdminPages.OrganizationGallery /></AdminRoute>} />
        <Route path="admin/members-summary" element={<AdminRoute><AdminPages.MembersSummary /></AdminRoute>} />
        <Route path="admin/visitors" element={<AdminRoute><Visitors /></AdminRoute>} />
        <Route path="admin/create-org-admin" element={<AdminRoute><AdminPages.CreateOrgAdmin /></AdminRoute>} />
        <Route path="admin/create-chapter-admin" element={<AdminRoute><AdminPages.CreateChapterAdmin /></AdminRoute>} />
        <Route path="admin/naming-convention" element={<AdminRoute><NamingConvention /></AdminRoute>} />

        {/* Master Data */}
        <Route path="admin/master/membership-plan" element={<AdminRoute><AdminPages.MembershipPlan /></AdminRoute>} />
        <Route path="admin/master/categories" element={<AdminRoute><AdminPages.MemberCategories /></AdminRoute>} />
        <Route path="admin/master/chapters" element={<AdminRoute><AdminPages.Chapters /></AdminRoute>} />

        {/* Operations */}
        <Route path="admin/membership-requests" element={<AdminRoute><AdminPages.MembershipRequests /></AdminRoute>} />
        <Route path="admin/renew-members" element={<AdminRoute><RenewMembers /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
        <Route path="admin/training" element={<AdminRoute><Training /></AdminRoute>} />
        <Route path="admin/thank-you" element={<AdminRoute><AdminPages.ThankYouNotes /></AdminRoute>} />
        <Route path="admin/chapter-meetings" element={<AdminRoute><ChapterMeetings /></AdminRoute>} />

        {/* Profile & Security */}
        <Route path="admin/profile" element={<AdminRoute><Profile /></AdminRoute>} />
        <Route path="admin/change-password" element={<AdminRoute><ChangePassword /></AdminRoute>} />
        <Route path="admin/members/:id" element={<AdminRoute><MemberProfile /></AdminRoute>} />
      </Route>

      {/* Super Admin Routes */}
      <Route path="/super-admin/login" element={
        <PublicRoute>
          <SuperAdminLogin />
        </PublicRoute>
      } />
      <Route path="/super-admin" element={
        <SuperAdminRoute>
          <SuperAdminLayout />
        </SuperAdminRoute>
      }>
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="organizations" element={<SuperAdminOrganizations />} />
        <Route path="change-password" element={<SuperAdminChangePassword />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </Router>
  );
};

export default App;
