// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// User Roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Product Categories
const PRODUCT_CATEGORIES = {
  WATCHES: 'watches',
  EARPHONES: 'earphones',
  ACCESSORIES: 'accessories'
};

// Payment Methods
const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  PAYPAL: 'PayPal',
  STRIPE: 'Stripe'
};

// Response Messages
const MESSAGES = {
  // Success Messages
  SUCCESS: {
    USER_REGISTERED: 'User registered successfully',
    USER_LOGGED_IN: 'Login successful',
    USER_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    ACCOUNT_DELETED: 'Account deactivated successfully',
    PRODUCT_CREATED: 'Product created successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    ORDER_CREATED: 'Order created successfully',
    ORDER_UPDATED: 'Order status updated successfully'
  },
  
  // Error Messages
  ERROR: {
    VALIDATION_FAILED: 'Validation failed',
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Access denied. No token provided.',
    FORBIDDEN: 'Access denied. Insufficient permissions.',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_EXPIRED: 'Token expired',
    USER_NOT_FOUND: 'User not found',
    USER_EXISTS: 'User already exists with this email',
    USER_INACTIVE: 'Account is deactivated. Please contact support.',
    PRODUCT_NOT_FOUND: 'Product not found',
    PRODUCT_OUT_OF_STOCK: 'Product is out of stock',
    ORDER_NOT_FOUND: 'Order not found',
    SERVER_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database connection error',
    CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
    EMAIL_EXISTS: 'Email already exists',
    ADMIN_ONLY: 'Access denied. Admin privileges required.',
    OWNER_ONLY: 'You can only access your own resources.'
  }
};

// Database Configuration
const DB_CONFIG = {
  MAX_POOL_SIZE: 10,
  SERVER_SELECTION_TIMEOUT: 5000,
  SOCKET_TIMEOUT: 45000,
  FAMILY: 4
};

// JWT Configuration
const JWT_CONFIG = {
  DEFAULT_EXPIRE: '7d',
  ALGORITHM: 'HS256'
};

// Rate Limiting
const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  BROWSE: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 200
  }
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100
};

// File Upload
const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  UPLOAD_PATH: './uploads'
};

// Order Calculation
const ORDER_CALC = {
  FREE_SHIPPING_THRESHOLD: 50,
  SHIPPING_COST: 9.99,
  TAX_RATE: 0.08 // 8%
};

// Regular Expressions
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  MONGO_ID: /^[0-9a-fA-F]{24}$/
};

// Environment
const NODE_ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  ORDER_STATUS,
  PRODUCT_CATEGORIES,
  PAYMENT_METHODS,
  MESSAGES,
  DB_CONFIG,
  JWT_CONFIG,
  RATE_LIMITS,
  PAGINATION,
  FILE_UPLOAD,
  ORDER_CALC,
  REGEX,
  NODE_ENV
};
