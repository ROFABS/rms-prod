// api/models/LaundryPriceList.js

module.exports = {
  tableName: "laundryPriceList",
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
    vendorName: {
      type: "string",
      required: true,
    },
    vendorUniqueId: {
      model: "vendorsManagement",
    },
    productUniqueId: {
      model: "MMInHouseInventory",
    },
    productName: {
      type: "string",
      required: true,
    },
    price: {
      type: "number",
      required: true,
    },
  },
};
