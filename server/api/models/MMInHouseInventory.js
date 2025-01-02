// api/models/MMInHouseInventory.js

module.exports = {
  tableName: "InHouseInventory",
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
      model: "marketManagement",
    },
    mainCategoryId: {
      model: "MainCategory",
    },
    mainCategoryName: {
      type: "string",
      required: true,
    },
    subCategoryId: {
      model: "SubCategory",
    },
    subCategoryName: {
      type: "string",
      required: true,
    },
    productName: {
      type: "string",
      required: true,
    },
    quantity: {
      type: "number",
      required: true,
    },
    unit: {
      type: "string",
      required: true,
    },
    noOfProducts: {
      type: "number",
      required: true,
    },
    vendorId: {
      model: "VendorsManagement",
    },
    vendorName: {
      type: "string",
      required: true,
    },
    incomingDate: {
      type: "string",
      required: true,
    },
    expiryDate: {
      type: "string",
    },
    price: {
      type: "number",
      required: true,
    },
    status: {
      type: "string",
      isIn: ["Normal", "Low Inventory", "Out of Stock"],
      defaultsTo: "Normal",
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
