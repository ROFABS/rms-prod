// api/controllers/MarketManagementController.js
const { v4: uuidv4 } = require("uuid");

module.exports = {
  createMarketItems: async (req, res) => {
    try {
      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      const marketItems = req.body;

      if (!Array.isArray(marketItems) || marketItems.length === 0) {
        return res.status(400).json({
          error: "Market items array is required and must not be empty",
        });
      }

      const createdMarketItems = [];

      for (const marketItem of marketItems) {
        const { subCategory, mainCategory, productName, status } = marketItem;

        if (!productName) {
          return res
            .status(400)
            .json({ error: "productName is a required field" });
        }

        if (!subCategory || !mainCategory) {
          return res.status(400).json({
            error: "subCategory and mainCategory are required fields",
          });
        }
        const subCategoryExists = await SubCategory.findOne({
          where: { uniqueId: subCategory, restaurant: restaurantId },
        }).populate("mainCategory");
        if (!subCategoryExists) {
          return res.status(404).json({ error: "SubCategory not found" });
        }

        const mainCategoryExists = await MainCategory.findOne({
          where: { uniqueId: mainCategory, restaurant: restaurantId },
        });
        if (!mainCategoryExists) {
          return res.status(404).json({ error: "MainCategory not found" });
        }

        // Check if the sub category belongs to the specified main category
        if (subCategoryExists.mainCategory.uniqueId !== mainCategory) {
          return res.status(400).json({
            error:
              "The specified sub category does not belong to the main category",
          });
        }

        const uniqueId = uuidv4();
        const newMarketItem = await MarketManagement.create({
          uniqueId,
          restaurant: restaurantId,
          subCategory,
          mainCategory,
          productName,
          status: status || "false",
        }).fetch();

        createdMarketItems.push(newMarketItem);
      }

      return res.status(201).json(createdMarketItems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteMarketItem: async (req, res) => {
    try {
      const { uniqueId } = req.query;

      const deletedMarketItem = await MarketManagement.destroyOne({ uniqueId });

      if (!deletedMarketItem) {
        return res.status(404).json({ error: "Market item not found" });
      }

      return res
        .status(200)
        .json({ message: "Market item deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getMarketItems: async (req, res) => {
    try {
      const { uniqueId, mainCategory, subCategory, status, restaurantId } =
        req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      const where = {};

      if (uniqueId) {
        where.uniqueId = uniqueId;
      }
      if (mainCategory) {
        where.mainCategory = mainCategory;
      }
      if (subCategory) {
        where.subCategory = subCategory;
      }
      if (status) {
        where.status = status;
      }
      if (restaurantId) {
        where.restaurant = restaurantId;
      }

      const marketItems = await MarketManagement.find(where);

      const marketItemsWithDetails = await Promise.all(
        marketItems.map(async (marketItem) => {
          const mainCategoryDetails = await MainCategory.findOne({
            where: { uniqueId: marketItem.mainCategory },
          });
          const subCategoryDetails = await SubCategory.findOne({
            where: { uniqueId: marketItem.subCategory },
          });

          marketItem.mainCategoryName = mainCategoryDetails
            ? mainCategoryDetails.name
            : null;
          marketItem.subCategoryName = subCategoryDetails
            ? subCategoryDetails.name
            : null;

          return marketItem;
        })
      );

      return res.status(200).json(marketItemsWithDetails);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  updateMarketItem: async (req, res) => {
    try {
      const { uniqueId } = req.query;
      const { subCategory, mainCategory, productName, status } = req.body;

      const updateData = {};

      if (subCategory !== undefined) {
        updateData.subCategory = subCategory || null;
      }
      if (mainCategory !== undefined) {
        updateData.mainCategory = mainCategory || null;
      }
      if (productName) {
        updateData.productName = productName;
      }
      if (status) {
        updateData.status = status;
      }

      const updatedMarketItem = await MarketManagement.updateOne({
        uniqueId,
      }).set(updateData);

      if (!updatedMarketItem) {
        return res.status(404).json({ error: "Market item not found" });
      }

      return res
        .status(200)
        .json({ message: "Market item updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
