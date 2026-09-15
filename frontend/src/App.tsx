import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickViewModal } from './components/product/QuickViewModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { BlogPage, BlogPostPage } from './pages/BlogPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { WishlistPage } from './pages/WishlistPage';
import { Product } from './types/index';

export const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const navigate = (page: string, param = '') => {
    setCurrentPage(page);
    setPageParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: any) => {
    setLastOrder(order);
    navigate('order-success');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900 font-sans">
      {/* 1. Global Announcement Ticker */}
      <AnnouncementBar />

      {/* 2. Professional Header */}
      <Header onNavigate={navigate} currentPage={currentPage} />

      {/* 3. Main Body Pages View */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigate}
            onQuickView={(p: Product) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            initialQuery={pageParam}
            onNavigate={navigate}
            onQuickView={(p: Product) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'product' && (
          <ProductDetailsPage
            slug={pageParam}
            onNavigate={navigate}
            onQuickView={(p: Product) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'cart' && <CartPage onNavigate={navigate} />}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onNavigate={navigate}
          />
        )}

        {currentPage === 'order-success' && (
          <OrderSuccessPage order={lastOrder} onNavigate={navigate} />
        )}

        {currentPage === 'tracking' && (
          <TrackOrderPage initialQuery={pageParam} onNavigate={navigate} />
        )}

        {currentPage === 'account' && (
          <CustomerAccountPage
            initialTab={(pageParam as any) || 'orders'}
            onNavigate={navigate}
          />
        )}

        {currentPage === 'wishlist' && (
          <WishlistPage
            onNavigate={navigate}
            onQuickView={(p: Product) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            initialTab={(pageParam as any) || 'login'}
            onNavigate={navigate}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage onNavigate={navigate} />
        )}

        {currentPage === 'blog' && <BlogPage onNavigate={navigate} />}

        {currentPage === 'blog-post' && (
          <BlogPostPage slug={pageParam} onNavigate={navigate} />
        )}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'legal' && (
          <LegalPage initialTab={pageParam} onNavigate={navigate} />
        )}
      </main>

      {/* 4. Global Modals & Overlays */}
      <CartDrawer onNavigate={navigate} />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={navigate}
      />
      <WhatsAppButton />

      {/* 5. Mobile Sticky Bottom Navigation */}
      <MobileBottomNav onNavigate={navigate} currentPage={currentPage} />

      {/* 6. Comprehensive Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
