import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight } from 'lucide-react';

interface PromoBannersProps {
  onNavigate: (page: string, param?: string) => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({ onNavigate }) => {
  const { lang } = useLanguage();

  const promos = [
    {
      title: lang === 'bn' ? 'স্মার্টফোন ও গ্যাজেট কার্নিভাল' : 'Smartphone & Gadgets Carnival',
      subtitle: lang === 'bn' ? 'অরিজিনাল ব্র্যান্ড ওয়ারেন্টি সহ ২৫% পর্যন্ত ছাড়' : 'Up to 25% OFF with official warranty',
      bgImg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
      cta: lang === 'bn' ? 'গ্যাজেট দেখুন' : 'Explore Gadgets',
      link: 'category=smartphones-tablets',
      gradient: 'from-sky-950/85 to-transparent'
    },
    {
      title: lang === 'bn' ? 'আভিজাত্যের খাঁটি দেশি ফ্যাশন' : 'Festive Bangladeshi Fashion',
      subtitle: lang === 'bn' ? 'আড়ং পাঞ্জাবি, জামদানি শাড়ি ও ট্রেন্ডিং কালেকশন' : 'Authentic Panjabi, sarees & casual wear',
      bgImg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      cta: lang === 'bn' ? 'ফ্যাশন শপ' : 'Shop Fashion',
      link: 'category=mens-fashion',
      gradient: 'from-amber-950/85 to-transparent'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {promos.map((p, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate('shop', p.link)}
            className="relative rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[260px] flex items-center p-6 sm:p-8 cursor-pointer group shadow-md"
          >
            <img
              src={p.bgImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${p.gradient}`} />

            <div className="relative z-10 max-w-sm space-y-2 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs">
                FEATURED
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-tight">{p.title}</h3>
              <p className="text-xs text-gray-200">{p.subtitle}</p>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-gray-900 group-hover:bg-teal-400 group-hover:text-teal-950 px-4 py-2 rounded-xl transition-all shadow-sm">
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
