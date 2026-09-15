import React from 'react';
import { Category } from '../../types/index';
import { useLanguage } from '../../context/LanguageContext';
import {
  Smartphone,
  Cpu,
  Laptop,
  Shirt,
  Sparkles,
  Heart,
  Home,
  Utensils,
  ShoppingBag,
  Watch,
  Footprints,
  Activity,
  Smile,
  BookOpen,
  Tv,
  ArrowRight
} from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  onNavigate: (page: string, param?: string) => void;
}

// Icon mapping helper
const getCategoryIcon = (slug: string) => {
  if (slug.includes('phone')) return <Smartphone className="w-6 h-6 text-sky-600" />;
  if (slug.includes('gadget') || slug.includes('electronic')) return <Cpu className="w-6 h-6 text-teal-600" />;
  if (slug.includes('computer')) return <Laptop className="w-6 h-6 text-indigo-600" />;
  if (slug.includes('men')) return <Shirt className="w-6 h-6 text-blue-600" />;
  if (slug.includes('women')) return <Sparkles className="w-6 h-6 text-pink-600" />;
  if (slug.includes('health') || slug.includes('beauty')) return <Heart className="w-6 h-6 text-rose-600" />;
  if (slug.includes('home')) return <Home className="w-6 h-6 text-emerald-600" />;
  if (slug.includes('kitchen')) return <Utensils className="w-6 h-6 text-amber-600" />;
  if (slug.includes('grocery') || slug.includes('food')) return <ShoppingBag className="w-6 h-6 text-green-600" />;
  if (slug.includes('watch')) return <Watch className="w-6 h-6 text-purple-600" />;
  if (slug.includes('footwear') || slug.includes('bag')) return <Footprints className="w-6 h-6 text-orange-600" />;
  if (slug.includes('sport')) return <Activity className="w-6 h-6 text-cyan-600" />;
  if (slug.includes('kid') || slug.includes('baby')) return <Smile className="w-6 h-6 text-yellow-500" />;
  if (slug.includes('book')) return <BookOpen className="w-6 h-6 text-emerald-700" />;
  return <Tv className="w-6 h-6 text-teal-600" />;
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onNavigate }) => {
  const { lang, t } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {t('home.shop_by_category')}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {lang === 'bn'
              ? 'সেরা মানের পণ্য খুঁজে নিন পছন্দের ক্যাটাগরি থেকে'
              : 'Browse our curated collection of verified products'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>{t('home.view_all')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.slice(0, 12).map(cat => (
          <div
            key={cat.id}
            onClick={() => onNavigate('shop', `category=${cat.slug}`)}
            className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-50 group-hover:bg-teal-50 flex items-center justify-center transition-all group-hover:scale-110 mb-3 shadow-xs">
              {getCategoryIcon(cat.slug)}
            </div>

            <h3 className="text-xs font-bold text-gray-800 group-hover:text-teal-700 transition-colors line-clamp-1">
              {lang === 'bn' ? cat.name_bn : cat.name_en}
            </h3>

            {cat.product_count !== undefined && (
              <span className="text-[10px] text-gray-400 mt-1">
                {cat.product_count} {lang === 'bn' ? 'টি পণ্য' : 'items'}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
