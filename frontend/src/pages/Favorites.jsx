import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/authStore';
import RestaurantList from '../components/RestaurantList'; // Reusing RestaurantList component logic or creating a simplified version
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { user, token } = useAuthStore();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-slate-600 mb-4">お気に入りを見るにはログインしてください。</p>
        <Link to="/login" className="px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors">
          ログイン
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">お気に入りのレストラン</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((restaurant) => (
                <Link key={restaurant.id} to={`/restaurants/${restaurant.id}`} className="block group">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      {restaurant.image_url ? (
                        <img
                          src={restaurant.image_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-orange-600 flex items-center shadow-sm">
                        <span className="text-yellow-400 mr-1">★</span>
                        {Number(restaurant.rating).toFixed(1)}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {restaurant.name}
                      </h3>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                        {restaurant.description || '美味しい料理と素敵な雰囲気をお楽しみください。'}
                      </p>
                      <div className="flex items-center text-xs text-slate-400 mt-auto">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{restaurant.address}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500 mb-4">お気に入りのレストランはまだありません。</p>
              <Link to="/restaurants" className="text-orange-600 font-medium hover:underline">
                レストランを探す
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
