import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PatientDashboard from './PatientDashboard';
import PatientAppointments from './PatientAppointments';
import PatientRequestAppointment from './PatientRequestAppointment';
import PatientFeedback from './PatientFeedback';
import PatientProfile from './PatientProfile';
import PatientReportView from './PatientReportView';
import PatientReports from './PatientReports';

export function PatientRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on route access (hybrid: new user OR legacy patient)
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      const patientStr = localStorage.getItem('patient');

      let isAuthenticated = false;

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          isAuthenticated = user?.role === 'patient';
        } catch (e) {
          console.error('Invalid user data in localStorage');
        }
      } else if (patientStr) {
        // Legacy patient authentication (no token required)
        try {
          JSON.parse(patientStr); // Validate JSON
          isAuthenticated = true;
        } catch (e) {
          console.error('Invalid patient data in localStorage');
        }
      }

      if (!isAuthenticated) {
        // Clear any stale data and redirect to home
        localStorage.removeItem('user');
        localStorage.removeItem('patient');
        localStorage.removeItem('token');
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <Routes>
      {/* Patient Dashboard - matches /patient */}
      <Route index element={<PatientDashboard />} />
      {/* Patient specific routes */}
      <Route path="dashboard" element={<PatientDashboard />} />
      <Route path="appointments" element={<PatientAppointments />} />
      <Route path="request-appointment" element={<PatientRequestAppointment />} />
      <Route path="feedback" element={<PatientFeedback />} />
      <Route path="profile" element={<PatientProfile />} />
      <Route path="reports" element={<PatientReports />} />
      <Route path="report/:appointmentId" element={<PatientReportView />} />
      
      {/* Redirect any unknown patient routes to dashboard */}
      <Route path="*" element={<Navigate to="/patient" replace />} />
    </Routes>
  );
}

export default PatientRoutes;
