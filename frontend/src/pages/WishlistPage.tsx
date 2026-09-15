import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types/index';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  onNavigate: (page: string, param?: string) => void;
  onQuickView: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { lang, formatPrice, t } = useLanguage();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4 select-none">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t('nav.wishlist')} খালি</h2>
        <p className="text-xs text-gray-500">আপনার পছন্দের পণ্যগুলোতে লাভ আইকনে ক্লিক করে সংরক্ষণ করুন।</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all"
        >
          {t('cart.start_shopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900">{t('nav.wishlist')} ({wishlist.length})</h1>
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
        >
          {t('cart.continue_shopping')} →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map(p => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
          >
            <div
              onClick={() => onNavigate('product', p.slug)}
              className="relative pt-[100%] bg-gray-50 rounded-xl overflow-hidden cursor-pointer mb-3"
            >
              <img
                src={p.primary_image || (p.images && p.images[0]?.image_url) || ''}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            <div className="space-y-1 mb-3">
              <h3
                onClick={() => onNavigate('product', p.slug)}
                className="text-xs sm:text-sm font-bold text-gray-900 truncate cursor-pointer hover:text-teal-700"
              >
                {lang === 'bn' ? p.name_bn || p.name_en : p.name_en}
              </h3>
              <p className="text-sm font-black text-teal-800">
                {formatPrice(p.sale_price || p.price)}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => addToCart(p, 1)}
                className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>কার্টে নিন</span>
              </button>

              <button
                onClick={() => removeFromWishlist(p.id)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
