// api/models/TableSession.js
module.exports = {
  tableName: "TableSessions",
  primaryKey: "sessionId",

  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnName: "id",
    },
    billId: {
      type: "string",
      required: true,
    },
    billAmount: {
      type: "number",
      required: true,
    },
    extraDiscount: {
      type: "number",
      defaultsTo: 0,
    },
    extraDiscountType: {
      type: "string",
    },
    extraDiscountAmount: {
      type: "number",
    },
    extraDiscountReason: {
      type: "string",
    },
    totalPaid: {
      type: "number",
      defaultsTo: 0,
    },
    sessionId: {
      type: "string",
      required: true,
      unique: true,
    },
    propertyId: {
      type: "string",
      // required: true,
    },
    restaurant: {
      model: "Restaurant",
      required: true,
    },
    table: {
      model: "KsrTables",
      required: true,
    },
    orders: {
      collection: "KsrOrders",
      via: "session",
    },
    typeOfSale: {
      type: "string",
      // isIn: ["dine-in", "take-away", "delivery"],
      // defaultsTo: "dine-in",
    },
    deliveryPartner: {
      type: "string",
    },
    userRole: {
      type: "string",
    },
    userName: {
      type: "string",
    },
    payments: {
      collection: "KsrPayments",
      via: "sessionId",
    },
    status: {
      type: "string",
      isIn: ["active", "ended"],
      defaultsTo: "active",
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
