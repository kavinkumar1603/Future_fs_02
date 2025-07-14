const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/payments/methods
// @desc    Get all available payment methods with test data
// @access  Public
router.get('/methods', async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        type: 'card',
        icon: '💳',
        description: 'Visa, Mastercard, American Express',
        testData: {
          cardNumber: '4242424242424242',
          expiryDate: '12/25',
          cvv: '123'
        }
      },
      {
        id: 'debit_card',
        name: 'Debit Card',
        type: 'card',
        icon: '💳',
        description: 'Bank debit cards',
        testData: {
          cardNumber: '5555555555554444',
          expiryDate: '12/25',
          cvv: '123'
        }
      },
      {
        id: 'upi',
        name: 'UPI',
        type: 'upi',
        icon: '📱',
        description: 'Pay using UPI ID',
        testData: {
          upiId: 'test@upi',
          description: 'Enter your UPI ID'
        }
      },
      {
        id: 'qr_code',
        name: 'QR Code Payment',
        type: 'qr',
        icon: '📱',
        description: 'Scan QR code to pay',
        testData: {
          qrData: 'upi://pay?pa=merchant@upi&pn=Test Store&am=100&cu=INR',
          description: 'Scan this QR code with any UPI app'
        }
      },
      {
        id: 'net_banking',
        name: 'Net Banking',
        type: 'bank',
        icon: '🏦',
        description: 'Online banking transfer',
        testData: {
          bankCode: 'SBI',
          description: 'Login to your bank account'
        }
      },
      {
        id: 'paytm',
        name: 'Paytm',
        type: 'wallet',
        icon: '💰',
        description: 'Paytm Wallet & UPI',
        testData: {
          phoneNumber: '+91XXXXXXXXXX',
          description: 'Pay using Paytm wallet or UPI'
        }
      },
      {
        id: 'phonepe',
        name: 'PhonePe',
        type: 'wallet',
        icon: '📞',
        description: 'PhonePe UPI & Wallet',
        testData: {
          phoneNumber: '+91XXXXXXXXXX',
          description: 'Pay using PhonePe'
        }
      },
      {
        id: 'gpay',
        name: 'Google Pay',
        type: 'wallet',
        icon: 'G',
        description: 'Google Pay UPI',
        testData: {
          upiId: 'user@gpay',
          description: 'Pay using Google Pay'
        }
      },
      {
        id: 'amazon_pay',
        name: 'Amazon Pay',
        type: 'wallet',
        icon: '📦',
        description: 'Amazon Pay Balance',
        testData: {
          email: 'user@example.com',
          description: 'Pay using Amazon Pay balance'
        }
      },
      {
        id: 'mobikwik',
        name: 'MobiKwik',
        type: 'wallet',
        icon: '💼',
        description: 'MobiKwik Wallet',
        testData: {
          phoneNumber: '+91XXXXXXXXXX',
          description: 'Pay using MobiKwik wallet'
        }
      }
    ];

    res.json({
      status: 'success',
      message: 'Payment methods retrieved successfully',
      data: {
        paymentMethods: paymentMethods,
        total: paymentMethods.length
      }
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve payment methods',
      error: error.message
    });
  }
});

// @route   POST /api/payments/process
// @desc    Process payment with real-time animation
// @access  Public (for testing)
router.post('/process', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('orderId').optional().isMongoId().withMessage('Invalid order ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, paymentMethod, paymentData = {}, orderId } = req.body;

    // Set up Server-Sent Events for real-time updates
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial status
    res.write(`data: ${JSON.stringify({
      status: 'initiated',
      message: 'Payment process started...',
      paymentMethod,
      amount,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Simulate payment processing steps
    const steps = [
      { status: 'validating', message: 'Validating payment details...', delay: 500 },
      { status: 'processing', message: 'Processing payment...', delay: 1000 },
      { status: 'verifying', message: 'Verifying transaction...', delay: 800 },
      { status: 'completing', message: 'Finalizing payment...', delay: 700 }
    ];

    // Send step-by-step updates
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      res.write(`data: ${JSON.stringify({
        ...step,
        paymentMethod,
        amount,
        timestamp: new Date().toISOString()
      })}\n\n`);
    }

    // Simulate payment result (95% success rate)
    const success = Math.random() > 0.05;
    const transactionId = success ? 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9) : null;

    // Send final result
    const finalResult = {
      status: success ? 'success' : 'failed',
      message: success ? 'Payment completed successfully!' : 'Payment failed - please try again',
      transactionId,
      paymentMethod,
      amount,
      timestamp: new Date().toISOString()
    };

    res.write(`data: ${JSON.stringify(finalResult)}\n\n`);
    
    // End the stream
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Process payment error:', error);
    res.write(`data: ${JSON.stringify({
      status: 'error',
      message: 'Payment processing failed',
      error: error.message,
      timestamp: new Date().toISOString()
    })}\n\n`);
    res.end();
  }
});

// @route   POST /api/payments/test-payment
// @desc    Test payment endpoint for demo
// @access  Public
router.post('/test-payment', async (req, res) => {
  try {
    const { amount, paymentMethod, paymentData } = req.body;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate fake transaction ID
    const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
    
    // Simulate success (95% success rate for demo)
    const success = Math.random() > 0.05;
    
    if (success) {
      res.json({
        success: true,
        message: 'Payment completed successfully',
        transactionId,
        paymentMethod,
        amount,
        provider: getProviderName(paymentMethod),
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        message: 'Payment failed - insufficient funds',
        transactionId: null,
        paymentMethod,
        amount
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during payment processing',
      error: error.message
    });
  }
});

function getProviderName(method) {
  const providers = {
    credit_card: 'Visa/Mastercard',
    debit_card: 'Visa/Mastercard',
    upi: 'UPI',
    qr_code: 'QR Payment',
    net_banking: 'Net Banking',
    paytm: 'Paytm',
    phonepe: 'PhonePe',
    gpay: 'Google Pay',
    amazon_pay: 'Amazon Pay',
    mobikwik: 'MobiKwik'
  };
  return providers[method] || 'Unknown';
}

module.exports = router;
