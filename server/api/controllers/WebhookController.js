module.exports = {
  orders: async function (req, res) {
    try {
      console.log('Full Request Body:', JSON.stringify(req.body, null, 2));
      const { orders } = req.body;

      if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({ error: 'Invalid orders data' });
      }

      // Extract only required fields, including item_id
      const simplifiedOrders = orders.map(order => {
        const firstItem = order.data.cart.items[0];
        return {
          orderId: order.orderId,
          vendor: order.vendor,
          name: firstItem?.name || null,
          itemId: firstItem?.item_id || null,
          total: order.data.bill
        };
      });

      // Log the simplified orders before broadcasting
      console.log('Broadcasting orders:', simplifiedOrders);

      // Broadcast simplified orders
      if (sails.sockets) {
        sails.sockets.blast('newOrder', {
          orders: simplifiedOrders,
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        orders: simplifiedOrders,
        ordersProcessed: simplifiedOrders.length,
      });
    } catch (error) {
      console.error('Error processing orders:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        details: error.message,
      });
    }
  }
};
