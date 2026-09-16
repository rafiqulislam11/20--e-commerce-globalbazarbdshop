import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';

interface AuthPageProps {
  initialTab?: 'login' | 'register';
  onNavigate: (page: string, param?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialTab = 'login', onNavigate }) => {
  const { lang, t } = useLanguage();
  const { login, register, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect
  if (user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {lang === 'bn' ? `স্বাগতম, ${user.name}!` : `Welcome, ${user.name}!`}
        </h2>
        <p className="text-xs text-gray-500">
          {lang === 'bn' ? 'আপনি ইতিমধ্যে লগইন অবস্থায় আছেন।' : 'You are currently logged in.'}
        </p>
        <button
          onClick={() => onNavigate('account')}
          className="px-6 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold"
        >
          {t('nav.account')}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email.trim(), password);
        onNavigate('home');
      } else {
        await register(name.trim(), email.trim(), phone.trim(), password);
        onNavigate('home');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string, targetPage?: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setActiveTab('login');
    setErrorMsg('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      onNavigate(targetPage || 'home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 select-none space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {activeTab === 'login' ? t('nav.login') : t('nav.register')}
        </h1>
        <p className="text-xs text-gray-500">
          গ্লোবাল বাজার বিডি শপে নিরাপদ শপিং করতে আপনার অ্যাকাউন্টে প্রবেশ করুন
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Tab switch */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'login' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-black'
            }`}
          >
            {t('nav.login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'register' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600 hover:text-black'
            }`}
          >
            {t('nav.register')}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('checkout.full_name')} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="আপনার পুরো নাম..."
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('checkout.email')} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full text-xs pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('checkout.phone')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="০১৭১১-XXXXXX"
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              পাসওয়ার্ড *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড..."
                className="w-full text-xs pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {activeTab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>
              {loading
                ? 'অনুরোধ যাচাই হচ্ছে...'
                : activeTab === 'login'
                ? t('nav.login')
                : t('nav.register')}
            </span>
          </button>
        </form>

        {/* Demo Accounts Helper for Instant Testing */}
        <div className="pt-4 border-t border-gray-100 text-xs">
          <p className="font-bold text-gray-700 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>এক ক্লিকে ডেমো লগইন পরীক্ষা করুন:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@globalbazarbd.com', 'Admin@123456', 'admin')}
              className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold text-center hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <span className="block font-bold">🛠️ Admin (ড্যাশবোর্ড)</span>
              <span className="text-[10px] text-teal-700">admin@... (1-Click)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('staff@globalbazarbd.com', 'Staff@123456', 'admin')}
              className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-semibold text-center hover:bg-sky-100 transition-colors cursor-pointer"
            >
              <span className="block font-bold">Staff (অর্ডার)</span>
              <span className="text-[10px] text-sky-700">staff@... (1-Click)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('tanvir.hasan@gmail.com', 'Customer@123456', 'account')}
              className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-semibold text-center hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span className="block font-bold">Customer</span>
              <span className="text-[10px] text-gray-500">tanvir@... (1-Click)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
