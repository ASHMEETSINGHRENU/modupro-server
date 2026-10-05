import express from 'express';
import { getProducts, getProductBySlug, getCategories } from '../controllers/productController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

export default router;
