import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { Category } from '../../types/index';
import { fetchApi } from '../../services/api';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  Flame,
  Globe,
  Sparkles,
  LayoutDashboard,
  Package,
  LogOut,
  MapPin,
  ShieldCheck,
  Phone,
  MessageCircle
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { lang, setLang, t, formatPrice } = useLanguage();
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout, isAdmin, isStaff } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ products: any[]; categories: any[]; brands: any[] }>({
    products: [],
    categories: [],
    brands: []
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApi<{ success: boolean; categories: Category[] }>('/categories')
      .then(res => {
        if (res.success) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  // Handle live search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions({ products: [], categories: [], brands: [] });
      return;
    }

    const timer = setTimeout(() => {
      fetchApi<{ success: boolean; products: any[]; categories: any[]; brands: any[] }>(
        `/products/suggestions?q=${encodeURIComponent(searchQuery)}`
      )
        .then(res => {
          if (res.success) {
            setSuggestions({
              products: res.products || [],
              categories: res.categories || [],
              brands: res.brands || []
            });
            setShowSuggestions(true);
          }
        })
        .catch(() => {});
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onNavigate('shop', `search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      {/* Top Utility Bar */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-100 text-xs text-gray-600 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-teal-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {lang === 'bn' ? '১০০% আসল পণ্যের নিশ্চয়তা' : '100% Authentic Products'}
            </span>
            <span className="text-gray-300">|</span>
            <a
              href="tel:01310824987"
              className="flex items-center gap-1 text-gray-700 hover:text-teal-700 font-medium transition-colors cursor-pointer"
              title="Call Helpline"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-mono">01310-824987</span>
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="https://wa.me/8801310824987"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium transition-colors cursor-pointer"
              title="WhatsApp Chat"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('tracking')}
              className="hover:text-teal-700 font-medium transition-colors cursor-pointer"
            >
              {t('nav.track_order')}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-teal-700 font-medium transition-colors cursor-pointer"
            >
              {t('nav.contact')}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => onNavigate('admin')}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/60 font-bold px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-105"
              title="Admin Panel & Product Management"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{lang === 'bn' ? '🛠️ অ্যাডমিন প্যানেল' : '🛠️ Admin Panel'}</span>
            </button>
            <span className="text-gray-300">|</span>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-gray-200/70 p-0.5 rounded-md">
              <button
                onClick={() => setLang('bn')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  lang === 'bn' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-teal-700 text-white shadow-xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Branding & Search Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-teal-700 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-teal-700 to-sky-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
                <span className="tracking-tighter">GB</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 leading-none">
                    GLOBAL BAZAR
                  </span>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                    BD
                  </span>
                </div>
                <p className="text-[11px] font-medium text-teal-700 leading-tight">
                  {lang === 'bn' ? 'স্মার্ট শপিং, সহজ জীবন' : 'Shop Smart. Live Better.'}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Search Bar with Live Suggestions */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                }}
                placeholder={t('header.search_placeholder')}
                className="w-full pl-4 pr-24 py-2.5 text-sm bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-gray-200 focus:border-teal-600 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-600/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'খুঁজুন' : 'Search'}</span>
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-50 animate-in fade-in-50 duration-150">
                {suggestions.products.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
                      {lang === 'bn' ? 'পণ্যসমূহ' : 'Products'}
                    </p>
                    <div className="space-y-1">
                      {suggestions.products.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setShowSuggestions(false);
                            onNavigate('product', p.slug);
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-teal-50/60 rounded-xl cursor-pointer transition-colors"
                        >
                          <img
                            src={p.image}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg bg-gray-100 border border-gray-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {lang === 'bn' ? p.name_bn || p.name_en : p.name_en}
                            </p>
                            <p className="text-xs font-bold text-teal-700">
                              {formatPrice(p.sale_price || p.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.categories.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
                      {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {suggestions.categories.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setShowSuggestions(false);
                            onNavigate('shop', `category=${c.slug}`);
                          }}
                          className="text-xs bg-gray-100 hover:bg-teal-100 hover:text-teal-800 text-gray-700 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer"
                        >
                          {lang === 'bn' ? c.name_bn : c.name_en}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.products.length === 0 && suggestions.categories.length === 0 && (
                  <div className="py-4 text-center text-xs text-gray-500">
                    {lang === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching results found'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons: Wishlist, Cart, Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2.5 text-gray-700 hover:text-teal-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              title={t('nav.wishlist')}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100/80 text-teal-800 px-3 py-2 rounded-full transition-all cursor-pointer border border-teal-200/70"
              title={t('nav.cart')}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-teal-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold text-xs">
                {formatPrice(subtotal)}
              </span>
            </button>

            {/* Account Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-gray-700 hover:text-teal-800 rounded-full sm:rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs">
                  {user ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <span className="hidden lg:inline text-xs font-semibold max-w-[90px] truncate">
                  {user ? user.name.split(' ')[0] : t('nav.account')}
                </span>
                <ChevronDown className="hidden lg:inline w-3 h-3 text-gray-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in-50 duration-150"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase">
                          {user.role}
                        </span>
                      </div>

                      {(isAdmin || isStaff) && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-50 flex items-center gap-2 cursor-pointer"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {t('admin.dashboard')}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('account', 'orders');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        {t('nav.my_orders')}
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('account', 'profile');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        {t('nav.account')}
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('auth', 'login');
                        }}
                        className="w-full text-center py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        {t('nav.login')}
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('auth', 'register');
                        }}
                        className="w-full text-center py-2 text-gray-700 hover:text-teal-700 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        {t('nav.register')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Visible only on mobile below main header) */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('header.search_placeholder')}
              className="w-full pl-4 pr-10 py-2 text-xs bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-700"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Navigation & Category Mega Bar */}
      <nav className="hidden lg:block bg-teal-800 text-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1">
            {/* All Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCatMenuOpen(!isCatMenuOpen)}
                className="bg-teal-900 hover:bg-teal-950 text-white px-4 py-3 flex items-center gap-2 font-bold cursor-pointer transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>{t('nav.all_categories')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCatMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCatMenuOpen && (
                <div
                  onMouseLeave={() => setIsCatMenuOpen(false)}
                  className="absolute left-0 top-full w-64 bg-white text-gray-900 rounded-b-2xl shadow-2xl border border-gray-200 py-2 z-50 max-h-[70vh] overflow-y-auto"
                >
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setIsCatMenuOpen(false);
                        onNavigate('shop', `category=${cat.slug}`);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between group transition-colors cursor-pointer"
                    >
                      <span className="font-semibold">{lang === 'bn' ? cat.name_bn : cat.name_en}</span>
                      {cat.product_count !== undefined && (
                        <span className="text-[10px] bg-gray-100 group-hover:bg-teal-200 text-gray-600 px-1.5 py-0.5 rounded-full font-mono">
                          {cat.product_count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-3 hover:bg-teal-700/60 font-semibold transition-colors cursor-pointer ${
                currentPage === 'home' ? 'bg-teal-700' : ''
              }`}
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className={`px-3 py-3 hover:bg-teal-700/60 font-semibold transition-colors cursor-pointer ${
                currentPage === 'shop' ? 'bg-teal-700' : ''
              }`}
            >
              {t('nav.shop')}
            </button>
            <button
              onClick={() => onNavigate('shop', 'flash_sale=true')}
              className="px-3 py-3 hover:bg-teal-700/60 font-bold text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-300 animate-pulse" />
              <span>{t('nav.flash_sale')}</span>
            </button>
            <button
              onClick={() => onNavigate('shop', 'sort=popular')}
              className="px-3 py-3 hover:bg-teal-700/60 transition-colors cursor-pointer"
            >
              {t('nav.best_sellers')}
            </button>
            <button
              onClick={() => onNavigate('shop', 'sort=newest')}
              className="px-3 py-3 hover:bg-teal-700/60 transition-colors cursor-pointer"
            >
              {t('nav.new_arrivals')}
            </button>
            <button
              onClick={() => onNavigate('shop', 'on_sale=true')}
              className="px-3 py-3 hover:bg-teal-700/60 transition-colors cursor-pointer"
            >
              {t('nav.offers')}
            </button>
            <button
              onClick={() => onNavigate('blog')}
              className="px-3 py-3 hover:bg-teal-700/60 transition-colors cursor-pointer"
            >
              {t('nav.blog')}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('tracking')}
              className="hover:text-amber-300 transition-colors font-medium cursor-pointer"
            >
              {t('nav.track_order')}
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                  GB
                </div>
                <span className="font-extrabold text-sm text-gray-900">GLOBAL BAZAR BD</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switcher in Mobile Drawer */}
            <div className="flex items-center justify-between bg-gray-100 p-1 rounded-lg mb-4">
              <button
                onClick={() => setLang('bn')}
                className={`flex-1 py-1 text-xs font-bold rounded ${
                  lang === 'bn' ? 'bg-teal-700 text-white' : 'text-gray-700'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`flex-1 py-1 text-xs font-bold rounded ${
                  lang === 'en' ? 'bg-teal-700 text-white' : 'text-gray-700'
                }`}
              >
                English
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 text-sm font-semibold">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-800"
              >
                {t('nav.home')}
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('shop');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-800"
              >
                {t('nav.shop')}
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('shop', 'flash_sale=true');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 text-amber-600 font-bold flex items-center gap-1.5"
              >
                <Flame className="w-4 h-4 fill-amber-500" />
                {t('nav.flash_sale')}
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('tracking');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-800"
              >
                {t('nav.track_order')}
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('admin');
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                <span>{lang === 'bn' ? '🛠️ অ্যাডমিন প্যানেল' : '🛠️ Admin Panel'}</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('blog');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-800"
              >
                {t('nav.blog')}
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('contact');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 text-gray-800"
              >
                {t('nav.contact')}
              </button>
            </div>

            {/* Categories Header in Mobile */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                {t('nav.categories')}
              </p>
              <div className="space-y-1">
                {categories.slice(0, 10).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('shop', `category=${cat.slug}`);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:text-teal-700 hover:bg-teal-50 rounded"
                  >
                    {lang === 'bn' ? cat.name_bn : cat.name_en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
