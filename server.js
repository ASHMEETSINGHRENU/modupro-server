import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { productsData } from './data/products.js';
import { Product } from './models/Product.js';
import { Inquiry } from './models/Inquiry.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3100;
const HOST = process.env.HOST || '0.0.0.0';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/modu_pro';

// Middleware
const corsOrigin = process.env.CLIENT_URL || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
  credentials: true
}));
app.use(express.json());

// In-Memory Fallback Store (for immediate zero-config local run)
let inMemoryInquiries = [];
let isMongoConnected = false;

// Connect to MongoDB
async function initDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    isMongoConnected = true;
    console.log(`✅ Connected to MongoDB Atlas successfully [Host: ${mongoose.connection.host}, DB: ${mongoose.connection.name}].`);

    // Sync products if collection has older schema or count mismatch
    const sample = await Product.findOne();
    if (!sample || !sample.id || (await Product.countDocuments()) !== productsData.length) {
      await Product.collection.drop().catch(() => {});
      await Product.insertMany(productsData);
      console.log(`📦 Seeded ${productsData.length} products to MongoDB Atlas collection.`);
    } else {
      console.log(`📦 Verified ${productsData.length} products active in MongoDB Atlas.`);
    }
  } catch (err) {
    isMongoConnected = false;
    console.error('⚠️ Database sync error:', err.message || err);
    console.warn('⚠️ Running with ultra-fast In-Memory data store fallback.');
  }
}

initDatabase();

const clientDistPath = path.resolve(__dirname, '../client/dist');

// ============================================================================
// API ROUTES
// ============================================================================

// Root Route: API Gateway & Status Dashboard
app.get('/', (req, res) => {
  if (fs.existsSync(clientDistPath)) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modu Pro Innovation — API Gateway</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: #F8F5EF; color: #1f1d1e; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #ffffff; max-width: 580px; width: 100%; border: 1px solid #e5e5e5; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #eef7ee; color: #1e7e34; margin-bottom: 20px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #28a745; display: inline-block; }
    h1 { font-size: 24px; font-weight: 600; color: #8C460C; margin-bottom: 8px; letter-spacing: -0.02em; }
    p { font-size: 14px; color: #6a6a6a; line-height: 1.6; margin-bottom: 24px; }
    .endpoints { border-top: 1px solid #e5e5e5; padding-top: 20px; }
    .endpoints h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #8C460C; margin-bottom: 12px; }
    .link-group { display: flex; flex-direction: column; gap: 10px; }
    .link-btn { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f1efe9; border-radius: 10px; color: #1f1d1e; text-decoration: none; font-size: 13px; font-weight: 500; transition: background 0.2s; }
    .link-btn:hover { background: #e5e2da; }
    .method { font-size: 11px; font-weight: 700; color: #8C460C; }
    .meta { margin-top: 24px; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Operational &bull; MongoDB Atlas Live</div>
    <h1>Modu Pro Innovation Pvt. Ltd.</h1>
    <p>Central India B2B API gateway for wood adhesives, precision Yash tooling, panel processing machinery, and Square One edge-banding tapes.</p>
    <div class="endpoints">
      <h2>Active API Endpoints</h2>
      <div class="link-group">
        <a class="link-btn" href="/api/health" target="_blank">
          <span><code>/api/health</code> &bull; Cluster Diagnostics</span>
          <span class="method">GET</span>
        </a>
        <a class="link-btn" href="/api/products" target="_blank">
          <span><code>/api/products</code> &bull; Full Product Catalog (19 Items)</span>
          <span class="method">GET</span>
        </a>
        <a class="link-btn" href="/api/inquiries" target="_blank">
          <span><code>/api/inquiries</code> &bull; Commercial RFQ Quotes</span>
          <span class="method">GET / POST</span>
        </a>
      </div>
    </div>
    <div class="meta">&copy; ${new Date().getFullYear()} Modu Pro Innovation Pvt. Ltd. &bull; Nagpur, Maharashtra.</div>
  </div>
</body>
</html>`);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Modu Pro Innovation API',
    database: isMongoConnected ? `MongoDB Atlas (${mongoose.connection.host}/${mongoose.connection.name})` : 'In-Memory Store',
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

// Serve frontend build if available (Unified MERN deployment on Render)
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Modu Pro Server running on port ${PORT}`);
});
