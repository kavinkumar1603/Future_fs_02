// Bill/Invoice generation service for order receipts

const fs = require('fs');
const path = require('path');

class BillService {
  // Generate invoice data for an order
  static generateInvoiceData(order) {
    const invoiceData = {
      // Invoice Header
      invoice: {
        number: `INV-${order.orderNumber}`,
        date: new Date(order.createdAt).toLocaleDateString(),
        dueDate: new Date(order.createdAt).toLocaleDateString()
      },
      
      // Company Information
      company: {
        name: 'Tech Store',
        address: '123 Technology Avenue',
        city: 'San Francisco, CA 94105',
        phone: '+1 (555) 123-4567',
        email: 'support@techstore.com',
        website: 'www.techstore.com'
      },
      
      // Customer Information
      customer: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        email: order.shippingAddress.email,
        phone: order.shippingAddress.phone,
        address: {
          street: order.shippingAddress.address,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.zipCode,
          country: order.shippingAddress.country
        }
      },
      
      // Order Information
      order: {
        number: order.orderNumber,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString(),
        paymentMethod: order.paymentMethod.type,
        transactionId: order.paymentMethod.transactionId
      },
      
      // Items
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      
      // Totals
      totals: {
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total
      },
      
      // Payment Information
      payment: {
        method: order.paymentMethod.type,
        status: order.status === 'delivered' ? 'Paid' : 'Pending',
        testMode: order.paymentMethod.testMode,
        last4: order.paymentMethod.last4,
        provider: order.paymentMethod.provider
      }
    };
    
