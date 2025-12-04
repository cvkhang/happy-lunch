import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import ReviewList from '../components/ReviewList';

const Community = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restaurant Search States
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Secondary Filter State
  const [filterTerm, setFilterTerm] = useState('');
  const [filteredReviews, setFilteredReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, [selectedRestaurant]);

  // Filter logic for the secondary search bar
  useEffect(() => {
    if (filterTerm) {
      const lowerTerm = filterTerm.toLowerCase();
      const filtered = reviews.filter(review =>
        review.comment?.toLowerCase().includes(lowerTerm) ||
        review.dish_names?.some(dish => dish.toLowerCase().includes(lowerTerm))
      );
      setFilteredReviews(filtered);
    } else {
      setFilteredReviews(reviews);
    }
  }, [filterTerm, reviews]);

  // Restaurant Autocomplete Search Logic
  useEffect(() => {
    if (selectedRestaurant && restaurantSearch === selectedRestaurant.name) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (restaurantSearch.length > 1) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/restaurants?search=${restaurantSearch}`);
          setSearchResults(response.data);
          setShowDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
    }
  }, [restaurantSearch, selectedRestaurant]);

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setRestaurantSearch(restaurant.name);
    setShowDropdown(false);
  };

  const clearRestaurantSelection = () => {
    setSelectedRestaurant(null);
    setRestaurantSearch('');
    setSearchResults([]);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/reviews?limit=50`;

      // If a restaurant is selected, fetch reviews only for that restaurant
      if (selectedRestaurant) {
        url = `${API_BASE_URL}/reviews?restaurant_id=${selectedRestaurant.id}&limit=50`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setReviews(response.data.reviews);
        setFilteredReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching community reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">コミュニティ</h1>
        <p className="text-slate-600 mb-6">みんなの美味しい体験を見つけよう</p>

        <div className="max-w-xl mx-auto space-y-4">
          {/* Restaurant Search (Primary) */}
          <div className="relative z-20 text-left">
            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">
              レストランで絞り込む
            </label>
            <div className="relative">
              <input
                type="text"
                value={restaurantSearch}
                onChange={(e) => {
                  setRestaurantSearch(e.target.value);
                  if (selectedRestaurant && e.target.value !== selectedRestaurant.name) {
                    setSelectedRestaurant(null); // Reset selection if user types
                  }
                }}
                placeholder="レストラン名を入力して検索..."
                className="w-full px-5 py-3 pl-12 rounded-full border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none shadow-sm transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              {/* Clear Button */}
              {restaurantSearch && (
                <button
                  onClick={clearRestaurantSelection}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Loading Spinner */}
              {isSearching && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Dropdown Results */}
            {showDropdown && (
              <div className="absolute z-30 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                {searchResults.length > 0 ? (
                  searchResults.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      onClick={() => handleSelectRestaurant(restaurant)}
                      className="px-5 py-3 hover:bg-orange-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={restaurant.image_url || 'https://via.placeholder.com/40'}
                        alt={restaurant.name}
                        className="w-10 h-10 rounded-lg object-cover shadow-sm"
                      />
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{restaurant.name}</div>
                        <div className="text-xs text-slate-500 truncate">{restaurant.address}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-4 text-center text-slate-500 text-sm">
                    レストランが見つかりません
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Secondary Filter */}
          <div className="relative z-10 text-left">
            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">
              キーワードで絞り込む
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="料理名、コメントで検索..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="w-full px-5 py-3 pl-12 rounded-full border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none shadow-sm transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {filteredReviews.length > 0 ? (
            <ReviewList reviews={filteredReviews} onReviewUpdated={fetchReviews} />
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
              <p className="text-slate-500">レビューが見つかりませんでした。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Community;
