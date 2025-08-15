"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const http_1 = require("http");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configure CORS
app.use((0, cors_1.default)({
    origin: ['http://localhost:8888'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Body parser middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// Health check route
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
});
// Routes
app.use('/api', orderRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '请求的资源不存在'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: '服务器错误，请稍后重试',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
const server = (0, http_1.createServer)(app);
const PORT = 8888;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log('Environment:', process.env.NODE_ENV);
});
