// api/models/LaundryManagement.js

module.exports = {
  tableName: "laundryManagement",
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
      model: "MMInHouseInventory",
    },
    laundryPrice: {
      model: "LaundryPriceList",
    },
    productName: {
      type: "string",
      required: true,
    },
    outQuantity: {
      type: "number",
      allowNull: true,
    },
    inQuantity: {
      type: "number",
      allowNull: true,
    },
    outNoOfProducts: {
      type: "number",
      allowNull: true,
    },
    inNoOfProducts: {
      type: "number",
      allowNull: true,
    },
    vendorId: {
      model: "VendorsManagement",
    },
    vendorName: {
      type: "string",
      required: true,
    },
    outDate: {
      type: "string",
      allowNull: true,
    },
    inDate: {
      type: "string",
      allowNull: true,
    },

    productPrice: {
      type: "number",
      allowNull: true,
    },
    status: {
      type: "string",
      isIn: ["In", "Out", "null"],
      defaultsTo: "null",
    },

    isDamaged: {
      type: "boolean",
      defaultsTo: false,
    },

    damagedItems: {
      collection: "MMDamagedItems",
      via: "laundryId",
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
