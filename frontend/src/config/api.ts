// API endpoints configuration
// Get the current host from the browser window
const currentHost = window.location.origin;

// Database URL (hardcoded as requested)
export const DB_URL = 'http://rm-uf6am28eh5qt2naa7.sqlserver.rds.aliyuncs.com:3433';

// API endpoints
export const API_ENDPOINTS = {
  // Add your API endpoints here
};

// Always use the current origin for API requests
export const API_BASE_URL = `${currentHost}/api`;

export const ENDPOINTS = {
  orders: '/orders'
} as const; 