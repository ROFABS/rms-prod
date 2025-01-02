// api/models/DayClosej.js
module.exports = {
  tableName: "DayClose",
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
    restaurant: {
      model: "Restaurant",
      required: true,
    },
    date: {
      type: "string",
      required: true,
    },
    totalSessions: {
      type: "number",
      defaultsTo: 0,
    },
    totalBillAmount: {
      type: "number",
      defaultsTo: 0,
    },
    totalDiscountAmount: {
      type: "number",
      defaultsTo: 0,
    },
    totalPaidAmount: {
      type: "number",
      defaultsTo: 0,
    },
    status: {
      type: "string",
      isIn: ["open", "closed"],
      defaultsTo: "open",
    },
    startTime: {
      type: "number",
    },
    endTime: {
      type: "number",
    },
    user: {
      model: "User",
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
