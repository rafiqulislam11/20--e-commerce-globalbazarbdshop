# Global Bazar BD Shop (গ্লোবাল বাজার বিডি শপ)

> **স্মার্ট শপিং, সহজ জীবন — Bangladesh's Premier Full-Stack E-Commerce Platform**

Global Bazar BD Shop is a modern, responsive, conversion-focused, and scalable Bangladeshi e-commerce platform built from the ground up with **Node.js, Express, TypeScript, SQLite (better-sqlite3), React 19, and Tailwind CSS**.

Designed specifically for the Bangladesh retail market, it features authentic local shipping policies, administrative geography (Division, District, Upazila/Thana), bilingual support (Bangla primary, English secondary), local payment integrations (Cash on Delivery, bKash, Nagad), and a real-time order tracking system.

---

## 🌟 Core Highlights & Bangladesh Market Features

1. **Bilingual Experience (বাংলা ও English)**:
   - Primary language is **Bangla** (`bn`) with immediate toggle to **English** (`en`).
   - Dynamic price formatting in Bangladeshi Taka (`৳` BDT) with Bengali numeral conversions.
   - Clean typography using Google Fonts (**Hind Siliguri** for Bengali, **Inter** for Latin numerals and English).

2. **Bangladeshi Administrative Hierarchy & Shipping Engine**:
   - **8 Divisions**: Dhaka, Chattogram, Rajshahi, Khulna, Barishal, Sylhet, Rangpur, Mymensingh.
   - **64 Districts** and Thana/Upazila auto-populated fields.
   - **Shipping Zones**:
     - 🚚 **Inside Dhaka**: ৳70 (2–3 Days)
     - 🚛 **Outside Dhaka**: ৳130 (3–5 Days)
     - ⚡ **Express Delivery**: ৳160 (Same-day/24 Hours in Dhaka Metro)
     - 🎁 **Free Delivery Threshold**: Automatic free delivery on orders above ৳2,000.

3. **Authentic Payment Architecture**:
   - **Cash on Delivery (COD)**: 100% functional with delivery confirmation and zero upfront fee.
   - **bKash (Merchant / Personal)**: Full instructions with Merchant number (`01812345678`), USSD `*247#` or app instructions, and live Transaction ID (TrxID) input.
   - **Nagad**: Merchant number (`01798765432`) with 8-character TrxID validation.
   - **Card / SSLCommerz / Stripe ready**: Secure payment interface simulation with instant receipt.

4. **Real Order Tracking System**:
   - Unique order identifier format: `GBBD-YYYYMMDD-XXXX` (e.g. `GBBD-20260910-1001`).
   - Security verification using both **Order ID** and **Customer Phone Number**.
   - Step-by-step visual timeline tracking:
     1. 📝 **অর্ডার গ্রহণ করা হয়েছে (Order Received / Placed)**
     2. ✅ **অর্ডার নিশ্চিত (Confirmed)**
     3. 📦 **প্যাকিং সম্পন্ন (Packed)**
     4. 🚚 **কুরিয়ারে হস্তান্তর (Shipped via Steadfast / RedX / Pathao)**
     5. 🛵 **ডেলিভারির পথে (Out for Delivery)**
     6. 🎉 **সফলভাবে ডেলিভারড (Delivered)**

5. **Complete Admin Dashboard**:
   - **Real-time KPI Metrics**: Total Revenue, Total Orders, Pending Orders, Low Stock Alerts, Total Customers.
   - **Order Lifecycle Management**: View order details, customer addresses, change order statuses, and append custom timeline logs with delivery tracking partner info.
   - **Product Catalog Management**: Add and manage products with SKU, variants (sizes, colors), stock levels, category, brand, images, and discounts.
   - **Coupon Engine**: Percentage or fixed discounts with minimum order values, maximum caps, and usage counters (e.g. `GLOBAL10`, `WELCOME50`).
   - **Customer & Review Moderation**: Inspect customer accounts and manage customer reviews.

6. **Customer Engagement & Conversion Boosters**:
   - **Floating WhatsApp Order Button**: Direct chat with customer support (`+880 1700-000000`).
   - **Cart Drawer & Free Shipping Progress Bar**: Dynamic calculation showing how much more to add to unlock free delivery.
   - **Countdown Flash Sales**: Limited-time deals with live countdown timers and stock progress indicators.
   - **Quick View Modal**: Inspect products, select variants, and add to cart without navigating away.
   - **Live Search Autocomplete**: Instant search suggestions for categories, brands, and products.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v20+ / v24) | High-performance asynchronous execution |
| **Backend Framework**| Express & TypeScript | Strongly-typed RESTful architecture |
| **Database** | SQLite via `better-sqlite3` | Zero-config, ultra-fast embedded database with foreign keys & WAL mode |
| **Security & Auth** | `bcryptjs` + `jsonwebtoken` | Secure password hashing & JWT bearer token authentication |
| **Frontend Framework**| React 19 + TypeScript + Vite | Blazing fast build & client-side routing |
| **Styling & Icons** | Tailwind CSS v4 + Lucide React | Modern, responsive aesthetics, dark/light contrast, polished badges |
| **UX Enhancements** | `canvas-confetti` | Delightful checkout and order celebration animations |

