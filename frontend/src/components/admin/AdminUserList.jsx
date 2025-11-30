import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import toast from 'react-hot-toast';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        page,
        limit: 10
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('is_blocked', statusFilter === 'blocked' ? 'true' : 'false');

      const response = await axios.get(`${API_BASE_URL}/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
      setLoading(false);
    } catch (error) {
      toast.error('ユーザーリストの取得に失敗しました');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  const handleBlockUser = async (userId, isBlocked) => {
    if (!window.confirm(isBlocked ? 'このユーザーのブロックを解除しますか？' : 'このユーザーをブロックしますか？')) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = isBlocked ? 'unblock' : 'block';
      await axios.put(`${API_BASE_URL}/admin/users/${userId}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(isBlocked ? 'ブロックを解除しました' : 'ユーザーをブロックしました');
      fetchUsers();
    } catch (error) {
      toast.error('操作に失敗しました');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('本当にこのユーザーを削除しますか？この操作は取り消せません。')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('ユーザーを削除しました');
      fetchUsers();
    } catch (error) {
      toast.error('削除に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="名前またはメールで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-slate-300 rounded-lg outline-none"
        >
          <option value="">すべての役割</option>
          <option value="user">ユーザー</option>
          <option value="admin">管理者</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-slate-300 rounded-lg outline-none"
        >
          <option value="">すべてのステータス</option>
          <option value="active">アクティブ</option>
          <option value="blocked">ブロック中</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-10">読み込み中...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">名前</th>
                    <th className="p-4 font-semibold">メール</th>
                    <th className="p-4 font-semibold">役割</th>
                    <th className="p-4 font-semibold">ステータス</th>
                    <th className="p-4 font-semibold text-right">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500">#{user.id}</td>
                        <td className="p-4 font-medium text-slate-800">{user.name}</td>
                        <td className="p-4 text-slate-600">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {user.role === 'admin' ? '管理者' : 'ユーザー'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {user.is_blocked ? 'ブロック中' : 'アクティブ'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleBlockUser(user.id, user.is_blocked)}
                            className={`text-sm font-medium ${user.is_blocked ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'
                              }`}
                          >
                            {user.is_blocked ? '解除' : 'ブロック'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
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
                        ユーザーが見つかりませんでした
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
  );
};

export default AdminUserList;
