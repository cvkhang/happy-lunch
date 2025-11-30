import React from 'react';

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/20">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
              {user.role === 'admin' ? '管理者' : 'ユーザー'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
              {user.is_blocked ? 'ブロック中' : 'アクティブ'}
            </span>
            {user.account_type && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                {user.account_type === 'family' ? '家族アカウント' : '個人アカウント'}
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">ユーザーID</p>
              <p className="font-mono text-slate-700">#{user.id}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">登録日</p>
              <p className="font-medium text-slate-700">
                {new Date(user.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">最終アクティブ</p>
              <p className="font-medium text-slate-700">
                {user.last_active_at
                  ? new Date(user.last_active_at).toLocaleString('ja-JP')
                  : '未記録'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">住所</p>
              <p className="font-medium text-slate-700 truncate" title={user.address}>
                {user.address || '未設定'}
              </p>
            </div>
          </div>

          {/* Intro */}
          <div>
            <p className="text-slate-500 text-xs mb-2 font-bold uppercase tracking-wider">自己紹介</p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed">
              {user.intro || '自己紹介はまだありません。'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
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

export default UserDetailModal;
