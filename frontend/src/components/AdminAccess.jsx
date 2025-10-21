import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Settings, 
  Users, 
  BarChart3,
  X,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminAccess() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const adminFeatures = [
    {
      icon: BarChart3,
      title: 'Dashboard Analytics',
      description: 'View comprehensive statistics and reports'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage doctors, patients, and staff'
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure system preferences and settings'
    }
  ];

  return (
    <>
      {/* Admin Access Button - Fixed position */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300"
          title="Admin Access"
        >
          <Shield className="h-8 w-8" />
        </Button>
      </div>

      {/* Admin Access Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="bg-white text-gray-800 p-4 rounded-t-2xl border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Shield className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Admin Access</h2>
                    <p className="text-gray-600 text-sm">Secure administrative portal</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <Lock className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Administrative Dashboard
                </h3>
                <p className="text-gray-600 text-xs">
                  Access the HealthNexus admin panel to manage the entire system
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {adminFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="p-1 bg-white rounded">
                      <feature.icon className="h-3 w-3 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-xs">{feature.title}</h4>
                      <p className="text-gray-600 text-xs">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Access Button */}
              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin');
                }}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white py-2 rounded-lg font-semibold transition-all duration-300 text-sm"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Access Admin Panel</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Button>

              {/* Security Notice */}
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lock className="h-3 w-3 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800">Security Notice</p>
                    <p className="text-xs text-yellow-700">
                      Admin access requires proper authentication. Unauthorized access is prohibited.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminAccess;
