import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Stethoscope,
  Calendar,
  FileText,
  MessageSquare,
  Newspaper,
  Eye,
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dash',
    color: 'text-blue-600'
  },
  {
    title: 'Doctors',
    icon: Stethoscope,
    color: 'text-green-600',
    submenu: [
      { title: 'Add Doctor', path: '/admin/dash/addoc', icon: UserPlus },
      { title: 'View Doctors', path: '/admin/dash/viewdoc', icon: Eye }
    ]
  },
  {
    title: 'Patients',
    icon: Users,
    color: 'text-purple-600',
    submenu: [
      { title: 'Add Patient', path: '/admin/dash/adpatient', icon: UserPlus },
      { title: 'View Patients', path: '/admin/dash/viewpatient', icon: Eye },
      { title: 'Appointments', path: '/admin/dash/viewapp', icon: Calendar }
    ]
  },
  {
    title: 'Communications',
    icon: MessageSquare,
    color: 'text-orange-600',
    submenu: [
      { title: 'Enquiries', path: '/admin/dash/viewenquiry', icon: MessageSquare },
      { title: 'Feedback', path: '/admin/dash/viewfeed', icon: FileText }
    ]
  },
  {
    title: 'News & Updates',
    icon: Newspaper,
    path: '/admin/dash/adnews',
    color: 'text-red-600'
  }
];

export function AdminSidebar({ isOpen, onClose, currentPath }) {
  const [expandedMenus, setExpandedMenus] = React.useState({
    1: true, // Doctors submenu expanded by default
    2: true, // Patients submenu expanded by default
    3: true  // Communications submenu expanded by default
  });

  const toggleSubmenu = (index) => {
    setExpandedMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl z-50
        transition-all duration-300 ease-in-out w-64
        lg:relative lg:top-0 lg:h-screen lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.submenu ? (
                  // Menu with submenu
                  <div>
                    <button
                      onClick={() => toggleSubmenu(index)}
                      className={`
                        w-full flex items-center justify-between px-3 py-3 rounded-lg
                        text-gray-300 hover:bg-gray-700 hover:text-white transition-colors
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform ${
                          expandedMenus[index] ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>

                    {/* Submenu */}
                    {expandedMenus[index] && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            onClick={onClose}
                            className={`
                              flex items-center space-x-3 px-3 py-2 rounded-lg text-sm
                              transition-colors
                              ${currentPath === subItem.path
                                ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }
                            `}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Direct menu item
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center space-x-3 px-3 py-3 rounded-lg
                      transition-colors
                      ${currentPath === item.path
                        ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 px-3 py-2">
              <HelpCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-400">Need Help?</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
