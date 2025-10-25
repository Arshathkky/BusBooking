import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Sun, Moon, User, LogOut, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'owner': return '/owner';
      case 'conductor': return '/conductor';
      case 'agent': return '/agent';
      default: return '/';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b-4 border-[#fdc106] transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="/WhatsApp Image 2025-08-18 at 19.30.28_16689637.jpg" 
              alt="TouchMe+" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TouchMe+</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Smart Bus Booking</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-gray-700 dark:text-gray-300 hover:text-[#fdc106] transition-colors">
              Search Buses
            </Link>
            {user && (
              <Link to={getDashboardLink()} className="text-gray-700 dark:text-gray-300 hover:text-[#fdc106] transition-colors">
                Dashboard
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-[#fdc106]" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-[#fdc106] p-2 rounded-full">
                    <User className="w-4 h-4 text-gray-900" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;