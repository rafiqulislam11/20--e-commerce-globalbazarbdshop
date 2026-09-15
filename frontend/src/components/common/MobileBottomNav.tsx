import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';

interface MobileBottomNavProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onNavigate, currentPage }) => {
  const { t } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            currentPage === 'home' ? 'text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">{t('nav.home')}</span>
        </button>

        <button
          onClick={() => onNavigate('shop')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            currentPage === 'shop' ? 'text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">{t('nav.shop')}</span>
        </button>

        <button
          onClick={() => onNavigate('wishlist')}
          className={`relative flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            currentPage === 'wishlist' ? 'text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 right-2 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
          <span className="text-[10px]">{t('nav.wishlist')}</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-gray-500 hover:text-teal-700 transition-colors cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">{t('nav.cart')}</span>
        </button>

        <button
          onClick={() => onNavigate('account')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            currentPage === 'account' ? 'text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">{t('nav.account')}</span>
        </button>
      </div>
    </div>
  );
};
