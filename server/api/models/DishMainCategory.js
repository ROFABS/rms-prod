// dishMainCategory.js

module.exports = {
  tableName: "dishMainCategory",
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
