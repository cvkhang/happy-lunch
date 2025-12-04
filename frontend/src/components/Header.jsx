import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import NotificationList from './NotificationList';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('ログアウトしました');
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path) => {
    const baseClass = "px-4 py-2 rounded-full transition-all whitespace-nowrap font-semibold";
    if (isActive(path)) {
      return `${baseClass} bg-orange-50 text-orange-600 shadow-sm`;
    }
    return `${baseClass} text-slate-600 hover:bg-slate-50 hover:text-slate-900`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      {/* Top Row */}
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center group">
          <img src="/logo.png" alt="Happy Lunch Logo" className="h-10 w-10 mr-2 transform group-hover:scale-110 transition-transform duration-300" />
          <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight">
            Happy Lunch
          </div>
        </Link>
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link to="/admin" className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  管理者ダッシュボード
                </Link>
              )}

              {/* Notification Icon */}
              <NotificationList />

              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none">
                  <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200 overflow-hidden">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden md:block max-w-[100px] truncate">{user?.name}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-xs text-slate-400">サインイン中</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    プロフィール
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ログアウト
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 transition-colors">
                ログイン
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md">
                登録
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Nav Row */}
      <div className="container mx-auto px-6 pb-4">
        <nav className="flex space-x-8 text-sm font-medium text-slate-600 overflow-x-auto">
          <Link to="/restaurants" className={getLinkClass('/restaurants')}>
            レストランとメニュー
          </Link>
          <Link to="/community" className={getLinkClass('/community')}>
            コミュニティ
          </Link>
          <Link to="/favorites" className={getLinkClass('/favorites')}>
            お気に入りの飲食店
          </Link>
          <Link to="/write-review" className={getLinkClass('/write-review')}>
            評価を書く
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
