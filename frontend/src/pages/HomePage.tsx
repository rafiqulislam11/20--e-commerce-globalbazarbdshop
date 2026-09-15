import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Banner, Category, Product, FlashSale } from '../types/index';
import { fetchApi } from '../services/api';
import { HeroSlider } from '../components/home/HeroSlider';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FlashSaleSection } from '../components/home/FlashSaleSection';
import { PromoBanners } from '../components/home/PromoBanners';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { CustomerReviewsSection } from '../components/home/CustomerReviewsSection';
import { ProductCard } from '../components/product/ProductCard';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onQuickView }) => {
  const { lang, t } = useLanguage();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashSaleCampaign, setFlashSaleCampaign] = useState<FlashSale | null>(null);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [bannerRes, catRes, featRes] = await Promise.all([
          fetchApi<{ success: boolean; banners: Banner[]; flashSale: FlashSale | null }>('/banners'),
          fetchApi<{ success: boolean; categories: Category[] }>('/categories'),
          fetchApi<{ success: boolean; flashSale: Product[]; bestSellers: Product[]; newArrivals: Product[] }>('/products/featured')
        ]);

        if (bannerRes.success) {
          setBanners(bannerRes.banners);
          setFlashSaleCampaign(bannerRes.flashSale);
        }
        if (catRes.success) setCategories(catRes.categories);
        if (featRes.success) {
          setFlashSaleProducts(featRes.flashSale);
          setBestSellers(featRes.bestSellers);
          setNewArrivals(featRes.newArrivals);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* 1. Hero Slider */}
      <HeroSlider banners={banners} onNavigate={onNavigate} />

      {/* 2. Shop by Category */}
      <CategoryGrid categories={categories} onNavigate={onNavigate} />

      {/* 3. Flash Sale Section */}
      <FlashSaleSection
        flashSaleCampaign={flashSaleCampaign}
        products={flashSaleProducts}
        onNavigate={onNavigate}
        onQuickView={onQuickView}
      />

      {/* 4. Best Selling Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {t('nav.best_sellers')}
              </h2>
              <p className="text-xs text-gray-500">
                {lang === 'bn' ? 'আমাদের গ্রাহকদের সবচেয়ে পছন্দের জনপ্রিয় পণ্য' : 'Top trending and most-ordered products'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('shop', 'sort=popular')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>{t('home.view_all')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {bestSellers.slice(0, 8).map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onNavigate={onNavigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 5. Promotional Banners */}
      <PromoBanners onNavigate={onNavigate} />

      {/* 6. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {t('nav.new_arrivals')}
              </h2>
              <p className="text-xs text-gray-500">
                {lang === 'bn' ? 'সদ্য যুক্ত হওয়া লেটেস্ট কালেকশন' : 'Explore newly added high quality arrivals'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('shop', 'sort=newest')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>{t('home.view_all')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {newArrivals.slice(0, 8).map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onNavigate={onNavigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 7. Why Choose Us */}
      <WhyChooseUs />

      {/* 8. Verified Customer Reviews */}
      <CustomerReviewsSection />
    </div>
  );
};
