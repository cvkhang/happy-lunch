import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/${id}`);
      setRestaurant(response.data);
      setLoading(false);

      // Check favorite status if user is logged in
      if (user) {
        try {
          const token = localStorage.getItem('token');
          const favResponse = await axios.get(`${API_BASE_URL}/favorites/check/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Fix: Backend returns is_favorite, not isFavorited
          setIsFavorite(favResponse.data.is_favorite);
        } catch (favErr) {
          console.error("Error checking favorite status:", favErr);
          // Don't block the page if favorite check fails
        }
      }
    } catch (err) {
      console.error("Error fetching restaurant details:", err);
      setError("レストランの詳細を読み込めませんでした。");
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRestaurant();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('ログインが必要です');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isFavorite) {
        await axios.delete(`${API_BASE_URL}/favorites/${id}`, config);
        toast.success('お気に入りから削除しました');
      } else {
        await axios.post(`${API_BASE_URL}/favorites`, { restaurant_id: id }, config);
        toast.success('お気に入りに追加しました');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast.error('エラーが発生しました');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return <div className="text-center mt-20 text-red-500 text-xl">{error}</div>;
  if (!restaurant) return <div className="text-center mt-20 text-xl text-slate-600">レストランが見つかりません。</div>;

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      <div className="container mx-auto px-6 py-8">
        {/* Restaurant Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-slate-800">{restaurant.name}</h1>
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-full hover:bg-red-50 transition-colors"
              title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
            >
              <svg className={`w-7 h-7 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center text-slate-600">
              <span className="text-yellow-400 mr-2">★</span>
              <span className="font-semibold">{Number(restaurant.rating).toFixed(1)}</span>
              <span className="text-slate-400 ml-1">({restaurant.Reviews?.length || 0} 件の評価)</span>
            </div>
            <div className="flex items-center text-slate-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span className="line-clamp-1">{restaurant.address}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <span>{restaurant.phone ? restaurant.phone.replace(/-/g, '') : '情報なし'}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{restaurant.opening_hours || '情報なし'}</span>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">メニュー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurant.MenuItems && restaurant.MenuItems.map((item, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-4 hover:border-orange-300 transition-colors">
                <div className="aspect-video bg-slate-100 rounded-lg mb-3 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name || item}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-full h-full text-slate-300" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="font-medium text-slate-700">{item.name || item}</div>
                <div className="text-sm text-orange-600 font-semibold mt-1">
                  {item.price ? `${Math.floor(item.price).toLocaleString('ja-JP')}đ` : '-đ'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-800">レビュー</h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold hover:bg-orange-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                貢献しませんか？
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review Form - Conditionally Rendered */}
            {showReviewForm && (
              <div className="lg:col-span-1 animate-fade-in">
                <ReviewForm
                  restaurantId={id}
                  onReviewAdded={() => {
                    fetchRestaurant();
                    setShowReviewForm(false); // Hide form after submission
                  }}
                />
              </div>
            )}

            {/* Review List */}
            <div className={showReviewForm ? "lg:col-span-2" : "lg:col-span-3"}>
              <ReviewList
                reviews={restaurant.Reviews}
                onReviewUpdated={fetchRestaurant}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
