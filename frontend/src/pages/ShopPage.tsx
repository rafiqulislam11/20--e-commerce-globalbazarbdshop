import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Product, Category, Brand } from '../types/index';
import { fetchApi } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import {
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ShopPageProps {
  initialQuery?: string;
  onNavigate: (page: string, param?: string) => void;
  onQuickView: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialQuery = '', onNavigate, onQuickView }) => {
  const { lang, formatPrice, t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [isFlashSaleOnly, setIsFlashSaleOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Mobile Filter Drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Parse initial query params (e.g. category=..., search=..., flash_sale=true)
  useEffect(() => {
    if (initialQuery) {
      const params = new URLSearchParams(initialQuery);
      if (params.get('category')) setSelectedCategory(params.get('category') || '');
      if (params.get('brand')) setSelectedBrand(params.get('brand') || '');
      if (params.get('search')) setSearchTerm(params.get('search') || '');
      if (params.get('flash_sale')) setIsFlashSaleOnly(true);
      if (params.get('on_sale')) setOnSaleOnly(true);
      if (params.get('sort')) setSortBy(params.get('sort') || 'newest');
    }
  }, [initialQuery]);

  // Load categories and brands
  useEffect(() => {
    fetchApi<{ success: boolean; categories: Category[] }>('/categories')
      .then(res => res.success && setCategories(res.categories))
      .catch(() => {});

    fetchApi<{ success: boolean; brands: Brand[] }>('/categories/brands')
      .then(res => res.success && setBrands(res.brands))
      .catch(() => {});
  }, []);

  // Fetch products whenever filters or page change
  useEffect(() => {
    setLoading(true);

    const queryParts: string[] = [`page=${page}`, `limit=12`, `sort=${sortBy}`];
    if (searchTerm) queryParts.push(`search=${encodeURIComponent(searchTerm)}`);
    if (selectedCategory) queryParts.push(`category=${encodeURIComponent(selectedCategory)}`);
    if (selectedBrand) queryParts.push(`brand=${encodeURIComponent(selectedBrand)}`);
    if (minPrice) queryParts.push(`min_price=${minPrice}`);
    if (maxPrice) queryParts.push(`max_price=${maxPrice}`);
    if (minRating) queryParts.push(`rating=${minRating}`);
    if (inStockOnly) queryParts.push('in_stock=true');
    if (onSaleOnly) queryParts.push('on_sale=true');
    if (isFlashSaleOnly) queryParts.push('flash_sale=true');

    fetchApi<{ success: boolean; products: Product[]; pagination: { total: number; totalPages: number } }>(
      `/products?${queryParts.join('&')}`
    )
      .then(res => {
        if (res.success) {
          setProducts(res.products);
          setTotal(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        }
      })
      .catch(err => console.error('Fetch products error:', err))
      .finally(() => setLoading(false));
  }, [
    page,
    sortBy,
    searchTerm,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    onSaleOnly,
    isFlashSaleOnly
  ]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setIsFlashSaleOnly(false);
    setSearchTerm('');
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
      selectedBrand ||
      minPrice ||
      maxPrice ||
      minRating ||
      inStockOnly ||
      onSaleOnly ||
      isFlashSaleOnly ||
      searchTerm
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none">
      {/* Top Header & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {searchTerm
              ? lang === 'bn'
                ? `"${searchTerm}" এর ফলাফল`
                : `Search results for "${searchTerm}"`
              : t('nav.shop')}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {total} {lang === 'bn' ? 'টি পণ্য পাওয়া গেছে' : 'products found'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ফিল্টার' : 'Filters'}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              {lang === 'bn' ? 'সর্ট করুন:' : 'Sort by:'}
            </span>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="text-xs font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="newest">{lang === 'bn' ? 'নতুন পণ্য (Newest)' : 'Newest'}</option>
              <option value="popular">{lang === 'bn' ? 'জনপ্রিয় (Popular)' : 'Best Selling'}</option>
              <option value="price-asc">{lang === 'bn' ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}</option>
              <option value="price-desc">{lang === 'bn' ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}</option>
              <option value="rating">{lang === 'bn' ? 'সর্বোচ্চ রেটিং' : 'Highest Rated'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Product Grid */}
      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset All Filters'}</span>
            </button>
          )}

          {/* Category Filter */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
              {t('nav.categories')}
            </h3>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPage(1);
                }}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === '' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('nav.all_categories')}
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === c.slug
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{lang === 'bn' ? c.name_bn : c.name_en}</span>
                  {c.product_count !== undefined && (
                    <span className="text-[10px] text-gray-400 font-mono">({c.product_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
              {lang === 'bn' ? 'মূল্য সীমা (৳)' : 'Price Range (৳)'}
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="Min ৳"
                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-600 font-mono"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Max ৳"
                className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-600 font-mono"
              />
            </div>
          </div>

          {/* Brands Filter */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 pb-2 border-b border-gray-100">
              {lang === 'bn' ? 'ব্র্যান্ডসমূহ' : 'Brands'}
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedBrand('');
                  setPage(1);
                }}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg cursor-pointer ${
                  selectedBrand === '' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {lang === 'bn' ? 'সব ব্র্যান্ড' : 'All Brands'}
              </button>
              {brands.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBrand(b.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                    selectedBrand === b.slug ? 'bg-teal-50 text-teal-800 font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{b.name}</span>
                  {b.product_count !== undefined && (
                    <span className="text-[10px] text-gray-400 font-mono">({b.product_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status Checkbox Toggles */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-2.5">
            <label className="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 accent-teal-600"
              />
              <span>{lang === 'bn' ? 'শুধু স্টকে থাকা পণ্য' : 'In-Stock Only'}</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={e => setOnSaleOnly(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 accent-teal-600"
              />
              <span>{lang === 'bn' ? 'মূল্যছাড়ের অফারযুক্ত পণ্য' : 'On-Sale Only'}</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFlashSaleOnly}
                onChange={e => setIsFlashSaleOnly(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 accent-teal-600"
              />
              <span className="text-red-600 font-bold">
                {lang === 'bn' ? 'মেগা ফ্ল্যাশ সেল পণ্য' : 'Flash Sale Only'}
              </span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 h-72 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-700 mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products matched your criteria'}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'আপনার ফিল্টার বা সার্চ কীওয়ার্ড পরিবর্তন করে পুনরায় চেষ্টা করুন।'
                  : 'Try adjusting your filters or search keywords to find what you are looking for.'}
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'সব পণ্য দেখুন' : 'View All Products'}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onNavigate={onNavigate}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-40 cursor-pointer"
                  >
                    {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        page === i + 1
                          ? 'bg-teal-700 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-40 cursor-pointer"
                  >
                    {lang === 'bn' ? 'পরবর্তী' : 'Next'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isFilterDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col p-4 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="font-bold text-sm text-gray-900">{lang === 'bn' ? 'ফিল্টার' : 'Filters'}</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">{t('nav.categories')}</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left text-xs p-1.5 rounded ${
                    selectedCategory === '' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-gray-600'
                  }`}
                >
                  {t('nav.all_categories')}
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left text-xs p-1.5 rounded ${
                      selectedCategory === c.slug ? 'bg-teal-50 text-teal-800 font-bold' : 'text-gray-600'
                    }`}
                  >
                    {lang === 'bn' ? c.name_bn : c.name_en}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Inputs */}
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">{lang === 'bn' ? 'মূল্য সীমা' : 'Price'}</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            {/* Done CTA */}
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold mt-4"
            >
              {lang === 'bn' ? 'ফিল্টার প্রয়োগ করুন' : 'Apply Filters'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
