import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Tag, Award, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import Logo from '../ui/Logo';
import StatusBadge from '../game/StatusBadge';
import Button from '../ui/Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentPlayer, logout } = useGameStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const navItems = [
    { name: 'Game', path: '/game', icon: <Tag className="w-5 h-5" /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Award className="w-5 h-5" /> },
  ];

  if (currentPlayer?.isAdmin) {
    navItems.push({
      name: 'Admin',
      path: '/admin',
      icon: <Settings className="w-5 h-5" />,
    });
  }

  return (
    <nav className="bg-dark-300 border-b border-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo className="h-8 w-auto" />
              <span className="ml-2 font-semibold text-xl hidden sm:block">ShadowTag</span>
            </Link>
          </div>

          {currentPlayer ? (
            <>
              {/* Desktop nav */}
              <div className="hidden md:flex md:items-center md:space-x-6">
                <div className="flex items-center space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${
                        location.pathname === item.path
                          ? 'bg-dark-100 text-white'
                          : 'text-neutral-400 hover:bg-dark-200 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Desktop dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-400 hover:bg-dark-200 hover:text-white transition-colors"
                  >
                    <div className="h-8 w-8 bg-dark-100 rounded-full flex items-center justify-center font-mono text-xs">
                      {currentPlayer.codename.substring(0, 2)}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{currentPlayer.codename}</span>
                      <StatusBadge status={currentPlayer.status} />
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-200 rounded-lg shadow-lg py-1 z-50 border border-dark-100">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-neutral-400 hover:bg-dark-100 hover:text-white transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-400 hover:bg-dark-100 hover:text-white transition-colors"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex md:hidden items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-white hover:bg-dark-200 focus:outline-none"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && currentPlayer && (
        <div className="md:hidden bg-dark-300 border-t border-dark-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-3 py-2 flex items-center space-x-2">
              <div className="h-8 w-8 bg-dark-100 rounded-full flex items-center justify-center font-mono text-xs">
                {currentPlayer.codename.substring(0, 2)}
              </div>
              <div>
                <div className="text-white font-medium">{currentPlayer.codename}</div>
                <StatusBadge status={currentPlayer.status} />
              </div>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2 ${
                  location.pathname === item.path
                    ? 'bg-dark-100 text-white'
                    : 'text-neutral-400 hover:bg-dark-200 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}

            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-400 hover:bg-dark-200 hover:text-white flex items-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-neutral-400 hover:bg-dark-200 hover:text-white flex items-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;