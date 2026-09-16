import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, Printer, Package, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderSuccessPageProps {
  order: any;
  onNavigate: (page: string, param?: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  const { lang, formatPrice } = useLanguage();

  useEffect(() => {
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  }, []);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold"
        >
          হোম পেজে ফিরে যান
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 select-none space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-3 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-black text-gray-900">
          {lang === 'bn' ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!' : 'Order Placed Successfully!'}
        </h1>

        <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
          {lang === 'bn'
            ? 'ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে। আমাদের প্রতিনিধি দ্রুত যোগাযোগ করে অর্ডার নিশ্চিত করবেন।'
            : 'Thank you for shopping with Global Bazar BD. We are processing your package for fast delivery.'}
        </p>

        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-2xl">
          <span className="text-xs text-teal-800 font-semibold">
            {lang === 'bn' ? 'অর্ডার নম্বর:' : 'Order ID:'}
          </span>
          <span className="font-mono font-black text-teal-900 text-sm">
            {order.order_number || order.id}
          </span>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div id="printable-invoice" className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <span className="font-extrabold text-xl text-teal-800">GLOBAL BAZAR BD SHOP</span>
            <p className="text-xs text-gray-500">স্মার্ট শপিং, সহজ জীবন • Hotline: 01711-000000</p>
          </div>

          <button
            onClick={handlePrint}
            className="self-start sm:self-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'রিসিপ্ট প্রিন্ট করুন' : 'Print Invoice'}</span>
          </button>
        </div>

        {/* Customer Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <p className="font-bold text-gray-900 mb-1">{lang === 'bn' ? 'গ্রাহকের তথ্য:' : 'Customer Info:'}</p>
            <p className="text-gray-700">{order.customer_name}</p>
            <p className="text-gray-700 font-mono">{order.customer_phone}</p>
            {order.customer_email && <p className="text-gray-500">{order.customer_email}</p>}
          </div>

          <div>
            <p className="font-bold text-gray-900 mb-1">{lang === 'bn' ? 'ডেলিভারি ঠিকানা ও পেমেন্ট:' : 'Delivery & Payment:'}</p>
            <p className="text-gray-700">{order.delivery_address || 'ঢাকা'}</p>
            <p className="text-gray-700 font-semibold mt-1">
              পেমেন্ট পদ্ধতি: <span className="text-teal-800 uppercase">{order.payment_method}</span>
            </p>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="space-y-2 text-xs border-t border-gray-100 pt-4">
          <div className="flex justify-between text-gray-600">
            <span>উপমোট (Subtotal):</span>
            <span className="font-mono font-semibold">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>ডিসকাউন্ট (Discount):</span>
              <span className="font-mono">-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>ডেলিভারি চার্জ (Delivery Fee):</span>
            <span className="font-mono">
              {order.shipping_charge === 0 ? 'FREE' : formatPrice(order.shipping_charge)}
            </span>
          </div>
          <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
            <span>সর্বমোট প্রদেয় (Grand Total):</span>
            <span className="text-teal-800 text-lg font-mono">{formatPrice(order.grand_total)}</span>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onNavigate('tracking', `order_number=${order.order_number}&phone=${order.customer_phone}`)}
          className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
        >
          <Truck className="w-4 h-4" />
          <span>{lang === 'bn' ? 'অর্ডার ট্র্যাক করুন (Live Tracking)' : 'Track Order'}</span>
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Package className="w-4 h-4" />
          <span>{lang === 'bn' ? 'শপিং অব্যাহত রাখুন' : 'Continue Shopping'}</span>
        </button>
      </div>
    </div>
  );
};
