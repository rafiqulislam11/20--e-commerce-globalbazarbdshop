import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck, Check, ChevronRight } from 'lucide-react';

interface CartPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { lang, formatPrice, t } = useLanguage();
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    shippingCharge,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingMethod,
    setShippingMethod,
    freeShippingRemaining,
    freeShippingThreshold
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setLoadingCoupon(true);
    setCouponMsg('');
    try {
      const msg = await applyCoupon(couponCode.trim());
      setCouponMsg(msg);
      setIsError(false);
      setCouponCode('');
    } catch (err: any) {
      setCouponMsg(err.message || 'Invalid coupon');
      setIsError(true);
    } finally {
      setLoadingCoupon(false);
    }
  };

  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t('cart.empty')}</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">{t('cart.empty_desc')}</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          {t('cart.start_shopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-teal-700 cursor-pointer">
          {t('nav.home')}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-bold">{t('cart.title')}</span>
      </div>

      <h1 className="text-2xl font-black text-gray-900">{t('cart.title')}</h1>

      {/* Free Delivery Banner */}
      <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs font-bold text-teal-950">
          <Truck className="w-5 h-5 text-teal-700 shrink-0" />
          <span>
            {freeShippingRemaining > 0
              ? lang === 'bn'
                ? `আর মাত্র ${formatPrice(freeShippingRemaining)} টাকার পণ্য অর্ডার করলেই পাচ্ছেন সারা বাংলাদেশে ফ্রি ডেলিভারি!`
                : `Add only ${formatPrice(freeShippingRemaining)} more to get Free Delivery all across Bangladesh!`
              : lang === 'bn'
              ? '🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি সুবিধা পেয়েছেন!'
              : '🎉 You have unlocked Free Delivery!'}
          </span>
        </div>
        <div className="w-full sm:w-48 h-2 bg-teal-200/70 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${freeShippingPercent}%` }}
          />
        </div>
      </div>

      {/* Cart Grid: Items Table + Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="hidden sm:grid grid-cols-12 p-4 bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">{t('cart.item')}</div>
              <div className="col-span-2 text-center">{t('cart.price')}</div>
              <div className="col-span-2 text-center">{t('cart.quantity')}</div>
              <div className="col-span-2 text-right">{t('cart.total')}</div>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div
                  key={`${item.product_id}-${item.variant_id || idx}`}
                  className="p-4 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-6 flex items-center gap-3 w-full">
                    <img
                      src={item.image}
                      alt=""
                      className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {lang === 'bn' ? item.name_bn || item.name_en : item.name_en}
                      </h3>
                      {item.variant_name && (
                        <span className="inline-block mt-0.5 text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-medium">
                          {item.variant_name}
                        </span>
                      )}
                      <button
                        onClick={() => removeFromCart(item.product_id, item.variant_id)}
                        className="mt-1 text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>মুছুন (Remove)</span>
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 text-center text-xs font-semibold text-gray-800">
                    {formatPrice(item.price)}
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-gray-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold font-mono bg-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs font-bold hover:bg-gray-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 text-right text-xs sm:text-sm font-black text-teal-800">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
            >
              ← {t('cart.continue_shopping')}
            </button>
          </div>
        </div>

        {/* Order Summary & Coupon (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
              {lang === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}
            </h2>

            {/* Shipping Zone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">
                {lang === 'bn' ? 'ডেলিভারি এলাকা নির্বাচন করুন:' : 'Shipping Region:'}
              </label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ship_zone"
                      checked={shippingMethod === 'INSIDE_DHAKA'}
                      onChange={() => setShippingMethod('INSIDE_DHAKA')}
                      className="accent-teal-700"
                    />
                    <span>{t('product.inside_dhaka')}</span>
                  </div>
                  <span className="font-mono font-bold">
                    {subtotal >= freeShippingThreshold ? 'FREE' : '৳70'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ship_zone"
                      checked={shippingMethod === 'OUTSIDE_DHAKA'}
                      onChange={() => setShippingMethod('OUTSIDE_DHAKA')}
                      className="accent-teal-700"
                    />
                    <span>{t('product.outside_dhaka')}</span>
                  </div>
                  <span className="font-mono font-bold">
                    {subtotal >= freeShippingThreshold ? 'FREE' : '৳130'}
                  </span>
                </label>
              </div>
            </div>

            {/* Coupon Application */}
            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Check className="w-4 h-4" />
                  <span>কুপন: {appliedCoupon.code}</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="space-y-1.5">
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="কুপন কোড (e.g. GLOBAL10)"
                      className="w-full pl-8 pr-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingCoupon}
                    className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {loadingCoupon ? '...' : t('cart.apply_coupon')}
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-[11px] font-medium ${isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {couponMsg}
                  </p>
                )}
              </form>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
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
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>{t('cart.grand_total')}</span>
                <span className="text-teal-800 text-lg">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-700/25 transition-all cursor-pointer"
            >
              <span>{t('cart.proceed_to_checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
