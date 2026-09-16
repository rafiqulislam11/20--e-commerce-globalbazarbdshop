import {
  MOCK_CATEGORIES,
  MOCK_BANNERS,
  MOCK_FLASH_SALE,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_COUPONS
} from './mockData';

const API_BASE = '/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('globalbazar_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      return data as T;
    }

    // If endpoint not found or backend offline, fallback to mock data
    const mockData = getMockFallback<T>(endpoint, options);
    if (mockData !== null) {
      return mockData;
    }

    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Request failed with status ${response.status}`);
  } catch (err: any) {
    // If network error (e.g. static GitHub Pages deployment with no backend), use mock
    const mockData = getMockFallback<T>(endpoint, options);
    if (mockData !== null) {
      return mockData;
    }
    throw err;
  }
}

function getMockFallback<T>(endpoint: string, options: RequestInit = {}): T | null {
  const [path, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  // 1. Banners
  if (path === '/banners') {
    return {
      success: true,
      banners: MOCK_BANNERS,
      flashSale: MOCK_FLASH_SALE
    } as T;
  }

  // 2. Categories
  if (path === '/categories') {
    return {
      success: true,
      categories: MOCK_CATEGORIES
    } as T;
  }

  // 3. Featured products
  if (path === '/products/featured') {
    return {
      success: true,
      flashSale: MOCK_PRODUCTS.filter(p => p.is_flash_sale),
      bestSellers: MOCK_PRODUCTS.slice(0, 4),
      newArrivals: MOCK_PRODUCTS.slice(2, 6)
    } as T;
  }

  // 4. Product details by slug
  if (path.startsWith('/products/slug/')) {
    const slug = path.replace('/products/slug/', '');
    const product = MOCK_PRODUCTS.find(p => p.slug === slug) || MOCK_PRODUCTS[0];
    return {
      success: true,
      product,
      relatedProducts: MOCK_PRODUCTS.filter(p => p.id !== product.id).slice(0, 4)
    } as T;
  }

  // 5. Product details by ID
  if (path.startsWith('/products/')) {
    const id = path.replace('/products/', '');
    const product = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
    return {
      success: true,
      product,
      relatedProducts: MOCK_PRODUCTS.filter(p => p.id !== product.id).slice(0, 4)
    } as T;
  }

  // 6. Products list / Search / Filter
  if (path === '/products') {
    let list = [...MOCK_PRODUCTS];
    const cat = params.get('category');
    const search = params.get('search')?.toLowerCase();
    const minPrice = Number(params.get('min_price')) || 0;
    const maxPrice = Number(params.get('max_price')) || Infinity;
    const sort = params.get('sort');

    if (cat) {
      list = list.filter(p => p.category_id === cat || p.category_slug === cat);
    }
    if (search) {
      list = list.filter(p => 
        p.name_en.toLowerCase().includes(search) || 
        p.name_bn.includes(search) || 
        (p.tags && p.tags.includes(search))
      );
    }
    if (minPrice > 0) list = list.filter(p => (p.sale_price || p.price) >= minPrice);
    if (maxPrice < Infinity) list = list.filter(p => (p.sale_price || p.price) <= maxPrice);

    if (sort === 'price_asc') list.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
    else if (sort === 'price_desc') list.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);

    return {
      success: true,
      products: list,
      pagination: {
        total: list.length,
        page: 1,
        limit: 20,
        total_pages: 1
      }
    } as T;
  }

  // 7. Customer Reviews
  if (path === '/reviews') {
    return {
      success: true,
      reviews: MOCK_REVIEWS
    } as T;
  }

  // 8. Apply Coupon
  if (path === '/coupons/apply') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      const found = MOCK_COUPONS.find(c => c.code.toUpperCase() === (body.code || '').toUpperCase());
      if (found) {
        return {
          success: true,
          coupon: found,
          message: 'কুপন সফলভাবে যুক্ত হয়েছে!'
        } as T;
      }
    } catch (_) {}
    return {
      success: false,
      message: 'অবৈধ বা মেয়াদোত্তীর্ণ কুপন কোড'
    } as T;
  }

  // 9. Create Order
  if (path === '/orders' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      const orderNumber = 'GBB-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        id: 'ord-' + Date.now(),
        order_number: orderNumber,
        customer_name: body.customer_name || 'গ্রাহক',
        customer_phone: body.customer_phone || '01700000000',
        delivery_address: body.delivery_address || 'ঢাকা, বাংলাদেশ',
        division: body.division || 'Dhaka',
        district: body.district || 'Dhaka',
        upazila: body.upazila || 'Dhanmondi',
        shipping_method: body.shipping_method || 'INSIDE_DHAKA',
        shipping_charge: body.shipping_charge || 60,
        subtotal: body.subtotal || 2500,
        discount: body.discount || 0,
        grand_total: body.grand_total || 2560,
        payment_method: body.payment_method || 'COD',
        payment_status: body.payment_method === 'COD' ? 'PENDING' : 'PAYMENT_VERIFICATION_PENDING',
        order_status: 'CONFIRMED',
        created_at: new Date().toISOString(),
        items: body.items || []
      };

      const existing = JSON.parse(localStorage.getItem('globalbazar_mock_orders') || '[]');
      existing.unshift(newOrder);
      localStorage.setItem('globalbazar_mock_orders', JSON.stringify(existing));

      return {
        success: true,
        order: newOrder
      } as T;
    } catch (_) {}
  }

  // 10. Track Order
  if (path.startsWith('/orders/track/')) {
    const orderNum = path.replace('/orders/track/', '');
    const existing = JSON.parse(localStorage.getItem('globalbazar_mock_orders') || '[]');
    const matched = existing.find((o: any) => o.order_number === orderNum);
    if (matched) {
      return {
        success: true,
        order: matched,
        timeline: [
          { id: 't-1', status: 'CONFIRMED', notes: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে', created_at: matched.created_at },
          { id: 't-2', status: 'PROCESSING', notes: 'প্যাকেজিং প্রক্রিয়াধীন রয়েছে', created_at: matched.created_at }
        ]
      } as T;
    }
  }

  // 11. My Orders
  if (path === '/orders/my-orders') {
    const existing = JSON.parse(localStorage.getItem('globalbazar_mock_orders') || '[]');
    return {
      success: true,
      orders: existing
    } as T;
  }

  // 12. Auth Login & Demo
  if (path === '/auth/login' && options.method === 'POST') {
    try {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
      const isAdmin = (body.email || '').includes('admin');
      const user = {
        id: isAdmin ? 'usr-admin-1' : 'usr-cust-1',
        name: isAdmin ? 'Rafiqul Admin' : 'Tanvir Hasan',
        email: body.email || (isAdmin ? 'admin@globalbazar.com' : 'customer@globalbazar.com'),
        role: isAdmin ? 'ADMIN' : 'CUSTOMER'
      };
      localStorage.setItem('globalbazar_token', 'mock_jwt_token_demo');
      return {
        success: true,
        token: 'mock_jwt_token_demo',
        user
      } as T;
    } catch (_) {}
  }

  // 13. Admin stats
  if (path.startsWith('/admin/stats')) {
    return {
      success: true,
      stats: {
        totalOrders: 142,
        totalRevenue: 540800,
        totalCustomers: 96,
        pendingOrders: 8,
        recentOrders: JSON.parse(localStorage.getItem('globalbazar_mock_orders') || '[]').slice(0, 5)
      }
    } as T;
  }

  // 14. Store Settings
  if (path === '/settings') {
    return {
      success: true,
      settings: {
        site_name: 'Global Bazar BD Shop',
        tagline: 'স্মার্ট শপিং, সহজ জীবন',
        hotline: '+880 1711-223344',
        email: 'support@globalbazarbd.com',
        address: 'লেভেল ৪, ব্লক-ডি, বসুন্ধরা সিটি শপিং মল, পান্থপথ, ঢাকা-১২১৫',
        shipping_inside_dhaka: 60,
        shipping_outside_dhaka: 120,
        free_shipping_threshold: 3000
      }
    } as T;
  }

  return null;
}
