import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const WhatsAppButton: React.FC = () => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const whatsappNumber = '8801310824987'; // Business WhatsApp: 01310-824987

  const quickMessages = [
    {
      title: lang === 'bn' ? '📦 অর্ডার সংক্রান্ত তথ্য' : '📦 Order Inquiry',
      msg: lang === 'bn' ? 'আসসালামু আলাইকুম, আমি আমার অর্ডারের স্ট্যাটাস জানতে চাই।' : 'Hello, I would like to inquire about my order status.'
    },
    {
      title: lang === 'bn' ? '🛍️ পণ্যের তথ্য ও অফার' : '🛍️ Product & Offers',
      msg: lang === 'bn' ? 'আসসালামু আলাইকুম, এই পণ্যটি কি স্টকে আছে এবং ডিসকাউন্ট অফার চলছে?' : 'Hello, is this product available in stock and what offers apply?'
    },
    {
      title: lang === 'bn' ? '🚚 ডেলিভারি চার্জ ও সময়' : '🚚 Delivery & Shipping',
      msg: lang === 'bn' ? 'আমার এলাকায় ডেলিভারি হতে কত দিন সময় লাগবে?' : 'How many days will it take for delivery in my area?'
    }
  ];

  const handleSend = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-5 z-40 select-none">
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <MessageCircle className="w-4 h-4 fill-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">গ্লোবাল বাজার সাপোর্ট</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  অনলাইন আছেন (Online)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-600 my-2.5">
            {lang === 'bn'
              ? 'যেকোনো প্রয়োজনে আমাদের হোয়াটসঅ্যাপে সরাসরি মেসেজ দিন:'
              : 'Directly chat with our representative on WhatsApp:'}
          </p>

          <div className="space-y-1.5 mb-3">
            {quickMessages.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.msg)}
                className="w-full text-left text-xs bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 text-gray-800 p-2 rounded-xl transition-colors border border-gray-100 font-medium cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              if (customMsg.trim()) handleSend(customMsg);
            }}
            className="flex gap-1.5"
          >
            <input
              type="text"
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              placeholder={lang === 'bn' ? 'আপনার মেসেজ লিখুন...' : 'Type message...'}
              className="flex-1 text-xs px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer relative group"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
      </button>
    </div>
  );
};
