import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import AdminUserList from '../components/admin/AdminUserList';
import AdminRestaurantList from '../components/admin/AdminRestaurantList';
import AdminMenuList from '../components/admin/AdminMenuList';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-slate-900 text-white pb-20 pt-10 px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">管理者ダッシュボード</h1>
          <p className="text-slate-400">システム全体の管理を行います</p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-10">
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden min-h-[600px]">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 text-center font-medium transition-colors border-b-2 ${activeTab === 'users'
                  ? 'text-orange-600 border-orange-600 bg-orange-50/30'
                  : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              ユーザー管理
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex-1 py-4 text-center font-medium transition-colors border-b-2 ${activeTab === 'restaurants'
                  ? 'text-orange-600 border-orange-600 bg-orange-50/30'
                  : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              レストラン管理
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-4 text-center font-medium transition-colors border-b-2 ${activeTab === 'menu'
                  ? 'text-orange-600 border-orange-600 bg-orange-50/30'
                  : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              メニュー管理
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'users' && <AdminUserList />}
            {activeTab === 'restaurants' && <AdminRestaurantList />}
            {activeTab === 'menu' && <AdminMenuList />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
