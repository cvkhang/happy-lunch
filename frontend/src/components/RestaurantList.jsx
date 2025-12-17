import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import RestaurantCard from './RestaurantCard';
import { FILTER_OPTIONS, getTimePeriod } from '../config/filterOptions';
import { API_BASE_URL } from '../config/api';
import useGeolocation from '../hooks/useGeolocation';
import { calculateDistance } from '../utils/distance';
import { useAuthStore } from '../store/authStore';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(5);
  const { user, token } = useAuthStore();
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    if (user && token) {
      fetchFavorites();
    } else {
      setFavoriteIds([]);
    }
  }, [user, token]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && Array.isArray(response.data.favorites)) {
        setFavoriteIds(response.data.favorites.map(fav => fav.id));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleToggleFavorite = (restaurantId, isNowFavorite) => {
    if (isNowFavorite) {
      setFavoriteIds(prev => [...prev, restaurantId]);
    } else {
      setFavoriteIds(prev => prev.filter(id => id !== restaurantId));
    }
  };

  // Filter states
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedTimePeriods, setSelectedTimePeriods] = useState([]);
  const [selectedDistanceFilter, setSelectedDistanceFilter] = useState(null); // 'near' (≤3km) or 'far' (>3km)

  // Geolocation hook
  const { userLocation, locationError, locationLoading, locationPermission, requestLocation } = useGeolocation();

  // Success banner state (auto-hide after 5 seconds)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Scroll state for sidebar
  const [scrollState, setScrollState] = useState({
    hasScrollTop: false,
    hasScrollBottom: false
  });

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const hasScrollBottom = el.scrollHeight > el.clientHeight;
      setScrollState(prev => ({ ...prev, hasScrollBottom }));
    }
  }, []);

  // Auto-hide success banner after 5 seconds when location is obtained
  useEffect(() => {
    if (userLocation) {
      setShowSuccessBanner(true);
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 1500); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [userLocation]);

  // Utility function to parse opening hours
  const parseOpeningHours = (hoursString) => {
    if (!hoursString) return null;
    const match = hoursString.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (!match) return null;

    const [, startHour, startMin, endHour, endMin] = match;
    return {
      start: parseInt(startHour) * 60 + parseInt(startMin),
      end: parseInt(endHour) * 60 + parseInt(endMin)
    };
  };

  // Check if restaurant is open during a time period
  const isOpenDuringPeriod = (openingHours, periodStart, periodEnd) => {
    const hours = parseOpeningHours(openingHours);
    if (!hours) return false;

    // Check if there's any overlap between restaurant hours and the period
    return hours.start <= periodEnd && hours.end >= periodStart;
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/restaurants?search=${searchTerm}`);
        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("レストランを読み込めませんでした。");
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchRestaurants();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Apply filters
  useEffect(() => {
    let filtered = [...restaurants];

    // Calculate distance for each restaurant if user location is available
    if (userLocation) {
      filtered = filtered.map(restaurant => ({
        ...restaurant,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          restaurant.latitude,
          restaurant.longitude
        )
      }));
    }

    // Filter by cuisine type
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(restaurant =>
        selectedCuisines.some(cuisine =>
          restaurant.cuisine_type && restaurant.cuisine_type.toLowerCase().includes(cuisine.toLowerCase())
        )
      );
    }

    // Filter by price range (based on most common price range in menu)
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(restaurant => {
        const menuItems = restaurant.MenuItems || [];
        if (menuItems.length === 0) return false;

        // Count how many items fall into each price range
        const rangeCounts = {};
        FILTER_OPTIONS.priceRanges.forEach(range => {
          rangeCounts[range.value] = 0;
        });

        menuItems.forEach(item => {
          const price = item.price || 0;
          FILTER_OPTIONS.priceRanges.forEach(range => {
            if (price >= range.min && price < range.max) {
              rangeCounts[range.value]++;
            }
          });
        });

        // Find the most common price range
        let mostCommonRange = null;
        let maxCount = 0;
        Object.entries(rangeCounts).forEach(([rangeValue, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostCommonRange = rangeValue;
          }
        });

        // Check if the most common range matches any selected range
        return selectedPriceRanges.includes(mostCommonRange);
      });
    }

    // Filter by rating
    if (selectedRatings.length > 0) {
      filtered = filtered.filter(restaurant =>
        selectedRatings.some(rating => restaurant.rating >= rating)
      );
    }

    // Filter by time period
    if (selectedTimePeriods.length > 0) {
      filtered = filtered.filter(restaurant => {
        return selectedTimePeriods.some(periodValue => {
          const period = getTimePeriod(periodValue);
          if (!period) return false;
          return isOpenDuringPeriod(restaurant.opening_hours, period.start, period.end);
        });
      });
    }

    // Filter by distance - uses config from filterOptions.js
    if (selectedDistanceFilter !== null && userLocation) {
      const distanceConfig = FILTER_OPTIONS.distanceFilters.find(f => f.value === selectedDistanceFilter);
      if (distanceConfig) {
        filtered = filtered.filter(restaurant => {
          if (restaurant.distance === undefined) return false;

          // Check maxDistance (if defined)
          if (distanceConfig.maxDistance !== undefined && restaurant.distance > distanceConfig.maxDistance) {
            return false;
          }

          // Check minDistance (if defined)
          if (distanceConfig.minDistance !== undefined && restaurant.distance < distanceConfig.minDistance) {
            return false;
          }

          return true;
        });
      }
    }

    // Sort by distance if user location is available
    if (userLocation) {
      filtered.sort((a, b) => {
        // Restaurants with distance come first
        if (a.distance !== undefined && b.distance === undefined) return -1;
        if (a.distance === undefined && b.distance !== undefined) return 1;
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, selectedCuisines, selectedPriceRanges, selectedRatings, selectedTimePeriods, selectedDistanceFilter, userLocation]);

  const loadMore = () => {
    setDisplayCount(prev => prev + 5);
  };

  const toggleFilter = (filterType, value) => {
    const setters = {
      cuisine: setSelectedCuisines,
      price: setSelectedPriceRanges,
      rating: setSelectedRatings,
      time: setSelectedTimePeriods
    };

    const getters = {
      cuisine: selectedCuisines,
      price: selectedPriceRanges,
      rating: selectedRatings,
      time: selectedTimePeriods
    };

    const setter = setters[filterType];
    const current = getters[filterType];

    if (current.includes(value)) {
      setter(current.filter(item => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setSelectedPriceRanges([]);
    setSelectedRatings([]);
    setSelectedTimePeriods([]);
    setSelectedDistanceFilter(null);
  };

  const hasActiveFilters = selectedCuisines.length > 0 || selectedPriceRanges.length > 0 ||
    selectedRatings.length > 0 || selectedTimePeriods.length > 0 || selectedDistanceFilter !== null;

  return (
    <div className="container mx-auto px-6">
      {/* Location Permission Banner */}
      {!userLocation && (
        <div className="pt-8 pb-4">
          {locationPermission === 'denied' ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-900 mb-1">位置情報へのアクセスが拒否されました</h4>
                <p className="text-sm text-red-700">ブラウザの設定で位置情報を許可してください。近くのレストランを表示できます。</p>
              </div>
            </div>
          ) : locationError ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-yellow-900 mb-1">位置情報エラー</h4>
                <p className="text-sm text-yellow-700">{locationError}</p>
              </div>
              <button
                onClick={requestLocation}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-semibold"
              >
                再試行
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">近くのレストランを見つけましょう</h4>
                <p className="text-sm text-slate-600">位置情報を共有すると、距離順にレストランを表示できます。</p>
              </div>
              <button
                onClick={requestLocation}
                disabled={locationLoading}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {locationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    取得中...
                  </>
                ) : (
                  '位置情報を許可'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Location Success Banner - Auto-hide after 5 seconds */}
      {userLocation && showSuccessBanner && (
        <div className="pt-8 pb-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4 animate-fade-in">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-green-900">位置情報が有効です</h4>
              <p className="text-sm text-green-700">近い順にレストランを表示しています</p>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="p-1 hover:bg-green-100 rounded-lg transition-colors"
              aria-label="閉じる"
            >
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Greeting & Search Section */}
      <div className="mb-12 pt-12">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            {user ? `${user.name.split(' ').pop()}さん` : 'ゲスト'}こんにちは! <br />
            <span className="text-orange-500">何を食べたいですか?</span>
          </h2>
          <div className="relative flex-grow max-w-3xl">
            <input
              type="text"
              placeholder="レストランを検索..."
              className="w-full bg-white border-0 px-8 py-5 rounded-full text-slate-700 shadow-lg shadow-slate-200/50 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all text-lg pl-16"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-6 h-6 text-orange-500 absolute left-6 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10 pb-12">
        {/* Filter Sidebar */}
        <div className="w-full md:w-72 flex-shrink-0 md:-mt-12">
          <div className="sticky top-24 h-[calc(100vh-8rem)]">
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 h-full flex flex-col relative overflow-hidden">
              {/* Fixed Header */}
              <div className="p-6 pb-4 border-b border-slate-50 flex-shrink-0 bg-white z-20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <div className="p-2 bg-orange-50 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                      </svg>
                    </div>
                    フィルター
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-full transition-all"
                    >
                      クリア
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="relative flex-1 min-h-0">
                {/* Top Fade */}
                <div
                  className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${scrollState.hasScrollTop ? 'opacity-100' : 'opacity-0'
                    }`}
                />

                <div
                  ref={scrollContainerRef}
                  className="h-full overflow-y-auto custom-scrollbar p-6 pt-4"
                  onScroll={(e) => {
                    const target = e.currentTarget;
                    const hasScrollTop = target.scrollTop > 10;
                    const hasScrollBottom = target.scrollTop < target.scrollHeight - target.clientHeight - 10;

                    setScrollState({ hasScrollTop, hasScrollBottom });
                  }}
                >
                  {/* Distance Filter - Only show if location is available */}
                  {userLocation && (
                    <div className="mb-8">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-1 h-4 bg-orange-400 rounded-full mr-2"></span>
                        距離
                      </h4>
                      <div className="space-y-2.5">
                        {FILTER_OPTIONS.distanceFilters.map((item, i) => (
                          <label
                            key={i}
                            className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors -mx-2"
                            onClick={() => setSelectedDistanceFilter(selectedDistanceFilter === item.value ? null : item.value)}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-all duration-200 ${selectedDistanceFilter === item.value
                              ? 'border-orange-500 bg-orange-500 shadow-sm shadow-orange-200'
                              : 'border-slate-300 group-hover:border-orange-400 bg-white'
                              }`}>
                              {selectedDistanceFilter === item.value && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className={`transition-colors text-sm ${selectedDistanceFilter === item.value ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-900'
                              }`}>
                              {item.icon} {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opening Hours Filter */}
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                      <span className="w-1 h-4 bg-orange-400 rounded-full mr-2"></span>
                      営業時間
                    </h4>
                    <div className="space-y-2.5">
                      {FILTER_OPTIONS.timePeriods.map((item, i) => (
                        <label key={i} className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors -mx-2" onClick={() => toggleFilter('time', item.value)}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-all duration-200 ${selectedTimePeriods.includes(item.value)
                            ? 'border-orange-500 bg-orange-500 shadow-sm shadow-orange-200'
                            : 'border-slate-300 group-hover:border-orange-400 bg-white'
                            }`}>
                            {selectedTimePeriods.includes(item.value) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <span className={`transition-colors text-sm ${selectedTimePeriods.includes(item.value) ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>
                            {item.icon} {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Cuisine Filter */}
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                      <span className="w-1 h-4 bg-orange-400 rounded-full mr-2"></span>
                      料理タイプ
                    </h4>
                    <div className="space-y-2.5">
                      {FILTER_OPTIONS.cuisines.map((item, i) => (
                        <label key={i} className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors -mx-2" onClick={() => toggleFilter('cuisine', item.value)}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-all duration-200 ${selectedCuisines.includes(item.value)
                            ? 'border-orange-500 bg-orange-500 shadow-sm shadow-orange-200'
                            : 'border-slate-300 group-hover:border-orange-400 bg-white'
                            }`}>
                            {selectedCuisines.includes(item.value) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <span className={`transition-colors text-sm ${selectedCuisines.includes(item.value) ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>
                            {item.icon} {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                      <span className="w-1 h-4 bg-orange-400 rounded-full mr-2"></span>
                      価格帯
                    </h4>
                    <div className="space-y-2.5">
                      {FILTER_OPTIONS.priceRanges.map((item, i) => (
                        <label key={i} className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors -mx-2" onClick={() => toggleFilter('price', item.value)}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-all duration-200 ${selectedPriceRanges.includes(item.value)
                            ? 'border-orange-500 bg-orange-500 shadow-sm shadow-orange-200'
                            : 'border-slate-300 group-hover:border-orange-400 bg-white'
                            }`}>
                            {selectedPriceRanges.includes(item.value) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={`transition-colors text-sm ${selectedPriceRanges.includes(item.value) ? 'text-slate-900 font-medium' : 'text-slate-700 group-hover:text-slate-900'}`}>{item.label}</span>
                            <span className="text-xs text-slate-400">{item.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                      <span className="w-1 h-4 bg-orange-400 rounded-full mr-2"></span>
                      評価
                    </h4>
                    <div className="space-y-2.5">
                      {FILTER_OPTIONS.ratings.map((item, i) => (
                        <label key={i} className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors -mx-2" onClick={() => toggleFilter('rating', item.value)}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-all duration-200 ${selectedRatings.includes(item.value)
                            ? 'border-orange-500 bg-orange-500 shadow-sm shadow-orange-200'
                            : 'border-slate-300 group-hover:border-orange-400 bg-white'
                            }`}>
                            {selectedRatings.includes(item.value) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400 text-sm">
                              {[...Array(Math.floor(item.value))].map((_, j) => <span key={j}>★</span>)}
                            </div>
                            <span className={`transition-colors text-sm ${selectedRatings.includes(item.value) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{item.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Fade */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${scrollState.hasScrollBottom ? 'opacity-100' : 'opacity-0'
                    }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {loading && !filteredRestaurants.length ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl">{error}</div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-slate-800">レストランが見つかりません。</h3>
              <p className="text-slate-500">検索条件やフィルターを変更してみてください。</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRestaurants.slice(0, displayCount).map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isFavorite={favoriteIds.includes(restaurant.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}

              {/* Load More Button */}
              {displayCount < filteredRestaurants.length && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    className="bg-white border border-slate-200 text-slate-600 font-semibold py-3 px-8 rounded-full hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all shadow-sm flex items-center mx-auto"
                  >
                    <span>もっと見る</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div >
      </div >
    </div >
  );
};

export default RestaurantList;
