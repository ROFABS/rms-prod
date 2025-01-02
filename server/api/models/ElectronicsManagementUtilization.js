// ElectronicsManagementUtilization.js

module.exports = {
  tableName: "ElectronicsManagementUtilizationEntry",
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
    roomNumber: {
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
    dateOfInstallation: {
      type: "string",
      required: true,
    },
    miscellaneous: {
      type: "string",
      required: true,
    },
    damaged: {
      type: "boolean",
      defaultsTo: false,
    },
    damageDescription: {
      type: "string",
      allowNull: true,
    },
    damageAmount: {
      type: "string",
      allowNull: true,
    },
  },
};
