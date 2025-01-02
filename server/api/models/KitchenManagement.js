module.exports = {
  tableName: "kitchenManagementUtilizationEntry",
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
    productName: {
      type: "string",
      required: true,
    },
    productUniqueId: {
      model: "MarketManagement",
    },
    quantity: {
      type: "number",
      allowNull: true,
    },

    noOfProducts: {
      type: "number",
      allowNull: true,
    },

    utilizationDate: {
      type: "string",
      required: true,
    },
    authorisedBy: {
      type: "string",
      required: true,
    },
    utilizationType: {
      type: "string",
      required: true,
    },
    roomNumber: {
      type: "string",
    },
    eventId: {
      type: "string",
    },
    eventDate: {
      type: "string",
    },
    saleType: {
      type: "string",
    },
  },
};
