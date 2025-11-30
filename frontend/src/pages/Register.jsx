import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nationality: 'vietnam'
  });

  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('パスワードは8文字以上である必要があります');
      return;
    }

    const registerData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      address: formData.nationality === 'japan' ? 'Japan' : 'Vietnam',
      account_type: 'personal'
    };

    const result = await register(registerData);

    if (result.success) {
      toast.success(result.message || 'アカウントが作成されました！');
      navigate('/restaurants');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50">
      {/* Decorative Background Elements - Fixed to prevent scrolling issues */}
      <div className="fixed top-[-10%] left-[-5%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 z-0"></div>

      {/* Auth Header - Matched with Welcome Page */}
      <header className="absolute top-0 left-0 w-full z-50">
        <div className="container mx-auto px-6 py-6 flex items-center">
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight">
              Happy Lunch
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 z-10 pb-20">
        <div className="w-full max-w-lg">
          <h2 className="text-4xl font-black text-slate-800 mb-8 text-center md:text-left tracking-tight">
            新規登録
          </h2>

          <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl shadow-orange-500/10 border border-white/50">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-1 group-focus-within:text-orange-600 transition-colors">ユーザーネーム</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full py-2.5 border-b-2 border-slate-200 focus:border-orange-500 outline-none transition-all bg-transparent font-medium text-slate-800 placeholder-slate-400"
                  placeholder="お名前を入力してください"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-1 group-focus-within:text-orange-600 transition-colors">メール</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full py-2.5 border-b-2 border-slate-200 focus:border-orange-500 outline-none transition-all bg-transparent font-medium text-slate-800 placeholder-slate-400"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-1 group-focus-within:text-orange-600 transition-colors">パスワード</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full py-2.5 border-b-2 border-slate-200 focus:border-orange-500 outline-none transition-all bg-transparent font-medium text-slate-800 placeholder-slate-400"
                  placeholder="8文字以上"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-1 group-focus-within:text-orange-600 transition-colors">パスワード（確認）</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full py-2.5 border-b-2 border-slate-200 focus:border-orange-500 outline-none transition-all bg-transparent font-medium text-slate-800 placeholder-slate-400"
                  placeholder="もう一度入力してください"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Nationality */}
              <div className="space-y-4 pt-2">
                <label className="block text-sm font-bold text-slate-700">国籍</label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer group relative">
                    <input
                      type="radio"
                      name="nationality"
                      value="japan"
                      checked={formData.nationality === 'japan'}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 peer-checked:border-orange-500 peer-checked:border-[6px] transition-all duration-300"></div>
                    <span className="ml-3 font-medium text-slate-600 group-hover:text-slate-800 peer-checked:text-slate-900 transition-colors">日本人</span>
                  </label>

                  <label className="flex items-center cursor-pointer group relative">
                    <input
                      type="radio"
                      name="nationality"
                      value="vietnam"
                      checked={formData.nationality === 'vietnam'}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 peer-checked:border-orange-500 peer-checked:border-[6px] transition-all duration-300"></div>
                    <span className="ml-3 font-medium text-slate-600 group-hover:text-slate-800 peer-checked:text-slate-900 transition-colors">ベトナム人</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-500">
                  <span className="mr-2">すでにアカウントをお持ちですか？<br></br></span>
                  <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 hover:underline transition-all">ログイン</Link>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? '登録中...' : '登録する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
