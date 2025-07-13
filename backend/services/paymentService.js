// Test payment service for handling different payment methods in test mode

const TEST_CARDS = {
  // Successful payments
  VISA_SUCCESS: {
    number: '4242424242424242',
    type: 'success',
    provider: 'Visa',
    description: 'Always succeeds'
  },
  MASTERCARD_SUCCESS: {
    number: '5555555555554444',
    type: 'success',
    provider: 'Mastercard',
    description: 'Always succeeds'
  },
  AMEX_SUCCESS: {
    number: '378282246310005',
    type: 'success',
    provider: 'American Express',
    description: 'Always succeeds'
  },
  
  // Declined payments
  CARD_DECLINED: {
    number: '4000000000000002',
    type: 'decline',
    provider: 'Visa',
    description: 'Always declined'
  },
  
  // Insufficient funds
  INSUFFICIENT_FUNDS: {
    number: '4000000000009995',
    type: 'insufficient_funds',
    provider: 'Visa',
    description: 'Insufficient funds'
  },
  
  // Expired card
  EXPIRED_CARD: {
    number: '4000000000000069',
    type: 'expired_card',
    provider: 'Visa',
    description: 'Expired card'
  },
  
  // Invalid CVC
  INVALID_CVC: {
    number: '4000000000000127',
    type: 'invalid_cvc',
    provider: 'Visa',
    description: 'Invalid CVC'
  }
};

const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  PAYPAL: 'PayPal',
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
  BANK_TRANSFER: 'Bank Transfer',
  CASH_ON_DELIVERY: 'Cash on Delivery'
};

class PaymentService {
  // Process test payment
  static async processTestPayment(paymentData) {
    const { method, amount, cardDetails } = paymentData;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (method) {
      case PAYMENT_METHODS.CREDIT_CARD:
      case PAYMENT_METHODS.DEBIT_CARD:
        return this.processCreditCardPayment(cardDetails, amount);
        
      case PAYMENT_METHODS.PAYPAL:
        return this.processPayPalPayment(amount);
        
      case PAYMENT_METHODS.APPLE_PAY:
        return this.processApplePayPayment(amount);
        
      case PAYMENT_METHODS.GOOGLE_PAY:
        return this.processGooglePayPayment(amount);
        
      case PAYMENT_METHODS.BANK_TRANSFER:
        return this.processBankTransferPayment(amount);
        
      case PAYMENT_METHODS.CASH_ON_DELIVERY:
        return this.processCashOnDeliveryPayment(amount);
        
      default:
        throw new Error('Unsupported payment method');
    }
  }
  
  static processCreditCardPayment(cardDetails, amount) {
    const { cardNumber, expiryDate, cvc } = cardDetails;
    
    // Find matching test card
    const testCard = Object.values(TEST_CARDS).find(card => 
      card.number === cardNumber
    );
    
    if (!testCard) {
      return {
        success: false,
        error: 'Invalid card number',
        transactionId: null
      };
    }
    
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    switch (testCard.type) {
      case 'success':
        return {
          success: true,
          transactionId,
          provider: testCard.provider,
          last4: cardNumber.slice(-4),
          message: 'Payment successful'
        };
        
      case 'decline':
        return {
          success: false,
          error: 'Your card was declined',
          transactionId: null
        };
        
      case 'insufficient_funds':
        return {
          success: false,
          error: 'Insufficient funds',
          transactionId: null
        };
        
      case 'expired_card':
        return {
          success: false,
          error: 'Your card has expired',
          transactionId: null
        };
        
      case 'invalid_cvc':
        return {
          success: false,
          error: 'Invalid security code',
          transactionId: null
        };
        
      default:
        return {
          success: false,
          error: 'Payment processing error',
          transactionId: null
        };
    }
  }
  
  static processPayPalPayment(amount) {
    const transactionId = `pp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // PayPal test mode - always succeeds
    return {
      success: true,
      transactionId,
      provider: 'PayPal',
      message: 'PayPal payment successful'
    };
  }
  
  static processApplePayPayment(amount) {
    const transactionId = `ap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      provider: 'Apple',
      message: 'Apple Pay payment successful'
    };
  }
  
  static processGooglePayPayment(amount) {
    const transactionId = `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      provider: 'Google',
      message: 'Google Pay payment successful'
    };
  }
  
  static processBankTransferPayment(amount) {
    const transactionId = `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      provider: 'Bank',
      message: 'Bank transfer initiated successfully',
      note: 'Payment will be processed within 1-3 business days'
    };
  }
  
  static processCashOnDeliveryPayment(amount) {
    const transactionId = `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transactionId,
      provider: 'COD',
      message: 'Cash on delivery order placed successfully',
      note: 'Please keep exact change ready for delivery'
    };
  }
  
  // Get available test cards for frontend
  static getTestCards() {
    return Object.entries(TEST_CARDS).map(([key, card]) => ({
      name: key,
      number: card.number,
      provider: card.provider,
      description: card.description,
      type: card.type
    }));
  }
  
  // Get available payment methods
  static getPaymentMethods() {
    return Object.values(PAYMENT_METHODS);
  }
}

module.exports = {
  PaymentService,
  TEST_CARDS,
  PAYMENT_METHODS
};
