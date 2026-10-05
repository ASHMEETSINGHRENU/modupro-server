import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import industryRoutes from './routes/industryRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { Product } from './models/Product.js';
import { seedDatabase } from './seed/seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins including Vercel production and preview deployments
const allowedOrigins = [
  'https://modu-pro-kohl.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return true;
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return true;
  return true;
};

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  })
);

// Explicit header fallback and preflight OPTIONS handler
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root API status endpoint
app.get('/', (req, res) => {
  res.json({
    company: 'MODUPRO INNOVATION PVT. LTD.',
    service: 'Backend REST API',
    status: 'online',
    tagline: 'Faithfully Delivering Excellence',
    location: 'Nagpur, Maharashtra, India',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/products/categories',
      services: '/api/services',
      industries: '/api/industries',
      enquiries: 'POST /api/enquiries',
      quotes: 'POST /api/quotes',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    company: 'MODUPRO INNOVATION PVT. LTD.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/industries', industryRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/quotes', quoteRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();
  if (dbConnected) {
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('[Init]: Database is empty. Seeding initial profile data...');
        await seedDatabase();
      }
    } catch (err) {
      console.warn('[Init Warning]: Could not check/seed database automatically:', err.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 MODUPRO INNOVATION PVT. LTD. Backend API Server`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
    console.log(`🛠️ Services API: http://localhost:${PORT}/api/services`);
    console.log(`🏢 Industries API: http://localhost:${PORT}/api/industries`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ [Error]: Port ${PORT} is already in use by another process.`);
      console.error(`👉 Solution: Either stop the existing process on port ${PORT}, or change PORT in server/.env (e.g., PORT=5001).\n`);
    } else {
      console.error(`\n❌ [Server Error]:`, err.message);
    }
  });
};

startServer();
