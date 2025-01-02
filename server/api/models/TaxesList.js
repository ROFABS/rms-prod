// api/models/TaxesList.js

module.exports = {
  tableName: "taxesList",
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
    name: {
      type: "string",
      required: true,
    },
    CGST: {
      type: "number",
      defaultsTo: 0,
    },
    SGST: {
      type: "number",
      defaultsTo: 0,
    },
    CESS: {
      type: "number",
      defaultsTo: 0,
    },
    SERVICE: {
      type: "number",
      defaultsTo: 0,
    },
    status: {
      type: "string",
      isIn: ["true", "false"],
      defaultsTo: "true",
    },
    products: {
      collection: "KsrDishInventory",
      via: "tax",
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
