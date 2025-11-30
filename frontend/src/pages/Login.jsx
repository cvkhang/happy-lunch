import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success(result.message || 'ログインに成功しました！');
      navigate('/restaurants');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50">
      {/* Decorative Background Elements - Fixed to prevent scrolling issues */}
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob z-0"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 z-0"></div>

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
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-black text-slate-800 mb-8 text-center md:text-left tracking-tight">
            ログイン
          </h2>

          <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl shadow-orange-500/10 border border-white/50">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">ユーザーネーム / Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-300 font-medium text-slate-700"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">パスワード</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all duration-300 font-medium text-slate-700"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center pl-1">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all duration-200"></div>
                    <svg className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                    アカウントを記録する
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ログイン中...
                  </span>
                ) : 'ログイン'}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">まだアカウントがお持ちでない場合は</span>
              <Link
                to="/register"
                className="font-bold text-orange-600 hover:text-orange-700 hover:underline decoration-2 underline-offset-4 transition-all"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
