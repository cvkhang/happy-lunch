import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

const WriteReview = () => {
  const { user, isAuthenticated, token } = useAuthStore();
  const navigate = useNavigate();

  // Form States
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [rating, setRating] = useState(0);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [customDish, setCustomDish] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchTimeoutRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll to top
    if (!isAuthenticated) {
      toast.error('レビューを書くにはログインが必要です');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const [menuItems, setMenuItems] = useState([]);

  // Search Restaurants Logic
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

  const handleSelectRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setRestaurantSearch(restaurant.name);
    setShowDropdown(false);
    setSelectedDishes([]); // Reset selected dishes
    setCustomDish('');

    // Fetch menu items for the selected restaurant
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/${restaurant.id}`);
      if (response.data && response.data.MenuItems) {
        setMenuItems(response.data.MenuItems);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    }
  };

  const toggleDishSelection = (dishName) => {
    if (selectedDishes.includes(dishName)) {
      setSelectedDishes(selectedDishes.filter(d => d !== dishName));
    } else {
      setSelectedDishes([...selectedDishes, dishName]);
    }
  };

  const handleAddCustomDish = () => {
    if (customDish.trim() && !selectedDishes.includes(customDish.trim())) {
      setSelectedDishes([...selectedDishes, customDish.trim()]);
      setCustomDish('');
    }
  };

  // Image Handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      toast.error('画像は最大3枚までアップロードできます');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);

    // Clear input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('認証エラー：再度ログインしてください');
      navigate('/login');
      return;
    }

    if (!selectedRestaurant) {
      toast.error('レストランを選択してください');
      return;
    }
    if (rating === 0) {
      toast.error('評価を選択してください');
      return;
    }
    if (!comment.trim()) {
      toast.error('コメントを入力してください');
      return;
    }
    if (!isConfirmed) {
      toast.error('確認ボックスにチェックを入れてください');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload images to Supabase
      const uploadedImageUrls = [];


      if (images.length > 0) {
        if (!supabase) {
          throw new Error('システム設定エラー: 画像アップロード機能が無効です');
        }

        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('review-images')
            .upload(filePath, image);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('画像のアップロードに失敗しました');
          }

          const { data } = supabase.storage
            .from('review-images')
            .getPublicUrl(filePath);

          uploadedImageUrls.push(data.publicUrl);
        }
      }

      // Combine selected dishes and any pending custom dish
      let finalDishes = [...selectedDishes];
      if (customDish.trim() && !finalDishes.includes(customDish.trim())) {
        finalDishes.push(customDish.trim());
      }

      const reviewData = {
        restaurant_id: selectedRestaurant.id,
        rating,
        comment,
        image_urls: uploadedImageUrls,
        dish_names: finalDishes
      };

      await axios.post(`${API_BASE_URL}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('レビューを投稿しました！');
      navigate(`/restaurants/${selectedRestaurant.id}`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              あなたの体験
            </span>
            を共有しましょう
          </h1>
          <p className="text-slate-500">美味しい食事の思い出をみんなに伝えよう</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative">
          {/* Decorative background blob container with overflow hidden */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 p-8 md:p-10 space-y-8">
            {/* 3. Restaurant Name */}
            <div className="relative z-20">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                レストラン名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={restaurantSearch}
                  onChange={(e) => {
                    setRestaurantSearch(e.target.value);
                    setSelectedRestaurant(null);
                  }}
                  placeholder="レストラン名を入力して検索..."
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-medium text-slate-800"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  )}
                </div>
              </div>

              {/* Dropdown Results */}
              {showDropdown && (
                <div className="absolute z-30 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        onClick={() => handleSelectRestaurant(restaurant)}
                        className="px-5 py-3 hover:bg-orange-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center gap-4 transition-colors"
                      >
                        <img
                          src={restaurant.image_url || 'https://via.placeholder.com/40'}
                          alt={restaurant.name}
                          className="w-12 h-12 rounded-lg object-cover shadow-sm"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{restaurant.name}</div>
                          <div className="text-xs text-slate-500 flex items-center mt-0.5">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            {restaurant.address}
                          </div>
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

            {/* 4. Rating */}
            <div className="relative z-10">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                評価 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-10 h-10 rounded-lg transition-all ${star <= rating
                      ? 'bg-orange-500 text-white shadow-orange-200 shadow-lg scale-110'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Dish Name (Menu Selection) */}
            <div className="relative z-10">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                何を食べた <span className="text-xs font-normal text-slate-400 ml-1">(複数選択可)</span>
              </label>

              {selectedRestaurant ? (
                <>
                  {menuItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1 mb-3">
                      {menuItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleDishSelection(item.name)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${selectedDishes.includes(item.name)
                            ? 'bg-orange-50 border-orange-500 shadow-sm ring-1 ring-orange-200'
                            : 'bg-white border-slate-200 hover:border-orange-300 hover:shadow-sm'
                            }`}
                        >
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800 text-sm truncate">{item.name}</div>
                            <div className="text-xs text-orange-600 font-semibold">
                              {item.price ? `${Math.floor(item.price).toLocaleString('ja-JP')}đ` : ''}
                            </div>
                          </div>
                          {selectedDishes.includes(item.name) && (
                            <div className="text-orange-500">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 italic mb-2">
                      メニュー情報がありません。手動で入力してください。
                    </div>
                  )}

                  {/* Selected Dishes Tags */}
                  {selectedDishes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedDishes.map((dish, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                          {dish}
                          <button
                            type="button"
                            onClick={() => toggleDishSelection(dish)}
                            className="hover:text-orange-900 focus:outline-none"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Manual Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDish}
                      onChange={(e) => setCustomDish(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomDish())}
                      placeholder="その他（手動入力）..."
                      className="flex-1 px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDish}
                      disabled={!customDish.trim()}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      追加
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400 italic mb-2">
                  先にレストランを選択してください
                </div>
              )}
            </div>

            {/* 6. Comment */}
            <div className="relative z-10">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                コメントを書く <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="5"
                placeholder="味、サービス、雰囲気などについて詳しく教えてください..."
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all resize-none font-medium text-slate-800"
              ></textarea>
            </div>

            {/* 7. Add Image */}
            <div className="relative z-10">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                画像を追加 <span className="text-xs font-normal text-slate-400 ml-1">(最大3枚)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Upload Button */}
                {images.length < 3 && (
                  <div className="aspect-square border-2 border-dashed border-slate-300 rounded-2xl hover:bg-orange-50 hover:border-orange-300 transition-all relative group cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-orange-500">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="bg-slate-100 p-3 rounded-full mb-2 group-hover:bg-white group-hover:shadow-md transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-bold">写真を追加</span>
                  </div>
                )}

                {/* Image Previews */}
                {previewUrls.map((url, index) => (
                  <div key={index} className="aspect-square relative rounded-2xl overflow-hidden shadow-md group">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 transform hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Checkbox */}
            <div className="relative z-10">
              <label className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 transition-all checked:border-orange-500 checked:bg-orange-500 hover:border-orange-400"
                  />
                  <svg
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm text-slate-600 font-medium pt-0.5 group-hover:text-slate-800 transition-colors">
                  このレビューは私の正直な体験に基づいていることを証明します。虚偽のレビューはコミュニティガイドラインに違反します。
                </span>
              </label>
            </div>

            {/* 9. Submit Button */}
            <div className="flex justify-center pt-4 relative z-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-16 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transform transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    送信中...
                  </>
                ) : (
                  <>
                    レビューを投稿
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 10. FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="h-px w-12 bg-slate-200"></span>
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">FAQ</h3>
            <span className="h-px w-12 bg-slate-200"></span>
          </div>

          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">Q</span>
                悪い評価を書いても大丈夫ですか？
              </h4>
              <p className="text-sm text-slate-500 pl-8 leading-relaxed">
                はい、正直な感想であれば問題ありません。ただし、個人的な攻撃や事実と異なる内容、差別的な表現はご遠慮ください。
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">Q</span>
                写真は必須ですか？
              </h4>
              <p className="text-sm text-slate-500 pl-8 leading-relaxed">
                いいえ、必須ではありません。しかし、写真があるレビューは他のユーザーにとってより参考になり、信頼性も高まります。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WriteReview;
