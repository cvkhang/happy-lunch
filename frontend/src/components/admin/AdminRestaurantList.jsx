import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import toast from 'react-hot-toast';
import RestaurantDetailModal from './RestaurantDetailModal';
import RestaurantEditModal from './RestaurantEditModal';

const AdminRestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

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
      setRestaurants(Array.isArray(response.data) ? response.data : []);
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
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentRestaurant(null);
    setIsEditing(true);
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRestaurants = React.useMemo(() => {
    let sortableItems = Array.isArray(restaurants) ? [...restaurants] : [];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle numeric values specifically if needed, but JS sort works okay for simple types usually.
        // For rating, ensure it's treated as number
        if (sortConfig.key === 'rating') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [restaurants, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="text-slate-300 ml-1">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-orange-500 ml-1">↑</span> : <span className="text-orange-500 ml-1">↓</span>;
  };

  if (loading) return <div className="text-center py-10">読み込み中...</div>;

  return (
    <div>
      <div className="space-y-4">
        {/* ... (search bar remains same) */}
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
                  <th
                    className="p-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => handleSort('id')}
                  >
                    ID {getSortIcon('id')}
                  </th>
                  <th className="p-4 font-semibold">画像</th>
                  <th
                    className="p-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    店名 {getSortIcon('name')}
                  </th>
                  <th className="p-4 font-semibold">住所</th>
                  <th
                    className="p-4 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => handleSort('rating')}
                  >
                    評価 {getSortIcon('rating')}
                  </th>
                  <th className="p-4 font-semibold text-right">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRestaurants.length > 0 ? (
                  sortedRestaurants.map((restaurant) => (
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
                          onClick={() => setSelectedRestaurant(restaurant)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          詳細
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

      {/* Detail Modal */}
      {selectedRestaurant && (
        <RestaurantDetailModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          onEdit={handleEdit}
        />
      )}

      {/* Edit/Create Modal */}
      {isEditing && (
        <RestaurantEditModal
          restaurant={currentRestaurant}
          onClose={() => setIsEditing(false)}
          onSuccess={() => {
            fetchRestaurants();
            // If we were editing a selected restaurant (from details modal), update it too if needed
            // But for now, fetchRestaurants refreshes the list.
          }}
        />
      )}
    </div>
  );
};

export default AdminRestaurantList;
