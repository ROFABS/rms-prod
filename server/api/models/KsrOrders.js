// api/models/KsrOrders.js
module.exports = {
  tableName: "KsrOrders",
  primaryKey: "uniqueId",

  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnName: "id",
    },
    uniqueId: {
      type: "string",
      required: true,
      unique: true,
    },
    orderId: {
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
    session: {
      model: "KsrTableSession",
    },
    role: {
      type: "string",
      required: true,
    },
    user: {
      type: "string",
    },
    subTotal: {
      type: "number",
      required: true,
    },
    totalPrice: {
      type: "number",
      required: true,
    },
    taxAmount: {
      type: "number",
    },
    products: {
      collection: "KsrOrderProducts",
      via: "orderId",
    },
    typeOfSale: {
      type: "string",
      required: true,
    },
    table: {
      model: "KsrTables",
    },
    deliveryPartner: {
      type: "string",
    },
    discount: {
      type: "number",
    },
    discountAmount: {
      type: "number",
    },
    discountType: {
      type: "string",
    },
    createdAt: {
      type: "number",
      autoCreatedAt: true,
    },
    updatedAt: {
      type: "number",
      autoUpdatedAt: true,
    },
  },
};
