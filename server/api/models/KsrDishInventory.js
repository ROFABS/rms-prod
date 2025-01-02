// api/models/KsrDishInventory.js
module.exports = {
  tableName: "KsrDishInventory",
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
    dishMainCategory: {
      model: "DishMainCategory",
    },
    dishMainCategoryName: {
      type: "string",
      required: true,
    },
    productName: {
      type: "string",
      required: true,
    },
    productType: {
      type: "string",
    },
    tax: {
      model: "TaxesList",
    },
    price: {
      type: "number",
      required: true,
    },
    status: {
      type: "string",
      isIn: ["true", "false"],
      defaultsTo: "true",
    },
  },
};
