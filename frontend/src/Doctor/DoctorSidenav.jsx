import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Clock, 
  CheckCircle, 
  Activity, 
  XCircle,
  Stethoscope,
  User,
  Users,
  Menu,
  X,
  Bell,
  LogOut,
  UserCircle,
  MessageCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import logo from '../assets/logo2.png';
import { getImageUrl } from '../setupApiBase';

function DoctorSidenav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const isImpersonating = (typeof window !== 'undefined') && (
    localStorage.getItem('impersonatedByAdmin') === 'true' &&
    localStorage.getItem('impersonateRole') === 'doctor' &&
    localStorage.getItem('token') === 'admin-impersonation'
  );
  const initials = (doctorInfo?.name || doctorInfo?.username || 'D')
    .split(' ')
    .map(n => n && n[0])
    .filter(Boolean)
    .slice(0,2)
    .join('')
    .toUpperCase();
  
  // Measure mobile navbar height to offset content precisely on mobile
  const mobileNavRef = useRef(null);
  const iconsRowRef = useRef(null);
  const [navHeight, setNavHeight] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (mobileNavRef.current) {
        const h = mobileNavRef.current.getBoundingClientRect().height;
        if (h && h !== navHeight) setNavHeight(h);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isOpen, pendingCount, doctorInfo, navHeight]);
  
  useEffect(() => {
    fetchDoctorInfo();
    fetchPendingCount();
  }, []);

  useEffect(() => {
    try {
      const saved = parseInt(sessionStorage.getItem('doctorNavScroll') || '0', 10);
      if (iconsRowRef.current && !Number.isNaN(saved)) {
        iconsRowRef.current.scrollLeft = saved;
      }
      const node = iconsRowRef.current;
      const onScroll = (e) => {
        try { sessionStorage.setItem('doctorNavScroll', String(e.target.scrollLeft)); } catch {}
      };
      if (node) node.addEventListener('scroll', onScroll);
      return () => { if (node) node.removeEventListener('scroll', onScroll); };
    } catch {}
  }, []);

  // Auto-clear stale impersonation flags if token is not admin-impersonation
  useEffect(() => {
    try {
      const impersonated = localStorage.getItem('impersonatedByAdmin') === 'true';
      const token = localStorage.getItem('token');
      if (impersonated && token !== 'admin-impersonation') {
        localStorage.removeItem('impersonatedByAdmin');
        localStorage.removeItem('impersonateRole');
        localStorage.removeItem('impersonateBy');
      }
    } catch {}
  }, []);

  // Refresh doctor info when profile is updated elsewhere (e.g., photo upload)
  useEffect(() => {
    const handler = () => fetchDoctorInfo();
    window.addEventListener('doctorProfileUpdated', handler);
    return () => window.removeEventListener('doctorProfileUpdated', handler);
  }, []);

  const fetchDoctorInfo = () => {
    const userRaw = localStorage.getItem('user') || '{}';
    const doctorRaw = localStorage.getItem('doctor') || '{}';
    const user = JSON.parse(userRaw);
    const doctor = JSON.parse(doctorRaw);
    // Merge so we have both profilePhoto and image; prefer doctor fields
    const merged = { ...user, ...doctor };
    setDoctorInfo(merged);
  };

  // Resolve avatar URL from image/profilePhoto and handle different formats
  const getAvatarSrc = (info) => {
    const raw = (info?.image || info?.profilePhoto || '').toString().trim();
    if (!raw) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('data:image/')) return raw;
    return getImageUrl(raw);
  };

  const fetchPendingCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');
      const doctorId = user.id || doctor._id || doctor.id;

      const response = await axios.get(`http://localhost:8000/api/app/d/${doctorId}`);

      if (response.data.msg === "Success") {
        const normalize = (s) => {
          const lc = String(s || '').toLowerCase();
          if (lc === 'scheduled') return 'pending';
          if (lc === 'confirmed') return 'confirmed';
          if (lc === 'cancelled' || lc === 'canceled') return 'cancelled';
          if (lc === 'completed' || lc === 'complete') return 'completed';
          return lc;
        };
        const pending = (response.data.value || []).filter(apt => normalize(apt.status) === 'pending').length;
        setPendingCount(pending);
      } else {
        setPendingCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
      setPendingCount(0);
    }
  };

  const exitImpersonation = () => {
    localStorage.removeItem('impersonatedByAdmin');
    localStorage.removeItem('impersonateRole');
    localStorage.removeItem('impersonateBy');
    localStorage.removeItem('user');
    localStorage.removeItem('doctor');
    localStorage.removeItem('token');
    toast({ title: 'Exited impersonation', description: 'Returning to Admin', duration: 2000 });
    const admin = localStorage.getItem('admin');
    if (admin) {
      navigate('/admin/dash');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    if (isImpersonating) return exitImpersonation();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('doctor');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  const handleNotificationClick = () => {
    navigate('/doctor/pending-appointments');
    setIsOpen(false);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const avatarSrc = getAvatarSrc(doctorInfo);

  const navItems = [
    {
      path: '/doctor',
      label: 'Dashboard',
      shortLabel: 'Home',
      icon: Home,
      color: 'blue'
    },
    {
      path: '/doctor/pending-appointments',
      label: 'Pending Appointments',
      shortLabel: 'Pending',
      icon: Clock,
      color: 'yellow'
    },
    {
      path: '/doctor/patients',
      label: 'Patients',
      shortLabel: 'Patients',
      icon: Users,
      color: 'blue'
    },
    {
      path: '/doctor/confirmed-appointments',
      label: 'Confirmed Appointments',
      shortLabel: 'Confirmed',
      icon: CheckCircle,
      color: 'green'
    },
    {
      path: '/doctor/completed-appointments',
      label: 'Completed Appointments',
      shortLabel: 'Completed',
      icon: Activity,
      color: 'purple'
    },
    {
      path: '/doctor/cancelled-appointments',
      label: 'Cancelled Appointments',
      shortLabel: 'Cancelled',
      icon: XCircle,
      color: 'red'
    },
    {
      path: '/doctor/feedback',
      label: 'Patient Feedback',
      shortLabel: 'Feedback',
      icon: MessageCircle,
      color: 'orange'
    },
    {
      path: '/doctor/reports',
      label: 'Medical Reports',
      shortLabel: 'Reports',
      icon: FileText,
      color: 'indigo'
    },
    {
      path: '/doctor/profile',
      label: 'My Profile',
      shortLabel: 'Profile',
      icon: UserCircle,
      color: 'blue'
    }
  ];

  return (
    <>
      {/* Mobile Navigation - Top Bar */}
      <div ref={mobileNavRef} className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        {/* Compact Header Row */}
        <div className="flex items-center justify-between px-2 py-1.5">
          {/* Left: Menu + Brand */}
          <div className="flex items-center">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            {/* Brand Logo */}
            <img src={logo} alt="Health Nexus" className="ml-2 h-5 w-5" />
          </div>
        {isImpersonating && (
          <div className="bg-yellow-50 text-yellow-800 text-xs px-3 py-1.5 flex items-center justify-between">
            <span className="font-semibold truncate">Impersonating as Doctor</span>
            <button onClick={exitImpersonation} className="ml-2 px-2 py-0.5 rounded border border-yellow-300 hover:bg-yellow-100">Exit</button>
          </div>
        )}
          
          {/* Compact Welcome Message */}
          <div className="flex-1 text-center px-1">
            <div className="flex items-center justify-center space-x-1.5">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {avatarSrc ? (
                  <img 
                    src={avatarSrc} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorInfo?.name || 'Doctor')}&size=64&background=3b82f6&color=ffffff&bold=true`;
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-bold text-gray-700">{initials}</span>
                )}
              </div>
              <div className="text-left">
                <h1 className="text-xs font-bold text-gray-900 leading-none">Dr. {doctorInfo?.name?.split(' ')[0] || 'Doctor'}</h1>
              </div>
            </div>
          </div>
          
          {/* Compact Action Buttons */}
          <div className="flex items-center space-x-1">
            {/* Notification Button */}
            <button
              onClick={handleNotificationClick}
              className="relative p-1.5 rounded-md bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
            >
              <Bell className="h-3.5 w-3.5" />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-xs">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        {/* Navigation Icons Row - Horizontally Scrollable */}
        <div ref={iconsRowRef} className="overflow-x-auto px-2 py-1">
          <div className="flex items-center space-x-2 min-w-max">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-lg transition-all flex-shrink-0 ${
                    active 
                      ? `bg-${item.color}-100 text-${item.color}-700` 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <IconComponent className={`h-3.5 w-3.5 ${active ? `text-${item.color}-600` : 'text-gray-600'}`} />
                  <span className={`text-xs mt-0.5 font-medium leading-none whitespace-nowrap ${active ? `text-${item.color}-700` : 'text-gray-600'}`}>
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic spacer under fixed mobile nav so content never hides behind it */}
      <div className="lg:hidden" style={{ height: navHeight || 64 }} aria-hidden="true"></div>

      

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Doctor Profile Header */}
                <div className="mb-6 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {avatarSrc ? (
                        <img 
                          src={avatarSrc} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorInfo?.name || 'Doctor')}&size=96&background=3b82f6&color=ffffff&bold=true`;
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-700">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">Doctor Portal</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {doctorInfo?.name || 'Doctor'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          active
                            ? `bg-${item.color}-50 text-${item.color}-700 shadow-md`
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 ${active ? `text-${item.color}-600` : 'text-gray-500'}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6">
          {isImpersonating && (
            <div className="mb-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded flex items-center justify-between">
              <span className="font-semibold truncate">Impersonating as Doctor</span>
              <button onClick={exitImpersonation} className="ml-2 px-2 py-0.5 rounded border border-yellow-300 hover:bg-yellow-100">Exit</button>
            </div>
          )}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {avatarSrc ? (
                <img 
                  src={avatarSrc} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorInfo?.name || 'Doctor')}&size=80&background=3b82f6&color=ffffff&bold=true`;
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-gray-700">{initials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <img src={logo} alt="Health Nexus" className="h-5 w-5" />
                <h2 className="font-bold text-gray-900">Doctor Portal</h2>
              </div>
              <p className="text-sm text-gray-600">Dr. {doctorInfo?.name || doctorInfo?.username || 'Doctor'}</p>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="flex space-x-2 mb-6">
            <Button
              onClick={handleNotificationClick}
              variant="outline"
              size="sm"
              className="flex-1 relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700 border-transparent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? `bg-${item.color}-50 text-${item.color}-700 shadow-md`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${active ? `text-${item.color}-600` : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

export default DoctorSidenav;
