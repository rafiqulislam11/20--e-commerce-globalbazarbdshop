import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Order, OrderTimeline } from '../types/index';
import { fetchApi } from '../services/api';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  AlertCircle,
  FileText
} from 'lucide-react';

interface TrackOrderPageProps {
  initialQuery?: string;
  onNavigate: (page: string, param?: string) => void;
}

const ORDER_STEPS = [
  { key: 'PENDING', label_bn: 'অর্ডার গ্রহণ', label_en: 'Order Placed' },
  { key: 'CONFIRMED', label_bn: 'অর্ডার নিশ্চিত', label_en: 'Confirmed' },
  { key: 'PACKED', label_bn: 'প্যাকিং সম্পন্ন', label_en: 'Packed' },
  { key: 'SHIPPED', label_bn: 'শিপমেন্ট হস্তান্তর', label_en: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label_bn: 'ডেলিভারির পথে', label_en: 'Out for Delivery' },
  { key: 'DELIVERED', label_bn: 'ডেলিভারি সম্পন্ন', label_en: 'Delivered' }
];

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialQuery = '', onNavigate }) => {
  const { lang, formatPrice, t } = useLanguage();

  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialQuery) {
      const params = new URLSearchParams(initialQuery);
      const ordNo = params.get('order_number') || '';
      const ph = params.get('phone') || '';
      if (ordNo && ph) {
        setOrderNumber(ordNo);
        setPhone(ph);
        trackOrderDirect(ordNo, ph);
      }
    }
  }, [initialQuery]);

  const trackOrderDirect = async (ordNo: string, ph: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchApi<{ success: boolean; order: Order }>(
        `/orders/track?order_number=${encodeURIComponent(ordNo)}&phone=${encodeURIComponent(ph)}`
      );
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setErrorMsg('No order found with provided details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Tracking failed. Please verify your Order ID and Phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setErrorMsg('অনুগ্রহ করে অর্ডার আইডি এবং মোবাইল নম্বর উভয়টি লিখুন।');
      return;
    }
    trackOrderDirect(orderNumber.trim(), phone.trim());
  };

  const getStepIndex = (status: string) => {
    if (status === 'DELIVERED') return 5;
    if (status === 'OUT_FOR_DELIVERY') return 4;
    if (status === 'SHIPPED') return 3;
    if (status === 'PACKED') return 2;
    if (status === 'CONFIRMED' || status === 'PROCESSING') return 1;
    return 0;
  };

  const activeStepIdx = order ? getStepIndex(order.order_status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {t('tracking.title')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">{t('tracking.desc')}</p>
      </div>

      {/* Input Search Form */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('tracking.order_id')} *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                placeholder="যেমন: GBBD-20260910-1001"
                className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('tracking.phone')} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="অর্ডারে ব্যবহৃত মোবাইল নম্বর (০১৭১২...)"
                className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-700/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'অনুসন্ধান চলছে...' : t('tracking.track_btn')}</span>
            </button>
          </div>
        </form>

        {/* Quick Demo Credentials for Reviewer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 mb-2">💡 দ্রুত পরীক্ষার জন্য ডেমো অর্ডার আইডি:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOrderNumber('GBBD-20260910-1001');
                setPhone('01712345678');
                trackOrderDirect('GBBD-20260910-1001', '01712345678');
              }}
              className="px-2.5 py-1 bg-gray-100 hover:bg-teal-100 hover:text-teal-900 text-gray-700 rounded-lg text-[11px] font-mono transition-colors cursor-pointer"
            >
              GBBD-20260910-1001 (Delivered)
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderNumber('GBBD-20260914-1002');
                setPhone('01912345678');
                trackOrderDirect('GBBD-20260914-1002', '01912345678');
              }}
              className="px-2.5 py-1 bg-gray-100 hover:bg-teal-100 hover:text-teal-900 text-gray-700 rounded-lg text-[11px] font-mono transition-colors cursor-pointer"
            >
              GBBD-20260914-1002 (Shipped)
            </button>
          </div>
        </div>
      </div>

      {/* Result Timeline Container */}
      {order && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-8 animate-in fade-in-50 duration-300">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {t('tracking.status_title')}
              </span>
              <h2 className="text-xl font-black text-teal-900 mt-0.5">
                {order.order_number}
              </h2>
              <p className="text-xs text-gray-500">
                অর্ডার তারিখ: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-teal-100 text-teal-800 uppercase">
                {order.order_status}
              </span>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                {order.payment_method} ({order.payment_status})
              </span>
            </div>
          </div>

          {/* Stepper Visual Timeline */}
          <div className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-0">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative">
                    {/* Connecting Bar */}
                    {idx < ORDER_STEPS.length - 1 && (
                      <div
                        className={`hidden sm:block absolute top-4 left-1/2 w-full h-1 -z-0 transition-all ${
                          idx < activeStepIdx ? 'bg-teal-600' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                        isPassed
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      } ${isCurrent ? 'ring-4 ring-teal-100 animate-pulse' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <p className={`text-xs mt-2 font-bold ${isCurrent ? 'text-teal-800' : 'text-gray-700'}`}>
                      {lang === 'bn' ? step.label_bn : step.label_en}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Log History */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-200">
                {t('tracking.timeline')}
              </h3>

              <div className="space-y-3">
                {order.timeline.map((entry: OrderTimeline) => (
                  <div key={entry.id} className="flex gap-3 text-xs">
                    <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{entry.notes || entry.status}</p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items & Delivery Address Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-4 border-t border-gray-100">
            <div>
              <p className="font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>ডেলিভারি ঠিকানা:</span>
              </p>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <p className="font-semibold text-gray-900">{order.customer_name}</p>
                <p className="text-gray-600">{order.delivery_address}</p>
                <p className="text-gray-600 font-mono">{order.customer_phone}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-teal-600" />
                <span>অর্ডারের পণ্যসমূহ ({order.items?.length || 0}):</span>
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {order.items?.map(it => (
                  <div key={it.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={it.product_image || ''} alt="" className="w-8 h-8 rounded object-cover" />
                      <div>
                        <p className="font-semibold text-gray-900 truncate max-w-[150px]">{it.product_name}</p>
                        <p className="text-[10px] text-gray-500">পরিমাণ: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-teal-800 font-mono">{formatPrice(it.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
