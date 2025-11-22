import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/restaurants/${id}`);
        setRestaurant(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
        setError("Failed to load restaurant details.");
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  if (error) return <div className="text-center mt-20 text-red-500 text-xl">{error}</div>;
  if (!restaurant) return <div className="text-center mt-20 text-xl text-slate-600">Restaurant not found.</div>;

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20">
      <div className="container mx-auto px-6 py-8">
        {/* Restaurant Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-slate-800">{restaurant.name}</h1>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-full hover:bg-red-50 transition-colors"
            >
              <svg className={`w-7 h-7 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center text-slate-600">
              <span className="text-yellow-400 mr-2">★</span>
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="text-slate-400 ml-1">(100 voted)</span>
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
              <span>{restaurant.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{restaurant.opening_hours || 'N/A'}</span>
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
                  {item.price ? `¥${item.price.toLocaleString()}` : '¥-'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">レビュー</h2>
            <button className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              貢献したいですか？
            </button>
          </div>

          <div className="space-y-4">
            {restaurant.Reviews && restaurant.Reviews.length > 0 ? (
              restaurant.Reviews.map((review, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                        <svg className="w-full h-full text-slate-300" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
                          <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-700">{review.user_id || 'Anonymous'}</span>
                          <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < (review.rating || 5) ? '★' : '☆'}</span>
                            ))}
                          </div>
                        </div>
                        <button className="flex items-center gap-1 p-1 hover:bg-red-50 rounded-full transition-colors group">
                          <svg className="w-5 h-5 text-slate-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                          </svg>
                          <span className="text-xs text-slate-500">{review.likes || 0}</span>
                        </button>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{review.comment || review}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-8">まだレビューがありません</p>
            )}
          </div>

          {restaurant.Reviews && restaurant.Reviews.length > 0 && (
            <div className="mt-6 text-center">
              <button className="text-orange-600 hover:text-orange-700 font-medium flex items-center mx-auto">
                <span>もっと見る</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
