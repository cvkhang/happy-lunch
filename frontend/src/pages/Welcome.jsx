import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Welcome = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect to restaurants list if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/restaurants');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-900">
      {/* Background Image with Overlay - Fixed */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Delicious Food"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90"></div>
      </div>

      {/* Header - Absolute Positioning */}
      <header className="absolute top-0 left-0 w-full z-50">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-default">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-12 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight">
              ハッピーランチ
            </span>
          </div>
          <Link
            to="/login"
            className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300"
          >
            ログイン
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-8 tracking-tight drop-shadow-lg">
            こんにちは
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
            >
              今すぐ始める
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg shadow-lg hover:bg-slate-100 hover:scale-105 transition-all duration-300"
            >
              アカウント登録
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-8 text-center border-t border-white/10">
        <div className="flex justify-center gap-8 mb-4 text-sm text-slate-400">
          <a href="#" className="hover:text-orange-400 transition-colors">FAQ</a>
        </div>
        <p className="text-xs text-slate-600">
          &copy; 2025 ハッピーランチ. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
