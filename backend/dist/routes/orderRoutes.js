"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderService_1 = require("../services/orderService");
const router = express_1.default.Router();
router.post('/orders', async (req, res) => {
    try {
        const orderData = req.body;
        await (0, orderService_1.createOrder)(orderData);
        res.status(201).json({
            success: true,
            message: '订单创建成功',
            data: orderData
        });
    }
    catch (err) {
        console.error('Error creating order:', err);
        const errorMessage = err instanceof Error
            ? err.message
            : typeof err === 'string'
                ? err
                : '未知错误';
        res.status(500).json({
            success: false,
            message: '订单创建失败',
            ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
        });
    }
});
exports.default = router;
