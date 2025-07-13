const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Calculate pagination info
const getPaginationInfo = (page, limit, total) => {
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const totalPages = Math.ceil(total / itemsPerPage);
  
  return {
    currentPage,
    totalPages,
    total,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    limit: itemsPerPage
  };
};

// Format response
const formatResponse = (status, message, data = null, pagination = null) => {
  const response = {
    status,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination !== null) {
    response.pagination = pagination;
  }

  return response;
};

// Calculate order totals
const calculateOrderTotals = (items, shippingThreshold = 50, taxRate = 0.08, shippingCost = 9.99) => {
  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const shipping = subtotal >= shippingThreshold ? 0 : shippingCost;
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${timestamp}-${random}`;
};

// Sanitize user data for response (remove sensitive fields)
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

// Build database query filter
const buildQueryFilter = (queryParams) => {
  const filter = {};
  
  Object.keys(queryParams).forEach(key => {
    const value = queryParams[key];
    
    if (value && value !== 'all') {
      switch (key) {
        case 'category':
          filter.category = value;
          break;
        case 'inStock':
          filter.inStock = value === 'true';
          break;
        case 'featured':
          filter.featured = value === 'true';
          break;
        case 'minPrice':
          if (!filter.price) filter.price = {};
          filter.price.$gte = parseFloat(value);
          break;
        case 'maxPrice':
          if (!filter.price) filter.price = {};
          filter.price.$lte = parseFloat(value);
          break;
        case 'search':
          filter.$or = [
            { name: { $regex: value, $options: 'i' } },
            { description: { $regex: value, $options: 'i' } },
            { brand: { $regex: value, $options: 'i' } }
          ];
          break;
        case 'status':
          filter.status = value;
          break;
      }
    }
  });
  
  return filter;
};

// Build sort object for database queries
const buildSortObject = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
  return sort;
};

// Validate file upload
const validateFileUpload = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5242880) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file uploaded');
    return errors;
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
  }
  
  return errors;
};

// Generate random string
const generateRandomString = (length = 10) => {
  return Math.random().toString(36).substring(2, length + 2);
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Clean and validate phone number
const cleanPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Validate US phone number (10 digits)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return null;
};

module.exports = {
  generateToken,
  getPaginationInfo,
  formatResponse,
  calculateOrderTotals,
  generateOrderNumber,
  sanitizeUser,
  buildQueryFilter,
  buildSortObject,
  validateFileUpload,
  generateRandomString,
  formatCurrency,
  isValidEmail,
  cleanPhoneNumber
};
