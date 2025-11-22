import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './components/RestaurantDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
          {/* Top Row */}
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center group">
              <img src="/logo.png" alt="Happy Lunch Logo" className="h-10 w-10 mr-2 transform group-hover:scale-110 transition-transform duration-300" />
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight">
                Happy Lunch
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 relative group">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </button>
              <button className="p-2 rounded-full text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Nav Row */}
          <div className="container mx-auto px-6 pb-4">
            <nav className="flex space-x-8 text-sm font-medium text-slate-600 overflow-x-auto">
              <Link to="/" className="px-4 py-2 rounded-full bg-orange-50 text-orange-600 font-semibold shadow-sm hover:shadow-md transition-all">
                レストランとメニュー
              </Link>
              <Link to="#" className="px-4 py-2 rounded-full hover:bg-slate-50 hover:text-slate-900 transition-all whitespace-nowrap">
                コミュニティ
              </Link>
              <Link to="#" className="px-4 py-2 rounded-full hover:bg-slate-50 hover:text-slate-900 transition-all whitespace-nowrap">
                お気に入りの飲食店
              </Link>
              <Link to="#" className="px-4 py-2 rounded-full hover:bg-slate-50 hover:text-slate-900 transition-all whitespace-nowrap">
                評価を書く
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow bg-slate-50/50">
          <Routes>
            <Route path="/" element={<RestaurantList />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-12 mt-12">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-lg font-medium text-slate-600 mb-4">FAQ</h3>
            <p className="text-slate-400 text-sm">&copy; 2025 Happy Lunch.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
