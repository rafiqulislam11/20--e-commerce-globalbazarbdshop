import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, Review } from '../types/index';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import {
  Star,
  ShoppingBag,
  Zap,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Check,
  ChevronRight,
  MessageSquarePlus,
  Flame,
  MessageCircle
} from 'lucide-react';

interface ProductDetailsPageProps {
  slug: string;
  onNavigate: (page: string, param?: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ slug, onNavigate, onQuickView }) => {
  const { lang, formatPrice, t } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchApi<{ success: boolean; product: Product }>(`/products/${slug}`)
      .then(res => {
        if (res.success && res.product) {
          setProduct(res.product);
          if (res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          }
          if (res.product.images && res.product.images.length > 0) {
            setActiveImage(res.product.images[0].image_url);
          } else {
            setActiveImage(res.product.primary_image || '');
          }
        }
      })
      .catch(err => console.error('Fetch product details error:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">পণ্যটি খুঁজে পাওয়া যায়নি (Product Not Found)</h2>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold"
        >
          {t('cart.start_shopping')}
        </button>
      </div>
    );
  }

  const price = product.price;
  const salePrice = selectedVariant?.price || product.sale_price || (product.is_flash_sale && product.flash_sale_price ? product.flash_sale_price : null);
  const currentPrice = salePrice !== null ? salePrice : price;
  const discountPercent = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    onNavigate('checkout');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleWhatsAppInquiry = () => {
    const productName = lang === 'bn' ? product.name_bn || product.name_en : product.name_en;
    const currentUrl = window.location.href;
    const msg = `Hello Global Bazar BD Shop, I am interested in this product: ${productName}. Price: ৳${currentPrice}. Link: ${currentUrl}`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/8801310824987?text=${encoded}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await fetchApi('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          product_id: product.id,
          rating: newRating,
          comment: newComment.trim(),
          customer_name: user?.name || reviewerName || 'Verified Customer'
        })
      });
      setReviewSuccess(true);
      setNewComment('');
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Review submission failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <button onClick={() => onNavigate('home')} className="hover:text-teal-700 cursor-pointer">
          {t('nav.home')}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('shop')} className="hover:text-teal-700 cursor-pointer">
          {t('nav.shop')}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => onNavigate('shop', `category=${product.category_slug}`)}
          className="hover:text-teal-700 cursor-pointer truncate max-w-[150px]"
        >
          {lang === 'bn' ? product.category_name_bn || product.category_name_en : product.category_name_en}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-bold truncate max-w-[200px]">
          {lang === 'bn' ? product.name_bn || product.name_en : product.name_en}
        </span>
      </div>

      {/* Main Product Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Gallery Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Image Box with Zoom Effect */}
          <div className="relative pt-[100%] bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs group">
            <img
              src={activeImage || product.primary_image}
              alt={product.name_en}
              className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-125 transition-transform duration-500 cursor-crosshair"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.is_flash_sale === 1 && (
              <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white" />
                FLASH SALE
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map(img => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 bg-white p-1 transition-all cursor-pointer ${
                    activeImage === img.image_url ? 'border-teal-600 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Actions Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Brand & Category Meta */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
              {lang === 'bn' ? product.category_name_bn || product.category_name_en : product.category_name_en}
            </span>
            {product.brand_name && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Brand: <strong className="text-gray-800">{product.brand_name}</strong>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-snug">
            {lang === 'bn' ? product.name_bn || product.name_en : product.name_en}
          </h1>

          {/* Rating & Stock Status Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-gray-900">{product.rating.toFixed(1)}</span>
              <span className="text-gray-500">({product.review_count} {t('product.reviews_count')})</span>
            </div>

            <span className="text-gray-300">|</span>

            <span className="font-mono text-gray-500">{t('product.sku')} {product.sku}</span>

            <span className="text-gray-300">|</span>

            <span
              className={`font-bold px-2.5 py-0.5 rounded-full ${
                product.stock_quantity > 10
                  ? 'bg-emerald-100 text-emerald-800'
                  : product.stock_quantity > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.stock_quantity > 0 ? t('product.in_stock') : t('product.out_of_stock')}
            </span>
          </div>

          {/* Price Box */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-teal-800">
              {formatPrice(currentPrice)}
            </span>
            {discountPercent > 0 && (
              <>
                <span className="text-sm sm:text-base text-gray-400 line-through">
                  {formatPrice(price)}
                </span>
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                  {lang === 'bn' ? `৳${price - (salePrice || price)} সাশ্রয়` : `Save ${discountPercent}%`}
                </span>
              </>
            )}
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-gray-800">{t('product.select_variant')}:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.image_url) setActiveImage(v.image_url);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedVariant?.id === v.id
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-gray-700">{t('product.quantity')}:</span>
            <div className="flex items-center border border-gray-300 bg-white rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-1.5 font-bold text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                -
              </button>
              <span className="px-4 py-1.5 text-xs font-bold font-mono">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="px-3.5 py-1.5 font-bold text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-gray-400">
              ({product.stock_quantity} {lang === 'bn' ? 'টি স্টকে আছে' : 'units left in stock'})
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
              className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('product.add_to_cart')}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock_quantity <= 0}
              className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-gray-950" />
              <span>{t('product.buy_now')}</span>
            </button>

            {/* Wishlist and Share */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                }`}
                title={t('nav.wishlist')}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-2xl border border-gray-200 hover:border-gray-300 text-gray-700 bg-white cursor-pointer transition-all"
                title="Share link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Dedicated WhatsApp Order / Inquiry Button */}
          <button
            type="button"
            onClick={handleWhatsAppInquiry}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.01]"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
            <span>
              {lang === 'bn'
                ? '💬 হোয়াটসঅ্যাপে সরাসরি অর্ডার / তথ্য জানতে ক্লিক করুন (01310-824987)'
                : '💬 Ask on WhatsApp / Direct Order (01310-824987)'}
            </span>
          </button>

          {/* Bangladesh Delivery Calculator & Trust Policy Badges */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-900">
              <Truck className="w-4 h-4 text-teal-700" />
              <span>{t('product.delivery_calc')} (Bangladesh)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{t('product.inside_dhaka')}</p>
                  <p className="text-[11px] text-gray-500">২৪-৪৮ ঘণ্টা সময় (Home Delivery)</p>
                </div>
                <span className="font-mono font-bold text-teal-800">৳70</span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{t('product.outside_dhaka')}</p>
                  <p className="text-[11px] text-gray-500">২-৪ কার্যদিবস (৬৪ জেলায় কুরিয়ার)</p>
                </div>
                <span className="font-mono font-bold text-teal-800">৳130</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-gray-600">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                {product.warranty || 'অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি'}
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                ৭ দিনের সহজ রিটার্ন পলিসি
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ক্যাশ অন ডেলিভারি সুবিধা
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Customer Reviews Tabs */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4">
            {t('product.description')}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {lang === 'bn' ? product.description_bn || product.description_en : product.description_en}
          </p>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {t('product.customer_reviews')} ({product.reviews?.length || 0})
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-900">{product.rating.toFixed(1)} out of 5</span>
              </div>
            </div>
          </div>

          {/* Existing Reviews List */}
          <div className="space-y-4 mb-8">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev: Review) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                        {rev.customer_name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-gray-900">{rev.customer_name}</span>
                      {rev.is_verified_purchase === 1 && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                          {lang === 'bn' ? 'যাচাইকৃত ক্রেতা' : 'Verified Purchase'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">
                {lang === 'bn' ? 'এখনো কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনি দিন!' : 'No reviews yet. Be the first to review this product!'}
              </p>
            )}
          </div>

          {/* Write a Review Form */}
          <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-4">
            <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-teal-700" />
              <span>{t('product.write_review')}</span>
            </h4>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {lang === 'bn' ? 'আপনার রেটিং নির্ধারণ করুন:' : 'Your Rating:'}
                </label>
                <div className="flex gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {!user && (
                <div>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    placeholder={lang === 'bn' ? 'আপনার নাম...' : 'Your Name...'}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>
              )}

              <div>
                <textarea
                  required
                  rows={3}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder={lang === 'bn' ? 'পণ্যটি সম্পর্কে আপনার বাস্তব অভিজ্ঞতা শেয়ার করুন...' : 'Write your honest review...'}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              {reviewSuccess && (
                <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'bn' ? 'ধন্যবাদ! আপনার রিভিউটি জমা দেওয়া হয়েছে।' : 'Thank you! Your review has been submitted.'}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submittingReview ? 'জমা হচ্ছে...' : lang === 'bn' ? 'রিভিউ জমা দিন' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {t('product.related_products')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {product.relatedProducts.map(rel => (
              <ProductCard
                key={rel.id}
                product={rel}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
