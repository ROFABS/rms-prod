// HouseKeepingManagement.js

module.exports = {
  tableName: "houseKeepingManagementUtilizationEntry",
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
    propertyId: {
      type: "string",
      // required: true,
    },
    restaurant: {
      model: "Restaurant",
      required: true,
    },
    productId: {
      model: "MarketManagement",
    },
    productName: {
      type: "string",
      required: true,
    },
    quantity: {
      type: "number",
      allowNull: true,
    },
    noOfProducts: {
      type: "number",
      allowNull: true,
    },
    utilizationDate: {
      type: "string",
      required: true,
    },
    roomNumber: {
      type: "string",
      required: true,
    },
  },
};