    return invoiceData;
  }
  
  // Generate HTML invoice
  static generateHTMLInvoice(invoiceData) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${invoiceData.invoice.number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        
        .invoice-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .company-info h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .company-info p {
            color: #6c757d;
            margin: 5px 0;
        }
        
        .invoice-info {
            text-align: right;
        }
        
        .invoice-info h2 {
            color: #e74c3c;
            font-size: 1.8em;
            margin-bottom: 10px;
        }
        
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .billing-info {
            flex: 1;
            margin-right: 20px;
        }
        
        .billing-info h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th,
        .items-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        
        .items-table th {
            background-color: #f8f9fa;
            color: #2c3e50;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        
        .items-table .text-right {
            text-align: right;
        }
        
        .totals-section {
            max-width: 400px;
            margin-left: auto;
        }
        
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .totals-row.total {
            font-weight: bold;
            font-size: 1.2em;
            color: #2c3e50;
            border-bottom: 2px solid #2c3e50;
        }
        
        .payment-info {
            margin-top: 40px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        
        .test-mode-warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .invoice-container {
                box-shadow: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        ${invoiceData.payment.testMode ? `
        <div class="test-mode-warning">
            ⚠️ TEST MODE - This is a test transaction and no real payment was processed
        </div>
        ` : ''}
        
        <div class="invoice-header">
            <div class="company-info">
                <h1>${invoiceData.company.name}</h1>
                <p>${invoiceData.company.address}</p>
                <p>${invoiceData.company.city}</p>
                <p>Phone: ${invoiceData.company.phone}</p>
                <p>Email: ${invoiceData.company.email}</p>
            </div>
            <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${invoiceData.invoice.number}</p>
                <p><strong>Date:</strong> ${invoiceData.invoice.date}</p>
                <p><strong>Order #:</strong> ${invoiceData.order.number}</p>
            </div>
        </div>
        
        <div class="billing-section">
            <div class="billing-info">
                <h3>Bill To:</h3>
                <p><strong>${invoiceData.customer.name}</strong></p>
                <p>${invoiceData.customer.email}</p>
                <p>${invoiceData.customer.phone}</p>
                <p>${invoiceData.customer.address.street}</p>
                <p>${invoiceData.customer.address.city}, ${invoiceData.customer.address.state} ${invoiceData.customer.address.zipCode}</p>
                <p>${invoiceData.customer.address.country}</p>
            </div>
            <div class="billing-info">
                <h3>Order Details:</h3>
                <p><strong>Order Status:</strong> ${invoiceData.order.status}</p>
                <p><strong>Payment Method:</strong> ${invoiceData.payment.method}</p>
                ${invoiceData.payment.last4 ? `<p><strong>Card:</strong> ****${invoiceData.payment.last4}</p>` : ''}
                <p><strong>Payment Status:</strong> ${invoiceData.payment.status}</p>
                ${invoiceData.order.transactionId ? `<p><strong>Transaction ID:</strong> ${invoiceData.order.transactionId}</p>` : ''}
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceData.items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">$${item.price.toFixed(2)}</td>
                    <td class="text-right">$${item.total.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals-section">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>$${invoiceData.totals.subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
                <span>Shipping:</span>
                <span>$${invoiceData.totals.shipping.toFixed(2)}</span>
            </div>
            <div class="totals-row">
                <span>Tax:</span>
                <span>$${invoiceData.totals.tax.toFixed(2)}</span>
            </div>
            <div class="totals-row total">
                <span>Total:</span>
                <span>$${invoiceData.totals.total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="payment-info">
            <h3>Payment Information</h3>
            <p><strong>Method:</strong> ${invoiceData.payment.method}</p>
            <p><strong>Status:</strong> ${invoiceData.payment.status}</p>
            ${invoiceData.payment.testMode ? '<p><strong>Mode:</strong> Test Transaction</p>' : ''}
        </div>
        
        <div class="footer">
            <p>Thank you for your business!</p>
            <p>For questions about this invoice, please contact us at ${invoiceData.company.email}</p>
            <p>This invoice was generated on ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
    
    <script>
        // Auto-print functionality
        function printInvoice() {
            window.print();
        }
        
        // Add print button for non-print view
        if (!window.matchMedia('print').matches) {
            const printButton = document.createElement('button');
            printButton.textContent = 'Print Invoice';
            printButton.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; z-index: 1000;';
            printButton.onclick = printInvoice;
            document.body.appendChild(printButton);
        }
    </script>
</body>
</html>`;
  }
  
  // Generate text-based receipt for simple printing
  static generateTextReceipt(invoiceData) {
    const width = 50;
    const line = '='.repeat(width);
    const dashes = '-'.repeat(width);
    
    let receipt = '';
    receipt += line + '\n';
    receipt += this.centerText('TECH STORE', width) + '\n';
    receipt += this.centerText('INVOICE RECEIPT', width) + '\n';
    receipt += line + '\n\n';
    
    // Invoice info
    receipt += `Invoice #: ${invoiceData.invoice.number}\n`;
    receipt += `Date: ${invoiceData.invoice.date}\n`;
    receipt += `Order #: ${invoiceData.order.number}\n\n`;
    
    // Customer info
    receipt += 'BILL TO:\n';
    receipt += dashes + '\n';
    receipt += `${invoiceData.customer.name}\n`;
    receipt += `${invoiceData.customer.email}\n`;
    receipt += `${invoiceData.customer.address.street}\n`;
    receipt += `${invoiceData.customer.address.city}, ${invoiceData.customer.address.state} ${invoiceData.customer.address.zipCode}\n\n`;
    
    // Items
    receipt += 'ITEMS:\n';
    receipt += dashes + '\n';
    receipt += this.formatRow('Item', 'Qty', 'Price', 'Total', width) + '\n';
    receipt += dashes + '\n';
    
    invoiceData.items.forEach(item => {
      receipt += this.formatRow(
        item.name.substring(0, 20),
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${item.total.toFixed(2)}`,
        width
      ) + '\n';
    });
    
    receipt += dashes + '\n';
    
    // Totals
    receipt += this.formatRow('', '', 'Subtotal:', `$${invoiceData.totals.subtotal.toFixed(2)}`, width) + '\n';
    receipt += this.formatRow('', '', 'Shipping:', `$${invoiceData.totals.shipping.toFixed(2)}`, width) + '\n';
    receipt += this.formatRow('', '', 'Tax:', `$${invoiceData.totals.tax.toFixed(2)}`, width) + '\n';
    receipt += dashes + '\n';
    receipt += this.formatRow('', '', 'TOTAL:', `$${invoiceData.totals.total.toFixed(2)}`, width) + '\n';
    receipt += line + '\n\n';
    
    // Payment info
    receipt += 'PAYMENT INFORMATION:\n';
    receipt += dashes + '\n';
    receipt += `Method: ${invoiceData.payment.method}\n`;
    receipt += `Status: ${invoiceData.payment.status}\n`;
    if (invoiceData.payment.testMode) {
      receipt += 'Mode: TEST TRANSACTION\n';
    }
    receipt += '\n';
    
    receipt += this.centerText('Thank you for your business!', width) + '\n';
    receipt += this.centerText('techstore.com', width) + '\n';
    receipt += line + '\n';
    
    return receipt;
  }
  
  // Helper methods
  static centerText(text, width) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }
  
  static formatRow(col1, col2, col3, col4, totalWidth) {
    const colWidth = Math.floor(totalWidth / 4);
    return (
      (col1 || '').substring(0, colWidth).padEnd(colWidth) +
      (col2 || '').substring(0, colWidth).padEnd(colWidth) +
      (col3 || '').substring(0, colWidth).padEnd(colWidth) +
      (col4 || '').substring(0, colWidth)
    );
  }
}

module.exports = BillService;
