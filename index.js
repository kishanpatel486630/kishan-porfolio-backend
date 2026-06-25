import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import contactRouter from './routes/contact.js';
import adminRouter from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Build allowed origins list — always include localhost for local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  // Hardcoded production Vercel URL — always allowed
  'https://kishan-porfolio.vercel.app',
];

// Also add any extra CLIENT_URL from Render env (e.g. custom domain)
if (process.env.CLIENT_URL) {
  const url = process.env.CLIENT_URL.trim();
  if (!allowedOrigins.includes(url)) {
    allowedOrigins.push(url);
  }
}

console.log('✅ CORS allowed origins:', allowedOrigins);


// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`⚠️ CORS blocked request from: ${origin}`);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight OPTIONS for all routes
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));


// Routes
app.use('/api', contactRouter);
app.use('/api', adminRouter);
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✨ Server running on http://localhost:${PORT}`);
});
