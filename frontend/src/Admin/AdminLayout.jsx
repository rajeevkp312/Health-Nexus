import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Open by default
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication check
  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate('/admin');
  };

  return (
    <div className="admin-root min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 w-full">
      {/* Admin Header */}
      <AdminHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      <div className="flex w-full">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath={location.pathname}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 w-full ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
          <div className="px-3 md:px-4 pb-4 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
