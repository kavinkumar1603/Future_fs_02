// Payment animation configurations for different payment methods

const PAYMENT_ANIMATIONS = {
  upi_success: {
    type: 'UPI',
    duration: 2000,
    steps: [
      { step: 1, message: 'Connecting to UPI...', icon: '📱', delay: 300 },
      { step: 2, message: 'Verifying UPI ID...', icon: '🔍', delay: 600 },
      { step: 3, message: 'Processing payment...', icon: '💳', delay: 800 },
      { step: 4, message: 'Payment successful!', icon: '✅', delay: 300 }
    ],
    successAnimation: {
      icon: '✅',
      color: '#4CAF50',
      message: 'UPI Payment Successful',
      particles: true,
      confetti: true
    }
  },

  qr_scan_success: {
    type: 'QR Code',
    duration: 3000,
    steps: [
      { step: 1, message: 'QR Code generated...', icon: '📷', delay: 500 },
      { step: 2, message: 'Waiting for scan...', icon: '👁️', delay: 1000 },
      { step: 3, message: 'QR Code scanned!', icon: '📱', delay: 800 },
      { step: 4, message: 'Processing payment...', icon: '💳', delay: 500 },
      { step: 5, message: 'Payment completed!', icon: '✅', delay: 200 }
    ],
    successAnimation: {
      icon: '📷✅',
      color: '#2196F3',
      message: 'QR Payment Successful',
      scanEffect: true,
      particles: true
    }
  },

  paytm_success: {
    type: 'Paytm',
    duration: 2500,
    steps: [
      { step: 1, message: 'Opening Paytm...', icon: '💰', delay: 400 },
      { step: 2, message: 'Checking wallet balance...', icon: '💵', delay: 700 },
      { step: 3, message: 'Processing payment...', icon: '🔄', delay: 900 },
      { step: 4, message: 'Payment successful!', icon: '✅', delay: 500 }
    ],
    successAnimation: {
      icon: '💰✅',
      color: '#00C0F7',
      message: 'Paytm Payment Successful',
      walletAnimation: true,
      particles: true
    }
  },

  phonepe_success: {
    type: 'PhonePe',
    duration: 2200,
    steps: [
      { step: 1, message: 'Connecting to PhonePe...', icon: '📞', delay: 400 },
      { step: 2, message: 'Authenticating...', icon: '🔐', delay: 600 },
      { step: 3, message: 'Processing UPI payment...', icon: '💳', delay: 800 },
      { step: 4, message: 'Payment successful!', icon: '✅', delay: 400 }
    ],
    successAnimation: {
      icon: '📞✅',
      color: '#5F259F',
      message: 'PhonePe Payment Successful',
      pulseEffect: true,
      particles: true
    }
  },

  gpay_success: {
    type: 'Google Pay',
    duration: 1800,
    steps: [
      { step: 1, message: 'Opening Google Pay...', icon: 'G', delay: 300 },
      { step: 2, message: 'Processing UPI...', icon: '🔄', delay: 600 },
      { step: 3, message: 'Payment completed!', icon: '✅', delay: 500 },
      { step: 4, message: 'Cashback earned!', icon: '🎁', delay: 400 }
    ],
    successAnimation: {
      icon: 'G✅',
      color: '#4285F4',
      message: 'Google Pay Successful',
      googleColors: true,
      rewards: true,
      particles: true
    }
  },

  amazon_success: {
    type: 'Amazon Pay',
    duration: 2000,
    steps: [
      { step: 1, message: 'Accessing Amazon Pay...', icon: '🛒', delay: 400 },
      { step: 2, message: 'Checking balance...', icon: '💰', delay: 600 },
      { step: 3, message: 'Processing payment...', icon: '💳', delay: 700 },
      { step: 4, message: 'Payment successful!', icon: '✅', delay: 300 }
    ],
    successAnimation: {
      icon: '🛒✅',
      color: '#FF9900',
      message: 'Amazon Pay Successful',
      shoppingEffect: true,
      cashback: true,
      particles: true
    }
  },

  card_success: {
    type: 'Card Payment',
    duration: 2500,
    steps: [
      { step: 1, message: 'Validating card...', icon: '💳', delay: 500 },
      { step: 2, message: 'Connecting to bank...', icon: '🏦', delay: 700 },
      { step: 3, message: 'Processing payment...', icon: '🔄', delay: 800 },
      { step: 4, message: 'Payment authorized!', icon: '✅', delay: 500 }
    ],
    successAnimation: {
      icon: '💳✅',
      color: '#4CAF50',
      message: 'Card Payment Successful',
      cardFlip: true,
      particles: true
    }
  },

  paypal_success: {
    type: 'PayPal',
    duration: 2300,
    steps: [
      { step: 1, message: 'Connecting to PayPal...', icon: '🅿️', delay: 400 },
      { step: 2, message: 'Authenticating account...', icon: '🔐', delay: 700 },
      { step: 3, message: 'Processing payment...', icon: '💳', delay: 800 },
      { step: 4, message: 'Payment completed!', icon: '✅', delay: 400 }
    ],
    successAnimation: {
      icon: '🅿️✅',
      color: '#0070BA',
      message: 'PayPal Payment Successful',
      paypalBlue: true,
      particles: true
    }
  }
};

const ANIMATION_STYLES = {
  particles: {
    count: 50,
    colors: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'],
    shapes: ['circle', 'square', 'triangle'],
    duration: 2000
  },
  
  confetti: {
    count: 100,
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
    gravity: 0.5,
    duration: 3000
  },
  
  pulseEffect: {
    scale: [1, 1.2, 1],
    duration: 600,
    repeat: 2
  },
  
  scanEffect: {
    scanLine: true,
    scanSpeed: 1000,
    scanColor: '#00ff00'
  },
  
  walletAnimation: {
    moneyFlow: true,
    flowDirection: 'up',
    flowDuration: 1500
  },
  
  cardFlip: {
    rotateY: [0, 180, 360],
    duration: 1000
  },
  
  shoppingEffect: {
    shoppingCart: true,
    itemsAdding: true,
    duration: 1500
  }
};

const SUCCESS_MESSAGES = {
  UPI: [
    'UPI payment completed successfully!',
    'Transaction processed via UPI',
    'Payment received instantly',
    'UPI transfer successful'
  ],
  
  'QR Code': [
    'QR payment completed!',
    'Scanned and paid successfully',
    'QR code payment processed',
    'Payment via QR scan successful'
  ],
  
  Paytm: [
    'Paytm payment successful!',
    'Paid via Paytm wallet',
    'Paytm transaction completed',
    'Payment processed through Paytm'
  ],
  
  PhonePe: [
    'PhonePe payment completed!',
    'UPI payment via PhonePe successful',
    'PhonePe transaction processed',
    'Payment successful through PhonePe'
  ],
  
  'Google Pay': [
    'Google Pay payment successful!',
    'GPay UPI payment completed',
    'Payment processed via Google Pay',
    'Google Pay transaction successful'
  ],
  
  'Amazon Pay': [
    'Amazon Pay successful!',
    'Payment completed via Amazon',
    'Amazon Pay balance used',
    'Amazon payment processed'
  ]
};

module.exports = {
  PAYMENT_ANIMATIONS,
  ANIMATION_STYLES,
  SUCCESS_MESSAGES
};
