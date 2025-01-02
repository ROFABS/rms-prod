// api/controllers/TaxManagementController.js
const { v4: uuidv4 } = require("uuid");
const FileName = "TaxManagementController";

module.exports = {
  create: async function (req, res) {
    sails.log.info(`${FileName} -  create`);
    try {
      const {
        restaurantId,
        name,
        CGST,
        SGST,
        CESS,
        SERVICE,
        status,
        products,
      } = req.body;

      // console.log(req.body, "body");
      if (!restaurantId || !name) {
        return res.status(400).json({
          success: false,
          message: "Restaurant Id and name are required",
        });
      }
      const uniqueId = uuidv4();
      const taxItem = await TaxesList.create({
        uniqueId: uniqueId,
        restaurant: restaurantId,
        name: name,
        CGST: CGST,
        SGST: SGST,
        CESS: CESS,
        SERVICE: SERVICE,
        status: status,
      }).fetch();

      if (typeof products !== "undefined" && Array.isArray(products)) {
        for (const product of products) {
          const res = await KsrDishInventory.updateOne({
            uniqueId: product,
          }).set({
            tax: uniqueId,
          });
          // console.log(update, "update");
        }
      }
      return res.status(201).json({
        success: true,
        message: "Tax item created successfully",
        taxItem,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to create tax item",
        error: error.message,
      });
    }
  },
  find: async function (req, res) {
    sails.log.info(`${FileName} -  find`);
    try {
      const { restaurantId, uniqueId, includeProducts } = req.query;

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: "Property is required",
        });
      }

      let query = {};

      query.restaurant = restaurantId;

      if (uniqueId) {
        query.uniqueId = uniqueId;
      }

      let taxItems = await TaxesList.find(query);

      if (includeProducts) {
        taxItems = await TaxesList.find(query).populate("products");
      }

      return res.status(200).json(taxItems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve tax items",
        error: error.message,
      });
    }
  },

  update: async function (req, res) {
    try {
      const { uniqueId } = req.query;
      const { name, CGST, SGST, CESS, SERVICE, status, products } = req.body;
      if (!uniqueId) {
        return res
          .status(400)
          .json({ success: false, message: "Tax item ID is required" });
      }
      const taxItem = await TaxesList.findOne({ uniqueId: uniqueId });
      if (!taxItem) {
        return res
          .status(404)
          .json({ success: false, message: "Tax item not found" });
      }

      // Fetch current products associated with the tax item
      const currentProducts = await KsrDishInventory.find({ tax: uniqueId });

      // Identify products to be removed
      const currentProductIds = currentProducts.map(
        (product) => product.uniqueId
      );
      const newProductIds = products || [];
      const productsToRemove = currentProductIds.filter(
        (id) => !newProductIds.includes(id)
      );
      const productsToAdd = newProductIds.filter(
        (id) => !currentProductIds.includes(id)
      );

      // Remove tax from products that are no longer associated
      for (const productId of productsToRemove) {
        await KsrDishInventory.updateOne({ uniqueId: productId }).set({
          tax: null,
        });
      }

      // Add tax to new products
      for (const productId of productsToAdd) {
        await KsrDishInventory.updateOne({ uniqueId: productId }).set({
          tax: uniqueId,
        });
      }

      const updatedTaxItem = await TaxesList.updateOne({
        uniqueId: uniqueId,
      }).set({
        name: name || taxItem.name,
        CGST: CGST || taxItem.CGST,
        SGST: SGST || taxItem.SGST,
        CESS: CESS || taxItem.CESS,
        SERVICE: SERVICE || taxItem.SERVICE,
        status: status || taxItem.status,
      });
      return res.status(200).json({
        success: true,
        message: "Tax item updated successfully",
        taxItem: updatedTaxItem,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to update tax item",
        error: error.message,
      });
    }
  },

  delete: async function (req, res) {
    try {
      const { uniqueId } = req.query;
      if (!uniqueId) {
        return res
          .status(400)
          .json({ success: false, message: "Tax item ID is required" });
      }

      const taxItem = await TaxesList.findOne({ uniqueId: uniqueId });
      if (!taxItem) {
        return res
          .status(404)
          .json({ success: false, message: "Tax item not found" });
      }

      // Remove tax from products associated with the tax item
      const products = await KsrDishInventory.find({ tax: uniqueId });
      for (const product of products) {
        await KsrDishInventory.updateOne({ uniqueId: product.uniqueId }).set({
          tax: null,
        });
      }

      await TaxesList.destroyOne({ uniqueId: uniqueId });

      return res
        .status(200)
        .json({ success: true, message: "Tax item deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete tax item",
        error: error.message,
      });
    }
  },
};
