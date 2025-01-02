// api/models/VendorCategory.js

module.exports = {
  tableName: "vendor_category",

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
    vendorsManagement: {
      model: "VendorsManagement",
    },
    mainCategory: {
      model: "MainCategory",
    },
  },
};
