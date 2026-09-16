export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  avatar?: string;
  status?: string;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  attributes: Record<string, string>;
  image_url?: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: number;
  display_order: number;
}

export interface Product {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  sku: string;
  category_id: string;
  brand_id?: string | null;
  description_en: string;
  description_bn: string;
  short_desc_en?: string;
  short_desc_bn?: string;
  price: number;
  sale_price?: number | null;
  cost_price?: number;
  stock_quantity: number;
  stock_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  warranty?: string;
  return_policy?: string;
  is_featured: number;
  is_flash_sale: number;
  flash_sale_price?: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  rating: number;
  review_count: number;
  tags?: string;
  created_at: string;
  primary_image?: string;
  category_name_en?: string;
  category_name_bn?: string;
  category_slug?: string;
  brand_name?: string;
  brand_slug?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  relatedProducts?: Product[];
}

export interface Category {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  product_count?: number;
  is_active: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  is_featured: number;
  product_count?: number;
}

export interface CartItem {
  product_id: string;
  name_en: string;
  name_bn: string;
  image: string;
  price: number;
  quantity: number;
  variant_id?: string | null;
  variant_name?: string | null;
  stock_quantity: number;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  variant_name?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderTimeline {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  delivery_address: string;
  division: string;
  district: string;
  upazila: string;
  shipping_method: 'INSIDE_DHAKA' | 'OUTSIDE_DHAKA' | 'EXPRESS';
  shipping_charge: number;
  subtotal: number;
  discount: number;
  grand_total: number;
  payment_method: 'COD' | 'BKASH' | 'NAGAD' | 'CARD' | 'BANK';
  payment_status: 'PENDING' | 'PAYMENT_VERIFICATION_PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'CORRECTION_REQUESTED';
  order_status: 'PENDING' | 'PAYMENT_VERIFICATION' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  transaction_id?: string | null;
  payment_phone?: string | null;
  payment_proof?: string | null;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
  timeline?: OrderTimeline[];
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_val: number;
  min_order_val: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  is_active: number;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: number;
  created_at: string;
  avatar?: string;
  product_name?: string;
}

export interface Banner {
  id: string;
  title_en: string;
  title_bn: string;
  subtitle_en?: string;
  subtitle_bn?: string;
  image_desktop: string;
  image_mobile?: string;
  link_url: string;
  cta_text_en: string;
  cta_text_bn: string;
}

export interface FlashSale {
  id: string;
  title_en: string;
  title_bn: string;
  banner?: string;
  start_time: string;
  end_time: string;
  discount_text?: string;
}

export interface BlogPost {
  id: string;
  title_en: string;
  title_bn: string;
  slug: string;
  summary_en?: string;
  summary_bn?: string;
  content_en: string;
  content_bn: string;
  cover_image?: string;
  category: string;
  author: string;
  read_time: string;
  created_at: string;
}

export interface StoreSettings {
  store_name: string;
  tagline_en: string;
  tagline_bn: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  address: string;
  currency_symbol: string;
  currency_code: string;
  shipping_inside_dhaka: number;
  shipping_outside_dhaka: number;
  shipping_express: number;
  free_shipping_threshold: number;
  announcement_text_bn: string;
  announcement_text_en: string;
  [key: string]: any;
}
