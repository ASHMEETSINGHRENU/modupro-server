import { Product } from '../models/Product.js';
import { ProductCategory } from '../models/ProductCategory.js';
import { productsData, categoriesData } from '../seed/seedData.js';

export const getProducts = async (req, res) => {
  try {
    const { category, brand, featured, search } = req.query;
    const filter = { isAvailable: true };

    if (category && category !== 'all') {
      filter.categorySlug = category;
    }
    if (brand && brand !== 'all') {
      filter.brand = brand.toUpperCase();
    }
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
      ];
    }

    let products = [];
    try {
      products = await Product.find(filter).sort({ isFeatured: -1, createdAt: -1 });
    } catch {
      // In case DB is offline, fall back to seed data in-memory
      products = productsData.filter((p) => {
        if (category && category !== 'all' && p.categorySlug !== category) return false;
        if (brand && brand !== 'all' && p.brand !== brand.toUpperCase()) return false;
        if (featured === 'true' && !p.isFeatured) return false;
        if (search) {
          const s = search.toLowerCase();
          return p.name.toLowerCase().includes(s) || p.shortDescription.toLowerCase().includes(s);
        }
        return true;
      });
    }

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let product = null;

    try {
      product = await Product.findOne({ slug });
    } catch {
      product = productsData.find((p) => p.slug === slug);
    }

    if (!product) {
      product = productsData.find((p) => p.slug === slug);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    let categories = [];
    try {
      categories = await ProductCategory.find({ isActive: true }).sort({ displayOrder: 1 });
    } catch {
      categories = categoriesData;
    }

    if (!categories.length) {
      categories = categoriesData;
    }

    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
