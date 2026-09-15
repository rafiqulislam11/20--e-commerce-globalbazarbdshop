import { Router } from 'express';
import { createOrder, trackOrder, getMyOrders, getOrderById } from '../controllers/orderController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/track', trackOrder);
router.get('/my-orders', authenticateToken, getMyOrders);
router.get('/:id', getOrderById);

export default router;
