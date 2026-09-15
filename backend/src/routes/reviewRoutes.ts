import { Router } from 'express';
import { getReviewsByProduct, createReview } from '../controllers/reviewController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', getReviewsByProduct);
router.post('/', optionalAuth, createReview);

export default router;
