"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
const tedious_1 = require("tedious");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const config = {
    server: process.env.DB_HOST || 'rm-uf6am28eh5qt2naa7.sqlserver.rds.aliyuncs.com',
    options: {
        database: process.env.DB_NAME || 'shirt_order_test',
        encrypt: true,
        port: parseInt(process.env.DB_PORT || '3433'),
        trustServerCertificate: true,
        rowCollectionOnRequestCompletion: true
    },
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER?.replace(/^'|'$/g, '') || '',
            password: process.env.DB_PASSWORD?.replace(/^'|'$/g, '') || ''
        }
    }
};
async function createOrder(orderData) {
    return new Promise((resolve, reject) => {
        const connection = new tedious_1.Connection(config);
        connection.on('connect', (err) => {
            if (err) {
                console.error('Database connection error:', err);
                reject(new Error('数据库连接失败'));
                return;
            }
            console.log('Connected to database successfully');
            const request = new tedious_1.Request(`INSERT INTO Test (
          customer_name, phone, order_date, delivery_date,
          suit_type, fabric, color, size,
          chest, waist, hips, shoulder, sleeve, back_length,
          special_requests
        ) VALUES (
          @customer_name, @phone, @order_date, @delivery_date,
          @suit_type, @fabric, @color, @size,
          @chest, @waist, @hips, @shoulder, @sleeve, @back_length,
          @special_requests
        )`, (err) => {
                if (err) {
                    console.error('SQL execution error:', err);
                    reject(new Error('订单创建失败'));
                    return;
                }
                resolve();
            });
            // Add parameters with correct TYPES
            request.addParameter('customer_name', tedious_1.TYPES.NVarChar, orderData.customer_name);
            request.addParameter('phone', tedious_1.TYPES.NVarChar, orderData.phone);
            request.addParameter('order_date', tedious_1.TYPES.Date, new Date(orderData.order_date));
            request.addParameter('delivery_date', tedious_1.TYPES.Date, new Date(orderData.delivery_date));
            request.addParameter('suit_type', tedious_1.TYPES.NVarChar, orderData.suit_type);
            request.addParameter('fabric', tedious_1.TYPES.NVarChar, orderData.fabric);
            request.addParameter('color', tedious_1.TYPES.NVarChar, orderData.color);
            request.addParameter('size', tedious_1.TYPES.NVarChar, orderData.size);
            request.addParameter('chest', tedious_1.TYPES.Real, parseFloat(orderData.measurements.chest));
            request.addParameter('waist', tedious_1.TYPES.Real, parseFloat(orderData.measurements.waist));
            request.addParameter('hips', tedious_1.TYPES.Real, parseFloat(orderData.measurements.hips));
            request.addParameter('shoulder', tedious_1.TYPES.Real, parseFloat(orderData.measurements.shoulder));
            request.addParameter('sleeve', tedious_1.TYPES.Real, parseFloat(orderData.measurements.sleeve));
            request.addParameter('back_length', tedious_1.TYPES.Real, parseFloat(orderData.measurements.back_length));
            request.addParameter('special_requests', tedious_1.TYPES.NVarChar, orderData.special_requests || '');
            connection.execSql(request);
        });
        // Handle connection errors
        connection.on('error', (err) => {
            console.error('Database error:', err);
            reject(new Error('数据库错误'));
        });
        connection.connect();
    });
}
