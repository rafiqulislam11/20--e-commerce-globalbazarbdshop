import { Router } from 'express';
import {
  getDashboardStats,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminCreateCategory,
  adminDeleteCategory,
  adminGetCustomers,
  adminToggleCustomerStatus,
  adminGetCoupons,
  adminCreateCoupon,
  adminDeleteCoupon,
  adminGetReviews,
  adminUpdateReviewStatus,
  adminUpdateSettings,
  adminGetPaymentVerifications,
  adminVerifyPayment,
  adminRejectPayment,
  adminRequestPaymentCorrection
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'STAFF']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router.get('/products', adminGetProducts);
router.post('/products', adminCreateProduct);
router.put('/products/:id', adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);

// Orders
router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', adminUpdateOrderStatus);

// Payment Verifications (Manual bKash, Nagad, etc.)
router.get('/payment-verifications', adminGetPaymentVerifications);
router.put('/payment-verifications/:id/verify', adminVerifyPayment);
router.put('/payment-verifications/:id/reject', adminRejectPayment);
router.put('/payment-verifications/:id/request-correction', adminRequestPaymentCorrection);

// Categories
router.post('/categories', adminCreateCategory);
router.delete('/categories/:id', adminDeleteCategory);

// Customers
router.get('/customers', adminGetCustomers);
router.put('/customers/:id/toggle-status', adminToggleCustomerStatus);

// Coupons
router.get('/coupons', adminGetCoupons);
router.post('/coupons', adminCreateCoupon);
router.delete('/coupons/:id', adminDeleteCoupon);

// Reviews
router.get('/reviews', adminGetReviews);
router.put('/reviews/:id/status', adminUpdateReviewStatus);

// Settings
router.put('/settings', adminUpdateSettings);

export default router;
