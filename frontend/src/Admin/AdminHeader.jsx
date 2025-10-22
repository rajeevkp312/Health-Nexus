import React, { useEffect, useRef, useState } from 'react';
import { Menu, Bell, Search, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import logo2 from '@/assets/logo2.png';

export function AdminHeader({ onMenuClick, onLogout }) {
  const adminEmail = localStorage.getItem('admin') || 'admin@gmail.com';
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [notifCount, setNotifCount] = useState(0);
  
  const handleNotificationClick = () => {
    // Redirect to admin feedback view
    navigate('/admin/dash/viewfeed');
  };

  const handleSettingsClick = () => {
    // Open Admin profile page
    navigate('/admin/dash/profile');
  };

  const handleSearchChange = (e) => {
    // Handle search input change
    console.log('Search:', e.target.value);
  };
  
  // Close dropdown on outside click or Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Fetch pending feedback count periodically
  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/admin/feedback');
        const data = await res.json();
        if (!isMounted) return;
        if (data?.msg === 'Success') {
          const items = Array.isArray(data.feedback) ? data.feedback : [];
          const pending = items.filter(f => (
            (f.status || 'pending') === 'pending' && String(f.utype || '').toLowerCase() === 'patient'
          )).length;
          setNotifCount(pending);
        } else {
          setNotifCount(0);
        }
      } catch (e) {
        setNotifCount(0);
      }
    };

    fetchCount();
    const iv = setInterval(fetchCount, 30000);
    return () => {
      isMounted = false;
      clearInterval(iv);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 w-full">
      <div className="flex items-center px-4 py-3 w-full overflow-visible">
        {/* Left Section */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="flex-shrink-0 p-2 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <img 
              src={logo2} 
              alt="HealthNexus Logo" 
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">HealthNexus</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm text-sm"
            />
          </div>
        </div>

        {/* Spacer for when search is hidden */}
        <div className="flex-1 lg:hidden"></div>

        {/* Right Section */}
        <div className="flex items-center space-x-1 flex-shrink-0 ml-auto">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative p-2 hover:bg-gray-100 transition-colors hidden sm:flex"
            onClick={handleNotificationClick}
          >
            <Bell className="h-4 w-4 text-gray-600" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-medium shadow-sm">
                {notifCount > 99 ? '99+' : notifCount}
              </span>
            )}
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-gray-100 transition-colors hidden md:flex"
            onClick={handleSettingsClick}
          >
            <Settings className="h-4 w-4 text-gray-600" />
          </Button>

          {/* Profile Dropdown */}
          <div className="flex items-center space-x-2 ml-1" ref={profileRef}>
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500 truncate max-w-24">{adminEmail}</p>
            </div>
            <div className="relative z-50">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                className="rounded-full p-2 hover:bg-gray-100 relative z-50"
              >
                <User className="h-4 w-4 text-gray-600" />
              </Button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-[9999] text-gray-800">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/admin/dash');
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <LayoutDashboard className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-900 font-medium">Go to Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/admin/dash/profile');
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-900 font-medium">Settings</span>
                  </button>
                  <div className="h-px bg-gray-200" />
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout?.();
                    }}
                    className="w-full px-3 py-2 text-left text-sm bg-red-600 text-white hover:bg-red-700 rounded-md flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="solid"
            size="sm"
            onClick={onLogout}
            className="bg-red-600 text-white hover:bg-red-700 border-transparent flex-shrink-0 ml-2"
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
