// api/models/itemManagement.js
module.exports = {
  tableName: "itemManagement",
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
    subCategory: {
      model: "SubCategory",
    },
    mainCategory: {
      model: "MainCategory",
    },
    productName: {
      type: "string",
    },
    measurementUnit: {
      type: "string",
      required: true,
    },
    weight: {
      type: "number",
      required: true,
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
