import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import { useAuthStore } from './store/authStore';

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
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

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
