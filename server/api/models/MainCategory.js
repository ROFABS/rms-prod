// api/models/MainCategory.js

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
      defaultsTo: "true",
    },
    subCategories: {
      collection: "SubCategory",
      via: "mainCategory",
    },
    vendorCategories: {
      collection: "VendorCategory",
      via: "mainCategory",
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
