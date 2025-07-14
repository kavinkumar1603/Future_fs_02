const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'United States'
    }
  },
  paymentMethod: {
    type: {
      type: String,
      required: true,
      enum: ['Credit Card', 'Debit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Bank Transfer', 'Cash on Delivery', 'UPI', 'QR Code Payment', 'Paytm', 'PhonePe', 'Google Pay UPI', 'Amazon Pay'],
      default: 'Credit Card'
    },
    cardNumber: String, // Encrypted or tokenized
    last4: String,
    expiryDate: String,
    cardHolderName: String,
    provider: {
      type: String,
      enum: ['Visa', 'Mastercard', 'American Express', 'Discover', 'PayPal', 'Apple', 'Google', 'Bank', 'COD', 'UPI', 'QR Payment', 'Paytm', 'PhonePe', 'Amazon Pay']
    },
    transactionId: String,
    upiId: String, // For UPI payments
    qrId: String, // For QR code payments
    phoneNumber: String, // For wallet payments
    testMode: {
      type: Boolean,
      default: true // Default to test mode for development
    },
    testCardDetails: {
      testCardNumber: String,
      testType: {
        type: String,
        enum: ['success', 'decline', 'insufficient_funds', 'expired_card', 'invalid_cvc']
      }
    },
    animationType: {
      type: String,
      enum: ['card_success', 'upi_success', 'qr_scan_success', 'paytm_success', 'phonepe_success', 'gpay_success', 'amazon_success', 'paypal_success']
    },
    processingTime: Number, // Animation duration in milliseconds
    additionalData: {
      cashbackEarned: Number,
      walletBalance: String,
      rewards: String,
      upiHandle: String
    }
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    sparse: true
  },
  estimatedDelivery: Date,
  deliveredAt: Date,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for formatted order number
orderSchema.virtual('formattedOrderNumber').get(function() {
  return `TS-${this.orderNumber}`;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.orderNumber = `${timestamp}-${random}`;
  }
  next();
});

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('user', 'name email').sort({ createdAt: -1 });
};

// Static method to find recent orders
orderSchema.statics.findRecent = function(limit = 10) {
  return this.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(limit);
};

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.tax = this.subtotal * 0.08; // 8% tax
  this.shipping = this.subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  this.total = this.subtotal + this.tax + this.shipping;
  return this;
};

module.exports = mongoose.model('Order', orderSchema);
