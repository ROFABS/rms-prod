// api/models/Restaurant.js
module.exports = {
  tableName: "Restaurant",
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
    },
    restaurantName: {
      type: "string",
      required: true,
    },
    restaurantType: {
      type: "string",
      required: true,
    },
    startTime: {
      type: "string",
      required: true,
    },
    endTime: {
      type: "string",
      required: true,
    },
    createdAt: {
      type: "number",
      autoCreatedAt: true,
    },
    updatedAt: {
      type: "number",
      autoUpdatedAt: true,
    },
    tables: {
      collection: "KsrTables",
      via: "restaurantUniqueId",
    },
    groupId: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
    },
    phone: {
      type: "string",
    },
    website: {
      type: "string",
    },
    address: {
      type: "string",
    },
    landmark: {
      type: "string",
    },
    city: {
      type: "string",
    },
    state: {
      type: "string",
    },
    countryCode: {
      type: "string",
    },
    timezone: {
      type: "string",
    },
    zipCode: {
      type: "string",
    },
    latitude: {
      type: "number",
    },
    longitude: {
      type: "number",
    },
    description: {
      type: "string",
    },
    currency: {
      type: "string",
    },
    coverImage: {
      type: "string",
    },
    status: {
      type: "string",
      isIn: ["active", "inactive"],
      defaultsTo: "active",
    },
  },
};
