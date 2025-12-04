import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const ReviewItem = ({ review, onReviewUpdated, readOnlyLikes, openGallery }) => {
  const { user, token } = useAuthStore();
  const [isLiked, setIsLiked] = useState(review.liked_by_user);
  const [likeCount, setLikeCount] = useState(review.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setIsLiked(review.liked_by_user);
    setLikeCount(review.like_count || 0);
  }, [review.liked_by_user, review.like_count]);

  const handleLike = async () => {
    if (!user) {
      toast.error('ログインが必要です');
      return;
    }

    if (isLiking) return; // Prevent double clicks

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiking(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (previousIsLiked) {
        await axios.delete(`${API_BASE_URL}/reviews/${review.id}/unlike`, config);
      } else {
        await axios.post(`${API_BASE_URL}/reviews/${review.id}/like`, {}, config);
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('エラーが発生しました');
      // Revert on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('このレビューを削除してもよろしいですか？')) return;

    try {
      await axios.delete(`${API_BASE_URL}/reviews/${review.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('レビューが削除されました');
      onReviewUpdated(); // Trigger refresh for delete
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('削除できませんでした');
    }
  };

  return (
    <div id={`review-${review.id}`} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center text-orange-600 font-bold overflow-hidden">
            {review.User && review.User.avatar_url ? (
              <img src={review.User.avatar_url} alt={review.User.name} className="w-full h-full object-cover" />
            ) : (
              (review.User?.name?.charAt(0).toUpperCase()) || 'U'
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-800">{review.User?.name || 'Unknown User'}</h4>
            <div className="flex items-center text-xs text-slate-400 gap-2">
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              {/* Show Restaurant Name if available */}
              {review.Restaurant && (
                <>
                  <span>•</span>
                  <a href={`/restaurants/${review.Restaurant.id}`} className="text-orange-500 hover:underline font-medium">
                    {review.Restaurant.name}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center bg-orange-50 px-2 py-1 rounded-lg">
            <svg className="w-4 h-4 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-bold text-orange-700">{review.rating}</span>
          </div>

          {/* Status Badge - Only show pending and rejected, not approved */}
          {readOnlyLikes && review.status && review.status !== 'approved' && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${review.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
              {review.status === 'rejected' ? '却下' : '承認待ち'}
            </span>
          )}
        </div>
      </div>

      {/* Dish Names */}
      {review.dish_names && review.dish_names.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {review.dish_names.map((dish, index) => (
            <span key={index} className="px-2.5 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-100">
              {dish}
            </span>
          ))}
        </div>
      )}

      <p className="text-slate-600 mb-4 leading-relaxed">{review.comment}</p>

      {/* Images Display */}
      {((Array.isArray(review.image_urls) && review.image_urls.length > 0) || review.image_url) && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Array.isArray(review.image_urls) && review.image_urls.length > 0 ? (
            review.image_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Review ${index + 1}`}
                className="rounded-xl h-40 w-40 object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity border border-slate-100"
                onClick={() => openGallery(url)}
              />
            ))
          ) : (
            <img
              src={review.image_url}
              alt="Review"
              className="rounded-xl max-h-60 object-cover w-full md:w-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openGallery(review.image_url)}
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        {readOnlyLikes ? (
          <div className="flex items-center space-x-2 text-sm font-medium text-slate-500">
            <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likeCount} いいね</span>
          </div>
        ) : (
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 text-sm font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
              }`}
          >
            <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likeCount} いいね</span>
          </button>
        )}

        {user && user.id === review.user_id && (
          <button
            onClick={handleDelete}
            className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;
