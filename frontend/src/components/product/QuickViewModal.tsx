import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types/index';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigate: (page: string, param?: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onNavigate }) => {
  const { lang, formatPrice, t } = useLanguage();
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState<string>('');

  if (!product) return null;

  const currentPrice = selectedVariant?.price || product.sale_price || product.price;
  const currentImg = activeImg || selectedVariant?.image_url || product.primary_image || (product.images && product.images[0]?.image_url) || '';

  const handleAdd = () => {
    addToCart(product, quantity, selectedVariant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl z-10 overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image */}
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-6 relative">
          <img
            src={currentImg}
            alt={product.name_en}
            className="w-full max-h-72 object-contain rounded-2xl"
          />
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
              {lang === 'bn' ? product.category_name_bn || product.category_name_en : product.category_name_en}
            </span>

            <h2 className="text-lg font-bold text-gray-900 leading-snug">
              {lang === 'bn' ? product.name_bn || product.name_en : product.name_en}
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="font-bold text-gray-800">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.review_count} {t('product.reviews_count')})</span>
              <span className="text-gray-300">|</span>
              <span className="text-emerald-600 font-semibold">{t('product.in_stock')}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-800">{formatPrice(currentPrice)}</span>
              {product.sale_price && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-xs text-gray-600 line-clamp-3">
              {lang === 'bn' ? product.description_bn || product.description_en : product.description_en}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-1.5">{t('product.select_variant')}:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.image_url) setActiveImg(v.image_url);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer ${
                        selectedVariant?.id === v.id
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-gray-700">{t('product.quantity')}:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 font-bold text-gray-600 cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1 text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3 py-1 bg-gray-50 hover:bg-gray-100 font-bold text-gray-600 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <button
              onClick={handleAdd}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('product.add_to_cart')}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigate('product', product.slug);
              }}
              className="w-full text-center text-xs text-teal-700 hover:underline font-semibold cursor-pointer py-1"
            >
              {lang === 'bn' ? 'বিস্তারিত সম্পূর্ণ দেখুন →' : 'View Full Details →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
