const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics (Admin only)
// @access  Private/Admin
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      ordersByStatus,
      monthlyRevenue
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 })
        .limit(5),
      Product.find({ featured: true })
        .sort({ rating: -1 })
        .limit(5),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    const stats = {
      overview: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentOrders,
      topProducts,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      monthlyRevenue: monthlyRevenue.reverse()
    };

    res.json({
      status: 'success',
      data: {
        stats
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard statistics'
    });
  }
});

// @route   GET /api/admin/analytics/sales
// @desc    Get sales analytics (Admin only)
// @access  Private/Admin
router.get('/analytics/sales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 90)) } };
        break;
      case '1y':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
    }

    const [
      salesData,
      topSellingProducts,
      categoryPerformance
    ] = await Promise.all([
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        { $sort: { quantity: -1 } },
        { $limit: 10 }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            quantity: { $sum: '$items.quantity' }
          }
        },
        { $sort: { revenue: -1 } }
      ])
    ]);

    res.json({
      status: 'success',
      data: {
        salesData,
        topSellingProducts,
        categoryPerformance,
        period
      }
    });

  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching sales analytics'
    });
  }
});

// @route   GET /api/admin/users/analytics
// @desc    Get user analytics (Admin only)
// @access  Private/Admin
router.get('/users/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      userRegistrations,
      userActivity,
      topCustomers
    ] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } },
        { $limit: 30 }
      ]),
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
            },
            adminUsers: {
              $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
            }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: '$user',
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      status: 'success',
      data: {
        userRegistrations,
        userActivity: userActivity[0] || { totalUsers: 0, activeUsers: 0, adminUsers: 0 },
        topCustomers
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user analytics'
    });
  }
});

module.exports = router;
