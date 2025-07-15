import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import Confetti from 'react-confetti';

const CheckoutPage = ({ onBackToCart, onOrderComplete }) => {
  const { cart, cartTotal, placeOrder, user } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'success'
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const qrCanvasRef = useRef(null);
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    
    // UPI Information
    upiId: '',
    
    // Wallet Information
    walletPhone: '',
    bankCode: '',
    
    // Additional Options
    saveInfo: false,
    sameAsShipping: true
  });

  const [errors, setErrors] = useState({});

  // Get window dimensions for confetti
  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    updateWindowDimensions();
    window.addEventListener('resize', updateWindowDimensions);

    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  // Generate QR code when QR payment method is selected
  useEffect(() => {
    if (selectedPaymentMethod === 'qr_code' && testMode) {
      generateQRCode();
    }
  }, [selectedPaymentMethod, testMode]);

  const generateQRCode = async () => {
    try {
      const paymentData = {
        amount: total.toFixed(2),
        currency: 'USD',
        merchantId: 'TEST_MERCHANT_123',
        orderId: `ORDER_${Date.now()}`,
        description: 'E-commerce Purchase',
        testMode: true
      };

      const qrData = `upi://pay?pa=test@upi&pn=Test Merchant&am=${paymentData.amount}&cu=${paymentData.currency}&tn=${paymentData.description}&mc=1234&tr=${paymentData.orderId}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  // Payment Methods
  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: '💳',
      description: 'Visa, Mastercard, Amex',
      category: 'card'
    },
    {
      id: 'debit_card',
      name: 'Debit Card',
      icon: '💳',
      description: 'Bank debit cards',
      category: 'card'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: '📱',
      description: 'Unified Payment Interface',
      category: 'upi'
    },
    {
      id: 'qr_code',
      name: 'QR Code',
      icon: '📱',
      description: 'Scan QR code to pay',
      category: 'qr'
    },
    {
      id: 'paytm',
      name: 'Paytm',
      icon: '💰',
      description: 'Paytm Wallet & UPI',
      category: 'wallet'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '📞',
      description: 'PhonePe UPI & Wallet',
      category: 'wallet'
    },
    {
      id: 'gpay',
      name: 'Google Pay',
      icon: '🌟',
      description: 'Google Pay UPI',
      category: 'wallet'
    },
    {
      id: 'amazon_pay',
      name: 'Amazon Pay',
      icon: '📦',
      description: 'Amazon Pay Balance',
      category: 'wallet'
    },
    {
      id: 'net_banking',
      name: 'Net Banking',
      icon: '🏦',
      description: 'Online banking',
      category: 'bank'
    },
    {
      id: 'mobikwik',
      name: 'MobiKwik',
      icon: '💼',
      description: 'MobiKwik Wallet',
      category: 'wallet'
    }
  ];

  // Test mode card numbers
  const testCards = {
    visa: '4242 4242 4242 4242',
    mastercard: '5555 5555 5555 4444',
    amex: '3782 822463 10005',
    discover: '6011 1111 1111 1117',
    declined: '4000 0000 0000 0002'
  };

  const shipping = cartTotal > 50 ? 0 : 9.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const fillTestCard = (cardType) => {
    const cardData = {
      visa: { cardNumber: '4242 4242 4242 4242', expiryDate: '12/25', cvv: '123', nameOnCard: 'Test User' },
      mastercard: { cardNumber: '5555 5555 5555 4444', expiryDate: '12/25', cvv: '123', nameOnCard: 'Test User' },
      amex: { cardNumber: '3782 822463 10005', expiryDate: '12/25', cvv: '1234', nameOnCard: 'Test User' },
      declined: { cardNumber: '4000 0000 0000 0002', expiryDate: '12/25', cvv: '123', nameOnCard: 'Test User' }
    };

    setFormData(prev => ({
      ...prev,
      ...cardData[cardType]
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields for shipping
    const requiredShippingFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 
      'city', 'state', 'zipCode'
    ];

    requiredShippingFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Payment method specific validation
    if (selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card') {
      const cardFields = ['cardNumber', 'expiryDate', 'cvv', 'nameOnCard'];
      cardFields.forEach(field => {
        if (!formData[field].trim()) {
          newErrors[field] = 'This field is required';
        }
      });
    } else if (selectedPaymentMethod === 'upi') {
      if (!formData.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      }
    } else if (['paytm', 'phonepe', 'gpay', 'mobikwik'].includes(selectedPaymentMethod)) {
      if (!formData.walletPhone.trim()) {
        newErrors.walletPhone = 'Phone number is required';
      }
    } else if (selectedPaymentMethod === 'amazon_pay') {
      if (!formData.walletPhone.trim()) {
        newErrors.walletPhone = 'Email address is required';
      }
    } else if (selectedPaymentMethod === 'net_banking') {
      if (!formData.bankCode) {
        newErrors.bankCode = 'Please select your bank';
      }
    }

    // Email validation
    if (formData.email && (!formData.email.includes('@'))) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Show different processing times based on payment method
      const processingTime = getProcessingTime(selectedPaymentMethod);
      
      // Simulate real payment processing with method-specific behavior
      await simulatePaymentProcessing(processingTime);
      
      const orderData = {
        items: cart,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: selectedPaymentMethod,
        paymentData: getPaymentData(),
        total: total,
        testMode: testMode
      };

      const result = await placeOrder(orderData);
      
      if (result.success) {
        setPaymentStep('success');
        setShowSuccessAnimation(true);
        setCompletedOrder(result.order);
        toast.success('Payment successful! 🎉');
        
        // Hide confetti after 5 seconds
        setTimeout(() => {
          setShowSuccessAnimation(false);
          if (onOrderComplete) {
            onOrderComplete(result.order);
          }
        }, 5000);
      } else {
        throw new Error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setPaymentStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  const getProcessingTime = (method) => {
    const times = {
      'credit_card': 3000,
      'debit_card': 3000,
      'upi': 2000,
      'qr_code': 1500,
      'paytm': 2500,
      'phonepe': 2500,
      'gpay': 2000,
      'amazon_pay': 3000,
      'net_banking': 4000,
      'mobikwik': 2500
    };
    return times[method] || 3000;
  };

  const simulatePaymentProcessing = async (duration) => {
    return new Promise((resolve) => {
      // Show processing steps
      const steps = [
        'Validating payment details...',
        'Connecting to payment gateway...',
        'Processing payment...',
        'Confirming transaction...'
      ];

      let currentStep = 0;
      const stepInterval = duration / steps.length;

      const showStep = () => {
        if (currentStep < steps.length) {
          toast.loading(steps[currentStep], { id: 'payment-progress' });
          currentStep++;
          setTimeout(showStep, stepInterval);
        } else {
          toast.dismiss('payment-progress');
          resolve();
        }
      };

      showStep();
    });
  };

  const getPaymentData = () => {
    switch (selectedPaymentMethod) {
      case 'credit_card':
      case 'debit_card':
        return {
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          nameOnCard: formData.nameOnCard
        };
      case 'upi':
        return {
          upiId: formData.upiId
        };
      case 'paytm':
      case 'phonepe':
      case 'gpay':
      case 'mobikwik':
        return {
          phoneNumber: formData.walletPhone
        };
      case 'amazon_pay':
        return {
          email: formData.walletPhone
        };
      case 'net_banking':
        return {
          bankCode: formData.bankCode
        };
      default:
        return {};
    }
  };

  const getPaymentMethodName = (method) => {
    const names = {
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'upi': 'UPI',
      'qr_code': 'QR Code',
      'paytm': 'Paytm',
      'phonepe': 'PhonePe',
      'gpay': 'Google Pay',
      'amazon_pay': 'Amazon Pay',
      'net_banking': 'Net Banking',
      'mobikwik': 'MobiKwik'
    };
    return names[method] || method;
  };

  const printOrderSummary = () => {
    if (!completedOrder) return;

    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Summary - ${completedOrder.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          .receipt-title {
            font-size: 20px;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .info-item {
            margin-bottom: 8px;
          }
          .label {
            font-weight: bold;
            color: #6b7280;
          }
          .value {
            color: #111827;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          .items-table th {
            background-color: #f9fafb;
            font-weight: bold;
            color: #374151;
          }
          .items-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .total-section {
            background-color: #f0f9ff;
            border: 2px solid #3b82f6;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .total-label {
            font-weight: bold;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            border-top: 2px solid #d1d5db;
            padding-top: 8px;
          }
          .payment-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
          }
          .status-completed {
            background-color: #dcfce7;
            color: #166534;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .test-mode {
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            color: #92400e;
            margin-bottom: 20px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">E-Commerce Store</div>
          <div class="receipt-title">Order Receipt</div>
        </div>

        ${completedOrder.testMode ? '<div class="test-mode">🧪 TEST MODE - This is a test transaction</div>' : ''}

        <div class="section">
          <div class="section-title">Order Information</div>
          <div class="order-info">
            <div>
              <div class="info-item">
                <span class="label">Order ID:</span>
                <span class="value">${completedOrder.id}</span>
              </div>
              <div class="info-item">
                <span class="label">Transaction ID:</span>
                <span class="value">${completedOrder.transactionId || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Order Date:</span>
                <span class="value">${new Date(completedOrder.date).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="label">Payment Method:</span>
                <span class="value">${getPaymentMethodName(completedOrder.paymentMethod)}</span>
              </div>
              <div class="info-item">
                <span class="label">Payment Status:</span>
                <span class="payment-status status-completed">${completedOrder.paymentStatus || 'Completed'}</span>
              </div>
              <div class="info-item">
                <span class="label">Order Status:</span>
                <span class="value">${completedOrder.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Shipping Address</div>
          <div>
            <strong>${completedOrder.shippingAddress.firstName} ${completedOrder.shippingAddress.lastName}</strong><br>
            ${completedOrder.shippingAddress.address}<br>
            ${completedOrder.shippingAddress.city}, ${completedOrder.shippingAddress.state} ${completedOrder.shippingAddress.zipCode}<br>
            ${completedOrder.shippingAddress.country}<br>
            <br>
            <strong>Email:</strong> ${completedOrder.shippingAddress.email}<br>
            <strong>Phone:</strong> ${completedOrder.shippingAddress.phone}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${completedOrder.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section total-section">
          <div class="section-title">Order Summary</div>
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${cartTotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>${shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Paid:</span>
            <span>$${completedOrder.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Questions? Contact us at support@ecommerce-store.com</p>
          <p>Printed on ${new Date().toLocaleString()}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case 'credit_card':
      case 'debit_card':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number *
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleChange({
                  target: {
                    name: 'cardNumber',
                    value: formatCardNumber(e.target.value)
                  }
                })}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => handleChange({
                  target: {
                    name: 'expiryDate',
                    value: formatExpiryDate(e.target.value)
                  }
                })}
                placeholder="MM/YY"
                maxLength="5"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV *
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength="4"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name on Card *
              </label>
              <input
                type="text"
                name="nameOnCard"
                value={formData.nameOnCard}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nameOnCard ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nameOnCard && <p className="mt-1 text-sm text-red-600">{errors.nameOnCard}</p>}
            </div>
          </div>
        );

      case 'upi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID *
              </label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="username@upi"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.upiId ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.upiId && <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>}
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🧪 <strong>Test Mode:</strong> Use "test@upi" for successful payment simulation
              </p>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={generateQRCode}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="mr-2">📱</span>
                Generate QR Code
              </button>
              {qrCodeUrl && (
                <div className="mt-4 p-4 bg-white border rounded-lg inline-block">
                  <img src={qrCodeUrl} alt="UPI QR Code" className="mx-auto mb-2" style={{ width: '150px', height: '150px' }} />
                  <p className="text-xs text-gray-600">Scan with any UPI app</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'qr_code':
        return (
          <div className="text-center space-y-4">
            <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-lg">
              {qrCodeUrl ? (
                <div className="space-y-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="Payment QR Code" 
                    className="mx-auto"
                    style={{ width: '200px', height: '200px' }}
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Scan QR Code to Pay</p>
                    <p className="text-lg font-bold text-blue-600">${total.toFixed(2)}</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Ready to scan</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600">Generating QR Code...</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🧪 <strong>Test Mode:</strong> QR code payment will be simulated automatically after submission
              </p>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Open your UPI app (GPay, PhonePe, Paytm)</p>
              <p>• Scan the QR code above</p>
              <p>• Confirm payment in your app</p>
            </div>
          </div>
        );

      case 'paytm':
      case 'phonepe':
      case 'gpay':
      case 'mobikwik':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="walletPhone"
                value={formData.walletPhone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.walletPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.walletPhone && <p className="mt-1 text-sm text-red-600">{errors.walletPhone}</p>}
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🧪 <strong>Test Mode:</strong> Use any test phone number for simulation
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">
                  {getPaymentMethodName(selectedPaymentMethod)} wallet ready
                </span>
              </div>
              <p className="text-xs text-gray-600">
                You'll be redirected to {getPaymentMethodName(selectedPaymentMethod)} to complete payment
              </p>
            </div>
          </div>
        );

      case 'amazon_pay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="walletPhone"
                value={formData.walletPhone}
                onChange={handleChange}
                placeholder="user@example.com"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.walletPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.walletPhone && <p className="mt-1 text-sm text-red-600">{errors.walletPhone}</p>}
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🧪 <strong>Test Mode:</strong> Use any test email for simulation
              </p>
            </div>
          </div>
        );

      case 'net_banking':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Bank *
              </label>
              <select
                name="bankCode"
                value={formData.bankCode || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.bankCode ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose your bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="AXIS">Axis Bank</option>
                <option value="PNB">Punjab National Bank</option>
                <option value="BOB">Bank of Baroda</option>
              </select>
              {errors.bankCode && <p className="mt-1 text-sm text-red-600">{errors.bankCode}</p>}
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                🧪 <strong>Test Mode:</strong> Select any bank for payment simulation
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <>
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4 shadow-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">Your order has been placed successfully</p>
              <div className="text-lg font-semibold text-gray-900 mb-4">Order Total: ${total.toFixed(2)}</div>
              {completedOrder && (
                <div className="text-sm text-gray-600 mb-4">
                  <p><strong>Order ID:</strong> {completedOrder.id}</p>
                  {completedOrder.transactionId && (
                    <p><strong>Transaction ID:</strong> {completedOrder.transactionId}</p>
                  )}
                </div>
              )}
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium text-green-800">Processing...</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowPrintPreview(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">👁️</span>
                  View Receipt
                </button>
                <button
                  onClick={printOrderSummary}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="mr-2">🖨️</span>
                  Print Receipt
                </button>
                <button
                  onClick={() => {
                    setShowSuccessAnimation(false);
                    if (onOrderComplete && completedOrder) {
                      onOrderComplete(completedOrder);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payment Processing Overlay */}
      {paymentStep === 'processing' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4 shadow-2xl">
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-xl font-semibold text-gray-900">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your {getPaymentMethodName(selectedPaymentMethod)} payment...</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="India">India</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={testMode}
                        onChange={(e) => setTestMode(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        testMode ? 'bg-green-600' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          testMode ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">Test Mode</span>
                    </label>
                  </div>
                </div>

                {testMode && (selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card') && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800 mb-3">Test Card Numbers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => fillTestCard('visa')}
                        className="text-left p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-50 transition-colors"
                      >
                        <div className="font-medium">Visa (Success)</div>
                        <div className="text-gray-600">4242 4242 4242 4242</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('mastercard')}
                        className="text-left p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-50 transition-colors"
                      >
                        <div className="font-medium">Mastercard (Success)</div>
                        <div className="text-gray-600">5555 5555 5555 4444</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('amex')}
                        className="text-left p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-50 transition-colors"
                      >
                        <div className="font-medium">American Express</div>
                        <div className="text-gray-600">3782 822463 10005</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => fillTestCard('declined')}
                        className="text-left p-2 text-xs bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        <div className="font-medium text-red-600">Declined Card</div>
                        <div className="text-gray-600">4000 0000 0000 0002</div>
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Click any card above to auto-fill the payment form with test data.
                    </p>
                  </div>
                )}

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Payment Method</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-3 border-2 rounded-lg text-center transition-all duration-200 relative ${
                          selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-2xl mb-1">{method.icon}</div>
                        <div className="text-xs font-medium text-gray-900">{method.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{method.description}</div>
                        {selectedPaymentMethod === method.id && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Form */}
                {renderPaymentForm()}

                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="saveInfo"
                      checked={formData.saveInfo}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Save payment information for future orders</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || paymentStep !== 'form'}
                className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {paymentStep === 'processing' ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Processing {getPaymentMethodName(selectedPaymentMethod)}...
                  </div>
                ) : paymentStep === 'success' ? (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">✅</span>
                    Payment Successful!
                  </div>
                ) : (
                  <>
                    {selectedPaymentMethod === 'qr_code' ? 
                      `Scan QR & Pay - $${total.toFixed(2)}` :
                      selectedPaymentMethod === 'upi' ?
                      `Pay with UPI - $${total.toFixed(2)}` :
                      ['paytm', 'phonepe', 'gpay', 'mobikwik', 'amazon_pay'].includes(selectedPaymentMethod) ?
                      `Pay with ${getPaymentMethodName(selectedPaymentMethod)} - $${total.toFixed(2)}` :
                      selectedPaymentMethod === 'net_banking' ?
                      `Pay with Net Banking - $${total.toFixed(2)}` :
                      `Complete Payment - $${total.toFixed(2)}`
                    }
                  </>
                )}
                
                {/* Animated background for processing */}
                {paymentStep === 'processing' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 animate-pulse"></div>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                {testMode && (
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                    Test Mode
                  </span>
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && completedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Receipt Preview</h3>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50">
              <div className="bg-white p-8 rounded-lg shadow-sm max-w-2xl mx-auto">
                {/* Receipt Header */}
                <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
                  <h1 className="text-3xl font-bold text-blue-600 mb-2">E-Commerce Store</h1>
                  <p className="text-xl text-gray-600">Order Receipt</p>
                </div>

                {completedOrder.testMode && (
                  <div className="bg-yellow-100 border-2 border-yellow-400 p-3 rounded-lg text-center font-bold text-yellow-800 mb-6">
                    🧪 TEST MODE - This is a test transaction
                  </div>
                )}

                {/* Order Information */}
                <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Order Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2"><span className="font-semibold text-gray-600">Order ID:</span> {completedOrder.id}</p>
                      <p className="mb-2"><span className="font-semibold text-gray-600">Transaction ID:</span> {completedOrder.transactionId || 'N/A'}</p>
                      <p className="mb-2"><span className="font-semibold text-gray-600">Order Date:</span> {new Date(completedOrder.date).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="mb-2"><span className="font-semibold text-gray-600">Payment Method:</span> {getPaymentMethodName(completedOrder.paymentMethod)}</p>
                      <p className="mb-2">
                        <span className="font-semibold text-gray-600">Payment Status:</span> 
                        <span className="inline-block ml-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                          {completedOrder.paymentStatus || 'COMPLETED'}
                        </span>
                      </p>
                      <p className="mb-2"><span className="font-semibold text-gray-600">Order Status:</span> {completedOrder.status}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Shipping Address</h3>
                  <div className="text-gray-700">
                    <p className="font-semibold">{completedOrder.shippingAddress.firstName} {completedOrder.shippingAddress.lastName}</p>
                    <p>{completedOrder.shippingAddress.address}</p>
                    <p>{completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} {completedOrder.shippingAddress.zipCode}</p>
                    <p>{completedOrder.shippingAddress.country}</p>
                    <p className="mt-2"><span className="font-semibold">Email:</span> {completedOrder.shippingAddress.email}</p>
                    <p><span className="font-semibold">Phone:</span> {completedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Order Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedOrder.items.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                            <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-blue-300 pb-2">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-600 border-t-2 border-gray-300 pt-2">
                      <span>Total Paid:</span>
                      <span>${completedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-gray-600 text-sm border-t border-gray-200 pt-6">
                  <p className="mb-2">Thank you for your business!</p>
                  <p className="mb-2">Questions? Contact us at support@ecommerce-store.com</p>
                  <p>Generated on {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPrintPreview(false);
                  printOrderSummary();
                }}
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span className="mr-2">🖨️</span>
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
