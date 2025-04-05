
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Clock, 
  BarChart, 
  Users, 
  User, 
  LogOut, 
  Calendar, 
  LayoutDashboard 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!currentUser) {
    return <>{children}</>;
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      show: true
    },
    {
      name: 'Time Entries',
      path: '/time-entries',
      icon: <Clock className="h-5 w-5" />,
      show: true
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: <BarChart className="h-5 w-5" />,
      show: true
    },
    {
      name: 'Calendar',
      path: '/calendar',
      icon: <Calendar className="h-5 w-5" />,
      show: true
    },
    {
      name: 'Users',
      path: '/users',
      icon: <Users className="h-5 w-5" />,
      show: isAdmin
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
      show: true
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold text-purple-700 flex items-center gap-2">
            <Clock className="h-6 w-6" />
            TimeTracker
          </h1>
        </div>
        
        <nav className="mt-6">
          <ul>
            {navigationItems
              .filter(item => item.show)
              .map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    className={cn(
                      "flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors",
                      location.pathname === item.path && "bg-purple-50 text-purple-700 border-l-4 border-purple-600"
                    )}
                  >
                    {item.icon}
                    <span className="mx-3">{item.name}</span>
                  </a>
                </li>
              ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-6">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 mr-2">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{currentUser.username}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center text-gray-700"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
