import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { productsData } from './data/products.js';
import { Product } from './models/Product.js';
import { Inquiry } from './models/Inquiry.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/modu_pro';

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Fallback Store (for immediate zero-config local run)
let inMemoryInquiries = [];
let isMongoConnected = false;

// Connect to MongoDB
async function initDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB successfully.');

    // Sync products if collection has older schema or count mismatch
    const sample = await Product.findOne();
    if (!sample || !sample.id || (await Product.countDocuments()) !== productsData.length) {
      await Product.collection.drop().catch(() => {});
      await Product.insertMany(productsData);
      console.log(`📦 Re-synced ${productsData.length} products to MongoDB with updated schema.`);
    } else {
      console.log(`📦 Verified ${productsData.length} products in MongoDB.`);
    }
  } catch (err) {
    isMongoConnected = false;
    console.error('⚠️ Database sync error:', err.message || err);
    console.warn('⚠️ Running with ultra-fast In-Memory data store fallback.');
  }
}

initDatabase();

// ============================================================================
// API ROUTES
// ============================================================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Modu Pro Innovation API',
    database: isMongoConnected ? 'MongoDB' : 'In-Memory Store',
    totalProducts: productsData.length
  });
});

// GET /api/products (Optional ?category=...&q=...)
app.get('/api/products', async (req, res) => {
  try {
    const { category, q } = req.query;

    if (isMongoConnected) {
      const filter = {};
      if (category && category !== 'all') {
        filter.category = category;
      }
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { summary: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } }
        ];
      }
      const products = await Product.find(filter);
      return res.json(products);
    }

    // Fallback: in-memory filter
    let results = [...productsData];
    if (category && category !== 'all') {
      results = results.filter(p => p.category === category);
    }
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      );
    }
    res.json(results);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const product = await Product.findOne({ id });
      if (product) return res.json(product);
    }

    const product = productsData.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/inquiries (Submit RFQ / Commercial Quote Request)
app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, company, phone, email, location, industry, categories, details } = req.body;

    if (!name || !company || !phone || !email) {
      return res.status(400).json({ error: 'Missing required fields (name, company, phone, email)' });
    }

    const inquiryPayload = {
      name,
      company,
      phone,
      email,
      location: location || 'Nagpur / Maharashtra',
      industry: industry || 'Modular Furniture / Woodworking',
      categories: categories || ['General Product Inquiry'],
      details: details || '',
      createdAt: new Date()
    };

    let savedInquiry;
    if (isMongoConnected) {
      savedInquiry = await Inquiry.create(inquiryPayload);
    } else {
      savedInquiry = { id: `inq_${Date.now()}`, ...inquiryPayload };
      inMemoryInquiries.unshift(savedInquiry);
    }

    // Generate WhatsApp direct text
    const catsFormatted = inquiryPayload.categories.join(', ');
    const waText = 
      `*MODU PRO INNOVATION - B2B RFQ QUOTE REQUEST*%0A%0A` +
      `*Client:* ${encodeURIComponent(name)}%0A` +
      `*Company:* ${encodeURIComponent(company)}%0A` +
      `*Phone:* ${encodeURIComponent(phone)}%0A` +
      `*Email:* ${encodeURIComponent(email)}%0A` +
      `*Location:* ${encodeURIComponent(inquiryPayload.location)}%0A` +
      `*Industry:* ${encodeURIComponent(inquiryPayload.industry)}%0A` +
      `*Categories:* ${encodeURIComponent(catsFormatted)}%0A` +
      `*Requirement:* ${encodeURIComponent(details || 'Standard pricing requested')}%0A%0A` +
      `Please provide commercial quotation.`;

    const waLink = `https://wa.me/918623041894?text=${waText}`;

    res.status(201).json({
      success: true,
      message: 'Quotation request submitted successfully. Our commercial engineering team will respond shortly.',
      inquiry: savedInquiry,
      whatsAppLink: waLink
    });
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({ error: 'Failed to process inquiry' });
  }
});

// GET /api/inquiries (View inquiries)
app.get('/api/inquiries', async (req, res) => {
  try {
    if (isMongoConnected) {
      const inquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(50);
      return res.json(inquiries);
    }
    res.json(inMemoryInquiries);
  } catch (error) {
    console.error('Error getting inquiries:', error);
    res.status(500).json({ error: 'Failed to get inquiries' });
  }
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Modu Pro Server running on http://127.0.0.1:${PORT}`);
});
