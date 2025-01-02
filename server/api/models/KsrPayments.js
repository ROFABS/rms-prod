// api/models/KsrPayments.js
module.exports = {
  tableName: "KsrPayments",
  primaryKey: "paymentId",

  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnName: "id",
    },
    paymentId: {
      type: "string",
      required: true,
      unique: true,
    },
    sessionId: {
      model: "KsrTableSession",
      required: true,
    },
    amount: {
      type: "number",
      required: true,
    },
    paymentMethod: {
      type: "string",
      required: true,
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
