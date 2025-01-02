// api/models/KsrOrderProducts.js
module.exports = {
  tableName: "KsrOrderProducts",
  primaryKey: "uniqueId",

  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnName: "id",
    },
    uniqueId: {
      type: "string",
      autoIncrement: true,
      unique: true,
    },
    orderId: {
      model: "KsrOrders",
      required: true,
    },
    orderUniqueId: {
      type: "string",
      required: true,
    },
    propertyId: {
      type: "string",
      // required: true,
    },
    restaurant: {
      model: "Restaurant",
      required: true,
    },
    productName: {
      type: "string",
      required: true,
    },
    productId: {
      model: "KsrDishInventory",
      required: true,
    },
    quantity: {
      type: "number",
      required: true,
    },
    price: {
      type: "number",
      required: true,
    },
    taxAmount: {
      type: "number",
    },
  },
};
