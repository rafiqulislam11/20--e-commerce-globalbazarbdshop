import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  Tag,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Search,
  DollarSign,
  TrendingUp,
  Clock,
  X,
  Key,
  Sparkles,
  CreditCard,
  RefreshCw,
  XCircle,
  FileText
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: string, param?: string) => void;
}

const IMAGE_PRESETS = [
  { label: '📱 স্মার্টফোন', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800' },
  { label: '👕 পাঞ্জাবি', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800' },
  { label: '👗 জামদানি শাড়ি', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800' },
  { label: '⌚ স্মার্ট ওয়াচ', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' },
  { label: '👟 স্নিকার্স', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' },
  { label: '🍯 মধু জার', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800' },
  { label: '🎧 হেডফোন', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' }
];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { formatPrice, t } = useLanguage();
  const { user, isAdmin, isStaff, login } = useAuth();
  const [loggingInAsAdmin, setLoggingInAsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'payments' | 'categories' | 'coupons' | 'customers' | 'reviews' | 'settings'
  >('products');

  // Payment Verifications state
  const [paymentVerifications, setPaymentVerifications] = useState<any[]>([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [verifyingAction, setVerifyingAction] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ open: boolean; orderId: string; reason: string }>({
    open: false,
    orderId: '',
    reason: ''
  });
  const [correctionModal, setCorrectionModal] = useState<{ open: boolean; orderId: string; instructions: string }>({
    open: false,
    orderId: '',
    instructions: ''
  });

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products state & modal
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productStockFilter, setProductStockFilter] = useState('ALL');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '',
    name_en: '',
    name_bn: '',
    category_id: '',
    brand_id: '',
    price: '',
    sale_price: '',
    stock_quantity: '25',
    sku: '',
    warranty: '১ বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
    description_en: 'Authentic product with official warranty and fast home delivery across Bangladesh.',
    description_bn: '১০০% আসল ও সেরা কোয়ালিটির পণ্য, সারা বাংলাদেশে দ্রুত হোম ডেলিভারি সুবিধা।',
    is_featured: false,
    is_flash_sale: false,
    flash_sale_price: ''
  });
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productFeedback, setProductFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Coupons state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [newCouponVal, setNewCouponVal] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(1000);

  // Customers & Reviews state
  const [customers, setCustomers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Settings state
  const [settings, setSettings] = useState<any>({
    store_name: 'Global Bazar BD Shop',
    phone: '01310-824987',
    whatsapp_number: '01310-824987',
    owner_name: 'Rafiqul Islam',
    bkash_number: '01930-279175',
    nagad_number: '01930-279175',
    email: 'globalbazarbdshop@gmail.com',
    address: 'SQ Color Master 3 No, Jamirdia, Hobirbari, Bhaluka, Mymensingh, Bangladesh',
    tagline_en: 'Shop Smart. Live Better.',
    tagline_bn: 'স্মার্ট শপিং, সহজ জীবন',
    shipping_inside_dhaka: 70,
    shipping_outside_dhaka: 130,
    free_shipping_threshold: 2000,
    announcement_text_bn: '🎉 স্পেশাল অফার! ২০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি হোম ডেলিভারি!'
  });
  const [settingsMsg, setSettingsMsg] = useState('');

  // Quick 1-Click Admin Login Handler
  const handleQuickAdminLogin = async () => {
    setLoggingInAsAdmin(true);
    try {
      await login('admin@globalbazarbd.com', 'Admin@123456');
    } catch (err: any) {
      alert(err.message || 'Login failed');
    } finally {
      setLoggingInAsAdmin(false);
    }
  };

  // Load Products
  const loadProducts = () => {
    fetchApi<{ success: boolean; products: any[] }>('/admin/products')
      .then(res => {
        if (res.success) setProducts(res.products);
      })
      .catch(() => {});
  };

  // Load Orders
  const loadOrders = () => {
    fetchApi<{ success: boolean; orders: any[] }>(
      `/admin/orders?status=${orderStatusFilter}&search=${encodeURIComponent(orderSearch)}`
    )
      .then(res => {
        if (res.success) setOrders(res.orders);
      })
      .catch(() => {});
  };

  // Load Categories & Coupons
  const loadCategories = () => {
    fetchApi<{ success: boolean; categories: any[] }>('/categories')
      .then(res => {
        if (res.success) setCategories(res.categories);
      })
      .catch(() => {});
  };

  const loadCoupons = () => {
    fetchApi<{ success: boolean; coupons: any[] }>('/admin/coupons')
      .then(res => {
        if (res.success) setCoupons(res.coupons);
      })
      .catch(() => {});
  };

  const loadCustomers = () => {
    fetchApi<{ success: boolean; customers: any[] }>('/admin/customers')
      .then(res => {
        if (res.success) setCustomers(res.customers);
      })
      .catch(() => {});
  };

  const loadReviews = () => {
    fetchApi<{ success: boolean; reviews: any[] }>('/admin/reviews')
      .then(res => {
        if (res.success) setReviews(res.reviews);
      })
      .catch(() => {});
  };

  const loadSettings = () => {
    fetchApi<{ success: boolean; settings: any }>('/settings')
      .then(res => {
        if (res.success && res.settings) setSettings(res.settings);
      })
      .catch(() => {});
  };

  const loadPaymentVerifications = () => {
    fetchApi<{ success: boolean; orders: any[] }>(
      `/admin/payment-verifications?status=${paymentStatusFilter}`
    )
      .then(res => {
        if (res.success) setPaymentVerifications(res.orders);
      })
      .catch(() => {});
  };

  const handleVerifyPayment = async (orderId: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই bKash/Nagad পেমেন্টটি ভেরিফাই করতে চান? এটি অর্ডারকে কনফার্ম করবে।')) return;
    setVerifyingAction(orderId);
    try {
      const res = await fetchApi<{ success: boolean; message: string }>(
        `/admin/payment-verifications/${orderId}/verify`,
        { method: 'PUT', body: JSON.stringify({ notes: 'Verified by Admin' }) }
      );
      if (res.success) {
        loadPaymentVerifications();
        loadOrders();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setVerifyingAction(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectionModal.reason.trim()) {
      alert('বাতিলের কারণ উল্লেখ করুন');
      return;
    }
    try {
      const res = await fetchApi<{ success: boolean; message: string }>(
        `/admin/payment-verifications/${rejectionModal.orderId}/reject`,
        { method: 'PUT', body: JSON.stringify({ reason: rejectionModal.reason }) }
      );
      if (res.success) {
        setRejectionModal({ open: false, orderId: '', reason: '' });
        loadPaymentVerifications();
        loadOrders();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  const handleConfirmCorrection = async () => {
    if (!correctionModal.instructions.trim()) {
      alert('সংশোধন নির্দেশাবলী উল্লেখ করুন');
      return;
    }
    try {
      const res = await fetchApi<{ success: boolean; message: string }>(
        `/admin/payment-verifications/${correctionModal.orderId}/request-correction`,
        { method: 'PUT', body: JSON.stringify({ instructions: correctionModal.instructions }) }
      );
      if (res.success) {
        setCorrectionModal({ open: false, orderId: '', instructions: '' });
        loadPaymentVerifications();
        loadOrders();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(err.message || 'Request failed');
    }
  };

  // Load Initial Data (Dashboard stats, categories, products)
  useEffect(() => {
    if (!user || (!isAdmin && !isStaff)) return;

    fetchApi<{ success: boolean; stats: any }>('/admin/dashboard')
      .then(res => {
        if (res.success) setStats(res.stats);
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    loadCategories();
    loadProducts();
  }, [user, isAdmin, isStaff]);

  useEffect(() => {
    if (!user || (!isAdmin && !isStaff)) return;

    if (activeTab === 'products') {
      loadProducts();
      loadCategories();
    }
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'payments') loadPaymentVerifications();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'coupons') loadCoupons();
    if (activeTab === 'customers') loadCustomers();
    if (activeTab === 'reviews') loadReviews();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab, orderStatusFilter, orderSearch, paymentStatusFilter, user, isAdmin, isStaff]);

  // Filtered Products for Admin Table
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      !productSearch ||
      p.name_en?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name_bn?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(productSearch.toLowerCase());

    const matchesCategory =
      productCategoryFilter === 'ALL' || p.category_id === productCategoryFilter;

    const matchesStock =
      productStockFilter === 'ALL' ||
      (productStockFilter === 'IN_STOCK' && p.stock_quantity > 10) ||
      (productStockFilter === 'LOW_STOCK' && p.stock_quantity > 0 && p.stock_quantity <= 10) ||
      (productStockFilter === 'OUT_OF_STOCK' && (!p.stock_quantity || p.stock_quantity <= 0));

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setIsEditMode(false);
    setProductFeedback(null);
    setProductForm({
      id: '',
      name_en: '',
      name_bn: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      brand_id: '',
      price: '',
      sale_price: '',
      stock_quantity: '25',
      sku: `GBBD-${Math.floor(1000 + Math.random() * 9000)}`,
      warranty: '১ বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
      image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
      description_en: 'Authentic product with official warranty and fast home delivery across Bangladesh.',
      description_bn: '১০০% আসল ও সেরা কোয়ালিটির পণ্য, সারা বাংলাদেশে দ্রুত হোম ডেলিভারি সুবিধা।',
      is_featured: false,
      is_flash_sale: false,
      flash_sale_price: ''
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (p: any) => {
    setIsEditMode(true);
    setProductFeedback(null);
    setProductForm({
      id: p.id,
      name_en: p.name_en || '',
      name_bn: p.name_bn || '',
      category_id: p.category_id || (categories.length > 0 ? categories[0].id : ''),
      brand_id: p.brand_id || '',
      price: p.price !== undefined ? String(p.price) : '',
      sale_price: p.sale_price !== undefined && p.sale_price !== null ? String(p.sale_price) : '',
      stock_quantity: p.stock_quantity !== undefined ? String(p.stock_quantity) : '0',
      sku: p.sku || '',
      warranty: p.warranty || '১ বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
      image_url: p.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      description_en: p.description_en || '',
      description_bn: p.description_bn || '',
      is_featured: Boolean(p.is_featured),
      is_flash_sale: Boolean(p.is_flash_sale),
      flash_sale_price: p.flash_sale_price ? String(p.flash_sale_price) : ''
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name_en.trim() || !productForm.category_id || !productForm.price) {
      setProductFeedback({
        type: 'error',
        text: 'পণ্যের নাম (English), ক্যাটাগরি এবং নিয়মিত মূল্য (Regular Price) দেওয়া বাধ্যতামূলক।'
      });
      return;
    }

    setProductSubmitting(true);
    setProductFeedback(null);

    const payload = {
      name_en: productForm.name_en.trim(),
      name_bn: productForm.name_bn.trim() || productForm.name_en.trim(),
      category_id: productForm.category_id,
      brand_id: productForm.brand_id || null,
      price: Number(productForm.price),
      sale_price: productForm.sale_price ? Number(productForm.sale_price) : null,
      stock_quantity: Number(productForm.stock_quantity) || 0,
      sku: productForm.sku.trim() || `GBBD-${Math.floor(1000 + Math.random() * 9000)}`,
      warranty: productForm.warranty.trim() || null,
      image_url: productForm.image_url.trim(),
      description_en: productForm.description_en.trim(),
      description_bn: productForm.description_bn.trim(),
      is_featured: productForm.is_featured,
      is_flash_sale: productForm.is_flash_sale,
      flash_sale_price: productForm.is_flash_sale && productForm.flash_sale_price ? Number(productForm.flash_sale_price) : null
    };

    try {
      if (isEditMode) {
        await fetchApi(`/admin/products/${productForm.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setProductFeedback({ type: 'success', text: '✅ পণ্য সফলভাবে আপডেট করা হয়েছে!' });
      } else {
        await fetchApi('/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setProductFeedback({ type: 'success', text: '🎉 নতুন পণ্য সফলভাবে ক্যাটালগে যুক্ত হয়েছে!' });
      }

      loadProducts();
      setTimeout(() => {
        setIsProductModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setProductFeedback({ type: 'error', text: err.message || 'পণ্য সংরক্ষণ ব্যর্থ হয়েছে।' });
    } finally {
      setProductSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত "${productName}" পণ্যটি স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await fetchApi(`/admin/products/${productId}`, { method: 'DELETE' });
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'পণ্য ডিলিট ব্যর্থ হয়েছে');
    }
  };

  // Order Status Update Handler
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetchApi(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          order_status: newStatus,
          notes: `স্ট্যাটাস পরিবর্তন করে ${newStatus} করা হয়েছে`
        })
      });
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  // Customer status toggle
  const handleToggleCustomer = async (customerId: string) => {
    try {
      await fetchApi(`/admin/customers/${customerId}/toggle-status`, { method: 'PUT' });
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'Status toggle failed');
    }
  };

  // Review status toggle
  const handleUpdateReviewStatus = async (revId: string, status: string) => {
    try {
      await fetchApi(`/admin/reviews/${revId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadReviews();
    } catch (err: any) {
      alert(err.message || 'Review update failed');
    }
  };

  // Add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameEn.trim()) return;
    try {
      await fetchApi('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          name_en: newCatNameEn.trim(),
          name_bn: newCatNameBn.trim() || newCatNameEn.trim(),
          slug: newCatSlug.trim()
        })
      });
      setNewCatNameEn('');
      setNewCatNameBn('');
      setNewCatSlug('');
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Category addition failed');
    }
  };

  // Add coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    try {
      await fetchApi('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: newCouponCode.trim().toUpperCase(),
          discount_type: newCouponType,
          discount_val: Number(newCouponVal),
          min_order_val: Number(newCouponMin)
        })
      });
      setNewCouponCode('');
      loadCoupons();
    } catch (err: any) {
      alert(err.message || 'Coupon creation failed');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      setSettingsMsg('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setSettingsMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  // Check admin authorization gate
  if (!user || (!isAdmin && !isStaff)) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-5 select-none">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Key className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900">অ্যাডমিন প্যানেল (Admin Access)</h2>
          <p className="text-xs text-gray-500">
            পণ্য যোগ করা, অর্ডার ম্যানেজমেন্ট ও সেটিংস পরিচালনার জন্য অ্যাডমিন প্যানেলে প্রবেশ করুন।
          </p>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-left text-xs space-y-1.5">
          <p className="font-bold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>অ্যাডমিন ডেমো এক্সেস:</span>
          </p>
          <p className="font-mono text-gray-600">ইমেইল: <strong className="text-teal-800">admin@globalbazarbd.com</strong></p>
          <p className="font-mono text-gray-600">পাসওয়ার্ড: <strong className="text-teal-800">Admin@123456</strong></p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleQuickAdminLogin}
            disabled={loggingInAsAdmin}
            className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-2xl text-xs font-black shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 disabled:opacity-50"
          >
            <Key className="w-4 h-4 text-amber-300" />
            <span>{loggingInAsAdmin ? 'লগইন হচ্ছে...' : '🔑 ১-ক্লিকে অ্যাডমিন প্যানেলে প্রবেশ করুন'}</span>
          </button>
          
          <button
            onClick={() => onNavigate('auth', 'login')}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
          >
            লগইন পেইজে যান (Login Page)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {t('admin.dashboard')}
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PORTAL
            </span>
          </div>
          <p className="text-xs text-gray-500">
            গ্লোবাল বাজার বিডি শপ ব্যবস্থাপনা ও রিয়েল-টাইম এনালাইটিক্স
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="self-start sm:self-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          ← ওয়েবসাইট ভিজিট করুন
        </button>
      </div>

      {/* Main Grid: Nav Sidebar + Content Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav (3 cols) */}
        <div className="lg:col-span-3 space-y-1 bg-white p-3 rounded-3xl border border-gray-200 shadow-xs h-fit text-xs font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('admin.dashboard')}</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'orders' ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>{t('admin.orders')}</span>
            </div>
            {stats && stats.pendingOrders > 0 && (
              <span className="bg-amber-400 text-gray-950 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {stats.pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'payments' ? 'bg-pink-700 text-white shadow-sm' : 'text-gray-700 hover:bg-pink-50/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-pink-500" />
              <span>পেমেন্ট ভেরিফিকেশন</span>
            </div>
            {paymentVerifications.filter(p => p.payment_status === 'PAYMENT_VERIFICATION_PENDING').length > 0 && (
              <span className="bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                {paymentVerifications.filter(p => p.payment_status === 'PAYMENT_VERIFICATION_PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'products' ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('admin.products')}</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'categories' ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>{t('admin.categories')}</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'coupons' ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{t('admin.coupons')}</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'customers' ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('admin.customers')}</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'reviews' ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('admin.reviews')}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left p-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('admin.settings')}</span>
          </button>
        </div>

        {/* Content Area (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && loadingStats && (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 mt-3">ড্যাশবোর্ড এনালাইটিক্স লোড হচ্ছে...</p>
            </div>
          )}

          {activeTab === 'dashboard' && !loadingStats && stats && (
            <div className="space-y-6 animate-in fade-in-50">
              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase">{t('admin.total_sales')}</p>
                  <p className="text-xl font-black text-teal-900 font-mono">{formatPrice(stats.totalSales)}</p>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase">{t('admin.today_sales')}</p>
                  <p className="text-xl font-black text-sky-900 font-mono">{formatPrice(stats.todaySales)}</p>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase">{t('admin.pending_orders')}</p>
                  <p className="text-xl font-black text-amber-900 font-mono">{stats.pendingOrders}</p>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase">{t('admin.low_stock_alert')}</p>
                  <p className="text-xl font-black text-rose-900 font-mono">{stats.lowStockProducts}</p>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    সব অর্ডার দেখুন →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                      <tr>
                        <th className="p-3">অর্ডার আইডি</th>
                        <th className="p-3">গ্রাহক</th>
                        <th className="p-3">মূল্য</th>
                        <th className="p-3">পদ্ধতি</th>
                        <th className="p-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats.recentOrders?.map((ord: any) => (
                        <tr key={ord.id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold text-teal-800">{ord.order_number}</td>
                          <td className="p-3 font-semibold text-gray-900">{ord.customer_name}</td>
                          <td className="p-3 font-bold font-mono">{formatPrice(ord.grand_total)}</td>
                          <td className="p-3 font-medium uppercase text-gray-600">{ord.payment_method}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                              {ord.order_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">{t('admin.orders')}</h3>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="অর্ডার নং / গ্রাহক খুঁজুন..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      className="text-xs pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="ALL">সব স্ট্যাটাস (All)</option>
                    <option value="PENDING">PENDING (অপেক্ষমান)</option>
                    <option value="CONFIRMED">CONFIRMED (নিশ্চিত)</option>
                    <option value="PACKED">PACKED (প্যাকড)</option>
                    <option value="SHIPPED">SHIPPED (শিপড)</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (ডেলিভারির পথে)</option>
                    <option value="DELIVERED">DELIVERED (ডেলিভার্ড)</option>
                    <option value="CANCELLED">CANCELLED (বাতিল)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-3">অর্ডার আইডি</th>
                      <th className="p-3">গ্রাহকের তথ্য</th>
                      <th className="p-3">ঠিকানা</th>
                      <th className="p-3">মূল্য</th>
                      <th className="p-3">পেমেন্ট</th>
                      <th className="p-3">স্ট্যাটাস পরিবর্তন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(ord => (
                      <tr key={ord.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-teal-800 whitespace-nowrap">
                          {ord.order_number}
                          <p className="text-[10px] text-gray-400 font-normal">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-gray-900">{ord.customer_name}</p>
                          <p className="text-gray-500 font-mono text-[11px]">{ord.customer_phone}</p>
                        </td>
                        <td className="p-3 text-gray-600 max-w-xs truncate">
                          {ord.delivery_address}
                        </td>
                        <td className="p-3 font-bold font-mono text-teal-900 whitespace-nowrap">
                          {formatPrice(ord.grand_total)}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold uppercase text-gray-700">{ord.payment_method}</span>
                          <span className="block text-[10px] text-gray-400">({ord.payment_status})</span>
                        </td>
                        <td className="p-3">
                          <select
                            value={ord.order_status}
                            onChange={e => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="text-xs p-1.5 rounded-lg border border-gray-200 bg-white font-bold text-teal-900 focus:outline-none focus:border-teal-600 cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="PACKED">PACKED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PAYMENT VERIFICATION (bKash, Nagad, etc.) */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      পেমেন্ট ভেরিফিকেশন (Payment Verification Dashboard)
                    </h3>
                    <span className="bg-pink-100 text-pink-800 text-[11px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {paymentVerifications.length} টি পেমেন্ট
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    bKash ও Nagad পেমেন্টের TrxID এবং প্রেরক নম্বর যাচাই করে সরাসরি অর্ডার কনফার্ম, বাতিল বা সংশোধন করুন
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadPaymentVerifications}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="রিলোড করুন"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>রিফ্রেশ</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: 'ALL', label: 'সবগুলো (All)' },
                  { id: 'PAYMENT_VERIFICATION_PENDING', label: 'অপেক্ষমান (Pending Verification)' },
                  { id: 'PAID', label: 'অনুমোদিত (Paid / Verified)' },
                  { id: 'CORRECTION_REQUESTED', label: 'সংশোধন চাওয়া হয়েছে (Correction Requested)' },
                  { id: 'FAILED', label: 'বাতিলকৃত (Rejected)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setPaymentStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      paymentStatusFilter === tab.id
                        ? 'bg-pink-700 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Verification List Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-3">অর্ডার আইডি ও সময়</th>
                      <th className="p-3">গ্রাহকের নাম ও ফোন</th>
                      <th className="p-3">মেথড</th>
                      <th className="p-3">টাকার পরিমাণ</th>
                      <th className="p-3">প্রেরক নম্বর</th>
                      <th className="p-3">Transaction ID (TrxID)</th>
                      <th className="p-3">পেমেন্ট স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paymentVerifications.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-gray-400 font-medium">
                          কোনো পেমেন্ট ভেরিফিকেশন রেকর্ড পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      paymentVerifications.map(ord => (
                        <tr key={ord.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <p className="font-mono font-bold text-teal-800">{ord.order_number}</p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-gray-900">{ord.customer_name}</p>
                            <p className="text-gray-500 font-mono text-[11px]">{ord.customer_phone}</p>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.payment_method === 'BKASH'
                                  ? 'bg-pink-100 text-pink-800 border border-pink-200'
                                  : ord.payment_method === 'NAGAD'
                                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ord.payment_method}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-teal-900 text-sm">
                            {formatPrice(ord.grand_total)}
                          </td>
                          <td className="p-3 font-mono font-bold text-gray-800">
                            {ord.payment_phone || 'N/A'}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-teal-50 border border-teal-200 rounded font-mono font-bold text-teal-800">
                              {ord.transaction_id || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ord.payment_status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : ord.payment_status === 'FAILED'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : ord.payment_status === 'CORRECTION_REQUESTED'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                              }`}
                            >
                              {ord.payment_status === 'PAID'
                                ? 'অনুমোদিত (PAID)'
                                : ord.payment_status === 'FAILED'
                                ? 'বাতিল (FAILED)'
                                : ord.payment_status === 'CORRECTION_REQUESTED'
                                ? 'সংশোধন চাওয়া হয়েছে'
                                : 'ভেরিফিকেশন অপেক্ষমান'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {ord.payment_status !== 'PAID' && (
                                <button
                                  onClick={() => handleVerifyPayment(ord.id)}
                                  disabled={verifyingAction === ord.id}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                                  title="ভেরিফাই ও অর্ডার কনফার্ম করুন"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{verifyingAction === ord.id ? '...' : 'ভেরিফাই'}</span>
                                </button>
                              )}

                              <button
                                onClick={() => setCorrectionModal({ open: true, orderId: ord.id, instructions: '' })}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                title="সংশোধন চান"
                              >
                                সংশোধন
                              </button>

                              {ord.payment_status !== 'FAILED' && (
                                <button
                                  onClick={() => setRejectionModal({ open: true, orderId: ord.id, reason: '' })}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                  title="পেমেন্ট বাতিল করুন"
                                >
                                  বাতিল
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">{t('admin.products')}</h3>
                    <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {products.length} টি পণ্য
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    দোকানের সকল পণ্য তালিকাভুক্ত, স্টক পরিবর্তন ও নতুন পণ্য যুক্ত করার নিয়ন্ত্রণ
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-700/20 cursor-pointer transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ নতুন পণ্য যোগ করুন (Add Product)</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="নাম, SKU বা ক্যাটাগরি দিয়ে খুঁজুন..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-teal-600"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={productCategoryFilter}
                    onChange={e => setProductCategoryFilter(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="ALL">সকল ক্যাটাগরি (All Categories)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name_en} ({c.name_bn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Status Filter */}
                <div>
                  <select
                    value={productStockFilter}
                    onChange={e => setProductStockFilter(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="ALL">সব ধরণের স্টক (All Stock)</option>
                    <option value="IN_STOCK">ইন স্টক (In Stock &gt; 10)</option>
                    <option value="LOW_STOCK">কম স্টক (Low Stock &le; 10)</option>
                    <option value="OUT_OF_STOCK">স্টক শেষ (Out of Stock)</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-3">ছবি</th>
                      <th className="p-3">নাম ও এসকেইউ</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3">মূল্য</th>
                      <th className="p-3">স্টক</th>
                      <th className="p-3">ট্যাগস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          কোনো পণ্য খুঁজে পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <img
                              src={p.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                              alt=""
                              className="w-12 h-12 object-cover rounded-xl border border-gray-100 shadow-2xs"
                            />
                          </td>
                          <td className="p-3 max-w-xs">
                            <p className="font-bold text-gray-900 truncate text-xs">{p.name_en}</p>
                            <p className="text-[11px] text-gray-500 truncate">{p.name_bn}</p>
                            <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                              {p.sku}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-gray-700 whitespace-nowrap">
                            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-[11px]">
                              {p.category_name}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="font-mono font-bold text-teal-900">
                              {formatPrice(p.sale_price || p.price)}
                            </div>
                            {p.sale_price && (
                              <div className="text-[10px] text-gray-400 line-through font-mono">
                                {formatPrice(p.price)}
                              </div>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                p.stock_quantity > 10
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.stock_quantity > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {p.stock_quantity} in stock
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap space-x-1">
                            {p.is_flash_sale ? (
                              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                ⚡ Flash
                              </span>
                            ) : null}
                            {p.is_featured ? (
                              <span className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                ⭐ Featured
                              </span>
                            ) : null}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name_en)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6 animate-in fade-in-50">
              <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                ক্যাটাগরি ব্যবস্থাপনা (Category Management)
              </h3>

              <form onSubmit={handleAddCategory} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-800">নতুন ক্যাটাগরি যুক্ত করুন:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Name (English)..."
                    value={newCatNameEn}
                    onChange={e => setNewCatNameEn(e.target.value)}
                    className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="নাম (বাংলা)..."
                    value={newCatNameBn}
                    onChange={e => setNewCatNameBn(e.target.value)}
                    className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Slug (optional)..."
                    value={newCatSlug}
                    onChange={e => setNewCatSlug(e.target.value)}
                    className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 cursor-pointer"
                >
                  ক্যাটাগরি তৈরি করুন
                </button>
              </form>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map(c => (
                  <div key={c.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-gray-900">{c.name_en}</p>
                      <p className="text-[11px] text-gray-500">{c.name_bn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6 animate-in fade-in-50">
              <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                ডিসকাউন্ট কুপন ভাউচার (Coupons)
              </h3>

              <form onSubmit={handleAddCoupon} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-800">নতুন কুপন কোড তৈরি করুন:</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="কুপন কোড (e.g. SUMMER20)"
                    value={newCouponCode}
                    onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                    className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl uppercase font-mono font-bold"
                  />
                  <select
                    value={newCouponType}
                    onChange={e => setNewCouponType(e.target.value as any)}
                    className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED">FIXED AMOUNT (৳)</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="মান (Value)"
                    value={newCouponVal}
                    onChange={e => setNewCouponVal(Number(e.target.value))}
                    className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-mono"
                  />
                  <input
                    type="number"
                    placeholder="নূন্যতম অর্ডার (Min ৳)"
                    value={newCouponMin}
                    onChange={e => setNewCouponMin(Number(e.target.value))}
                    className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 cursor-pointer"
                >
                  কুপন সেভ করুন
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coupons.map(cp => (
                  <div key={cp.id} className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-800 text-sm bg-teal-50 px-2 py-0.5 rounded">
                          {cp.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          {cp.discount_type === 'PERCENTAGE' ? `${cp.discount_val}% OFF` : `৳${cp.discount_val} OFF`}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        নূন্যতম অর্ডার: {formatPrice(cp.min_order_val)} | মোট ব্যবহার: {cp.used_count} বার
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4 animate-in fade-in-50">
              <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                নিবন্ধিত গ্রাহকবৃন্দ ({customers.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                    <tr>
                      <th className="p-3">গ্রাহক নাম</th>
                      <th className="p-3">যোগাযোগ</th>
                      <th className="p-3">মোট অর্ডার</th>
                      <th className="p-3">মোট ব্যয়</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{c.name}</td>
                        <td className="p-3">
                          <p className="text-gray-700">{c.email}</p>
                          <p className="text-gray-400 font-mono text-[11px]">{c.phone}</p>
                        </td>
                        <td className="p-3 font-mono font-bold">{c.order_count}</td>
                        <td className="p-3 font-mono font-bold text-teal-800">{formatPrice(c.total_spent)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleCustomer(c.id)}
                            className="text-[11px] text-teal-700 font-bold hover:underline cursor-pointer"
                          >
                            {c.status === 'ACTIVE' ? 'ব্লক করুন' : 'সক্রিয় করুন'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4 animate-in fade-in-50">
              <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                গ্রাহক রিভিউ মডারেশন (Review Moderation)
              </h3>

              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">{r.customer_name}</span>
                        <span className="text-[11px] text-amber-500 font-bold">★ {r.rating}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{r.product_name}</span>
                      </div>
                      <p className="text-xs text-gray-700 italic">"{r.comment}"</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        {r.status}
                      </span>
                      {r.status === 'APPROVED' ? (
                        <button
                          onClick={() => handleUpdateReviewStatus(r.id, 'HIDDEN')}
                          className="text-[11px] text-gray-600 hover:underline cursor-pointer"
                        >
                          হাইড করুন
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateReviewStatus(r.id, 'APPROVED')}
                          className="text-[11px] text-emerald-700 hover:underline font-bold cursor-pointer"
                        >
                          অনুমোদন দিন
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5 animate-in fade-in-50">
              <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                ওয়েবসাইট ও ডেলিভারি কনফিগারেশন
              </h3>

              {settingsMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{settingsMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">স্টোর নাম (Business Name)</label>
                    <input
                      type="text"
                      value={settings.store_name || ''}
                      onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">মালিকের নাম (Business Owner)</label>
                    <input
                      type="text"
                      value={settings.owner_name || 'Rafiqul Islam'}
                      onChange={e => setSettings({ ...settings, owner_name: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-bold text-teal-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">বিজনেস ফোন / হটলাইন (Phone)</label>
                    <input
                      type="text"
                      value={settings.phone || '01310-824987'}
                      onChange={e => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">হোয়াটসঅ্যাপ নম্বর (WhatsApp)</label>
                    <input
                      type="text"
                      value={settings.whatsapp_number || '01310-824987'}
                      onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-pink-800 mb-1">বিকাশ নম্বর (bKash Number)</label>
                    <input
                      type="text"
                      value={settings.bkash_number || '01930-279175'}
                      onChange={e => setSettings({ ...settings, bkash_number: e.target.value })}
                      className="w-full text-xs p-2.5 border border-pink-200 rounded-xl font-mono font-bold text-pink-700 bg-pink-50/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-orange-800 mb-1">নগদ নম্বর (Nagad Number)</label>
                    <input
                      type="text"
                      value={settings.nagad_number || '01930-279175'}
                      onChange={e => setSettings({ ...settings, nagad_number: e.target.value })}
                      className="w-full text-xs p-2.5 border border-orange-200 rounded-xl font-mono font-bold text-orange-700 bg-orange-50/40"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">বিজনেস জিমেইল (Business Gmail)</label>
                    <input
                      type="email"
                      value={settings.email || 'globalbazarbdshop@gmail.com'}
                      onChange={e => setSettings({ ...settings, email: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">বিজনেস লোকেশন / ঠিকানা (Business Address)</label>
                    <input
                      type="text"
                      value={settings.address || 'SQ Color Master 3 No, Jamirdia, Hobirbari, Bhaluka, Mymensingh, Bangladesh'}
                      onChange={e => setSettings({ ...settings, address: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ট্যাগলাইন (বাংলা)</label>
                    <input
                      type="text"
                      value={settings.tagline_bn || 'স্মার্ট শপিং, সহজ জীবন'}
                      onChange={e => setSettings({ ...settings, tagline_bn: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tagline (English)</label>
                    <input
                      type="text"
                      value={settings.tagline_en || 'Shop Smart. Live Better.'}
                      onChange={e => setSettings({ ...settings, tagline_en: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ঢাকার ভেতরের চার্জ (৳)</label>
                    <input
                      type="number"
                      value={settings.shipping_inside_dhaka}
                      onChange={e => setSettings({ ...settings, shipping_inside_dhaka: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ঢাকার বাইরের চার্জ (৳)</label>
                    <input
                      type="number"
                      value={settings.shipping_outside_dhaka}
                      onChange={e => setSettings({ ...settings, shipping_outside_dhaka: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">ফ্রি ডেলিভারি সীমা (৳)</label>
                    <input
                      type="number"
                      value={settings.free_shipping_threshold}
                      onChange={e => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono font-bold text-teal-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">টপ অ্যানাউন্সমেন্ট টেক্সট</label>
                    <input
                      type="text"
                      value={settings.announcement_text_bn || ''}
                      onChange={e => setSettings({ ...settings, announcement_text_bn: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  সেটিংস আপডেট করুন
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Modal: Add / Edit Product */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            onClick={() => !productSubmitting && setIsProductModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto space-y-5 border border-gray-100 animate-in fade-in-50 zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  {isEditMode ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">
                    {isEditMode ? 'পণ্য সম্পাদনা করুন (Edit Product)' : 'নতুন পণ্য যোগ করুন (Add New Product)'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isEditMode
                      ? 'পণ্যের তথ্য, মূল্য বা স্টক আপডেট করুন'
                      : 'গ্লোবাল বাজার বিডি শপ ক্যাটালগে নতুন পণ্য তালিকাভুক্ত করুন'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !productSubmitting && setIsProductModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feedback Alert */}
            {productFeedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  productFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {productFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{productFeedback.text}</span>
              </div>
            )}

            {/* Quick Image Presets */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <p className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>দ্রুত ছবি নির্বাচন করুন (1-Click Sample Photo Presets):</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProductForm({ ...productForm, image_url: preset.url })}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      productForm.image_url === preset.url
                        ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-teal-500 hover:text-teal-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name English */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Product Title (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Walton Primo RM4 Pro..."
                    value={productForm.name_en}
                    onChange={e => setProductForm({ ...productForm, name_en: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                {/* Name Bangla */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    পণ্যের নাম (বাংলা)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ওয়ালটন প্রিমো আরএম৪ প্রো..."
                    value={productForm.name_bn}
                    onChange={e => setProductForm({ ...productForm, name_bn: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Category (ক্যাটাগরি) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={productForm.category_id}
                    onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="" disabled>ক্যাটাগরি নির্বাচন করুন</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name_en} ({c.name_bn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* SKU */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    SKU (পণ্য কোড)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GBBD-1094"
                    value={productForm.sku}
                    onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                {/* Regular Price */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Regular Price (মূল দাম ৳) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1500"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-teal-600 font-bold text-gray-900"
                  />
                </div>

                {/* Sale Price */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Sale / Offer Price (অফার মূল্য ৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1290 (ঐচ্ছিক)"
                    value={productForm.sale_price}
                    onChange={e => setProductForm({ ...productForm, sale_price: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-teal-600 font-bold text-teal-800"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Stock Quantity (মজুদ সংখ্যা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 30"
                    value={productForm.stock_quantity}
                    onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                {/* Warranty */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Warranty (ওয়ারেন্টি সুবিধা)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ১ বছরের অফিসিয়াল ওয়ারেন্টি"
                    value={productForm.warranty}
                    onChange={e => setProductForm({ ...productForm, warranty: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Image URL & Thumbnail Preview */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Image URL (ছবির সরাসরি ওয়েব লিংক) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.image_url}
                    onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                    className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                  {productForm.image_url && (
                    <img
                      src={productForm.image_url}
                      alt="Preview"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
                      }}
                      className="w-11 h-11 object-cover rounded-xl border border-gray-200 shadow-xs shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Description (English)</label>
                  <textarea
                    rows={2}
                    placeholder="Short product overview and specifications..."
                    value={productForm.description_en}
                    onChange={e => setProductForm({ ...productForm, description_en: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">বিবরণ (বাংলা)</label>
                  <textarea
                    rows={2}
                    placeholder="পণ্যের সংক্ষিপ্ত বিবরণ ও বৈশিষ্ট্য..."
                    value={productForm.description_bn}
                    onChange={e => setProductForm({ ...productForm, description_bn: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Featured & Flash Sale Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="rounded text-teal-700 focus:ring-teal-600 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">⭐ ফিচার্ড প্রোডাক্ট (Featured)</span>
                    <span className="text-[10px] text-gray-500">হোমপেজের জনপ্রিয় কালেকশনে দেখাবে</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_flash_sale}
                    onChange={e => setProductForm({ ...productForm, is_flash_sale: e.target.checked })}
                    className="rounded text-teal-700 focus:ring-teal-600 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">⚡ ফ্ল্যাশ সেল (Flash Sale)</span>
                    <span className="text-[10px] text-gray-500">সীমিত সময়ের বিশেষ অফার সেকশনে যাবে</span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={productSubmitting}
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  বাতিল করুন (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={productSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl font-bold shadow-lg shadow-teal-700/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-102 disabled:opacity-50"
                >
                  {productSubmitting ? (
                    <span>সংরক্ষণ হচ্ছে...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isEditMode ? 'পণ্য আপডেট করুন (Update)' : 'পণ্য সংরক্ষণ করুন (Save Product)'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Rejection Modal */}
      {rejectionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-rose-700">
                <XCircle className="w-5 h-5" />
                <span>পেমেন্ট বাতিল নিশ্চিতকরণ (Reject Payment)</span>
              </h4>
              <button
                onClick={() => setRejectionModal({ open: false, orderId: '', reason: '' })}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              পেমেন্ট বাতিল করলে অর্ডারটি CANCELLED হবে এবং টাইমলাইনে কারণ সংরক্ষিত হবে।
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">বাতিলের কারণ উল্লেখ করুন *</label>
              <textarea
                rows={3}
                required
                placeholder="যেমন: ভুল TrxID বা অ্যাকাউন্টে কোনো পেমেন্ট পাওয়া যায়নি..."
                value={rejectionModal.reason}
                onChange={e => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRejectionModal({ open: false, orderId: '', reason: '' })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Correction Modal */}
      {correctionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-purple-700">
                <FileText className="w-5 h-5" />
                <span>পেমেন্ট সংশোধন অনুরোধ (Request Correction)</span>
              </h4>
              <button
                onClick={() => setCorrectionModal({ open: false, orderId: '', instructions: '' })}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              গ্রাহকের সাথে যোগাযোগ করে সঠিক TrxID বা প্রেরক নম্বর সরবরাহের অনুরোধ পাঠান।
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">সংশোধন নির্দেশনা *</label>
              <textarea
                rows={3}
                required
                placeholder="যেমন: প্রদত্ত TrxID ম্যাচ করছে না, অনুগ্রহ করে সঠিক bKash/Nagad TrxID মেসেজ দিন..."
                value={correctionModal.instructions}
                onChange={e => setCorrectionModal({ ...correctionModal, instructions: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCorrectionModal({ open: false, orderId: '', instructions: '' })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer"
              >
                ফিরে যান
              </button>
              <button
                type="button"
                onClick={handleConfirmCorrection}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
              >
                সংশোধন রিকোয়েস্ট পাঠান
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
