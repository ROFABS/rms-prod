// api/controllers/InHouseManagementController.js
const { v4: uuidv4 } = require("uuid");

module.exports = {
  moveToDamagedItems: async function (req, res) {
    try {
      const {
        productId,
        damageQuantity,
        damageNoOfProducts,
        damageDescription,
        vendorUniqueId,
        mainCategoryId,
        subCategoryId,
        receivedQuantity,
        receivedNoOfProducts,
      } = req.body;

      if (
        !productId ||
        !damageDescription ||
        !vendorUniqueId ||
        !mainCategoryId ||
        !subCategoryId ||
        (!damageQuantity && !damageNoOfProducts)
      ) {
        return res.status(400).json({
          error:
            "productId, damageDescription, vendorUniqueId, mainCategoryId, subCategoryId, and either damageQuantity or damageNoOfProducts are required",
        });
      }

      const inHouseItem = await MMInHouseInventory.findOne({ productId });

      if (!inHouseItem) {
        return res.status(404).json({ error: "In-house item not found" });
      }

      if (damageQuantity && damageQuantity > inHouseItem.quantity) {
        return res.status(400).json({
          error:
            "Damage quantity cannot exceed the available quantity in the in-house inventory",
        });
      }

      if (damageNoOfProducts && damageNoOfProducts > inHouseItem.noOfProducts) {
        return res.status(400).json({
          error:
            "Damage number of products cannot exceed the available number of products in the in-house inventory",
        });
      }

      const vendor = await VendorsManagement.findOne({
        uniqueId: vendorUniqueId,
      });

      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      const mainCategory = await MainCategory.findOne({
        uniqueId: mainCategoryId,
      });

      if (!mainCategory) {
        return res.status(404).json({ error: "Main category not found" });
      }

      const subCategory = await SubCategory.findOne({
        uniqueId: subCategoryId,
      });

      if (!subCategory) {
        return res.status(404).json({ error: "Sub category not found" });
      }

      const damagedItem = await MMDamagedItems.create({
        uniqueId: uuidv4(),
        restaurant: inHouseItem.restaurant,
        productId: inHouseItem.productId,
        productName: inHouseItem.productName,
        mainCategoryId: mainCategoryId,
        mainCategoryName: mainCategory.name,
        subCategoryId: subCategoryId,
        subCategoryName: subCategory.name,
        damageFrom: "InHouse",
        damageQuantity: damageQuantity || null,
        damageNoOfProducts: damageNoOfProducts || null,
        receivedQuantity: receivedQuantity || null,
        receivedNoOfProducts: receivedNoOfProducts || null,
        damageDescription: damageDescription,
        vendorUniqueId: vendorUniqueId,
        vendorName: vendor.vendorName,
        price: inHouseItem.price,
        inHouseDamageItemStatus: "null",
      }).fetch();

      const updatedFields = {};

      if (damageQuantity) {
        updatedFields.quantity = inHouseItem.quantity - damageQuantity;
      }

      if (damageNoOfProducts) {
        updatedFields.noOfProducts =
          inHouseItem.noOfProducts - damageNoOfProducts;
      }

      if (receivedQuantity) {
        updatedFields.quantity = inHouseItem.quantity + receivedQuantity;
      }

      if (receivedNoOfProducts) {
        updatedFields.noOfProducts =
          inHouseItem.noOfProducts + receivedNoOfProducts;
      }

      const updatedInHouseItem = await MMInHouseInventory.updateOne({
        productId,
      }).set(updatedFields);

      return res.json({
        message: "Item moved to damaged items successfully",
        damagedItem,
        updatedInHouseItem,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  find: async function (req, res) {
    try {
      const {
        mainCategoryId,
        mainCategoryName,
        subCategoryId,
        subCategoryName,
        vendorId,
        vendorName,
        incomingDate,
        expiryDate,
        status,
        restaurantId,
        productId,
      } = req.query;

      const query = {};

      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant ID is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId: restaurantId });

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      if (mainCategoryId) {
        query.mainCategoryId = mainCategoryId;
      }

      if (mainCategoryName) {
        query.mainCategoryName = mainCategoryName;
      }

      if (subCategoryId) {
        query.subCategoryId = subCategoryId;
      }

      if (subCategoryName) {
        query.subCategoryName = subCategoryName;
      }

      if (vendorId) {
        query.vendorId = vendorId;
      }

      if (vendorName) {
        query.vendorName = vendorName;
      }

      if (incomingDate) {
        query.incomingDate = incomingDate;
      }

      if (expiryDate) {
        query.expiryDate = expiryDate;
      }

      if (status) {
        query.status = status;
      }

      if (productId) {
        query.productId = productId;
      }

      const inHouseItems = await MMInHouseInventory.find(query);

      return res.json(inHouseItems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
