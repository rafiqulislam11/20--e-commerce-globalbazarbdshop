import { Router } from 'express';
import { getProducts, getProductBySlug, getFeaturedSections, getSearchSuggestions } from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedSections);
router.get('/suggestions', getSearchSuggestions);
router.get('/:slug', getProductBySlug);

export default router;
