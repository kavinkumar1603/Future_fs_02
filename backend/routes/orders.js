const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { PaymentService } = require('../services/paymentService');
const BillService = require('../services/billService');

const router = express.Router();

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

// Validation middleware for creating orders
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('shippingAddress.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required')
];

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', authenticateToken, validateOrder, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate and get product details
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          status: 'error',
          message: `Product with ID ${item.product} not found`
        });
      }

      if (!product.inStock) {
        return res.status(400).json({
          status: 'error',
          message: `Product ${product.name} is out of stock`
        });
      }

      const orderItem = {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      };

      orderItems.push(orderItem);
      subtotal += product.price * item.quantity;
    }

    // Calculate totals
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Process payment if payment details provided
    let paymentResult = null;
    let processedPaymentMethod = paymentMethod || { type: 'Credit Card', testMode: true };

    if (paymentMethod && paymentMethod.cardDetails) {
      paymentResult = await PaymentService.processTestPayment({
        method: paymentMethod.type,
        amount: total,
        cardDetails: paymentMethod.cardDetails
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          status: 'error',
          message: `Payment failed: ${paymentResult.error}`
        });
      }

      processedPaymentMethod = {
        type: paymentMethod.type,
        provider: paymentResult.provider,
        transactionId: paymentResult.transactionId,
        last4: paymentResult.last4,
        testMode: true
      };
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: processedPaymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      status: paymentResult ? 'processing' : 'pending'
    });

    await order.save();

    // Populate user details
    await order.populate('user', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order,
        paymentResult,
        invoiceUrl: `/api/orders/${order._id}/invoice/html`
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating order'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image description')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user owns the order (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.json({
      status: 'success',
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error fetching order'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', [
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.'
      });
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, trackingNumber, estimatedDelivery } = req.body;

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (status === 'delivered') updateData.deliveredAt = new Date();

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Order status updated successfully',
      data: {
        order
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error updating order status'
    });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.'
      });
    }

    const { page = 1, limit = 20, status, search } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching orders'
    });
  }
});

// @route   GET /api/orders/stats/dashboard
// @desc    Get order statistics (Admin only)
// @access  Private/Admin
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin only.'
      });
    }

    const [totalOrders, totalRevenue, ordersByStatus, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentOrders
    };

    res.json({
      status: 'success',
      data: {
        stats
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching order statistics'
    });
  }
});

// @route   GET /api/orders/payment/methods
// @desc    Get available payment methods and test cards
// @access  Public
router.get('/payment/methods', async (req, res) => {
  try {
    const paymentMethods = PaymentService.getPaymentMethods();
    const testCards = PaymentService.getTestCards();
    
    res.json({
      status: 'success',
      data: {
        paymentMethods,
        testCards,
        testMode: true
      }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching payment methods'
    });
  }
});

// @route   POST /api/orders/payment/process
// @desc    Process payment for an order
// @access  Private
router.post('/payment/process', [
  body('orderId').isMongoId().withMessage('Invalid order ID'),
  body('paymentMethod.type').notEmpty().withMessage('Payment method is required'),
  body('paymentMethod.cardDetails').optional().isObject()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, paymentMethod } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Process payment
    const paymentResult = await PaymentService.processTestPayment({
      method: paymentMethod.type,
      amount: order.total,
      cardDetails: paymentMethod.cardDetails || {}
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        status: 'error',
        message: paymentResult.error
      });
    }

    // Update order with payment information
    order.paymentMethod = {
      type: paymentMethod.type,
      provider: paymentResult.provider,
      transactionId: paymentResult.transactionId,
      last4: paymentResult.last4,
      testMode: true
    };
    order.status = 'processing';

    await order.save();

    res.json({
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        order,
        paymentResult
      }
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing payment'
    });
  }
});

// @route   GET /api/orders/:id/invoice
// @desc    Get order invoice/bill
// @access  Private
router.get('/:id/invoice', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image description')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user owns the order (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const invoiceData = BillService.generateInvoiceData(order);

    res.json({
      status: 'success',
      data: {
        invoice: invoiceData
      }
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generating invoice'
    });
  }
});

// @route   GET /api/orders/:id/invoice/html
// @desc    Get order invoice as HTML for printing
// @access  Private
router.get('/:id/invoice/html', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image description')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user owns the order (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const invoiceData = BillService.generateInvoiceData(order);
    const htmlInvoice = BillService.generateHTMLInvoice(invoiceData);

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlInvoice);

  } catch (error) {
    console.error('Get HTML invoice error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generating HTML invoice'
    });
  }
});

// @route   GET /api/orders/:id/invoice/text
// @desc    Get order invoice as plain text receipt
// @access  Private
router.get('/:id/invoice/text', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image description')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user owns the order (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const invoiceData = BillService.generateInvoiceData(order);
    const textReceipt = BillService.generateTextReceipt(invoiceData);

    res.setHeader('Content-Type', 'text/plain');
    res.send(textReceipt);

  } catch (error) {
    console.error('Get text receipt error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generating text receipt'
    });
  }
});

module.exports = router;
