import React, { useState } from 'react';
import { Product } from '../../types/index';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, ShoppingBag, Eye, Star, Flame } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, param?: string) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, onQuickView }) => {
  const { lang, formatPrice, t } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [isAddedAnim, setIsAddedAnim] = useState(false);

  const price = product.price;
  const salePrice = product.sale_price || (product.is_flash_sale && product.flash_sale_price ? product.flash_sale_price : null);
  const currentPrice = salePrice !== null ? salePrice : price;

  const discountPercent = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const wishlisted = isInWishlist(product.id);
  const primaryImg = product.primary_image || (product.images && product.images[0]?.image_url) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsAddedAnim(true);
    setTimeout(() => setIsAddedAnim(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <div
      onClick={() => onNavigate('product', product.slug)}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* Top Media & Badges */}
      <div className="relative pt-[100%] bg-gray-50 overflow-hidden">
        <img
          src={primaryImg}
          alt={lang === 'bn' ? product.name_bn : product.name_en}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.is_flash_sale === 1 && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 fill-white" />
              HOT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 shadow-md'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-rose-600 shadow-sm'
          }`}
          title={t('nav.wishlist')}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Quick View Button (desktop hover) */}
        <button
          onClick={handleQuickView}
          className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md items-center gap-1 hover:bg-teal-700 hover:text-white"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('product.quick_view')}</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2">
        <div>
          {/* Category & Brand info */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-1">
            <span className="truncate max-w-[120px]">
              {lang === 'bn' ? product.category_name_bn || product.category_name_en : product.category_name_en}
            </span>
            {product.brand_name && (
              <span className="font-semibold text-gray-500">{product.brand_name}</span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
            {lang === 'bn' ? product.name_bn || product.name_en : product.name_en}
          </h3>
        </div>

        {/* Ratings */}
        <div className="flex items-center gap-1 text-xs">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <span className="font-bold text-gray-800 text-xs">{product.rating.toFixed(1)}</span>
          <span className="text-gray-400 text-[11px]">({product.review_count})</span>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-sm sm:text-base text-teal-800">
                {formatPrice(currentPrice)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
              product.stock_quantity <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isAddedAnim
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-teal-50 hover:bg-teal-700 text-teal-800 hover:text-white'
            }`}
            title={t('product.add_to_cart')}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
