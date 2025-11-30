import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const ReviewForm = ({ restaurantId, onReviewAdded }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('レビューを書くにはログインが必要です');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          restaurant_id: restaurantId,
          rating,
          comment,
          image_url: imageUrl
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('レビューが投稿されました');
      setComment('');
      setImageUrl('');
      setRating(5);
      onReviewAdded();
    } catch (error) {
      toast.error(error.response?.data?.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-200">
        <p className="text-slate-600 mb-4">レビューを書くにはログインしてください</p>
        <a href="/login" className="inline-block px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors">
          ログイン
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">レビューを書く</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">評価</label>
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

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">コメント</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all min-h-[120px]"
            placeholder="このレストランの感想を教えてください..."
            required
          />
        </div>

        {/* Image URL (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">画像URL (任意)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
            placeholder="https://example.com/food.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? '投稿中...' : 'レビューを投稿'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
