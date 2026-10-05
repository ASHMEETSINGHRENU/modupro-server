import express from 'express';
import { getIndustries, getIndustryBySlug } from '../controllers/industryController.js';

const router = express.Router();

router.get('/', getIndustries);
router.get('/:slug', getIndustryBySlug);

export default router;
