// ElectronicsManagementPurchaseOrder.js

module.exports = {
  tableName: "ElectronicsManagementPurchaseOrder",
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
      required: true,
    },
    vendorId: {
      model: "vendorsManagement",
    },
    vendorName: {
      type: "string",
      required: true,
    },
    purchaseDate: {
      type: "string",
      required: true,
    },
  },
};
