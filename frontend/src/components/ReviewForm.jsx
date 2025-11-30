import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

import { supabase } from '../config/supabase';

const ReviewForm = ({ restaurantId, onReviewAdded }) => {
  const { user, isAuthenticated, token } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  // ... (handleImageChange and removeImage remain mostly the same, but we might need to verify file types if strict)

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      toast.error('画像は最大3枚までアップロードできます');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('レビューを書くにはログインが必要です');
      return;
    }

    setLoading(true);
    try {
      const imageUrls = [];

      // Upload images to Supabase
      if (images.length > 0) {
        if (!supabase) {
          throw new Error('Supabase client is not initialized');
        }

        for (const file of images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('review-images')
            .upload(filePath, file);

          if (uploadError) {
            throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`);
          }

          const { data: publicUrlData } = supabase.storage
            .from('review-images')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrlData.publicUrl);
        }
      }

      // Send data to backend as JSON
      const reviewData = {
        restaurant_id: restaurantId,
        rating: Number(rating),
        comment: comment,
        image_urls: imageUrls // Send array of URLs
      };

      await axios.post(
        `${API_BASE_URL}/reviews`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('レビューが投稿されました');
      setComment('');
      setImages([]);
      setPreviewUrls([]);
      setRating(5);
      onReviewAdded();
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error.message || error.response?.data?.message || 'エラーが発生しました');
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

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">画像 (任意)</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {/* Upload Button */}
            {images.length < 3 && (
              <div className="aspect-square border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors relative flex flex-col items-center justify-center text-slate-400 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-2xl">+</span>
                <span className="text-xs">追加</span>
              </div>
            )}

            {/* Previews */}
            {previewUrls.map((url, index) => (
              <div key={index} className="aspect-square relative rounded-xl overflow-hidden border border-slate-200 group">
                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">最大3枚までアップロードできます</p>
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
