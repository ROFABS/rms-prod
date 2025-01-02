//src/api/models/MMDamagedItems.js

module.exports = {
  tableName: "MMDamagedItems",
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
    laundryId: {
      model: "laundryManagement",
    },
    productId: {
      type: "string",
      required: true,
    },
    productName: {
      type: "string",
      required: true,
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

    //Damaged
    damageQuantity: {
      type: "number",
      allowNull: true,
    },
    damageDescription: {
      type: "string",
      required: false,
    },
    damageNoOfProducts: {
      type: "number",
      allowNull: true,
    },
    additionalInfo: {
      type: "string",
      allowNull: true,
    },

    // Where damge came from, it could be Purchased, InHouse or Laundry
    damageFrom: {
      type: "string",
      isIn: ["Purchased", "InHouse", "Laundry"],
      required: true,
    },

    //Purchased if product was purchased
    purchaseOrderId: {
      model: "InventoryManagement",
    },

    //Recevied
    receivedQuantity: {
      type: "number",
      allowNull: true,
    },
    receivedNoOfProducts: {
      type: "number",
      allowNull: true,
    },

    //Missing

    missingQuantity: {
      type: "number",
      allowNull: true,
    },
    missingNoOfProducts: {
      type: "number",
      allowNull: true,
    },

    refundStatus: {
      type: "boolean",
      defaultsTo: false,
    },

    // Damaged Item Status for Purchased, InHouse, Laundary
    purchasedDamageItemStatus: {
      type: "string",
      isIn: ["returnedToVendor", "retained", "disposed", "null"],
      defaultsTo: "null",
    },
    inHouseDamageItemStatus: {
      type: "string",
      isIn: ["retained", "disposed", "null"],
      defaultsTo: "null",
    },
    laundryDamageItemStatus: {
      type: "string",
      isIn: ["retained", "disposed", "null"],
      defaultsTo: "null",
    },

    vendorUniqueId: {
      model: "VendorsManagement",
    },
    vendorName: {
      type: "string",
      required: true,
    },
    //Price of Item (Piece, Kg etc, of a single item)
    // For laundry, it should be from Laundry Price List or from user
    // For other items it could be from user
    price: {
      type: "number",
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
