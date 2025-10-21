import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DoctorDashboard from './DoctorDashboard';
import DoctorPendingAppointments from './DoctorPendingAppointments';
import DoctorConfirmedAppointments from './DoctorConfirmedAppointments';
import DoctorCompletedAppointments from './DoctorCompletedAppointments';
import DoctorCancelledAppointments from './DoctorCancelledAppointments';
import DoctorProfile from './DoctorProfile';
import DoctorFeedback from './DoctorFeedback';
import DoctorPatients from './DoctorPatients';
import DoctorCreateReport from './DoctorCreateReport';
import DoctorReports from './DoctorReports';
import DoctorReportView from './DoctorReportView';
import DoctorEditReport from './DoctorEditReport';

export function DoctorRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on route access
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const doctorStr = localStorage.getItem('doctor');
      
      let isAuthenticated = false;
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          isAuthenticated = user?.role === 'doctor';
        } catch (e) {
          console.error('Invalid user data in localStorage');
        }
      } else if (token && doctorStr) {
        // Legacy doctor authentication
        try {
          JSON.parse(doctorStr); // Validate JSON
          isAuthenticated = true;
        } catch (e) {
          console.error('Invalid doctor data in localStorage');
        }
      }
      
      if (!isAuthenticated) {
        // Clear any stale data and redirect to home
        localStorage.removeItem('user');
        localStorage.removeItem('doctor');
        localStorage.removeItem('token');
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <Routes>
      {/* Doctor Dashboard - matches /doctor */}
      <Route index element={<DoctorDashboard />} />
      
      {/* Doctor specific routes */}
      <Route path="dashboard" element={<DoctorDashboard />} />
      <Route path="pending-appointments" element={<DoctorPendingAppointments />} />
      <Route path="confirmed-appointments" element={<DoctorConfirmedAppointments />} />
      <Route path="completed-appointments" element={<DoctorCompletedAppointments />} />
      <Route path="cancelled-appointments" element={<DoctorCancelledAppointments />} />
      <Route path="feedback" element={<DoctorFeedback />} />
      <Route path="patients" element={<DoctorPatients />} />
      <Route path="profile" element={<DoctorProfile />} />
      <Route path="reports" element={<DoctorReports />} />
      <Route path="report/:appointmentId" element={<DoctorCreateReport />} />
      <Route path="report/view/:reportId" element={<DoctorReportView />} />
      <Route path="report/edit/:reportId" element={<DoctorEditReport />} />
      
      {/* Redirect any unknown doctor routes to dashboard */}
      <Route path="*" element={<Navigate to="/doctor" replace />} />
    </Routes>
  );
}

export default DoctorRoutes;
