import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import toast from 'react-hot-toast';

const AdminMenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    restaurant_id: '',
    name: '',
    description: '',
    price: '',
    image_url: ''
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch restaurants for dropdown
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/restaurants`);
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants');
      }
    };
    fetchRestaurants();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/admin/menu-items?page=${page}&limit=10`;
      if (selectedRestaurant) {
        url += `&restaurant_id=${selectedRestaurant}`;
      }
      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMenuItems(response.data.menuItems);
      setTotalPages(response.data.pagination.totalPages);
      setLoading(false);
    } catch (error) {
      toast.error('メニューリストの取得に失敗しました');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [page, selectedRestaurant, debouncedSearch]);

  const handleEdit = (menu) => {
    setCurrentMenu(menu);
    setFormData({
      restaurant_id: menu.restaurant_id,
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      image_url: menu.image_url || ''
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentMenu(null);
    setFormData({
      restaurant_id: selectedRestaurant || (restaurants[0]?.id || ''),
      name: '',
      description: '',
      price: '',
      image_url: ''
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (currentMenu) {
        await axios.put(`${API_BASE_URL}/admin/menu-items/${currentMenu.id}`, formData, config);
        toast.success('メニュー情報を更新しました');
      } else {
        await axios.post(`${API_BASE_URL}/admin/menu-items`, formData, config);
        toast.success('新しいメニューを追加しました');
      }

      setIsEditing(false);
      fetchMenuItems();
    } catch (error) {
      toast.error('保存に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/admin/menu-items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('削除しました');
      fetchMenuItems();
    } catch (error) {
      toast.error('削除に失敗しました');
    }
  };

  return (
    <div>
      {!isEditing ? (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="メニュー名で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select
                value={selectedRestaurant}
                onChange={(e) => {
                  setSelectedRestaurant(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-full md:w-64"
              >
                <option value="">すべてのレストラン</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium whitespace-nowrap"
              >
                + 新規追加
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-700">メニュー一覧</h3>
            </div>

            {loading ? (
              <div className="text-center py-10">読み込み中...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">画像</th>
                        <th className="p-4 font-semibold">メニュー名</th>
                        <th className="p-4 font-semibold">レストラン</th>
                        <th className="p-4 font-semibold">価格</th>
                        <th className="p-4 font-semibold text-right">アクション</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {menuItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                              {item.image_url ? (
                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Img</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-slate-800">{item.name}</td>
                          <td className="p-4 text-slate-600 text-sm">{item.Restaurant?.name}</td>
                          <td className="p-4 text-orange-600 font-medium">
                            {Number(item.price).toLocaleString('ja-JP')}đ
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-800"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 flex justify-between items-center">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                  >
                    前へ
                  </button>
                  <span className="text-slate-600">ページ {page} / {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                  >
                    次へ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {currentMenu ? 'メニュー編集' : '新規メニュー追加'}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">レストラン</label>
              <select
                value={formData.restaurant_id}
                onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                required
              >
                <option value="">選択してください</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">メニュー名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">価格 (VND)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                required
                min="0"
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

export default AdminMenuList;
