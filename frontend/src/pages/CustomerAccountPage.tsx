import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Order, Product } from '../types/index';
import { fetchApi } from '../services/api';
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';

interface CustomerAccountPageProps {
  initialTab?: 'orders' | 'profile' | 'wishlist';
  onNavigate: (page: string, param?: string) => void;
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({
  initialTab = 'orders',
  onNavigate
}) => {
  const { lang, formatPrice, t } = useLanguage();
  const { user, logout, updateProfile } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoadingOrders(false);
      return;
    }
    fetchApi<{ success: boolean; orders: Order[] }>('/orders/my-orders')
      .then(res => {
        if (res.success && res.orders) setOrders(res.orders);
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">অনুগ্রহ করে লগইন করুন</h2>
        <p className="text-xs text-gray-500">অ্যাকাউন্ট দেখতে আপনাকে লগইন করতে হবে।</p>
        <button
          onClick={() => onNavigate('auth', 'login')}
          className="px-6 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold"
        >
          {t('nav.login')}
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await updateProfile(name, phone);
      setProfileMsg('প্রোফাইল সফলভাবে আপডেট করা হয়েছে।');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none space-y-6">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
        {t('nav.account')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Account Sidebar Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            {/* User Profile Card */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">{user.name}</h3>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full uppercase">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'orders' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>{t('nav.my_orders')}</span>
                </div>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-full text-[11px]">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'profile' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>প্রোফাইল সেটিংস (Profile Settings)</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  activeTab === 'wishlist' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4" />
                  <span>{t('nav.wishlist')}</span>
                </div>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-full text-[11px]">
                  {wishlist.length}
                </span>
              </button>

              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={logout}
                  className="w-full text-left p-3 rounded-xl flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content Panel (8 cols) */}
        <div className="lg:col-span-8">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                {t('nav.my_orders')} ({orders.length})
              </h2>

              {loadingOrders ? (
                <div className="py-8 text-center text-xs text-gray-500">লোড হচ্ছে...</div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500">আপনার এখনো কোনো অর্ডার নেই।</p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="px-5 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold"
                  >
                    {t('cart.start_shopping')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(ord => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200/60">
                        <div>
                          <p className="font-mono font-bold text-teal-900 text-xs sm:text-sm">
                            {ord.order_number}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(ord.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800">
                            {ord.order_status}
                          </span>
                          <span className="text-xs font-black text-gray-900 font-mono">
                            {formatPrice(ord.grand_total)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-gray-500">
                          পেমেন্ট: <strong>{ord.payment_method}</strong> ({ord.payment_status})
                        </span>

                        <button
                          onClick={() =>
                            onNavigate(
                              'tracking',
                              `order_number=${ord.order_number}&phone=${ord.customer_phone}`
                            )
                          }
                          className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-teal-600 text-teal-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Truck className="w-3.5 h-3.5 text-teal-700" />
                          <span>ট্র্যাক করুন</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Edit Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                প্রোফাইল তথ্য ও সেটিংস
              </h2>

              {profileMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{profileMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    পুরো নাম (Full Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ইমেইল (Email)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-xs p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    মোবাইল নম্বর (Phone)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="০১৭১১-XXXXXX"
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
                </button>
              </form>
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                {t('nav.wishlist')} ({wishlist.length})
              </h2>

              {wishlist.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500">আপনার পছন্দের তালিকা বর্তমানে খালি।</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {wishlist.map(p => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div
                        onClick={() => onNavigate('product', p.slug)}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <img
                          src={p.primary_image || (p.images && p.images[0]?.image_url) || ''}
                          alt=""
                          className="w-14 h-14 object-cover rounded-xl border border-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {lang === 'bn' ? p.name_bn : p.name_en}
                          </p>
                          <p className="text-xs font-bold text-teal-800 mt-0.5">
                            {formatPrice(p.sale_price || p.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="px-3 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition-colors cursor-pointer"
                        >
                          কার্টে নিন
                        </button>
                        <button
                          onClick={() => removeFromWishlist(p.id)}
                          className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          মুছুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
