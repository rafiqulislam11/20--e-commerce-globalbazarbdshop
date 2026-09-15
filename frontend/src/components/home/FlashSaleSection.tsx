import React, { useState, useEffect } from 'react';
import { Product, FlashSale } from '../../types/index';
import { useLanguage } from '../../context/LanguageContext';
import { ProductCard } from '../product/ProductCard';
import { Flame, ArrowRight } from 'lucide-react';

interface FlashSaleSectionProps {
  flashSaleCampaign: FlashSale | null;
  products: Product[];
  onNavigate: (page: string, param?: string) => void;
  onQuickView?: (product: Product) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  flashSaleCampaign,
  products,
  onNavigate,
  onQuickView
}) => {
  const { lang, t } = useLanguage();

  // Real-time Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const targetDate = flashSaleCampaign?.end_time
      ? new Date(flashSaleCampaign.end_time).getTime()
      : Date.now() + 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetDate - now);

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSaleCampaign]);

  if (!products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-red-600/10">
        {/* Header with Title & Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              <Flame className="w-7 h-7 fill-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {t('home.flash_deals')}
                </h2>
                <span className="bg-amber-400 text-red-950 text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {lang === 'bn' ? 'সীমিত অফার' : 'Limited Offer'}
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                {lang === 'bn'
                  ? flashSaleCampaign?.title_bn || 'সেরা পণ্যে অবিশ্বাস্য মূল্যছাড়!'
                  : flashSaleCampaign?.title_en || 'Unbelievable discounts on top picks!'}
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 self-start sm:self-auto">
            <span className="text-xs font-semibold text-amber-300">{t('home.deal_ends_in')}</span>
            <div className="flex items-center gap-1 font-mono font-black text-sm">
              <span className="bg-white text-gray-900 px-2 py-1 rounded-lg">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-white text-gray-900 px-2 py-1 rounded-lg">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="bg-white text-gray-900 px-2 py-1 rounded-lg text-red-600">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
          {products.slice(0, 4).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="pt-6 text-center">
          <button
            onClick={() => onNavigate('shop', 'flash_sale=true')}
            className="inline-flex items-center gap-2 bg-white text-red-700 hover:bg-amber-300 hover:text-red-950 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <span>{lang === 'bn' ? 'সব ফ্ল্যাশ ডিল দেখুন' : 'View All Flash Deals'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
