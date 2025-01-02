const SubCategory = require("./SubCategory");

// api/models/MarketManagement.js
module.exports = {
  tableName: "marketManagement",
  primaryKey: "uniqueId",

  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnName: "id",
    },
    propertyId: {
      type: "string",
      // required: true,
    },
    restaurant: {
      model: "Restaurant",
      required: true,
    },
    uniqueId: {
      type: "string",
      required: true,
      unique: true,
    },
    mainCategory: {
      model: "MainCategory",
    },
    subCategory: {
      model: "SubCategory",
    },

    productName: {
      type: "string",
    },
    status: {
      type: "string",
      isIn: ["true", "false"],
      defaultsTo: "false",
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
