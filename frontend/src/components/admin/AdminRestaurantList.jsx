import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import toast from 'react-hot-toast';

const AdminRestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    opening_hours: '',
    description: '',
    image_url: '',
    cuisine_type: ''
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await axios.get(`${API_BASE_URL}/restaurants?${params.toString()}`);
      setRestaurants(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('レストランリストの取得に失敗しました');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [debouncedSearch]);

  const handleEdit = (restaurant) => {
    setCurrentRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone || '',
      opening_hours: restaurant.opening_hours || '',
      description: restaurant.description || '',
      image_url: restaurant.image_url || '',
      cuisine_type: restaurant.cuisine_type || ''
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentRestaurant(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      opening_hours: '',
      description: '',
      image_url: '',
      cuisine_type: ''
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (currentRestaurant) {
        await axios.put(`${API_BASE_URL}/restaurants/${currentRestaurant.id}`, formData, config);
        toast.success('レストラン情報を更新しました');
      } else {
        await axios.post(`${API_BASE_URL}/restaurants`, formData, config);
        toast.success('新しいレストランを追加しました');
      }

      setIsEditing(false);
      fetchRestaurants();
    } catch (error) {
      toast.error('保存に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('削除しました');
      fetchRestaurants();
    } catch (error) {
      toast.error('削除に失敗しました');
    }
  };

  if (loading) return <div className="text-center py-10">読み込み中...</div>;

  return (
    <div>
      {!isEditing ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="レストラン名で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
              />
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium whitespace-nowrap"
            >
              + 新規追加
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-700">レストラン一覧</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">画像</th>
                    <th className="p-4 font-semibold">店名</th>
                    <th className="p-4 font-semibold">住所</th>
                    <th className="p-4 font-semibold">評価</th>
                    <th className="p-4 font-semibold text-right">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {restaurants.length > 0 ? (
                    restaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500">#{restaurant.id}</td>
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                            {restaurant.image_url ? (
                              <img src={restaurant.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Img</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-800">{restaurant.name}</td>
                        <td className="p-4 text-slate-600 text-sm max-w-xs truncate">{restaurant.address}</td>
                        <td className="p-4 text-orange-500 font-medium">★ {Number(restaurant.rating).toFixed(1)}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleEdit(restaurant)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-800"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        レストランが見つかりませんでした
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {currentRestaurant ? 'レストラン編集' : '新規レストラン追加'}
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              キャンセル
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">店名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">住所</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">電話番号</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">営業時間</label>
                <input
                  type="text"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">料理ジャンル</label>
              <input
                type="text"
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                placeholder="例: 日本料理, イタリアン"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">画像URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">説明</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none h-32"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium shadow-sm"
              >
                保存する
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminRestaurantList;
