// api/models/VendorsManagement.js

module.exports = {
  tableName: "vendors_material_management",

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

    vendorName: {
      type: "string",
    },
    vendorEmail: {
      type: "string",
    },
    vendorPhoneNumber: {
      type: "string",
    },
    vendorAddress: {
      type: "string",
    },
    vendorCategories: {
      collection: "VendorCategory",
      via: "vendorsManagement",
    },
    selfVending: {
      type: "string",
      isIn: ["true", "false"],
      defaultsTo: "false",
    },
    vendorStatus: {
      type: "string",
      isIn: ["true", "false"],
      defaultsTo: "true",
    },
  },
};
