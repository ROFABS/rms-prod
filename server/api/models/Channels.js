// api/models/Channels.js
module.exports = {
  tableName: "Channels",
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
    restaurant: {
      model: "Restaurant",
      required: true,
    },

    swiggyRestaurantId: {
      type: "string",
      allowNull: true,
    },

    swiggyStatus: {
      type: "boolean",
      defaultsTo: false,
    },

    zomatoRestaurantId: {
      type: "string",
      allowNull: true,
    },

    zomatoStatus: {
      type: "boolean",
      defaultsTo: false,
    },

    apiAccessToken: {
      type: "string",
      allowNull: true,
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
