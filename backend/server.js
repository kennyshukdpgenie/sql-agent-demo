const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { insertOrder } = require('./database_handler');

const app = express();
const port = process.env.PORT || 8888;

// Add error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Configure CORS
app.use(cors({
  origin: [
    'http://akheartebespoken.com',
    'https://akheartebespoken.com',
    'http://www.akheartebespoken.com',
    'https://www.akheartebespoken.com',
    'http://localhost:3000',  // For local development
    'http://localhost:8888',  // For local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 3600
}));

// Parse JSON bodies
app.use(bodyParser.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Order submission endpoint
app.post('/submit-order', async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    
    // Insert order into database
    await insertOrder(req.body);
    
    res.json({ success: true, message: '订单提交成功' });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ 
      success: false, 
      message: '订单提交失败',
      error: error.message 
    });
  }
});

// Server info endpoint
app.get('/api/server-info', (req, res) => {
  const host = req.headers.host || 'akheartebespoken.com';
  const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  
  res.json({
    api_base_url: `${protocol}://${host}`,
    client_ip: req.ip,
    server_hostname: host
  });
});

// Handle any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
}); 