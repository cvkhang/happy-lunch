import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';

const MenuManagementModal = ({ restaurant, onClose }) => {
  const { token } = useAuthStore();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenu, setCurrentMenu] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
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

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/admin/menu-items?page=${page}&limit=5&restaurant_id=${restaurant.id}`;
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
  }, [page, debouncedSearch, restaurant.id]);

  const handleEdit = (menu) => {
    setCurrentMenu(menu);
    setFormData({
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
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let imageUrl = formData.image_url;

      // Upload image to Supabase if it's a File object
      if (formData.image_url instanceof File) {
        if (!supabase) {
          throw new Error('システム設定エラー: 画像アップロード機能が無効です');
        }

        const file = formData.image_url;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `menu-items/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('menu-images') // Assuming a bucket for menu images
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from('menu-images')
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      const data = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        restaurant_id: restaurant.id,
        image_url: imageUrl
      };

      if (currentMenu) {
        await axios.put(`${API_BASE_URL}/admin/menu-items/${currentMenu.id}`, data, config);
        toast.success('メニュー情報を更新しました');
      } else {
        await axios.post(`${API_BASE_URL}/admin/menu-items`, data, config);
        toast.success('新しいメニューを追加しました');
      }

      setIsEditing(false);
      fetchMenuItems();
    } catch (error) {
      console.error(error);
      toast.error(error.message || '保存に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">メニュー管理</h3>
            <p className="text-slate-400 text-sm">{restaurant.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="メニュー名で検索..."
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

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                            <th className="p-4 font-semibold">価格</th>
                            <th className="p-4 font-semibold text-right">アクション</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {menuItems.length > 0 ? (
                            menuItems.map((item) => (
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
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="p-8 text-center text-slate-500">
                                メニューが見つかりませんでした
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
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
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  {currentMenu ? 'メニュー編集' : '新規メニュー追加'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">画像</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {formData.image_url ? (
                        <img
                          src={typeof formData.image_url === 'string' ? formData.image_url : URL.createObjectURL(formData.image_url)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">No Img</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, image_url: file });
                          }
                        }}
                        className="w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-orange-50 file:text-orange-700
                          hover:file:bg-orange-100
                        "
                      />
                      <p className="text-xs text-slate-500 mt-1 ml-32">推奨: 1MB以下のJPG/PNG</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">説明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none h-24"
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
      </div>
    </div>
  );
};

export default MenuManagementModal;
