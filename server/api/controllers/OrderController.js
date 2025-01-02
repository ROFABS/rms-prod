const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Mock Order model (replace with actual database model)
const Order = {
  create: async function(orderData) {
    // Simulating database create operation
    console.log('Creating order:', orderData);
    return { ...orderData };
  }
};

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    // Extract order data from webhook payload
    const { vendor, orderId, resId, status, data } = req.body;

    // Create new order in database
    const newOrder = await Order.create({
      vendor,
      orderId,
      resId,
      status,
      data
    });

    // Respond to Dyno confirming order receipt
    return res.status(200).json({ 
      message: 'Order received successfully', 
      orderId: newOrder.orderId 
    });
  } catch (error) {
    console.error('Webhook order processing error:', error);
    
    // Send error response to Dyno
    return res.status(500).json({ 
      message: 'Failed to process order', 
      error: error.message 
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Webhook server running on http://localhost:${port}`);
});