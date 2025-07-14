import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const CheckoutPage = ({ onBackToCart, onOrderComplete }) => {
  const { cart, cartTotal, placeOrder, user } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
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
    
    // Additional Options
    saveInfo: false,
    sameAsShipping: true
  });

  const [errors, setErrors] = useState({});

  // Payment Methods
  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: '💳',
      description: 'Visa, Mastercard, American Express',
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
      description: 'Online banking transfer',
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

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 
      'city', 'state', 'zipCode', 'cardNumber', 'expiryDate', 
      'cvv', 'nameOnCard'
    ];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email validation
    if (formData.email && (!formData.email.includes('@'))) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && (formData.phone.length < 10)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Card number validation (simple)
    if (formData.cardNumber && formData.cardNumber.replace(/\s/g, '').length < 16) {
      if (!testMode) {
        newErrors.cardNumber = 'Please enter a valid card number';
      } else {
        // In test mode, allow test card numbers
        const cardNumber = formData.cardNumber.replace(/\s/g, '');
        const testCardNumbers = Object.values(testCards).map(card => card.replace(/\s/g, ''));
        if (!testCardNumbers.includes(cardNumber)) {
          newErrors.cardNumber = 'Please use a test card number (see examples below)';
        }
      }
    }

    // Expiry date validation
    if (formData.expiryDate && !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter date in MM/YY format';
    }

    // CVV validation
    if (formData.cvv && formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing with test mode logic
    setTimeout(() => {
      let paymentResult = 'success';
      
      if (testMode) {
        const cardNumber = formData.cardNumber.replace(/\s/g, '');
        if (cardNumber === testCards.declined.replace(/\s/g, '')) {
          paymentResult = 'declined';
        }
      }

      if (paymentResult === 'declined') {
        setIsProcessing(false);
        toast.error('Payment declined. Please try a different card.');
        return;
      }

      const orderData = {
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
        paymentMethod: {
          last4: formData.cardNumber.slice(-4),
          type: getCardType(formData.cardNumber),
          testMode: testMode
        },
        shipping: shipping,
        tax: tax,
        total: total
      };

      const order = placeOrder(orderData);
      setIsProcessing(false);
      
      if (testMode) {
        toast.success('Test payment successful! 🎉');
      } else {
        toast.success('Payment processed successfully! 🎉');
      }
      
      onOrderComplete(order);
    }, 2000);
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

  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    return 'Credit Card';
  };

  const useTestCard = (cardType) => {
    setFormData(prev => ({
      ...prev,
      cardNumber: testCards[cardType],
      expiryDate: '12/25',
      cvv: cardType === 'amex' ? '1234' : '123',
      nameOnCard: 'Test User'
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <button
          onClick={onBackToCart}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Back to Cart
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
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

              {testMode && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-3">Test Card Numbers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => useTestCard('visa')}
                      className="text-left p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-50 transition-colors"
                    >
                      <div className="font-medium">Visa (Success)</div>
                      <div className="text-gray-600">4242 4242 4242 4242</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => useTestCard('mastercard')}
                      className="text-left p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-50 transition-colors"
                    >
                      <div className="font-medium">Mastercard (Success)</div>
                      <div className="text-gray-600">5555 5555 5555 4444</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => useTestCard('amex')}
                      className="text-left p-2 text-xs bg-white border border-green-300 rounded hover:bg-green-50 transition-colors"
                    >
                      <div className="font-medium">American Express</div>
                      <div className="text-gray-600">3782 822463 10005</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => useTestCard('declined')}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-lg text-center transition-all duration-200 relative ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-2xl mb-2">{method.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{method.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{method.description}</div>
                      {selectedPaymentMethod === method.id && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Form based on selected method */}
              {(selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card') && (
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
              )}

              {/* UPI Payment Form */}
              {selectedPaymentMethod === 'upi' && (
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
                </div>
              )}

              {/* QR Code Payment */}
              {selectedPaymentMethod === 'qr_code' && (
                <div className="text-center space-y-4">
                  <div className="inline-block p-8 bg-gray-100 rounded-lg">
                    <div className="text-6xl">📱</div>
                    <p className="text-sm text-gray-600 mt-2">QR Code will appear here</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🧪 <strong>Test Mode:</strong> QR code payment will be simulated automatically
                    </p>
                  </div>
                </div>
              )}

              {/* Wallet Payments */}
              {['paytm', 'phonepe', 'gpay', 'amazon_pay', 'mobikwik'].includes(selectedPaymentMethod) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedPaymentMethod === 'amazon_pay' ? 'Email Address *' : 'Phone Number *'}
                    </label>
                    <input
                      type={selectedPaymentMethod === 'amazon_pay' ? 'email' : 'tel'}
                      name="walletPhone"
                      value={formData.walletPhone}
                      onChange={handleChange}
                      placeholder={selectedPaymentMethod === 'amazon_pay' ? 'user@example.com' : '+91 XXXXX XXXXX'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.walletPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.walletPhone && <p className="mt-1 text-sm text-red-600">{errors.walletPhone}</p>}
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🧪 <strong>Test Mode:</strong> Use any test {selectedPaymentMethod === 'amazon_pay' ? 'email' : 'phone number'} for simulation
                    </p>
                  </div>
                </div>
              )}

              {/* Net Banking */}
              {selectedPaymentMethod === 'net_banking' && (
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
              )}
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
                </div>                </div>
              )}

              <div className="mt-4">
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
              disabled={isProcessing}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Processing Order...
                </div>
              ) : (
                `Complete Order - $${total.toFixed(2)}`
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
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
  );
};

export default CheckoutPage;