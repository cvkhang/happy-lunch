import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './components/RestaurantDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminLayout from './layouts/AdminLayout';
import AdminUserList from './components/admin/AdminUserList';
import AdminReviewList from './components/admin/AdminReviewList';
import AdminRestaurantMenuManager from './components/admin/AdminRestaurantMenuManager';
import WriteReview from './pages/WriteReview';
import Welcome from './pages/Welcome';
import Community from './pages/Community';
import Favorites from './pages/Favorites';
import axios from 'axios';
import { useAuthStore } from './store/authStore';
import { API_BASE_URL } from './config/api';

// Set base URL for axios
axios.defaults.baseURL = API_BASE_URL;

// Layout component for pages that need the main Header and Footer
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-slate-50/50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  const { initAuth, logout } = useAuthStore();

  useEffect(() => {
    initAuth();

    // Setup Axios interceptor to handle token expiration
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Check if it's a token expiration error
          const errorMessage = error.response.data?.message;
          if (errorMessage === 'Token is not valid' || errorMessage === 'Token expired' || errorMessage === 'No token provided, authorization denied') {
            logout();
            toast.error('セッションの有効期限が切れました。もう一度ログインしてください。');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [initAuth, logout]);

  return (
    <Router>
      <Toaster position="top-center" containerStyle={{ zIndex: 9999 }} />
      <Routes>
        {/* Welcome Page (No Main Header/Footer) */}
        <Route path="/" element={<Welcome />} />

        {/* Auth Routes (Custom Header/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main App Routes (With Header/Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/write-review" element={<WriteReview />} />
          <Route path="/community" element={<Community />} />
          <Route path="/favorites" element={<Favorites />} />
        </Route>

        {/* Admin Routes (With Admin Header) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<AdminUserList />} />
          <Route path="reviews" element={<AdminReviewList />} />
          <Route path="restaurants" element={<AdminRestaurantMenuManager />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