---

## 📂 Project Structure

```
20- e-commerce-globalbazarbdshop/
├── .env.example              # Sample backend environment configuration
├── README.md                 # Complete documentation (this file)
├── backend/                  # Express + TypeScript + SQLite REST API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts         # SQLite schema initialization and connection
│   │   ├── controllers/      # Handlers for auth, products, orders, coupons, etc.
│   │   ├── middleware/       # JWT auth & admin role verification
│   │   ├── routes/           # RESTful API route declarations
│   │   ├── seed/
│   │   │   └── seedData.ts   # Comprehensive BD product catalog & sample orders
│   │   └── server.ts         # Express app entrypoint & middleware setup
│   ├── package.json
│   └── tsconfig.json
└── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
    ├── src/
    │   ├── components/       # Common, home, product, cart, checkout, admin UI
    │   ├── context/          # LanguageContext, AuthContext, CartContext, WishlistContext
    │   ├── locales/          # bn.json (Bangla) & en.json (English) dictionaries
    │   ├── pages/            # 13 complete application views & admin dashboard
    │   ├── services/         # Typed API client wrapper with auth token handling
    │   ├── types/            # TypeScript interfaces for database models & state
    │   ├── App.tsx           # Main application routing and shell
    │   └── main.tsx          # React DOM entrypoint
    ├── vite.config.ts        # Vite config with API proxy to port 5000
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (Node 20 / 22 / 24 recommended).
- **npm**: Comes with Node.js.

### 2. Backend Setup & Seeding

Open a terminal in the `backend` directory:

```bash
cd backend
npm install
npm run build
npm run seed       # Seeds 15 categories, 10 brands, 24+ products, sample orders & coupons
npm start          # Runs on http://localhost:5000
```

> **API Health Check**: Verify that the backend is alive by visiting `http://localhost:5000/api/health`.

### 3. Frontend Setup & Launch

Open a second terminal in the `frontend` directory:

```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server (typically http://localhost:3000 or http://localhost:3001)
```

Open your browser and navigate to the printed Vite URL (e.g. `http://localhost:3000/` or `http://localhost:3001/`).

---

## 🔑 Default Credentials

### 1. Admin Account
- **Email**: `admin@globalbazarbd.com`
- **Password**: `Admin@123456`
- **Role**: `ADMIN`
- **Access**: Full Admin Dashboard, Revenue Analytics, Order Status Updates, Product Management, Settings.

### 2. Staff Account
- **Email**: `staff@globalbazarbd.com`
- **Password**: `Staff@123456`
- **Role**: `STAFF`
- **Access**: Order Processing & Stock Updates.

### 3. Customer Accounts (Pre-seeded with Order History)
- **Customer 1**:
  - **Email**: `tanvir.hasan@gmail.com`
  - **Password**: `Customer@123`
  - **Sample Order ID**: `GBBD-20260910-1001`
  - **Phone**: `01712345678`
- **Customer 2**:
  - **Email**: `nusrat.jahan@yahoo.com`
  - **Password**: `Customer@123`
  - **Sample Order ID**: `GBBD-20260912-1002`
  - **Phone**: `01812345678`

---

## 🎟️ Active Promotional Coupons

Test these during checkout or inside the Cart Drawer:
- `GLOBAL10` — 10% discount on orders above ৳1,000 (Max discount ৳500).
- `WELCOME50` — Fixed ৳50 discount on orders above ৳500.

---

## 🔍 Real Order Tracking Demonstration

To test the live tracking engine:
1. Click **"অর্ডার ট্র্যাক করুন" (Track Order)** in the top navigation bar or footer.
2. Enter:
   - **Order ID**: `GBBD-20260910-1001`
   - **Phone**: `01712345678`
3. Click **"ট্র্যাক করুন" (Track Now)**.
4. You will see the live progress bar, active delivery status (**DELIVERED**), delivery address, order items breakdown, and full audit timeline with dates and notes.
5. You can also place a new order on the checkout page; it will instantly generate a new `GBBD-YYYYMMDD-XXXX` tracking number that can be searched immediately!

---

## 🔒 Security & Best Practices
- **Password Security**: Passwords are saved as bcrypt salted hashes (cost factor 10).
- **JWT Authorization**: Strict token verification with user claims and expiration checks.
- **Transactional Stock Decrement**: Uses SQLite transactions (`db.transaction`) so that whenever an order is submitted, inventory quantities are decremented atomically with stock status flags (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`).
- **Input Sanitization**: Query parameter and payload checks across all administrative and public endpoints.

---

## 📄 License & Attribution
Developed with ❤️ for the Bangladesh eCommerce ecosystem. Open for commercial customization and deployment.
