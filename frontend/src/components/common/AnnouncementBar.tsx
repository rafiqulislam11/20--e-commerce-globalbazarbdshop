import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Truck, Phone } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-sky-800 text-white text-xs py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-amber-400 text-teal-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" />
            {lang === 'bn' ? 'স্পেশাল অফার' : 'Special Offer'}
          </span>
          <span className="truncate">
            {lang === 'bn'
              ? '🎉 ২০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি! কোড: GLOBAL10 ব্যবহারে পান ১০% ছাড়!'
              : '🎉 Free home delivery across Bangladesh on orders over ৳2000! Use code: GLOBAL10 for 10% OFF!'}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-teal-100">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('header.delivery_bd')}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            <span>হটলাইন: 01711-000000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
