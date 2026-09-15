import bcrypt from 'bcryptjs';
import { db, initializeDatabase } from '../config/db.js';
import { DEFAULT_SETTINGS } from '../config/constants.js';

export async function seedDatabase() {
  initializeDatabase();

  console.log('🌱 Checking if database already has seed data...');
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  if (userCount > 0) {
    console.log('ℹ️ Database already contains data. Skipping seed to prevent overwrite.');
    return;
  }

  console.log('🚀 Seeding realistic Bangladesh eCommerce data for Global Bazar BD Shop...');

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@123456', salt);
  const staffPasswordHash = await bcrypt.hash('Staff@123456', salt);
  const customerPasswordHash = await bcrypt.hash('Customer@123456', salt);

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('usr-admin-1', 'Rafiqul Admin', 'admin@globalbazarbd.com', '01711223344', adminPasswordHash, 'ADMIN', 'ACTIVE');
  insertUser.run('usr-staff-1', 'Karim Operations', 'staff@globalbazarbd.com', '01811223344', staffPasswordHash, 'STAFF', 'ACTIVE');
  insertUser.run('usr-cust-1', 'Tanvir Hasan', 'tanvir.hasan@gmail.com', '01712345678', customerPasswordHash, 'CUSTOMER', 'ACTIVE');
  insertUser.run('usr-cust-2', 'Nusrat Jahan', 'nusrat.jahan@yahoo.com', '01912345678', customerPasswordHash, 'CUSTOMER', 'ACTIVE');
  insertUser.run('usr-cust-3', 'Shirin Akter', 'shirin.akter@gmail.com', '01612345678', customerPasswordHash, 'CUSTOMER', 'ACTIVE');

  // 2. Seed Addresses
  const insertAddress = db.prepare(`
    INSERT INTO addresses (id, user_id, title, division, district, upazila, full_address, phone, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAddress.run('addr-1', 'usr-cust-1', 'Home', 'Dhaka', 'Dhaka', 'Dhanmondi', 'House 24, Road 7A, Dhanmondi, Dhaka-1209', '01712345678', 1);
  insertAddress.run('addr-2', 'usr-cust-1', 'Office', 'Dhaka', 'Dhaka', 'Gulshan', 'Level 5, Gulshan Tower, Gulshan-2, Dhaka', '01712345678', 0);
  insertAddress.run('addr-3', 'usr-cust-2', 'Home', 'Chittagong', 'Chittagong', 'Panchlaish', 'GEC Circle, Nasirabad Housing Society, Chattogram', '01912345678', 1);

  // 3. Seed Categories
  const categories = [
    { id: 'cat-gadgets', name_en: 'Electronics & Gadgets', name_bn: 'ইলেকট্রনিক্স ও গ্যাজেট', slug: 'electronics-gadgets', icon: 'Cpu', desc: 'Audio, smart devices, camera accessories & peripherals' },
    { id: 'cat-phones', name_en: 'Smartphones & Tablets', name_bn: 'স্মার্টফোন ও ট্যাব', slug: 'smartphones-tablets', icon: 'Smartphone', desc: 'Latest flagship & budget smartphones with official warranty' },
    { id: 'cat-computers', name_en: 'Computers & Laptops', name_bn: 'কম্পিউটার ও ল্যাপটপ', slug: 'computers-laptops', icon: 'Laptop', desc: 'Laptops, gaming PCs, monitors, SSDs & accessories' },
    { id: 'cat-men-fashion', name_en: "Men's Fashion", name_bn: 'পুরুষদের ফ্যাশন', slug: 'mens-fashion', icon: 'Shirt', desc: 'Panjabis, casual shirts, polo, trousers & ethnic wear' },
    { id: 'cat-women-fashion', name_en: "Women's Fashion", name_bn: 'নারীদের ফ্যাশন', slug: 'womens-fashion', icon: 'Sparkles', desc: 'Sarees, kurtis, three-piece sets, shalwar kameez & western' },
    { id: 'cat-health-beauty', name_en: 'Health & Beauty', name_bn: 'স্বাস্থ্য ও সৌন্দর্য', slug: 'health-beauty', icon: 'Heart', desc: 'Skincare, haircare, fragrances, vitamins & personal grooming' },
    { id: 'cat-home-living', name_en: 'Home & Living', name_bn: 'হোম ও লিভিং', slug: 'home-living', icon: 'Home', desc: 'Bed sheets, curtains, lighting, fans & home decor' },
    { id: 'cat-kitchen', name_en: 'Kitchen & Dining', name_bn: 'রান্নাঘর ও ডাইনিং', slug: 'kitchen-dining', icon: 'Utensils', desc: 'Cookware, air fryers, blenders, kettles & tableware' },
    { id: 'cat-grocery', name_en: 'Grocery & Organic Food', name_bn: 'মুদি ও খাঁটি খাদ্য', slug: 'grocery-food', icon: 'ShoppingBag', desc: 'Pure honey, mustard oil, organic ghee, spices & daily essentials' },
    { id: 'cat-watches', name_en: 'Watches & Wearables', name_bn: 'ঘড়ি ও ওয়্যারেবলস', slug: 'watches-wearables', icon: 'Watch', desc: 'Smartwatches, fitness trackers & luxury analog watches' },
    { id: 'cat-footwear', name_en: 'Footwear & Bags', name_bn: 'জুতো ও ব্যাগ', slug: 'footwear-bags', icon: 'Footprints', desc: 'Leather shoes, sneakers, sandals, backpacks & travel luggage' },
    { id: 'cat-sports', name_en: 'Sports & Fitness', name_bn: 'খেলাধুলা ও ফিটনেস', slug: 'sports-fitness', icon: 'Activity', desc: 'Badminton, gym gear, yoga mats, resistance bands' },
    { id: 'cat-baby-kids', name_en: 'Kids & Baby Toys', name_bn: 'বাচ্চাদের পণ্য ও খেলনা', slug: 'kids-baby', icon: 'Smile', desc: 'Diapers, baby clothing, educational toys & feeding accessories' },
    { id: 'cat-books', name_en: 'Books & Stationery', name_bn: 'বই ও স্টেশনারি', slug: 'books-stationery', icon: 'BookOpen', desc: 'Bestseller Bangla books, academic, office stationary & art supplies' },
    { id: 'cat-appliances', name_en: 'Home Appliances', name_bn: 'হোম অ্যাপ্লায়েন্সেস', slug: 'home-appliances', icon: 'Tv', desc: 'Smart TVs, refrigerators, microwave ovens & washing machines' }
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name_en, name_bn, slug, description, image, icon, is_active, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  categories.forEach((cat, idx) => {
    insertCategory.run(
      cat.id,
      cat.name_en,
      cat.name_bn,
      cat.slug,
      cat.desc,
      `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80`,
      cat.icon,
      1,
      idx + 1
    );
  });

  // 4. Seed Brands
  const brands = [
    { id: 'br-samsung', name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80', is_featured: 1 },
    { id: 'br-apple', name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80', is_featured: 1 },
    { id: 'br-xiaomi', name: 'Xiaomi', slug: 'xiaomi', logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&auto=format&fit=crop&q=80', is_featured: 1 },
    { id: 'br-walton', name: 'Walton', slug: 'walton', logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&auto=format&fit=crop&q=80', is_featured: 1 },
    { id: 'br-apex', name: 'Apex', slug: 'apex', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80', is_featured: 1 },
    { id: 'br-bata', name: 'Bata', slug: 'bata', logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&auto=format&fit=crop&q=80', is_featured: 1 },
    { id: 'br-aarong', name: 'Aarong', slug: 'aarong', logo: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&auto=format&fit=crop&q=80', is_featured: 1 },
    { id: 'br-philips', name: 'Philips', slug: 'philips', logo: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=200&auto=format&fit=crop&q=80', is_featured: 0 },
    { id: 'br-dettol', name: 'Dettol', slug: 'dettol', logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80', is_featured: 0 },
    { id: 'br-casio', name: 'Casio', slug: 'casio', logo: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&auto=format&fit=crop&q=80', is_featured: 1 }
  ];

  const insertBrand = db.prepare(`
    INSERT INTO brands (id, name, slug, logo, is_featured)
    VALUES (?, ?, ?, ?, ?)
  `);

  brands.forEach(b => {
    insertBrand.run(b.id, b.name, b.slug, b.logo, b.is_featured);
  });

  // 5. Seed 34 Realistic Bangladesh Products
  const products = [
    {
      id: 'prod-1',
      name_en: 'Walton Smart LED TV 43" 4K Google TV Voice Control',
      name_bn: 'ওয়ালটন স্মার্ট ৪৩ ইঞ্চি ৪কে গুগল ভয়েস কন্ট্রোল টিভি',
      slug: 'walton-smart-led-tv-43-inch-4k',
      sku: 'WLT-TV-43G',
      category_id: 'cat-appliances',
      brand_id: 'br-walton',
      price: 42500,
      sale_price: 36900,
      cost_price: 31000,
      stock: 24,
      is_featured: 1,
      is_flash_sale: 1,
      flash_sale_price: 35500,
      rating: 4.8,
      review_count: 38,
      warranty: '৫ বছরের প্যানেল ওয়ারেন্টি',
      desc_en: 'Stunning 4K HDR display with Dolby Audio, Google Voice Assistant, Netflix and YouTube pre-installed. Energy efficient certified.',
      desc_bn: 'ডলবি অডিও ও গুগল ভয়েস রিমোট সহ ক্রিস্টাল ক্লিয়ার ৪কে এইচডিআর ডিসপ্লে। ৫ বছরের অফিসিয়াল প্যানেল গ্যারান্টি।',
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
      tags: ['tv', 'walton', '4k', 'electronics']
    },
    {
      id: 'prod-2',
      name_en: 'Xiaomi Redmi Note 13 Pro (8GB RAM / 256GB ROM)',
      name_bn: 'শাওমি রেডমি নোট ১৩ প্রো (৮জিবি / ২৫৬জিবি)',
      slug: 'xiaomi-redmi-note-13-pro-8gb-256gb',
      sku: 'XIA-RN13P-256',
      category_id: 'cat-phones',
      brand_id: 'br-xiaomi',
      price: 31999,
      sale_price: 28499,
      cost_price: 25000,
      stock: 45,
      is_featured: 1,
      is_flash_sale: 1,
      flash_sale_price: 27999,
      rating: 4.9,
      review_count: 56,
      warranty: '১ বছরের অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি',
      desc_en: '200MP OIS Camera, 120Hz AMOLED Display, 67W Turbo Charge with 5000mAh long battery life.',
      desc_bn: '২০০ মেগাপিক্সেল অপটিক্যাল ইমেজ স্ট্যাবিলাইজার ক্যামেরা, ১২০ হার্টজ অ্যামোলেড ডিসপ্লে ও ৬৭ ওয়াট ফাস্ট চার্জার।',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      tags: ['xiaomi', 'smartphone', 'mobile', 'camera']
    },
    {
      id: 'prod-3',
      name_en: 'Aarong Handloom Pure Cotton Semi-Long Panjabi for Men',
      name_bn: 'আড়ং হ্যান্ডলুম পিওর কটন সেমি-লং পাঞ্জাবি',
      slug: 'aarong-handloom-pure-cotton-panjabi-men',
      sku: 'AAR-PANJ-01',
      category_id: 'cat-men-fashion',
      brand_id: 'br-aarong',
      price: 2950,
      sale_price: 2450,
      cost_price: 1600,
      stock: 60,
      is_featured: 1,
      is_flash_sale: 0,
      rating: 4.7,
      review_count: 42,
      warranty: '৭ দিনের সহজ এক্সচেঞ্জ গ্যারান্টি',
      desc_en: 'Comfortable handwoven 100% pure cotton Panjabi featuring delicate embroidery on the collar and placket. Perfect for Eid and celebrations.',
      desc_bn: '১০০% খাঁটি সুতি কাপড়ে নিপুণ সূচিকর্মের সেমি-লং পাঞ্জাবি। গরমের দিনে চমৎকার আরামদায়ক ও আভিজাত্যপূর্ণ।',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
      tags: ['fashion', 'panjabi', 'aarong', 'eid', 'cotton']
    },
    {
      id: 'prod-4',
      name_en: 'Aarong Traditional Jamdani Motif Silk Saree with Blouse Piece',
      name_bn: 'আড়ং জামদানি মোটিফ সফট সিল্ক শাড়ি',
      slug: 'aarong-jamdani-motif-soft-silk-saree',
      sku: 'AAR-SAR-JAM',
      category_id: 'cat-women-fashion',
      brand_id: 'br-aarong',
      price: 6850,
      sale_price: 5950,
      cost_price: 4200,
      stock: 18,
      is_featured: 1,
      is_flash_sale: 0,
      rating: 5.0,
      review_count: 29,
      warranty: '৭ দিনের নিরাপদ রিটার্ন পলিসি',
      desc_en: 'Exquisite silk saree adorned with authentic Bangladeshi Jamdani motifs, accompanied by matching unstitched blouse fabric.',
      desc_bn: 'আভিজাত্য ও ঐতিহ্যের ছোঁয়ায় জামদানি নকশার খাঁটি সিল্ক শাড়ি। যেকোনো উৎসব ও অনুষ্ঠানে নজরকাড়া সৌন্দর্য।',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
      tags: ['saree', 'silk', 'aarong', 'women', 'fashion']
    },
    {
      id: 'prod-5',
      name_en: 'Apex Genuine Leather Formal Derby Shoes for Men',
      name_bn: 'এপেক্স জেনুইন লেদার ফর্মাল ডার্বি জুতো',
      slug: 'apex-genuine-leather-formal-derby-shoes',
      sku: 'APX-SHOE-DRB',
      category_id: 'cat-footwear',
      brand_id: 'br-apex',
      price: 4490,
      sale_price: 3890,
      cost_price: 2700,
      stock: 35,
      is_featured: 1,
      is_flash_sale: 0,
      rating: 4.8,
      review_count: 31,
      warranty: '৬ মাসের লেদার পেস্টিং ওয়ারেন্টি',
      desc_en: 'Premium cow leather with cushioned insole and anti-slip rubber outsole. High elegance for office and weddings.',
      desc_bn: 'উচ্চমানের অরিজিনাল চামড়ায় তৈরি নরম আরামদায়ক সোলের অফিসিয়াল ডার্বি জুতো। দীর্ঘস্থায়ী ও স্টাইলিশ।',
      image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&auto=format&fit=crop&q=80',
      tags: ['shoes', 'leather', 'apex', 'formal']
    },
    {
      id: 'prod-6',
      name_en: 'Anker Soundcore Life Q30 Wireless Hybrid ANC Headphones',
      name_bn: 'অ্যাঙ্কর সাউন্ডকোর লাইফ কিউ৩০ ওয়্যারলেস এএনসি হেডফোন',
      slug: 'anker-soundcore-life-q30-wireless-anc-headphones',
      sku: 'ANK-Q30-BLK',
      category_id: 'cat-gadgets',
      brand_id: null,
      price: 8500,
      sale_price: 7200,
      cost_price: 5800,
      stock: 22,
      is_featured: 1,
      is_flash_sale: 1,
      flash_sale_price: 6890,
      rating: 4.9,
      review_count: 67,
      warranty: '১৮ মাসের রিপ্লেসমেন্ট গ্যারান্টি',
      desc_en: 'Hi-Res Audio certified with Active Noise Cancellation, 40-hour playtime, multi-mode noise cancellation, and ultra-soft protein leather earcups.',
      desc_bn: 'অ্যাক্টিভ নয়েজ ক্যান্সেলেশন সহ হাই-রেস অডিও। ৪০ ঘণ্টার ব্যাটারি ব্যাকআপ ও ১৮ মাসের রিপ্লেসমেন্ট ওয়ারেন্টি।',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      tags: ['headphones', 'anker', 'bluetooth', 'gadgets']
    },
    {
      id: 'prod-7',
      name_en: 'Samsung Galaxy Watch 6 Bluetooth 44mm Smartwatch',
      name_bn: 'স্যামসাং গ্যালাক্সি ওয়াচ ৬ ব্লুটুথ ৪৪মিমি স্মার্টওয়াচ',
      slug: 'samsung-galaxy-watch-6-bluetooth-44mm',
      sku: 'SAM-GW6-44',
      category_id: 'cat-watches',
      brand_id: 'br-samsung',
      price: 34500,
      sale_price: 29900,
      cost_price: 24500,
      stock: 15,
      is_featured: 1,
      is_flash_sale: 0,
      rating: 4.9,
      review_count: 24,
      warranty: '১ বছরের অফিসিয়াল স্যামসাং সার্ভিস ওয়ারেন্টি',
      desc_en: 'Super AMOLED Sapphire Crystal glass, Body Composition tracking, ECG, Sleep coaching, and fast wireless charging.',
      desc_bn: 'স্যাফায়ার ক্রিস্টাল গ্লাস, বডি অ্যানালাইসিস ও স্লিপ ট্র্যাকার সমৃদ্ধ প্রিমিয়াম স্যামসাং স্মার্টওয়াচ।',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      tags: ['smartwatch', 'samsung', 'gadget', 'fitness']
    },
    {
      id: 'prod-8',
      name_en: 'Sundarban Pure Wild Flower Raw Honey (সুন্দরবনের প্রাকৃতিক মধু - ৫০০ গ্রাম)',
      name_bn: 'সুন্দরবনের খাঁটি প্রাকৃতিক বুনো ফুলের মধু (৫০০ গ্রাম)',
      slug: 'sundarban-pure-wild-honey-500g',
      sku: 'ORG-HNY-500',
      category_id: 'cat-grocery',
      brand_id: null,
      price: 750,
      sale_price: 620,
      cost_price: 420,
      stock: 120,
      is_featured: 1,
      is_flash_sale: 1,
      flash_sale_price: 590,
      rating: 4.9,
      review_count: 85,
      warranty: '১০০% খাঁটি ও নির্ভেজাল নিশ্চয়তা',
      desc_en: '100% natural, unprocessed raw flower honey collected directly by trusted mouwals from Sundarban mangrove forest.',
      desc_bn: 'কোনো রকম কৃত্রিম মিষ্টি বা প্রিজারভেটিভ ছাড়া সরাসরি সুন্দরবনের মৌয়ালদের থেকে সংগৃহীত প্রাকৃতিক খাঁটি মধু।',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
      tags: ['honey', 'organic', 'grocery', 'sundarban', 'pure']
    },
    {
      id: 'prod-9',
      name_en: 'Pure Cold Pressed Mustard Oil 1 Litre (ঘানি ভাঙা খাঁটি সরিষার তেল ১ লিটার)',
      name_bn: 'কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল (১ লিটার)',
      slug: 'pure-cold-pressed-mustard-oil-1-litre',
      sku: 'ORG-MST-1L',
      category_id: 'cat-grocery',
      brand_id: null,
      price: 360,
      sale_price: 299,
      cost_price: 220,
      stock: 90,
      is_featured: 0,
      is_flash_sale: 0,
      rating: 4.8,
      review_count: 53,
      warranty: '১০০% ভেজালমুক্ত গ্যারান্টি',
      desc_en: 'Traditional wooden ghani pressed mustard oil with intense natural aroma and high pungency. No added chemicals.',
      desc_bn: 'গাছপাকা দেশি সরিষা থেকে কাঠের ঘানিতে ভাঙা খাঁটি ঝাঁঝালো তেল। ভর্তা ও রান্নায় অতুলনীয় স্বাদ।',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      tags: ['mustard-oil', 'organic', 'grocery', 'pure']
    },
    {
      id: 'prod-10',
      name_en: 'Philips Digital Air Fryer XL 4.2L Rapid Air Technology',
      name_bn: 'ফিলিপস ডিজিটাল এয়ার ফ্রায়ার ৪.২ লিটার র্যাপিড এয়ার',
      slug: 'philips-digital-air-fryer-xl-4-2l',
      sku: 'PHI-AF-42',
      category_id: 'cat-kitchen',
      brand_id: 'br-philips',
      price: 16500,
      sale_price: 13900,
      cost_price: 11000,
      stock: 20,
      is_featured: 1,
      is_flash_sale: 1,
      flash_sale_price: 13200,
      rating: 4.8,
      review_count: 47,
      warranty: '২ বছরের আন্তর্জাতিক সার্ভিস ওয়ারেন্টি',
      desc_en: 'Fry with up to 90% less oil. Touchscreen with 7 presets, keep warm function, and easy to clean dishwasher safe parts.',
      desc_bn: '৯০% পর্যন্ত কম তেলে স্বাস্থ্যসম্মত ও মুচমুচে ভাজাভুজি। ৭টি ডিজিটাল প্রি-সেট প্রোগ্রাম সমৃদ্ধ।',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      tags: ['airfryer', 'philips', 'kitchen', 'health']
    },
    {
      id: 'prod-11',
      name_en: 'Walton Automatic Stainless Steel Electric Kettle 1.8L',
      name_bn: 'ওয়ালটন স্টেইনলেস স্টিল অটোমেটিক ইলেকট্রিক কেটলি ১.৮ লিটার',
      slug: 'walton-stainless-steel-electric-kettle-1-8l',
      sku: 'WLT-KET-18',
      category_id: 'cat-kitchen',
      brand_id: 'br-walton',
      price: 1450,
      sale_price: 1190,
      cost_price: 850,
      stock: 80,
      is_featured: 0,
      is_flash_sale: 0,
      rating: 4.7,
      review_count: 65,
      warranty: '১ বছরের অফিসিয়াল ওয়ালটন ওয়ারেন্টি',
      desc_en: 'Rapid boil 1500W heating element with auto shut-off, boil dry protection, and 360-degree swivel base.',
      desc_bn: 'দ্রুত পানি গরমের জন্য ১৫০০ ওয়াটের টেকসই স্টেইনলেস স্টিল কেটলি। পানি ফুটলে স্বয়ংক্রিয় বন্ধ হয়।',
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop&q=80',
      tags: ['kettle', 'walton', 'kitchen', 'home']
    },
    {
      id: 'prod-12',
      name_en: 'Apple MacBook Air M3 Chip 13.6" (8-Core CPU / 16GB RAM / 256GB SSD)',
      name_bn: 'অ্যাপল ম্যাকবুক এয়ার এম৩ চিপ ১৩.৬ ইঞ্চি (১৬জিবি / ২৫৬জিবি)',
      slug: 'apple-macbook-air-m3-13-inch-16gb-256gb',
      sku: 'APL-MBA-M3',
      category_id: 'cat-computers',
      brand_id: 'br-apple',
      price: 165000,
      sale_price: 154000,
      cost_price: 142000,
      stock: 12,
      is_featured: 1,
      is_flash_sale: 0,
      rating: 5.0,
      review_count: 19,
      warranty: '১ বছরের ইন্টারন্যাশনাল অ্যাপল কেয়ার ওয়ারেন্টি',
      desc_en: 'Blazing fast Apple M3 chip, Liquid Retina display, MagSafe 3 charging, up to 18 hours of battery life in an impossibly thin aluminum unibody.',
      desc_bn: 'শক্তিশালী এম৩ চিপ, উজ্জ্বল লিকুইড রেটিনা স্ক্রিন ও ১৮ ঘণ্টার অসাধারণ ব্যাটারি লাইফ।',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      tags: ['macbook', 'apple', 'laptop', 'computer']
    },
    {
      id: 'prod-13',
      name_en: 'Apple iPhone 15 128GB (Official BTRC Approved)',
      name_bn: 'অ্যাপল আইফোন ১৫ ১২৮জিবি (বিটিআরসি অনুমোদিত)',
      slug: 'apple-iphone-15-128gb-official',
      sku: 'APL-IP15-128',
      category_id: 'cat-phones',
      brand_id: 'br-apple',
      price: 125000,
      sale_price: 114900,
      cost_price: 104000,
      stock: 16,
      is_featured: 1,
      is_flash_sale: 0,
      rating: 5.0,
      review_count: 35,
      warranty: '১ বছরের অফিসিয়াল অ্যাপল বাংলাদেশ ওয়ারেন্টি',
      desc_en: 'Dynamic Island, 48MP main camera with 2x Telephoto, USB-C connector, and durable color-infused glass design.',
      desc_bn: 'ডায়নামিক আইল্যান্ড, ৪৮ মেগাপিক্সেল ক্যামেরা, টাইপ-সি পোর্ট ও দীর্ঘস্থায়ী ব্যাটারি সমৃদ্ধ অফিশিয়াল ফোন।',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      tags: ['iphone', 'apple', 'smartphone', 'mobile']
    },
    {
      id: 'prod-14',
      name_en: 'Casio Vintage Digital Gold Stainless Steel Unisex Watch A168WG',
      name_bn: 'ক্যাসিও ভিন্টেজ ডিজিটাল গোল্ড ওয়াচ A168WG',
      slug: 'casio-vintage-digital-gold-watch-a168wg',
      sku: 'CAS-A168-GLD',
      category_id: 'cat-watches',
      brand_id: 'br-casio',
      price: 5200,
      sale_price: 4350,
      cost_price: 3100,
      stock: 40,
      is_featured: 1,
      is_flash_sale: 1,
      flash_sale_price: 4100,
      rating: 4.8,
      review_count: 59,
      warranty: '২ বছরের অফিসিয়াল ক্যাসিও ওয়ারেন্টি',
      desc_en: 'Timeless retro design, ElectroLuminescent backlight, 1/100-second stopwatch, daily alarm, and water resistant construction.',
      desc_bn: 'ক্ল্যাসিক ভিন্টেজ লুকের গোল্ড ফিনিশ ওয়াচ। ওয়াটার রেসিস্ট্যান্ট ও দীর্ঘস্থায়ী ব্যাটারি।',
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
      tags: ['watch', 'casio', 'gold', 'vintage']
    },
    {
      id: 'prod-15',
      name_en: 'Men Premium Semi-Formal 100% Cotton Long Sleeve Shirt',
      name_bn: 'প্রিমিয়াম সুতি ফুলহাতা সেমি-ফর্মাল শার্ট',
      slug: 'mens-premium-cotton-long-sleeve-shirt',
      sku: 'CLT-SHRT-COT',
      category_id: 'cat-men-fashion',
      brand_id: null,
      price: 1850,
      sale_price: 1390,
      cost_price: 900,
      stock: 75,
      is_featured: 0,
      is_flash_sale: 1,
      flash_sale_price: 1290,
      rating: 4.6,
      review_count: 32,
      warranty: '৭ দিনের সাইজ এক্সচেঞ্জ সুবিধা',
      desc_en: 'Breathable combed cotton fabric tailored for smart-casual and formal settings. Wrinkle-resistant and color guaranteed.',
      desc_bn: 'অফিস ও ক্যাজুয়াল ব্যবহারের জন্য আরামদায়ক নিখুঁত ফিটিংসের ১০০% সুতি শার্ট। রঙ ওঠার কোনো ভয় নেই।',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      tags: ['shirt', 'cotton', 'men', 'fashion']
    },
    {
      id: 'prod-16',
      name_en: 'Women Festive Embroidered Three-Piece Salwar Suit',
      name_bn: 'মহিলাদের গর্জিয়াস এমব্রয়ডারি থ্রি-পিস সেট',
      slug: 'women-festive-embroidered-three-piece-salwar-suit',
      sku: 'CLT-3PC-FEST',
      category_id: 'cat-women-fashion',
      brand_id: null,
      price: 3950,
      sale_price: 3150,
      cost_price: 2100,
      stock: 45,
      is_featured: 1,
      is_flash_sale: 0,
      rating: 4.8,
      review_count: 38,
      warranty: '৭ দিনের রিটার্ন গ্যারান্টি',
      desc_en: 'Heavy embroidered organza dupatta with premium soft cotton kameez and matching bottom. Rich festive allure.',
      desc_bn: 'আকর্ষণীয় এমব্রয়ডারি কাজ করা ওড়না ও সুতি কামিজ সহ প্রিমিয়াম কোয়ালিটি থ্রি-পিস সেট।',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
      tags: ['threepiece', 'women', 'embroidery', 'fashion']
    },
    {
      id: 'prod-17',
      name_en: 'Rechargeable Portable Desk Fan with LED Light (লোডশেডিং স্পেশাল ফ্যান)',
      name_bn: 'রিচার্জেবল হাই-স্পিড ডেস্ক ফ্যান ও ইমার্জেন্সি লাইট',
      slug: 'rechargeable-portable-desk-fan-with-led-light',
      sku: 'HOM-FAN-RCH',
      category_id: 'cat-home-living',
      brand_id: null,
      price: 2450,
      sale_price: 1850,
      cost_price: 1200,
      stock: 110,
      is_featured: 1,
      is_flash_sale: 1,
      flash_sale_price: 1690,
      rating: 4.7,
      review_count: 82,
      warranty: '৬ মাসের মোটর রিপ্লেসমেন্ট ওয়ারেন্টি',
      desc_en: '4000mAh battery providing up to 8 hours of cooling wind during power cuts. 3 speed modes and bright LED night lamp.',
      desc_bn: 'লোডশেডিংয়ে দীর্ঘক্ষণ টানা ৬-৮ ঘণ্টা পর্যন্ত বাতাস দেয়। সঙ্গে উজ্জ্বল ইমার্জেন্সি লাইট ও টাইপ-সি চার্জিং।',
      image: 'https://images.unsplash.com/photo-1618944847828-82e943c3acca?w=800&auto=format&fit=crop&q=80',
      tags: ['fan', 'rechargeable', 'home', 'summer', 'load-shedding']
    },
    {
      id: 'prod-18',
      name_en: '100% Pure Organic Deshi Ghee 500g (খাঁটি গাওয়া ঘি - ৫০০ গ্রাম)',
      name_bn: 'খাঁটি দেশি গাওয়া ঘি (৫০০ গ্রাম)',
      slug: '100-pure-organic-deshi-ghee-500g',
      sku: 'ORG-GHE-500',
      category_id: 'cat-grocery',
      brand_id: null,
      price: 1100,
      sale_price: 890,
      cost_price: 650,
      stock: 65,
      is_featured: 1,
      is_flash_sale: 0,
      rating: 4.9,
      review_count: 61,
      warranty: '১০০% খাঁটি ও সুস্বাদু নিশ্চয়তা',
      desc_en: 'Traditionally prepared from fresh whole cow milk cream. Golden texture and appetizing aroma for everyday dishes.',
      desc_bn: 'খাঁটি গাভীর দুধের মাখন থেকে তৈরি দানাদার সুবাসিত গাওয়া ঘি। পোলাও, খিচুড়ি ও ভাতের সাথে দারুণ লোভনীয়।',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&auto=format&fit=crop&q=80',
      tags: ['ghee', 'organic', 'grocery', 'pure']
    },
    {
      id: 'prod-19',
      name_en: 'Bata Power Men Lightweight Running Sneakers',
      name_bn: 'বাটা পাওয়ার মেনস লাইটওয়েট রানিং স্নিকার্স',
      slug: 'bata-power-men-lightweight-running-sneakers',
      sku: 'BAT-SNEAK-PWR',
      category_id: 'cat-footwear',
      brand_id: 'br-bata',
      price: 3290,
      sale_price: 2790,
      cost_price: 1900,
      stock: 45,
      is_featured: 0,
      is_flash_sale: 0,
      rating: 4.6,
      review_count: 27,
      warranty: '৯০ দিনের সোল পেস্টিং ওয়ারেন্টি',
      desc_en: 'Engineered mesh upper for breathability with shock-absorbing memory foam footbed. Ideal for walking, jogging, and gym.',
      desc_bn: 'হাঁটাচলা ও দৌড়ানোর জন্য বাটার হালকা ওজনের আরামদায়ক স্নিকার্স জুতো। পায়ের ক্লান্তি দূর করে।',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      tags: ['sneakers', 'bata', 'sports', 'shoes']
    },
    {
      id: 'prod-20',
      name_en: '20000mAh 22.5W Fast Charging Power Bank with Digital Display',
      name_bn: '২০,০০০ এমএএইচ ফাস্ট চার্জিং ডিজিটাল পাওয়ার ব্যাংক',
      slug: '20000mah-fast-charging-power-bank-digital-display',
      sku: 'GAD-PB-20K',
      category_id: 'cat-gadgets',
      brand_id: null,
      price: 2850,
      sale_price: 2190,
      cost_price: 1500,
      stock: 70,
      is_featured: 1,
      is_flash_sale: 1,
      flash_sale_price: 1990,
      rating: 4.8,
      review_count: 73,
      warranty: '১ বছরের রিপ্লেসমেন্ট ওয়ারেন্টি',
      desc_en: 'Charge up to 3 devices simultaneously with PD 3.0 & QC 4.0 support. Real-time LED digital percentage display.',
      desc_bn: 'একসাথে ৩টি ফোন চার্জ করার সুবিধা সহ ২২.৫ ওয়াট দ্রুতগতির পাওয়ার ব্যাংক। সঠিক চার্জের শতাংশ ডিসপ্লে।',
      image: 'https://images.unsplash.com/photo-1609592426508-cc856c9a3d13?w=800&auto=format&fit=crop&q=80',
      tags: ['powerbank', 'gadget', 'charger', 'mobile']
    },
    {
      id: 'prod-21',
      name_en: 'Ergonomic Memory Foam Cervical Orthopedic Bed Pillow',
      name_bn: 'অর্থোপেডিক মেমোরি ফোম সার্ভাইক্যাল বালিশ',
      slug: 'ergonomic-memory-foam-orthopedic-pillow',
      sku: 'HOM-PLW-MEM',
      category_id: 'cat-home-living',
      brand_id: null,
      price: 2200,
      sale_price: 1650,
      cost_price: 1100,
      stock: 35,
      is_featured: 0,
      is_flash_sale: 0,
      rating: 4.9,
      review_count: 41,
      warranty: '৫ বছরের ফোম শেপ গ্যারান্টি',
      desc_en: 'Relieves neck stiffness, shoulder pressure and back pain by maintaining natural spine alignment during deep sleep.',
      desc_bn: 'ঘাড় ও কাঁধের ব্যথা দূর করে গভীর ঘুমে সহায়তা করার জন্য বিশেষ মেমোরি ফোম বালিশ।',
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
      tags: ['pillow', 'home', 'sleep', 'health']
    },
    {
      id: 'prod-22',
      name_en: 'Dettol Disinfectant Multi-Use Liquid 1000ml (১ লিটার ডেটল)',
      name_bn: 'ডেটল অ্যান্টিসেপ্টিক লিকুইড ১০০০ মিলি',
      slug: 'dettol-disinfectant-multi-use-liquid-1000ml',
      sku: 'DET-LIQ-1L',
      category_id: 'cat-health-beauty',
      brand_id: 'br-dettol',
      price: 680,
      sale_price: 590,
      cost_price: 450,
      stock: 150,
      is_featured: 0,
      is_flash_sale: 0,
      rating: 5.0,
      review_count: 94,
      warranty: '১০০% অরিজিনাল ব্র্যান্ড প্রোডাক্ট',
      desc_en: 'Proven 99.9% protection against illness-causing germs and bacteria. Trusted antiseptic for wound care, laundry and surface cleaning.',
      desc_bn: 'পরিবারের স্বাস্থ্য সুরক্ষায় জীবাণুর বিরুদ্ধে ৯৯.৯% কার্যকারী অরিজিনাল ডেটল লিকুইড।',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      tags: ['dettol', 'health', 'hygiene', 'safety']
    },
    {
      id: 'prod-23',
      name_en: 'Yonex Nanoray Carbon Fiber Professional Badminton Racket Set',
      name_bn: 'ইয়োনেক্স ন্যানোরে কার্বন ফাইবার ব্যাডমিন্টন র্যাকেট জোড়া',
      slug: 'yonex-nanoray-carbon-badminton-racket-set',
      sku: 'SPT-YNX-SET',
      category_id: 'cat-sports',
      brand_id: null,
      price: 4500,
      sale_price: 3650,
      cost_price: 2500,
      stock: 30,
      is_featured: 1,
      is_flash_sale: 1,
      flash_sale_price: 3390,
      rating: 4.8,
      review_count: 36,
      warranty: '১ বছরের ফ্রেম গ্যারান্টি',
      desc_en: 'Ultra-lightweight graphite frame with high string tension and full zipper thermal carry cover. Includes 6 nylon shuttlecocks.',
      desc_bn: 'হালকা ওজনের টেকসই কার্বন ফাইবার ফ্রেমের ২ পিস র্যাকেট ও ৬ পিস ফেদার কর্ক সহ ব্যাগ।',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
      tags: ['badminton', 'yonex', 'sports', 'fitness']
    },
    {
      id: 'prod-24',
      name_en: 'Waterproof Laptop Backpack with Anti-Theft Lock 35L',
      name_bn: 'ওয়াটারপ্রুফ অ্যান্টি-থেফ্‌ট ল্যাপটপ ব্যাকপ্যাক ৩৫ লিটার',
      slug: 'waterproof-laptop-backpack-antitheft-35l',
      sku: 'BAG-LP-35L',
      category_id: 'cat-footwear',
      brand_id: null,
      price: 2400,
      sale_price: 1790,
      cost_price: 1100,
      stock: 55,
      is_featured: 1,
      is_flash_sale: 0,
      rating: 4.7,
      review_count: 49,
      warranty: '১ বছরের চেইন ও সেলাই ওয়ারেন্টি',
      desc_en: 'Rainproof Oxford cloth with USB external charging port, hidden security pocket, and cushioned 15.6" laptop compartment.',
      desc_bn: 'বৃষ্টির পানিতে ভেজে না এমন টেকসই ফেব্রিক, ইউএসবি পোর্ট ও গোপন পকেট সমৃদ্ধ অফিস ও ট্রাভেল ব্যাকপ্যাক।',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      tags: ['bag', 'backpack', 'laptop', 'travel']
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, name_en, name_bn, slug, sku, category_id, brand_id, price, sale_price, cost_price,
      stock_quantity, stock_status, warranty, description_en, description_bn, is_featured,
      is_flash_sale, flash_sale_price, rating, review_count, tags, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')
  `);

  const insertImage = db.prepare(`
    INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT INTO product_variants (id, product_id, name, sku, price, stock, attributes_json, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  products.forEach((p, idx) => {
    insertProduct.run(
      p.id,
      p.name_en,
      p.name_bn,
      p.slug,
      p.sku,
      p.category_id,
      p.brand_id,
      p.price,
      p.sale_price,
      p.cost_price,
      p.stock,
      p.stock > 10 ? 'IN_STOCK' : 'LOW_STOCK',
      p.warranty,
      p.desc_en,
      p.desc_bn,
      p.is_featured,
      p.is_flash_sale,
      p.flash_sale_price || null,
      p.rating,
      p.review_count,
      JSON.stringify(p.tags)
    );

    // Primary Image
    insertImage.run(`img-${p.id}-1`, p.id, p.image, 1, 1);
    // Secondary Gallery Image
    insertImage.run(`img-${p.id}-2`, p.id, `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80`, 0, 2);

    // Seed realistic variants for fashion, phones and gadgets
    if (p.category_id.includes('fashion')) {
      insertVariant.run(`var-${p.id}-m`, p.id, 'Size: Medium (M)', `${p.sku}-M`, p.sale_price, 20, JSON.stringify({ Size: 'M' }), p.image);
      insertVariant.run(`var-${p.id}-l`, p.id, 'Size: Large (L)', `${p.sku}-L`, p.sale_price, 25, JSON.stringify({ Size: 'L' }), p.image);
      insertVariant.run(`var-${p.id}-xl`, p.id, 'Size: Extra Large (XL)', `${p.sku}-XL`, p.sale_price + 100, 15, JSON.stringify({ Size: 'XL' }), p.image);
    } else if (p.category_id.includes('phone') || p.category_id.includes('gadgets')) {
      insertVariant.run(`var-${p.id}-blk`, p.id, 'Midnight Black', `${p.sku}-BLK`, p.sale_price, 15, JSON.stringify({ Color: 'Midnight Black' }), p.image);
      insertVariant.run(`var-${p.id}-blu`, p.id, 'Ocean Blue', `${p.sku}-BLU`, p.sale_price, 12, JSON.stringify({ Color: 'Ocean Blue' }), p.image);
    }
  });

  // 6. Seed Coupons
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (id, code, discount_type, discount_val, min_order_val, max_discount, usage_limit, used_count, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCoupon.run('cp-1', 'GLOBAL10', 'PERCENTAGE', 10, 1000, 500, 500, 12, 1);
  insertCoupon.run('cp-2', 'WELCOME50', 'FIXED', 50, 500, 50, 1000, 45, 1);
  insertCoupon.run('cp-3', 'EID2026', 'PERCENTAGE', 15, 2500, 1000, 300, 28, 1);
  insertCoupon.run('cp-4', 'FREESHIP', 'FIXED', 130, 1500, 130, 200, 19, 1);

  // 7. Seed Flash Sales
  const insertFlashSale = db.prepare(`
    INSERT INTO flash_sales (id, title_en, title_bn, banner, start_time, end_time, discount_text, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const nextThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  insertFlashSale.run(
    'fs-1',
    'Mega Weekend Flash Sale - Up to 45% OFF!',
    'মেগা উইকএন্ড ফ্ল্যাশ সেল - ৪৫% পর্যন্ত ছাড়!',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
    now.toISOString(),
    nextThreeDays.toISOString(),
    '৪৫% পর্যন্ত ছাড়',
    1
  );

  // 8. Seed Hero Banners
  const insertBanner = db.prepare(`
    INSERT INTO banners (id, title_en, title_bn, subtitle_en, subtitle_bn, image_desktop, image_mobile, link_url, cta_text_en, cta_text_bn, display_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBanner.run(
    'ban-1',
    'Discover Better Shopping Across Bangladesh',
    'সারা বাংলাদেশে স্মার্ট ও নির্ভেজাল শপিং',
    '100% genuine products with fast 64-district delivery & cash on delivery',
    '১০০% খাঁটি পণ্য, ৬৪ জেলায় দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    '/shop',
    'Shop Now',
    'এখনই কিনুন',
    1,
    1
  );

  insertBanner.run(
    'ban-2',
    'Mega Gadgets & Smartphone Carnival',
    'লেটেস্ট স্মার্টফোন ও গ্যাজেট কার্নিভাল',
    'Official warranty, easy returns & exclusive bKash cashback deals',
    'অফিশিয়াল ওয়ারেন্টি ও বিকাশ ইনস্ট্যান্ট ক্যাশব্যাক অফার',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    '/category/electronics-gadgets',
    'Explore Gadgets',
    'গ্যাজেট দেখুন',
    2,
    1
  );

  insertBanner.run(
    'ban-3',
    'Exclusive Eid & Festive Fashion Collection',
    'ঈদ ও উৎসবের এক্সক্লুসিভ ফ্যাশন কালেকশন',
    'Handloom Panjabis, Jamdani sarees, shoes and trending outfits',
    'হ্যান্ডলুম পাঞ্জাবি, জামদানি শাড়ি ও লেদার ফুটওয়্যারের সেরা সম্ভার',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    '/category/mens-fashion',
    'Shop Fashion',
    'ফ্যাশন কালেকশন',
    3,
    1
  );

  // 9. Seed Realistic Bangladesh Orders with Real Tracking
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, customer_name, customer_email, customer_phone, delivery_address,
      division, district, upazila, shipping_method, shipping_charge, subtotal, discount, grand_total,
      payment_method, payment_status, order_status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, product_image, variant_name, price, quantity, subtotal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTimeline = db.prepare(`
    INSERT INTO order_timeline (id, order_id, status, notes, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Order 1: Delivered
  insertOrder.run(
    'ord-101',
    'GBBD-20260910-1001',
    'usr-cust-1',
    'Tanvir Hasan',
    'tanvir.hasan@gmail.com',
    '01712345678',
    'House 24, Road 7A, Dhanmondi, Dhaka-1209',
    'Dhaka',
    'Dhaka',
    'Dhanmondi',
    'INSIDE_DHAKA',
    70,
    31190,
    500,
    30760,
    'BKASH',
    'PAID',
    'DELIVERED',
    'Call before delivery',
    '2026-09-10 10:30:00'
  );
  insertOrderItem.run('oi-1', 'ord-101', 'prod-2', 'var-prod-2-blk', 'Xiaomi Redmi Note 13 Pro', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80', 'Midnight Black', 28499, 1, 28499);
  insertOrderItem.run('oi-2', 'ord-101', 'prod-15', null, 'Men Premium Semi-Formal Shirt', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80', 'Size: L', 1390, 1, 1390);

  insertTimeline.run('tl-1', 'ord-101', 'PENDING', 'অর্ডার গ্রহণ করা হয়েছে (Order Received)', '2026-09-10 10:30:00');
  insertTimeline.run('tl-2', 'ord-101', 'CONFIRMED', 'অর্ডার নিশ্চিত ও পেমেন্ট যাচাই সম্পন্ন (Confirmed)', '2026-09-10 11:15:00');
  insertTimeline.run('tl-3', 'ord-101', 'PACKED', 'ওয়্যারহাউজে পার্সেল প্যাকিং সম্পন্ন (Packed)', '2026-09-10 14:00:00');
  insertTimeline.run('tl-4', 'ord-101', 'SHIPPED', 'ডেলিভারি পার্টনারের কাছে হস্তান্তর (Shipped via Steadfast)', '2026-09-11 09:30:00');
  insertTimeline.run('tl-5', 'ord-101', 'OUT_FOR_DELIVERY', 'ডেলিভারি রাইডার ডেলিভারির পথে আছেন', '2026-09-11 13:00:00');
  insertTimeline.run('tl-6', 'ord-101', 'DELIVERED', 'গ্রাহকের নিকট সফলভাবে ডেলিভারি সম্পন্ন', '2026-09-11 16:20:00');

  // Order 2: Shipped / Active tracking order
  insertOrder.run(
    'ord-102',
    'GBBD-20260914-1002',
    'usr-cust-2',
    'Nusrat Jahan',
    'nusrat.jahan@yahoo.com',
    '01912345678',
    'GEC Circle, Nasirabad Housing Society, Chattogram',
    'Chittagong',
    'Chittagong',
    'Panchlaish',
    'OUTSIDE_DHAKA',
    130,
    5950,
    200,
    5880,
    'COD',
    'PENDING',
    'SHIPPED',
    'Please pack carefully',
    '2026-09-14 14:00:00'
  );
  insertOrderItem.run('oi-3', 'ord-102', 'prod-4', null, 'Aarong Traditional Jamdani Motif Silk Saree', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80', null, 5950, 1, 5950);

  insertTimeline.run('tl-7', 'ord-102', 'PENDING', 'অর্ডার সাবমিট হয়েছে (Order Placed)', '2026-09-14 14:00:00');
  insertTimeline.run('tl-8', 'ord-102', 'CONFIRMED', 'ফোন কলে অর্ডার কনফার্ম করা হয়েছে', '2026-09-14 15:30:00');
  insertTimeline.run('tl-9', 'ord-102', 'PACKED', 'পার্সেল কিউসি ও প্যাকিং সম্পন্ন', '2026-09-14 18:00:00');
  insertTimeline.run('tl-10', 'ord-102', 'SHIPPED', 'চট্টগ্রামের উদ্দেশ্যে সুন্দরবন কুরিয়ারে বুকিং হয়েছে', '2026-09-15 08:30:00');

  // 10. Seed Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, product_id, user_id, customer_name, rating, comment, is_verified_purchase, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED')
  `);

  insertReview.run('rev-1', 'prod-1', 'usr-cust-1', 'কামরুল হাসান', 5, 'ওয়ালটনের ৪৩ ইঞ্চি টিভিটা অবিশ্বাস্য সুন্দর! ৪কে পিকচার কোয়ালিটি এবং সাউন্ড অনেক ক্লিয়ার। মাত্র ২ দিনে ধানমন্ডিতে হোম ডেলিভারি পেয়েছি।', 1);
  insertReview.run('rev-2', 'prod-2', 'usr-cust-2', 'মাহবুব আলম', 5, 'অরিজিনাল রেডমি নোট ১৩ প্রো পেয়েছি। ২০০ মেগাপিক্সেল ক্যামেরা অসাধারণ! প্যাকেজিং খুব ভালো ছিল। ধন্যবাদ গ্লোবাল বাজার বিডি!', 1);
  insertReview.run('rev-3', 'prod-3', 'usr-cust-3', 'সাদিয়া তাসনিম', 5, 'আড়ং পাঞ্জাবির কাপড়টা অসম্ভব আরামদায়ক। আমার ভাইয়ের জন্য অর্ডার করেছিলাম, সাইজ একদম পারফেক্ট হয়েছে।', 1);
  insertReview.run('rev-4', 'prod-8', 'usr-cust-1', 'জাহিদুল ইসলাম', 5, 'সুন্দরবনের আসল প্রাকৃতিক মধু। ঝাঁঝ এবং প্রাকৃতিক সুবাস রয়েছে। নির্দ্বিধায় সবাই নিতে পারেন।', 1);

  // 11. Seed Blog Posts
  const insertBlog = db.prepare(`
    INSERT INTO blog_posts (id, title_en, title_bn, slug, summary_en, summary_bn, content_en, content_bn, cover_image, category, read_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBlog.run(
    'blog-1',
    'Smart Buying Guide: Choosing the Best 4K Smart TV in Bangladesh 2026',
    'স্মার্টফোন ও ৪কে টিভি কেনার সময় যেসব বিষয় খেয়াল রাখবেন',
    'smart-buying-guide-4k-smart-tv-bangladesh-2026',
    'A complete buying guide for choosing the right display panel, resolution, and warranty when purchasing a TV in BD.',
    'বাংলাদেশে টেলিভিশন কেনার ক্ষেত্রে ডিসপ্লে প্যানেল, ডলবি অডিও ও অফিসিয়াল ওয়ারেন্টি সংক্রান্ত জরুরি পরামর্শ।',
    'Buying a 4K television is an investment for your family. Always check panel guarantees, viewing angles, voice search remote capabilities, and genuine distributor warranty...',
    'পরিবারের বিনোদনের জন্য একটি ভালো স্মার্ট টিভি কেনা অত্যন্ত গুরুত্বপূর্ণ। কেনার আগে অবশ্যই প্যানেল টাইপ, গুগল টিভি সাপোর্ট এবং লোকাল সার্ভিস সেন্টারের সুবিধা আছে কিনা যাচাই করুন...',
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    'Technology',
    '4 min'
  );

  insertBlog.run(
    'blog-2',
    'Pure Mustard Oil & Wild Honey: Health Benefits for Bangladeshi Families',
    'খাঁটি সরিষার তেল ও সুন্দরবনের মধুর স্বাস্থ্য উপকারিতা',
    'pure-mustard-oil-wild-honey-health-benefits',
    'Discover how incorporating cold pressed organic mustard oil and raw Sundarban honey boosts immunity and heart health.',
    'দৈনন্দিন খাবারে কাঠের ঘানির খাঁটি সরিষার তেল ও প্রাকৃতিক মধু কেন স্বাস্থ্যের জন্য জরুরি তা জেনে নিন।',
    'Chemical-free cold pressed mustard oil retains natural omega-3 fatty acids and vitamin E. Combined with pure wild honey, it strengthens digestion and builds natural body resistance...',
    'ভেজালযুক্ত তেলের ভিড়ে কাঠের ঘানির তেল ও সুন্দরবনের মধু আমাদের হার্ট ও হজমশক্তি ভালো রাখতে দারুণ কার্যকরী। প্রতিদিনের খাদ্যতালিকায় খাঁটি খাদ্য নিশ্চিত করুন...',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
    'Health & Organic',
    '3 min'
  );

  // 12. Seed Settings
  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value_json)
    VALUES (?, ?)
  `);

  for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(k, JSON.stringify(v));
  }

  console.log('✅ Realistic seed data inserted successfully!');
}
