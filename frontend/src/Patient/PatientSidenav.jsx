import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Plus, 
  MessageCircle, 
  Star,
  User,
  Menu,
  X,
  Bell,
  LogOut,
  UserCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getImageUrl } from '../setupApiBase';

function PatientSidenav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const computeImpersonation = () => {
    if (typeof window === 'undefined') return false;
    const hasAdmin = !!localStorage.getItem('admin');
    return (
      localStorage.getItem('impersonatedByAdmin') === 'true' &&
      localStorage.getItem('impersonateRole') === 'patient' &&
      localStorage.getItem('token') === 'admin-impersonation' &&
      hasAdmin
    );
  };
  const [isImpersonating, setIsImpersonating] = useState(computeImpersonation());
  const initials = (patientInfo?.name || patientInfo?.username || 'P')
    .split(' ')
    .map(n => n && n[0])
    .filter(Boolean)
    .slice(0,2)
    .join('')
    .toUpperCase();
  
  // Measure mobile navbar height to create an exact spacer
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
  }, [isOpen, patientInfo, appointmentCount, navHeight]);
  
  useEffect(() => {
    fetchPatientInfo();
    fetchAppointmentCount();
    tryFetchAvatarFromApi();
  }, []);

  // Persist and restore horizontal scroll for icons row
  useEffect(() => {
    try {
      const saved = parseInt(sessionStorage.getItem('patientNavScroll') || '0', 10);
      if (iconsRowRef.current && !Number.isNaN(saved)) {
        iconsRowRef.current.scrollLeft = saved;
      }
      const node = iconsRowRef.current;
      const onScroll = (e) => {
        try { sessionStorage.setItem('patientNavScroll', String(e.target.scrollLeft)); } catch {}
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
      const hasAdmin = !!localStorage.getItem('admin');
      if (impersonated && (token !== 'admin-impersonation' || !hasAdmin)) {
        localStorage.removeItem('impersonatedByAdmin');
        localStorage.removeItem('impersonateRole');
        localStorage.removeItem('impersonateBy');
        setIsImpersonating(false);
      } else {
        setIsImpersonating(computeImpersonation());
      }
    } catch {}
  }, []);

  // Sync across tabs/windows and on any storage changes
  useEffect(() => {
    const handler = () => setIsImpersonating(computeImpersonation());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const fetchPatientInfo = () => {
    try {
      const userRaw = localStorage.getItem('user') || '{}';
      const patientRaw = localStorage.getItem('patient') || '{}';
      const user = JSON.parse(userRaw);
      const patient = JSON.parse(patientRaw);
      // Merge so we have both profilePhoto and image; prefer patient fields
      const merged = { ...user, ...patient };
      setPatientInfo(merged);
    } catch {
      
    }
  };

  // Refresh avatar when patient profile is updated elsewhere
  useEffect(() => {
    const handler = () => fetchPatientInfo();
    window.addEventListener('patientProfileUpdated', handler);
    return () => window.removeEventListener('patientProfileUpdated', handler);
  }, []);

  // Resolve avatar URL from multiple sources/fields and handle different formats
  const getAvatarSrc = (info) => {
    // Gather candidates from merged info and raw localStorage
    const userLS = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
    const patientLS = (() => { try { return JSON.parse(localStorage.getItem('patient') || '{}'); } catch { return {}; } })();

    const candidates = [
      info?.image, info?.profilePhoto, info?.avatar, info?.photo, info?.picture,
      patientLS?.image, patientLS?.profilePhoto, patientLS?.avatar, patientLS?.photo, patientLS?.picture,
      userLS?.image, userLS?.profilePhoto, userLS?.avatar, userLS?.photo, userLS?.picture,
    ].filter((v) => typeof v === 'string' && v.trim().length > 0);

    if (candidates.length === 0) return null;
    const raw = candidates[0].toString().trim();
    if (/^https?:\/\//i.test(raw)) return raw; // absolute URL
    if (raw.startsWith('data:image/')) return raw; // base64
    return getImageUrl(raw);
  };

  const avatarSrc = getAvatarSrc(patientInfo);

  const tryFetchAvatarFromApi = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patientId = user?.id;
      if (!patientId) return;

      const res = await axios.get(`http://localhost:8000/api/auth/profile/${patientId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.success && res.data?.user) {
        const img = res.data.user.image || res.data.user.profilePhoto;
        if (img) {
          // Persist in LS and update state
          const userLS = JSON.parse(localStorage.getItem('user') || '{}');
          const patientLS = JSON.parse(localStorage.getItem('patient') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...userLS, image: img, profilePhoto: img }));
          if (patientLS && Object.keys(patientLS).length > 0) {
            localStorage.setItem('patient', JSON.stringify({ ...patientLS, image: img, profilePhoto: img }));
          }
          fetchPatientInfo();
          window.dispatchEvent(new CustomEvent('patientProfileUpdated'));
          return;
        }
      }
      // Fallback to admin patients list if no image from auth profile
      try {
        const resp2 = await axios.get('http://localhost:8000/api/admin/patients');
        const list = resp2.data?.value || resp2.data?.patients || [];
        const match = list.find(p => (p._id === patientId) || (String(p.email||'').toLowerCase() === String(user?.email||'').toLowerCase()));
        if (match && (match.image || match.profilePhoto || match.avatar)) {
          const img2 = match.image || match.profilePhoto || match.avatar;
          const userLS = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...userLS, image: img2, profilePhoto: img2 }));
          localStorage.setItem('patient', JSON.stringify(match));
          fetchPatientInfo();
          window.dispatchEvent(new CustomEvent('patientProfileUpdated'));
        }
      } catch {}
    } catch (e) {
      // silent fallback
    }
  };

  // Fetch total appointments for badge/counter
  const fetchAppointmentCount = async () => {
    try {
      // Check if user has already seen notifications
      const notificationsSeen = localStorage.getItem('notificationsSeen') === 'true';
      if (notificationsSeen) {
        setAppointmentCount(0);
        return;
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const patient = JSON.parse(localStorage.getItem('patient') || '{}');
      const patientId = (user && user.id) || (patient && (patient._id || patient.id));

      if (!patientId) {
        setAppointmentCount(0);
        return;
      }

      const response = await axios.get(`http://localhost:8000/api/appointments/patient/${patientId}`);

      if (response.data.msg === "Success") {
        const totalAppointments = (response.data.value || []).length;
        
        // Check if there are new appointments since last seen
        const lastSeenCount = parseInt(localStorage.getItem('lastSeenAppointmentCount') || '0');
        if (totalAppointments > lastSeenCount) {
          // There are new appointments, clear the "seen" flag
          localStorage.removeItem('notificationsSeen');
        }
        
        setAppointmentCount(totalAppointments);
      } else {
        setAppointmentCount(0);
      }
    } catch (error) {
      console.error('Error fetching appointment count:', error);
      setAppointmentCount(0);
    }
  };

  const exitImpersonation = () => {
    // Clear only impersonation-related state and patient session
    localStorage.removeItem('impersonatedByAdmin');
    localStorage.removeItem('impersonateRole');
    localStorage.removeItem('impersonateBy');
    localStorage.removeItem('user');
    localStorage.removeItem('patient');
    localStorage.removeItem('token');
    localStorage.removeItem('notificationsSeen');
    localStorage.removeItem('lastSeenAppointmentCount');
    toast({ title: 'Exited impersonation', description: 'Returning to Admin', duration: 2000 });
    setIsImpersonating(false);
    const admin = localStorage.getItem('admin');
    if (admin) {
      navigate('/admin/dash');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    if (isImpersonating) {
      return exitImpersonation();
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('notificationsSeen'); // Clear notification state on logout
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
      duration: 2000,
    });
    navigate('/');
  };

  const handleNotificationClick = () => {
    // Clear the notification count when clicked and mark as seen
    const currentCount = appointmentCount;
    setAppointmentCount(0);
    localStorage.setItem('notificationsSeen', 'true');
    localStorage.setItem('lastSeenAppointmentCount', currentCount.toString());
    navigate('/patient/appointments');
    setIsOpen(false);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/patient',
      label: 'Dashboard',
      shortLabel: 'Home',
      icon: Home,
      color: 'yellow'
    },
    {
      path: '/patient/appointments',
      label: 'My Appointments',
      shortLabel: 'Appts',
      icon: Calendar,
      color: 'blue'
    },
    {
      path: '/patient/request-appointment',
      label: 'Book Appointment',
      shortLabel: 'Book',
      icon: Plus,
      color: 'green'
    },
    {
      path: '/patient/feedback',
      label: 'Feedback Center',
      shortLabel: 'Feedback',
      icon: MessageCircle,
      color: 'purple'
    },
    {
      path: '/patient/reports',
      label: 'Medical Reports',
      shortLabel: 'Reports',
      icon: FileText,
      color: 'orange'
    },
    {
      path: '/patient/profile',
      label: 'My Profile',
      shortLabel: 'Profile',
      icon: UserCircle,
      color: 'blue'
    }
  ];

  return (
    <>
      {/* Mobile Navigation - Top Bar */}
      <div ref={mobileNavRef} className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-30">
        {/* Compact Header Row */}
        <div className="flex items-center justify-between px-2 py-0.5">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
          >
            {isOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
          </button>
          
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
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patientInfo?.name || 'Patient')}&size=64&background=ec4899&color=ffffff&bold=true`;
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-bold text-gray-700">{initials}</span>
                )}
              </div>
              <div className="text-left">
                <h1 className="text-xs font-bold text-gray-900 leading-none">{patientInfo?.name?.split(' ')[0] || 'Patient'}</h1>
              </div>
            </div>
          </div>
          
          {/* Compact Action Buttons */}
          <div className="flex items-center space-x-1">
            {/* Notification Button */}
            <button
              onClick={handleNotificationClick}
              className="relative p-1 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <Bell className="h-3 w-3" />
              {appointmentCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center font-bold text-xs">
                  {appointmentCount > 9 ? '9+' : appointmentCount}
                </span>
              )}
            </button>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>
        {isImpersonating && (
          <div className="bg-yellow-50 text-yellow-800 text-xs px-3 py-1.5 flex items-center justify-between">
            <span className="font-semibold truncate">Impersonating as Patient</span>
            <button onClick={exitImpersonation} className="ml-2 px-2 py-0.5 rounded border border-yellow-300 hover:bg-yellow-100">Exit</button>
          </div>
        )}
        
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
                {/* Patient Profile Header */}
                <div className="mb-6 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                      {avatarSrc ? (
                        <img 
                          src={avatarSrc} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patientInfo?.name || 'Patient')}&size=96&background=ec4899&color=ffffff&bold=true`;
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-700">{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">Patient Portal</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {patientInfo?.name || 'Patient'}
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
              <span className="font-semibold truncate">Impersonating as Patient</span>
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
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patientInfo?.name || 'Patient')}&size=80&background=ec4899&color=ffffff&bold=true`;
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-gray-700">{initials}</span>
              )}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Patient Portal</h2>
              <p className="text-sm text-gray-600">{patientInfo?.name || patientInfo?.username || 'Patient'}</p>
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
              Appointments
              {appointmentCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {appointmentCount > 9 ? '9+' : appointmentCount}
                </span>
              )}
            </Button>
            <Button
              onClick={handleLogout}
              variant="solid"
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
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

export default PatientSidenav;
