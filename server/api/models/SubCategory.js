// api/models/SubCategory.js
module.exports = {
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
    name: {
      type: "string",
      required: true,
    },
    status: {
      type: "string",
      isIn: ["true", "false"],
      defaultsTo: "false",
    },
    mainCategory: {
      model: "MainCategory",
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
