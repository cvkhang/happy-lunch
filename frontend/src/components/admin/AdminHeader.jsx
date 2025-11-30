import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const AdminHeader = () => {
  const { user, logout } = useAuthStore();
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
    const baseClass = "px-4 py-2 rounded-lg transition-all font-medium text-sm";
    if (isActive(path)) {
      return `${baseClass} bg-slate-800 text-white shadow-sm`;
    }
    return `${baseClass} text-slate-400 hover:bg-slate-800/50 hover:text-white`;
  };

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
                A
              </div>
              <span className="text-lg font-bold tracking-tight">Admin Panel</span>
            </Link>
            <div className="h-6 w-px bg-slate-700 mx-2"></div>
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              メインサイトに戻る
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            <Link to="/admin/users" className={getLinkClass('/admin/users')}>
              ユーザー管理
            </Link>
            <Link to="/admin/reviews" className={getLinkClass('/admin/reviews')}>
              レビュー管理
            </Link>
            <Link to="/admin/restaurants" className={getLinkClass('/admin/restaurants')}>
              レストラン・メニュー管理
            </Link>
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-white">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-slate-800"
              title="ログアウト"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
