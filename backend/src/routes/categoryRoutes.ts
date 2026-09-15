import { Router } from 'express';
import { getCategories, getBrands } from '../controllers/categoryController.js';

const router = Router();

router.get('/', getCategories);
router.get('/brands', getBrands);

export default router;
