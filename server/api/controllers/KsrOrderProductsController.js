const retry = require("async-retry");

module.exports = {
  delete: async function (req, res) {
    const { uniqueId, restaurantId, sessionId } = req.query;

    if (!uniqueId) {
      return res
        .status(400)
        .json({ success: false, message: "Order Product ID is required" });
    }

    try {
      await sails.getDatastore().transaction(async (db) => {
        // Fetch all necessary data first
        const orderProduct = await KsrOrderProducts.findOne({
          uniqueId,
          restaurant: restaurantId,
        }).usingConnection(db);

        if (!orderProduct) {
          throw new Error("Order Product not found");
        }

        const tableSession = await KsrTableSession.findOne({
          sessionId,
          restaurant: restaurantId,
        }).usingConnection(db);

        if (!tableSession) {
          throw new Error("Table Session not found");
        }

        const dishInventory = await KsrDishInventory.findOne({
          uniqueId: orderProduct.productId,
        })
          .populate("tax")
          .usingConnection(db);

        if (!dishInventory) {
          throw new Error("Dish Inventory not found");
        }

        const ksrOrder = await KsrOrders.findOne({
          //   orderId: orderProduct.orderId,
          uniqueId: orderProduct.orderUniqueId,
          restaurant: orderProduct.restaurant,
        }).usingConnection(db);

        if (!ksrOrder) {
          throw new Error("Order not found");
        }

        // Calculate the total price and tax amount
        const totalPrice = orderProduct.price * orderProduct.quantity;

        // Update ksr order
        ksrOrder.subTotal -= totalPrice;
        ksrOrder.totalPrice -= totalPrice + orderProduct.taxAmount;
        ksrOrder.totalPrice = parseFloat(ksrOrder.totalPrice.toFixed(2));
        ksrOrder.taxAmount -= orderProduct.taxAmount;
        ksrOrder.taxAmount = parseFloat(ksrOrder.taxAmount.toFixed(2));

        const updatingOrder = await KsrOrders.updateOne({
          //   orderId: orderProduct.orderId,
          uniqueId: orderProduct.orderUniqueId,
          restaurant: orderProduct.restaurant,
        })
          .set({
            subTotal: ksrOrder.subTotal,
            totalPrice: ksrOrder.totalPrice,
            taxAmount: ksrOrder.taxAmount,
          })
          .usingConnection(db);

        if (!updatingOrder) {
          throw new Error("Failed to update order");
        }

        // Update the session
        tableSession.billAmount -= totalPrice + orderProduct.taxAmount;
        tableSession.billAmount = parseFloat(
          tableSession.billAmount.toFixed(2)
        );

        const updatingSession = await KsrTableSession.updateOne({
          sessionId,
          restaurant: restaurantId,
        })
          .set({
            billAmount: tableSession.billAmount,
          })
          .usingConnection(db);

        if (!updatingSession) {
          throw new Error("Failed to update session");
        }

        // Delete the order product
        const deletingProduct = await KsrOrderProducts.destroyOne({
          uniqueId,
          restaurant: restaurantId,
        }).usingConnection(db);

        if (!deletingProduct) {
          throw new Error("Failed to delete order product");
        }

        return res.status(200).json({
          success: true,
          message: "Order Product deleted successfully",
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete order product",
        error: error.message,
      });
    }
  },
};
