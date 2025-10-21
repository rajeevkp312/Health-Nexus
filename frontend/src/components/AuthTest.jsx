import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import { User, UserCheck } from 'lucide-react';

export function AuthTest() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Circular Floating Button - Chatbot Style */}
      <div className="relative group">
        <button
          onClick={() => setIsAuthOpen(true)}
          className="w-14 h-14 bg-black/90 backdrop-blur-sm hover:bg-black text-white rounded-full shadow-2xl border border-gray-700 flex items-center justify-center transition-all duration-300 hover:scale-110"
          title={user ? `Logged in as ${user.name}` : "Login / Register"}
        >
          {user ? (
            <UserCheck className="h-6 w-6 text-green-400" />
          ) : (
            <User className="h-6 w-6 text-gray-300" />
          )}
        </button>
        

        {/* Hover Info Panel */}
        {user && (
          <div className="absolute bottom-16 left-0 bg-black/95 backdrop-blur-sm rounded-lg shadow-2xl p-3 min-w-[200px] border border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform translate-y-2 group-hover:translate-y-0">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
              <p className="text-xs text-blue-400 capitalize">{user.role}</p>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full text-xs bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
              >
                Logout
              </Button>
            </div>
            {/* Arrow pointer */}
            <div className="absolute bottom-[-6px] left-6 w-3 h-3 bg-black/95 border-r border-b border-gray-700 transform rotate-45"></div>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => {
          setIsAuthOpen(false);
          // Refresh user state after modal closes
          const storedToken = localStorage.getItem('token');
          const storedUser = localStorage.getItem('user');
          if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        }} 
      />
    </div>
  );
}
