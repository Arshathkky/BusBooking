import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, User, LogOut, Menu, X, Bus, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
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
    <header className="bg-white dark:bg-gray-800 shadow-md border-b-4 border-[#fdc106] sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">

        <div className="flex items-center justify-between">

          {/* LOGO SECTION */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/WhatsApp Image 2025-08-18 at 19.30.28_16689637.jpg"
              alt="TouchMe+"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
            />

            <div className="flex flex-col leading-tight">
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                TouchMe+
              </span>

              <div className="flex items-center space-x-1">
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  Partner:
                </span>
                <img
                  src="/Partner-logo.jpeg"
                  alt="Partner"
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                />
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/search"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-[#fdc106] transition-colors"
            >
              <Bus className="w-4 h-4" />
              <span>Search Buses</span>
            </Link>

            {user && (
              <Link
                to={getDashboardLink()}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-[#fdc106] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-[#fdc106]" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Desktop Login */}
            {!user && (
              <Link
                to="/login"
                className="hidden md:inline-block bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Login
              </Link>
            )}

            {/* Desktop User */}
            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-[#fdc106] p-2 rounded-full">
                    <User className="w-4 h-4 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>

          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="md:hidden mt-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3 shadow-lg">

            <Link
              to="/search"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-[#fdc106] hover:text-gray-900 transition"
            >
              <Bus className="w-4 h-4" />
              <span className="text-sm font-medium">Search Buses</span>
            </Link>

            {user && (
              <Link
                to={getDashboardLink()}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-[#fdc106] hover:text-gray-900 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center bg-[#fdc106] hover:bg-[#e6ad05] text-gray-900 py-2 rounded-lg text-sm font-semibold transition"
              >
                Login
              </Link>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="block w-full text-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 py-2 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;