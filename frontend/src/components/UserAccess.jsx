import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, ChevronDown, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthModal } from '@/components/AuthModal';

export function UserAccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(u);
    } catch {}
  }, [location.pathname]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('doctor');
      localStorage.removeItem('patient');
    } catch {}
    setUser(null);
    setMenuOpen(false);
    toast({ title: 'Logged out', description: 'You have been logged out.', duration: 2000 });
    if (location.pathname.startsWith('/doctor') || location.pathname.startsWith('/patient')) {
      navigate('/');
    }
  };

  const gotoPortal = () => {
    if (!user) return;
    if (user.role === 'doctor') navigate('/doctor');
    else if (user.role === 'patient') navigate('/patient');
  };

  // Hide on admin routes (admin already has its own header/profile)
  if (location.pathname.startsWith('/admin')) return null;

  const initials = (user?.name || '').split(' ').map(s => s[0]).filter(Boolean).slice(0,2).join('').toUpperCase();

  return (
    <div className="fixed top-6 right-6 z-50" ref={menuRef}>
      {/* Button */}
      <Button
        onClick={() => (user ? setMenuOpen(!menuOpen) : setAuthOpen(true))}
        className="rounded-full h-12 pl-3 pr-3 bg-white/90 hover:bg-white shadow-md border border-gray-200 text-gray-700 flex items-center space-x-2"
        variant="ghost"
      >
        <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
          {user ? (
            <span className="text-[10px] font-bold text-gray-700">{initials || <User className="h-4 w-4" />}</span>
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
        <span className="hidden sm:inline text-sm font-medium">{user ? (user.name?.split(' ')[0] || 'Account') : 'Login'}</span>
        <ChevronDown className="h-4 w-4 hidden sm:inline" />
      </Button>

      {/* Dropdown menu when logged in */}
      {user && menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={gotoPortal}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
          >
            <UserCircle2 className="h-4 w-4 text-gray-600" />
            <span>Go to {user.role === 'doctor' ? 'Doctor' : 'Patient'} Portal</span>
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              if (user.role === 'doctor') navigate('/doctor/profile');
              else navigate('/patient/profile');
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
          >
            <User className="h-4 w-4 text-gray-600" />
            <span>My Profile</span>
          </button>
          <div className="h-px bg-gray-200" />
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-left text-sm bg-red-600 text-white hover:bg-red-700 rounded-md flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Auth Modal when not logged in */}
      {!user && (
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          redirectTo={null}
          defaultRole="patient"
        />
      )}
    </div>
  );
}

export default UserAccess;
