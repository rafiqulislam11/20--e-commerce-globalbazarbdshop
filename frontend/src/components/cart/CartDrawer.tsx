import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Check } from 'lucide-react';

interface CartDrawerProps {
  onNavigate: (page: string, param?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { lang, formatPrice, t } = useLanguage();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    shippingCharge,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingRemaining,
    freeShippingThreshold
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponError('');
    setIsApplying(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setIsApplying(false);
    }
  };

  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-700" />
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">
              {t('cart.title')} ({items.length})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-teal-50 px-4 py-2.5 border-b border-teal-100">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-900 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-teal-700" />
              {freeShippingRemaining > 0
                ? lang === 'bn'
                  ? `আর ${formatPrice(freeShippingRemaining)} টাকার পণ্য কিনলে ফ্রি ডেলিভারি!`
                  : `Add ${formatPrice(freeShippingRemaining)} more for Free Shipping!`
                : lang === 'bn'
                ? '🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন!'
                : '🎉 Congratulations! You have unlocked Free Shipping!'}
            </span>
            <span className="text-[11px] font-bold font-mono">{freeShippingPercent}%</span>
          </div>
          <div className="w-full h-2 bg-teal-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-800 text-sm">{t('cart.empty')}</p>
              <p className="text-xs text-gray-500 max-w-xs">{t('cart.empty_desc')}</p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('shop');
                }}
                className="mt-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {t('cart.start_shopping')}
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.product_id}-${item.variant_id || idx}`}
                className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 items-center justify-between"
              >
                <img
                  src={item.image}
                  alt={item.name_en}
                  className="w-16 h-16 object-cover rounded-xl bg-white border border-gray-100 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {lang === 'bn' ? item.name_bn || item.name_en : item.name_en}
                  </h4>
                  {item.variant_name && (
                    <span className="text-[11px] text-teal-700 font-medium bg-teal-100/50 px-1.5 py-0.5 rounded">
                      {item.variant_name}
                    </span>
                  )}
                  <p className="text-xs font-black text-teal-800 mt-1">
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs font-bold hover:bg-gray-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs font-bold hover:bg-gray-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id, item.variant_id)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Coupon & Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white space-y-3">
            {/* Coupon Box */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Check className="w-4 h-4" />
                  <span>কুপন: {appliedCoupon.code} (-{formatPrice(discount)})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-rose-600 hover:underline font-bold cursor-pointer text-[11px]"
                >
                  মুছুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      placeholder={t('cart.coupon_code')}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {isApplying ? '...' : t('cart.apply_coupon')}
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
              </form>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{t('cart.discount')}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span>
                  {shippingCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">{t('cart.free_shipping')}</span>
                  ) : (
                    formatPrice(shippingCharge)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
                <span>{t('cart.grand_total')}</span>
                <span className="text-teal-800 text-base">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('checkout');
                }}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all cursor-pointer"
              >
                <span>{t('cart.proceed_to_checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('cart');
                }}
                className="w-full text-center text-xs text-gray-600 hover:text-teal-700 font-semibold py-1 cursor-pointer"
              >
                {lang === 'bn' ? 'সম্পূর্ণ কার্ট পেজ দেখুন' : 'View Full Cart Page'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
