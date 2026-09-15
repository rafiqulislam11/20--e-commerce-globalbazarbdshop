import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-teal-600" />,
      title: t('home.authentic_title'),
      desc: t('home.authentic_desc')
    },
    {
      icon: <Truck className="w-8 h-8 text-sky-600" />,
      title: t('home.fast_delivery_title'),
      desc: t('home.fast_delivery_desc')
    },
    {
      icon: <RotateCcw className="w-8 h-8 text-amber-600" />,
      title: t('home.easy_return_title'),
      desc: t('home.easy_return_desc')
    },
    {
      icon: <Headphones className="w-8 h-8 text-emerald-600" />,
      title: t('home.support_title'),
      desc: t('home.support_desc')
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none">
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {t('home.why_choose_us')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            স্মার্ট অনলাইন শপিংয়ের সেরা অভিজ্ঞতা ও শতভাগ বিশ্বস্ততার প্রতিশ্রুতি
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50/60 hover:bg-teal-50/40 border border-gray-100 hover:border-teal-200 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
