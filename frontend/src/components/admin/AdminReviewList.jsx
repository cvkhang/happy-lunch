import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const AdminReviewList = () => {
  const { token } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10
      });

      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`${API_BASE_URL}/admin/reviews?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.total_pages);
      setLoading(false);
    } catch (error) {
      toast.error('レビューの取得に失敗しました');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/reviews/${reviewId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`レビューを${newStatus === 'approved' ? '承認' : '却下'}しました`);
      fetchReviews();
    } catch (error) {
      toast.error('ステータスの更新に失敗しました');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('本当にこのレビューを削除しますか？')) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('レビューを削除しました');
      fetchReviews();
    } catch (error) {
      toast.error('削除に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', ''].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {status === 'pending' && '承認待ち'}
              {status === 'approved' && '承認済み'}
              {status === 'rejected' && '却下済み'}
              {status === '' && 'すべて'}
            </button>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-10">読み込み中...</div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                          {review.User?.avatar_url ? (
                            <img src={review.User.avatar_url} alt={review.User.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                              {review.User?.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{review.User?.name}</p>
                          <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleString('ja-JP')}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                          review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                        }`}>
                        {review.status === 'approved' ? '承認済み' :
                          review.status === 'rejected' ? '却下済み' : '承認待ち'}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-400 text-lg">{'★'.repeat(review.rating)}</span>
                        <span className="text-slate-300 text-lg">{'★'.repeat(5 - review.rating)}</span>
                        <span className="text-slate-600 text-sm font-medium ml-2">
                          @ {review.Restaurant?.name}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{review.comment}</p>
                    </div>

                    {review.image_urls && review.image_urls.length > 0 && (
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {review.image_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Review ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border border-slate-200"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(review.id, 'approved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                          >
                            承認する
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(review.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                          >
                            却下する
                          </button>
                        </>
                      )}
                      {review.status !== 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(review.id, 'pending')}
                          className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                        >
                          ステータスをリセット
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-500">
                  レビューが見つかりませんでした
                </div>
              )}
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

export default AdminReviewList;
