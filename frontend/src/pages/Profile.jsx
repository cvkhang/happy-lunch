import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';
import ReviewList from '../components/ReviewList';
import AvatarUpload from '../components/AvatarUpload';

const Profile = () => {
  const { user, isAuthenticated, logout, changePassword, updateProfile, updateAvatar, token } = useAuthStore();
  const navigate = useNavigate();

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    address: '',
    account_type: 'personal'
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setProfileFormData({
        name: user.name || '',
        address: user.address || '',
        account_type: user.account_type || 'personal'
      });
    }
    fetchUserReviews();
  }, [isAuthenticated, navigate, user]);

  const fetchUserReviews = async () => {
    if (!user) return;
    try {
      setLoadingReviews(true);
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await axios.get(`${API_BASE_URL}/reviews?user_id=${user.id}`, config);
      if (response.data.success) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('レビューの取得に失敗しました');
    } finally {
      setLoadingReviews(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('新しいパスワードが一致しません');
      return;
    }

    setLoadingPassword(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

      if (result.success) {
        toast.success('パスワードが変更されました');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('エラーが発生しました');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const result = await updateProfile(profileFormData);
      if (result.success) {
        toast.success('プロフィールを更新しました');
        setIsEditingProfile(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('エラーが発生しました');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAvatarUpdate = async (avatarUrl) => {
    const result = await updateAvatar(avatarUrl);
    if (!result.success) {
      throw new Error(result.message);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: User Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-28 relative">
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                <AvatarUpload
                  currentAvatar={user.avatar_url}
                  userName={user.name}
                  onAvatarUpdate={handleAvatarUpdate}
                />
              </div>
            </div>

            <div className="pt-12 pb-6 px-5 text-center">
              <h1 className="text-xl font-bold text-slate-800">{user.name}</h1>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
                {user.role === 'admin' ? '管理者' : 'ユーザー'}
              </div>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSubmitProfile} className="p-5 border-t border-slate-100 space-y-3 bg-slate-50/50">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">名前</label>
                  <input
                    type="text"
                    name="name"
                    value={profileFormData.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">アカウントタイプ</label>
                  <select
                    name="account_type"
                    value={profileFormData.account_type}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm"
                  >
                    <option value="personal">個人</option>
                    <option value="family">家族</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">住所</label>
                  <input
                    type="text"
                    name="address"
                    value={profileFormData.address}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loadingProfile}
                    className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 shadow-sm"
                  >
                    {loadingProfile ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-slate-100 p-5 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">アカウントタイプ</label>
                  <p className="font-medium text-slate-700 text-sm">{user.account_type === 'family' ? '家族' : '個人'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">住所</label>
                  <p className="font-medium text-slate-700 text-sm">{user.address || '未設定'}</p>
                </div>

                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full mt-2 py-2 px-4 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  情報を変更
                </button>
              </div>
            )}
          </div>

          {/* Additional Actions (Password Change Only) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 space-y-2">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full py-2 px-3 text-left text-slate-600 hover:bg-slate-50 rounded-lg transition-all text-sm flex items-center justify-between group"
            >
              <span className="font-medium">パスワードを変更</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${showPasswordForm ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Password Change Form (Collapsible) */}
            {showPasswordForm && (
              <div className="pt-1 pb-2 px-2 animate-fade-in">
                <form onSubmit={handleSubmitPassword} className="space-y-3">
                  <div>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="現在のパスワード"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="新しいパスワード (8文字以上)"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 outline-none text-sm"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="パスワード確認"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 outline-none text-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingPassword}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all disabled:opacity-70 text-sm shadow-sm"
                  >
                    {loadingPassword ? '処理中...' : '変更を保存'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: User Reviews */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 min-h-[400px]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </span>
                あなたのレビュー
              </h2>
              <div className="flex gap-2">
                <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {reviews.reduce((sum, review) => sum + (review.like_count || 0), 0)} いいね
                </span>
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                  全 {reviews.length} 件
                </span>
              </div>
            </div>

            {loadingReviews ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <ReviewList
                reviews={reviews}
                onReviewUpdated={fetchUserReviews}
                readOnlyLikes={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
