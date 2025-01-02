// api/controllers/PriceListController.js
const { v4: uuidv4 } = require("uuid");

module.exports = {
  createPriceList: async (req, res) => {
    try {
      const { items, restaurantId } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant ID is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId: restaurantId });

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "At least one item is required" });
      }

      const priceListItems = [];

      for (const { vendorUniqueId, productUniqueId, price } of items) {
        if (!vendorUniqueId || !productUniqueId || !price) {
          return res.status(400).json({
            error:
              "Vendor Unique ID, Product Unique ID, and Price are required for each item",
          });
        }

        const vendor = await VendorsManagement.findOne({
          uniqueId: vendorUniqueId,
        });

        if (!vendor) {
          return res.status(404).json({
            error: `Vendor not found for Unique ID: ${vendorUniqueId}`,
          });
        }

        const item = await MarketManagement.findOne({
          uniqueId: productUniqueId,
        });

        if (!item) {
          return res.status(404).json({
            error: `Product not found for Unique ID: ${productUniqueId} in Market Management`,
          });
        }

        // Check if a price list entry already exists for this vendor and product
        const existingPriceListItem = await LaundryPriceList.findOne({
          restaurant: restaurantId,
          vendorUniqueId,
          productUniqueId,
        });

        if (existingPriceListItem) {
          // Update the existing record or skip it

          await LaundryPriceList.updateOne(
            { uniqueId: existingPriceListItem.uniqueId },
            { price }
          );

          priceListItems.push({
            ...existingPriceListItem,
            price,
          });

          continue;
        }

        const uniqueId = uuidv4();

        const priceListItem = await LaundryPriceList.create({
          restaurant: restaurantId,
          uniqueId,
          vendorName: vendor.vendorName,
          vendorUniqueId,
          productUniqueId,
          productName: item.productName,
          price,
        }).fetch();

        priceListItems.push(priceListItem);
      }

      return res.status(201).json(priceListItems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  updatePriceList: async (req, res) => {
    try {
      const { uniqueId } = req.query;
      const { vendorUniqueId, price } = req.body;

      const updateData = {};

      if (vendorUniqueId) {
        updateData.vendorUniqueId = vendorUniqueId;
      }

      if (price) {
        updateData.price = price;
      }

      const updatedPriceList = await LaundryPriceList.updateOne({
        uniqueId,
      }).set(updateData);

      if (!updatedPriceList) {
        return res.status(404).json({ error: "Laundry Price not found" });
      }

      return res
        .status(200)
        .json({ message: "Laundry Price updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  getPriceLists: async (req, res) => {
    try {
      const { uniqueId, vendorUniqueId, productUniqueId, restaurantId } =
        req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant ID is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId: restaurantId });

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      let query = { restaurant: restaurantId };

      if (uniqueId) {
        query.uniqueId = uniqueId;
      }

      if (vendorUniqueId) {
        query.vendorUniqueId = vendorUniqueId;
      }

      if (productUniqueId) {
        query.productUniqueId = productUniqueId;
      }

      const priceLists = await LaundryPriceList.find(query);

      return res.status(200).json(priceLists);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deletePriceList: async (req, res) => {
    try {
      const { uniqueId } = req.query;

      if (!uniqueId) {
        return res.status(400).json({ error: "Unique ID is required" });
      }

      const deletedPriceList = await LaundryPriceList.destroyOne({ uniqueId });

      if (!deletedPriceList) {
        return res.status(404).json({ error: "Laundry Price not found" });
      }

      return res
        .status(200)
        .json({ message: "Laundry Price deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
