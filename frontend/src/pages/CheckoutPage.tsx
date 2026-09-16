import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import {
  CheckCircle,
  Truck,
  CreditCard,
  User,
  MapPin,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface CheckoutPageProps {
  onOrderSuccess: (order: any) => void;
  onNavigate: (page: string, param?: string) => void;
}

// 8 Divisions of Bangladesh
const BANGLADESH_DIVISIONS = [
  'Dhaka (ঢাকা)',
  'Chittagong (চট্টগ্রাম)',
  'Rajshahi (রাজশাহী)',
  'Khulna (খুলনা)',
  'Barisal (বরিশাল)',
  'Sylhet (সিলেট)',
  'Rangpur (রংপুর)',
  'Mymensingh (ময়মনসিংহ)'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onNavigate }) => {
  const { lang, formatPrice, t } = useLanguage();
  const {
    items,
    subtotal,
    discount,
    shippingCharge,
    grandTotal,
    appliedCoupon,
    clearCart,
    shippingMethod,
    setShippingMethod
  } = useCart();
  const { user } = useAuth();

  // Form fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [division, setDivision] = useState('Dhaka (ঢাকা)');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'CARD'>('COD');
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashTxId, setBkashTxId] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [nagadTxId, setNagadTxId] = useState('');

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{t('cart.empty')}</h2>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold"
        >
          {t('cart.start_shopping')}
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !phone.trim() || !fullAddress.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং বিস্তারিত ঠিকানা সঠিকভাবে লিখুন।');
      return;
    }

    if (paymentMethod === 'BKASH' && (!bkashNumber.trim() || !bkashTxId.trim())) {
      setErrorMessage('বিকাশ পেমেন্টের জন্য বিকাশ অ্যাকাউন্ট নম্বর এবং ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    if (paymentMethod === 'NAGAD' && (!nagadNumber.trim() || !nagadTxId.trim())) {
      setErrorMessage('নগদ পেমেন্টের জন্য নগদ অ্যাকাউন্ট নম্বর এবং ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const activeTxId = paymentMethod === 'BKASH' ? bkashTxId.trim() : paymentMethod === 'NAGAD' ? nagadTxId.trim() : null;
      const activePayPhone = paymentMethod === 'BKASH' ? bkashNumber.trim() : paymentMethod === 'NAGAD' ? nagadNumber.trim() : null;

      const orderPayload = {
        customer_name: fullName.trim(),
        customer_email: email.trim() || null,
        customer_phone: phone.trim(),
        delivery_address: fullAddress.trim(),
        division: division.split(' ')[0],
        district: district.trim(),
        upazila: upazila.trim(),
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        transaction_id: activeTxId,
        payment_phone: activePayPhone,
        items: items.map(it => ({
          product_id: it.product_id,
          variant_id: it.variant_id,
          product_image: it.image,
          variant_name: it.variant_name,
          quantity: it.quantity
        })),
        coupon_code: appliedCoupon?.code || null,
        notes: notes
          ? `${notes} ${activeTxId ? `[${paymentMethod} No: ${activePayPhone}, TrxID: ${activeTxId}]` : ''}`
          : activeTxId
          ? `[${paymentMethod} No: ${activePayPhone}, TrxID: ${activeTxId}]`
          : null
      };

      const res = await fetchApi<{ success: boolean; message: string; order: any }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      if (res.success && res.order) {
        clearCart();
        onOrderSuccess(res.order);
      } else {
        setErrorMessage(res.message || 'Order failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Order placement failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">
        {t('checkout.title')}
      </h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Left Steps (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Info */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 text-teal-800 font-bold text-sm">
                <User className="w-4 h-4" />
                <span>{t('checkout.step_contact')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('checkout.full_name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="আপনার পুরো নাম..."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('checkout.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="০১৭১১-XXXXXX"
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('checkout.email')} (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 text-teal-800 font-bold text-sm">
                <MapPin className="w-4 h-4" />
                <span>{t('checkout.step_shipping')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('checkout.division')} *
                  </label>
                  <select
                    value={division}
                    onChange={e => {
                      setDivision(e.target.value);
                      if (e.target.value.includes('Dhaka')) {
                        setShippingMethod('INSIDE_DHAKA');
                      } else {
                        setShippingMethod('OUTSIDE_DHAKA');
                      }
                    }}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    {BANGLADESH_DIVISIONS.map(div => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('checkout.district')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="জেলা (e.g. Dhaka / Gazipur)"
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('checkout.upazila')}
                  </label>
                  <input
                    type="text"
                    value={upazila}
                    onChange={e => setUpazila(e.target.value)}
                    placeholder="থানা / উপজেলা (e.g. Dhanmondi, Gulshan, Savar)"
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('checkout.full_address')} *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={fullAddress}
                    onChange={e => setFullAddress(e.target.value)}
                    placeholder="বাড়ি নং, রোড নং, এলাকা ও পরিচিত ল্যান্ডমার্ক..."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('checkout.order_notes')}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="যেমন: ডেলিভারির পূর্বে ফোন করবেন..."
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Shipping Method */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 text-teal-800 font-bold text-sm">
                <Truck className="w-4 h-4" />
                <span>{t('checkout.step_delivery_method')}</span>
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-teal-50/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="ship_opt"
                      checked={shippingMethod === 'INSIDE_DHAKA'}
                      onChange={() => setShippingMethod('INSIDE_DHAKA')}
                      className="accent-teal-700"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{t('product.inside_dhaka')}</p>
                      <p className="text-[11px] text-gray-500">২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-teal-800">
                    {subtotal >= 2000 ? 'FREE' : '৳70'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-teal-50/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="ship_opt"
                      checked={shippingMethod === 'OUTSIDE_DHAKA'}
                      onChange={() => setShippingMethod('OUTSIDE_DHAKA')}
                      className="accent-teal-700"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{t('product.outside_dhaka')}</p>
                      <p className="text-[11px] text-gray-500">২-৪ দিনের মধ্যে ৬৪ জেলায় হোম ডেলিভারি</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-teal-800">
                    {subtotal >= 2000 ? 'FREE' : '৳130'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-teal-50/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="ship_opt"
                      checked={shippingMethod === 'EXPRESS'}
                      onChange={() => setShippingMethod('EXPRESS')}
                      className="accent-teal-700"
                    />
                    <div>
                      <p className="font-bold text-gray-900">এক্সপ্রেস ফাস্ট ডেলিভারি (Express)</p>
                      <p className="text-[11px] text-gray-500">জরুরি অর্ডারের ক্ষেত্রে অগ্রাধিকার ভিত্তিক ডেলিভারি</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-teal-800">৳160</span>
                </label>
              </div>
            </div>

            {/* Step 4: Payment Method */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 text-teal-800 font-bold text-sm">
                <CreditCard className="w-4 h-4" />
                <span>{t('checkout.step_payment')}</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* COD Option */}
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-teal-50/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="pay_opt"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-teal-700"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{t('checkout.payment_cod')}</p>
                    <p className="text-[11px] text-gray-500">পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন</p>
                  </div>
                </label>

                {/* bKash Option */}
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-pink-50/40 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="pay_opt"
                    checked={paymentMethod === 'BKASH'}
                    onChange={() => setPaymentMethod('BKASH')}
                    className="accent-pink-600"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-pink-700 flex items-center gap-2">
                        <span>{t('checkout.payment_bkash')}</span>
                        <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded font-bold">
                          Send Money / Merchant
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500">বিকাশ অ্যাপ অথবা *247# ডায়াল করে পেমেন্ট করুন</p>
                    </div>
                    <span className="font-bold text-xs text-pink-600">bKash</span>
                  </div>
                </label>

                {/* If bKash selected, show realistic transaction verification inputs */}
                {paymentMethod === 'BKASH' && (
                  <div className="p-4 bg-pink-50/90 rounded-2xl border border-pink-200 space-y-3 animate-in fade-in-50">
                    <div className="p-3 bg-white rounded-xl border border-pink-100 text-xs text-pink-950 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-pink-800">
                        <span>📱 আমাদের বিকাশ নম্বর:</span>
                        <span className="font-mono text-base font-black text-pink-700">01930-279175</span>
                      </p>
                      <p className="text-[11px] text-gray-600">
                        মোট প্রদেয়: <strong className="text-teal-800 font-mono font-bold">{formatPrice(grandTotal)}</strong> টাকা। বিকাশ অ্যাপ থেকে <strong>Send Money</strong> করুন।
                      </p>
                      <p className="text-[10px] text-pink-700 font-medium">
                        * পেমেন্ট করার পর প্রাপ্ত TrxID ও প্রেরক বিকাশ নম্বর নিচে প্রদান করুন। অ্যাডমিন ভেরিফাই করে অর্ডার কনফার্ম করবেন।
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-pink-900 mb-1">আপনার বিকাশ নম্বর *</label>
                        <input
                          type="tel"
                          required
                          placeholder="০১৭১১-XXXXXX"
                          value={bkashNumber}
                          onChange={e => setBkashNumber(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:border-pink-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-pink-900 mb-1">Transaction ID (TrxID) *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: BLK934KD8"
                          value={bkashTxId}
                          onChange={e => setBkashTxId(e.target.value.toUpperCase())}
                          className="w-full text-xs p-2.5 bg-white border border-pink-200 rounded-xl focus:outline-none focus:border-pink-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Nagad Option */}
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-orange-50/40 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="pay_opt"
                    checked={paymentMethod === 'NAGAD'}
                    onChange={() => setPaymentMethod('NAGAD')}
                    className="accent-orange-600"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-orange-700 flex items-center gap-2">
                        <span>{t('checkout.payment_nagad')}</span>
                        <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold">
                          Send Money
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500">নগদ অ্যাপ অথবা *167# ডায়াল করে পেমেন্ট করুন</p>
                    </div>
                    <span className="font-bold text-xs text-orange-600">Nagad</span>
                  </div>
                </label>

                {/* If Nagad selected, show realistic transaction verification inputs */}
                {paymentMethod === 'NAGAD' && (
                  <div className="p-4 bg-orange-50/90 rounded-2xl border border-orange-200 space-y-3 animate-in fade-in-50">
                    <div className="p-3 bg-white rounded-xl border border-orange-100 text-xs text-orange-950 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-orange-800">
                        <span>📱 আমাদের নগদ নম্বর:</span>
                        <span className="font-mono text-base font-black text-orange-700">01930-279175</span>
                      </p>
                      <p className="text-[11px] text-gray-600">
                        মোট প্রদেয়: <strong className="text-teal-800 font-mono font-bold">{formatPrice(grandTotal)}</strong> টাকা। নগদ অ্যাপ থেকে <strong>Send Money</strong> করুন।
                      </p>
                      <p className="text-[10px] text-orange-700 font-medium">
                        * পেমেন্ট করার পর প্রাপ্ত TrxID ও প্রেরক নগদ নম্বর নিচে প্রদান করুন। অ্যাডমিন ভেরিফাই করে অর্ডার কনফার্ম করবেন।
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-orange-900 mb-1">আপনার নগদ নম্বর *</label>
                        <input
                          type="tel"
                          required
                          placeholder="০১৭১১-XXXXXX"
                          value={nagadNumber}
                          onChange={e => setNagadNumber(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-orange-900 mb-1">Transaction ID (TrxID) *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: 7KD829XQ"
                          value={nagadTxId}
                          onChange={e => setNagadTxId(e.target.value.toUpperCase())}
                          className="w-full text-xs p-2.5 bg-white border border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Card / Bank Option */}
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="pay_opt"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="accent-blue-600"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-800">{t('checkout.payment_card')}</p>
                      <p className="text-[11px] text-gray-500">ভিসা, মাস্টারকার্ড বা ব্যাংক ট্রান্সফার</p>
                    </div>
                    <span className="font-bold text-xs text-blue-700">Visa / MC</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                {t('checkout.order_summary')}
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map(it => (
                  <div key={`${it.product_id}-${it.variant_id}`} className="flex items-center gap-3 text-xs">
                    <img src={it.image} alt="" className="w-12 h-12 object-cover rounded-xl border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {lang === 'bn' ? it.name_bn || it.name_en : it.name_en}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {it.quantity} × {formatPrice(it.price)}
                      </p>
                    </div>
                    <span className="font-bold text-gray-800 font-mono">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{t('cart.discount')} ({appliedCoupon?.code})</span>
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

              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-teal-700/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t('checkout.placing_order')}</span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{t('checkout.place_order')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>নিরাপদ পেমেন্ট ও আসল পণ্যের নিশ্চয়তা</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
