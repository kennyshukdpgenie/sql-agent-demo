import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './routes/orderRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS to accept requests from the same origin
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow both frontend dev servers
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器错误，请稍后重试'
  });
});

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 