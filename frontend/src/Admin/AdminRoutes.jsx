import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import ModernAdminDash from './ModernAdminDash';
import ModernAddDoctor from './ModernAddDoctor';
import ModernViewDoctors from './ModernViewDoctors';
import ModernViewPatients from './ModernViewPatients';
import ModernViewAppointments from './ModernViewAppointments';
import ModernNewsManagement from './ModernNewsManagement';
import ModernAddPatient from './ModernAddPatient';
import ModernEditPatient from './ModernEditPatient';
import ModernEditDoctor from './ModernEditDoctor';
import ModernViewEnquiries from './ModernViewEnquiries';
import ModernViewFeedback from './ModernViewFeedback';
import ModernReports from './ModernReports';
import AdminProfile from './AdminProfile';

// Import existing components (fallback to old ones if new ones don't exist)
import Addoc from './Addoc';
import Adpatient from './Adpatient';
import Editdoc from './Editdoc';
import Viewenquiry from './Viewenquiry';
import Viewfeed from './Viewfeed';

export function AdminRoutes() {
  return (
    <Routes>
      {/* Admin Login - matches /admin */}
      <Route index element={<AdminLogin />} />
      
      {/* Admin Dashboard with Layout */}
      <Route path="dash" element={<AdminLayout />}>
        <Route index element={<ModernAdminDash />} />
        
        {/* Doctor Management */}
        <Route path="addoc" element={<ModernAddDoctor />} />
        <Route path="viewdoc" element={<ModernViewDoctors />} />
        <Route path="editdoc/:id" element={<ModernEditDoctor />} />
        
        {/* Patient Management */}
        <Route path="adpatient" element={<ModernAddPatient />} />
        <Route path="viewpatient" element={<ModernViewPatients />} />
        <Route path="editpatient/:id" element={<ModernEditPatient />} />
        
        {/* Appointments */}
        <Route path="viewapp" element={<ModernViewAppointments />} />
        {/* Reports Management */}
        <Route path="reports" element={<ModernReports />} />
        
        {/* Communications */}
        <Route path="viewenquiry" element={<ModernViewEnquiries />} />
        <Route path="viewfeed" element={<ModernViewFeedback />} />
        
        {/* Admin Profile */}
        <Route path="profile" element={<AdminProfile />} />
        
        {/* News Management */}
        <Route path="adnews" element={<ModernNewsManagement />} />
      </Route>
      
      {/* Direct routes for backward compatibility */}
      <Route path="admindash" element={<AdminLayout />}>
        <Route index element={<ModernAdminDash />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
