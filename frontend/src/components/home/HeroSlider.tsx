import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Banner } from '../../types/index';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

interface HeroSliderProps {
  banners: Banner[];
  onNavigate: (page: string, param?: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners, onNavigate }) => {
  const { lang, t } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;

  const current = banners[currentIdx];

  const prevSlide = () => {
    setCurrentIdx(prev => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIdx(prev => (prev + 1) % banners.length);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 select-none">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] flex items-center bg-gray-900">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={current.image_desktop}
            alt={current.title_en}
            className="w-full h-full object-cover opacity-60 scale-105 transition-all duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl px-6 sm:px-12 lg:px-16 py-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/90 text-gray-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GLOBAL BAZAR EXCLUSIVE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
            {lang === 'bn' ? current.title_bn : current.title_en}
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-gray-200 line-clamp-2 max-w-lg drop-shadow-xs">
            {lang === 'bn' ? current.subtitle_bn : current.subtitle_en}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('shop')}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30 transition-all cursor-pointer hover:scale-105"
            >
              <span>{lang === 'bn' ? current.cta_text_bn : current.cta_text_en}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('shop', 'category=electronics-gadgets')}
              className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              {t('home.explore_cat')}
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-5 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-5 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIdx ? 'w-8 bg-teal-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
