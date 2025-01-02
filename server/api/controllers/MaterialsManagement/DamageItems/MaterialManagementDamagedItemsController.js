// api/controllers/MaterialManagementDamagedItemsController.js
const { v4: uuidv4 } = require("uuid");

module.exports = {
  find: async function (req, res) {
    try {
      const {
        uniqueId,
        restaurantId,
        purchaseOrderId,
        productId,
        productName,
        mainCategoryId,
        mainCategoryName,
        subCategoryId,
        subCategoryName,
        damageFrom,
        refundStatus,
        purchasedDamageItemStatus,
        inHouseDamageItemStatus,
        vendorUniqueId,
      } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant ID is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId: restaurantId });

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      const query = {
        restaurant: restaurantId,
      };

      if (uniqueId) {
        query.uniqueId = uniqueId;
      }

      if (purchaseOrderId) {
        query.purchaseOrderId = purchaseOrderId;
      }

      if (productId) {
        query.productId = productId;
      }

      if (productName) {
        query.productName = productName;
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

      if (damageFrom) {
        query.damageFrom = damageFrom;
      }

      if (refundStatus !== undefined) {
        query.refundStatus = refundStatus;
      }

      if (purchasedDamageItemStatus) {
        query.purchasedDamageItemStatus = purchasedDamageItemStatus;
      }

      if (inHouseDamageItemStatus) {
        query.inHouseDamageItemStatus = inHouseDamageItemStatus;
      }

      if (vendorUniqueId) {
        query.vendorUniqueId = vendorUniqueId;
      }

      const damagedItems = await MMDamagedItems.find(query);

      return res.json(damagedItems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  update: async function (req, res) {
    try {
      const { uniqueId } = req.query;
      const updateData = req.body;

      if (!uniqueId) {
        return res.status(400).json({ error: "uniqueId is required" });
      }

      const updatedFields = {};

      if (updateData.damageDescription) {
        updatedFields.damageDescription = updateData.damageDescription;
      }

      if (updateData.refundStatus !== undefined) {
        updatedFields.refundStatus = updateData.refundStatus;
      }

      if (updateData.purchasedDamageItemStatus) {
        updatedFields.purchasedDamageItemStatus =
          updateData.purchasedDamageItemStatus;
      }

      if (updateData.inHouseDamageItemStatus) {
        updatedFields.inHouseDamageItemStatus =
          updateData.inHouseDamageItemStatus;
      }

      const updatedItem = await MMDamagedItems.updateOne({ uniqueId }).set(
        updatedFields
      );

      if (!updatedItem) {
        return res.status(404).json({ error: "Damaged item not found" });
      }

      return res.json({
        message: "Damaged item updated successfully",
        data: updatedItem,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
