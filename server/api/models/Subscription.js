/**
 * Subscription.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  primaryKey: "subscriptionId",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnName: "id",
    },
    subscriptionId: {
      type: "string",
      required: true,
      unique: true,
    },
    userId: {
      model: "User",
    },
    plan: {
      type: "string",
      isIn: ["yearly", "three_years"],
      required: true,
    },
    amount: {
      type: "number",
      required: true,
    },
    startDate: {
      type: "ref",
      columnType: "datetime",
      required: true,
    },
    endDate: {
      type: "ref",
      columnType: "datetime",
      required: true,
    },
    status: {
      type: "string",
      isIn: ["pending", "active", "expired", "cancelled"],
      defaultsTo: "pending",
    },
    paymentMethod: {
      type: "string",
    },
    transactionId: {
      type: "string",
      allowNull: true,
    },
    autoRenew: {
      type: "boolean",
      defaultsTo: false,
    },
  },
};
