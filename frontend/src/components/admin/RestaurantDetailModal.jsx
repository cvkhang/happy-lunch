import React, { useState } from 'react';
import MenuManagementModal from './MenuManagementModal';

const RestaurantDetailModal = ({ restaurant, onClose, onEdit }) => {
  const [showMenuModal, setShowMenuModal] = useState(false);

  if (showMenuModal) {
    return (
      <MenuManagementModal
        restaurant={restaurant}
        onClose={() => setShowMenuModal(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 p-6 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-800 overflow-hidden border border-slate-700">
              {restaurant.image_url ? (
                <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-medium">No Img</div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{restaurant.name}</h3>
              <p className="text-slate-400 text-sm">{restaurant.address}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">電話番号</p>
              <p className="text-slate-800 font-medium">{restaurant.phone || '未設定'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">営業時間</p>
              <p className="text-slate-800 font-medium">{restaurant.opening_hours || '未設定'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">料理ジャンル</p>
              <p className="text-slate-800 font-medium">{restaurant.cuisine_type || '未設定'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">評価</p>
              <p className="text-orange-500 font-bold">★ {Number(restaurant.rating).toFixed(1)}</p>
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">説明</p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {restaurant.description || '説明はありません。'}
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 pt-4 border-t border-slate-100">
            <p>作成: {restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString('ja-JP') : 'N/A'}</p>
            <p>更新: {restaurant.updatedAt ? new Date(restaurant.updatedAt).toLocaleDateString('ja-JP') : 'N/A'}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={() => setShowMenuModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            メニュー管理
          </button>
          <button
            onClick={() => {
              onEdit(restaurant);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            編集
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailModal;
