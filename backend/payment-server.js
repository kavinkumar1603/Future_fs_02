const express = require('express');
const path = require('path');
const cors = require('cors');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Payment processing endpoint with real-time animations
app.post('/api/payment/process', async (req, res) => {
    const { paymentMethod, amount, testMode, paymentData } = req.body;
    
    try {
        console.log(`Processing ${paymentMethod} payment for $${amount}`);
        
        // Set SSE headers for real-time updates
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Send processing steps based on payment method
        const steps = getProcessingSteps(paymentMethod);
        const stepDelay = getProcessingDelay(paymentMethod) / steps.length;

        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, stepDelay));
            
            const eventData = {
                step: i + 1,
                total: steps.length,
                message: steps[i],
                progress: Math.round(((i + 1) / steps.length) * 100)
            };

            res.write(`data: ${JSON.stringify(eventData)}\n\n`);
        }

        // Generate payment result
        const paymentResult = await processPayment(paymentMethod, amount, paymentData, testMode);
        
        // Send final result
        res.write(`data: ${JSON.stringify({
            status: 'completed',
            success: paymentResult.success,
            transactionId: paymentResult.transactionId,
            message: paymentResult.message,
            qrCode: paymentResult.qrCode
        })}\n\n`);

        res.end();

    } catch (error) {
        console.error('Payment processing error:', error);
        res.write(`data: ${JSON.stringify({
            status: 'error',
            message: error.message
        })}\n\n`);
        res.end();
    }
});

// QR Code generation endpoint
app.post('/api/payment/qr-generate', async (req, res) => {
    try {
        const { amount, orderId, merchantId } = req.body;
        
        const upiString = `upi://pay?pa=merchant@upi&pn=E-Commerce Store&am=${amount}&cu=USD&tn=Order Payment&mc=1234&tr=${orderId || Date.now()}`;
        
        const qrCodeDataUrl = await QRCode.toDataURL(upiString, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        res.json({
            success: true,
            qrCode: qrCodeDataUrl,
            upiString: upiString,
            expiresIn: 300 // 5 minutes
        });

    } catch (error) {
        console.error('QR generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code'
        });
    }
});

function getProcessingSteps(paymentMethod) {
    const steps = {
        'credit_card': [
            'Validating card details...',
            'Connecting to card network...',
            'Authorizing payment...',
            'Processing transaction...',
            'Confirming payment...'
        ],
        'debit_card': [
            'Validating card details...',
            'Connecting to bank...',
            'Checking account balance...',
            'Processing transaction...',
            'Confirming payment...'
        ],
        'upi': [
            'Validating UPI ID...',
            'Connecting to UPI network...',
            'Processing payment...',
            'Confirming transaction...'
        ],
        'qr_code': [
            'Scanning QR code...',
            'Validating payment details...',
            'Processing payment...',
            'Confirming transaction...'
        ],
        'paytm': [
            'Connecting to Paytm...',
            'Validating wallet balance...',
            'Processing payment...',
            'Confirming transaction...'
        ],
        'phonepe': [
            'Connecting to PhonePe...',
            'Validating account...',
            'Processing payment...',
            'Confirming transaction...'
        ],
        'gpay': [
            'Connecting to Google Pay...',
            'Validating account...',
            'Processing payment...',
            'Confirming transaction...'
        ],
        'amazon_pay': [
            'Connecting to Amazon Pay...',
            'Validating account balance...',
            'Processing payment...',
            'Confirming transaction...'
        ],
        'net_banking': [
            'Redirecting to bank...',
            'Validating credentials...',
            'Processing payment...',
            'Confirming transaction...',
            'Redirecting back...'
        ],
        'mobikwik': [
            'Connecting to MobiKwik...',
            'Validating wallet...',
            'Processing payment...',
            'Confirming transaction...'
        ]
    };

    return steps[paymentMethod] || steps['credit_card'];
}

function getProcessingDelay(paymentMethod) {
    const delays = {
        'credit_card': 4000,
        'debit_card': 4000,
        'upi': 2500,
        'qr_code': 2000,
        'paytm': 3000,
        'phonepe': 3000,
        'gpay': 2500,
        'amazon_pay': 3500,
        'net_banking': 5000,
        'mobikwik': 3000
    };

    return delays[paymentMethod] || 3000;
}

async function processPayment(paymentMethod, amount, paymentData, testMode) {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (testMode) {
        // Test mode - simulate success/failure based on payment data
        const shouldFail = (
            paymentData.cardNumber === '4000 0000 0000 0002' ||
            paymentData.upiId === 'fail@upi' ||
            paymentData.phoneNumber === '0000000000'
        );

        if (shouldFail) {
            return {
                success: false,
                message: 'Payment declined - Test mode failure',
                transactionId: null
            };
        }

        let qrCode = null;
        if (paymentMethod === 'qr_code') {
            const upiString = `upi://pay?pa=test@upi&pn=Test Merchant&am=${amount}&cu=USD&tn=Test Payment&mc=1234&tr=TEST_${Date.now()}`;
            qrCode = await QRCode.toDataURL(upiString);
        }

        return {
            success: true,
            message: 'Payment successful - Test mode',
            transactionId: `TEST_TXN_${Date.now()}`,
            qrCode: qrCode
        };
    }

    // Real payment processing would go here
    return {
        success: true,
        message: 'Payment processed successfully',
        transactionId: `TXN_${Date.now()}`
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`Payment processing server running on port ${PORT}`);
    console.log(`Demo page: http://localhost:${PORT}/payment-demo.html`);
});

module.exports = app;
