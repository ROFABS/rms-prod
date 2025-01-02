// api/controllers/InventoryManagementController.js
const { v4: uuidv4 } = require("uuid");

module.exports = {
  create: async function (req, res) {
    try {
      const { propertyId, items } = req.body;
      if (!propertyId) {
        return res.status(400).json({ error: "Property ID is required" });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ error: "Items array is required and must not be empty" });
      }
      const responses = [];
      for (const item of items) {
        const {
          productId,
          quantity,
          unit,
          noOfProducts,
          vendorId,
          incomingDate,
          expiryDate,
        } = item;
        if (
          !productId ||
          !quantity ||
          !unit ||
          !noOfProducts ||
          !vendorId ||
          !incomingDate ||
          !expiryDate
        ) {
          responses.push({
            status: 400,
            message:
              "Product ID, quantity, unit, number of products, vendor ID, incoming date, and expiry date are required for each item",
          });
          continue;
        }
        const product = await MarketManagement.findOne({ uniqueId: productId });
        if (!product) {
          responses.push({
            status: 404,
            message: `Product with ID ${productId} not found`,
          });
          continue;
        }
        const mainCategory = await MainCategory.findOne({
          uniqueId: product.mainCategory,
        });
        if (!mainCategory) {
          responses.push({
            status: 404,
            message: `Main category not found for product with ID ${productId}`,
          });
          continue;
        }
        const subCategory = await SubCategory.findOne({
          uniqueId: product.subCategory,
        });
        if (!subCategory) {
          responses.push({
            status: 404,
            message: `Sub category not found for product with ID ${productId}`,
          });
          continue;
        }
        const vendor = await VendorsManagement.findOne({ uniqueId: vendorId });
        if (!vendor) {
          responses.push({
            status: 404,
            message: `Vendor with ID ${vendorId} not found`,
          });
          continue;
        }
        // Check if an inventory entry with the same productId and vendorId already exists for the current property
        const existingEntry = await InventoryManagement.findOne({
          productId,
          vendorId,
          propertyId,
        });
        if (existingEntry) {
          // If an entry already exists for the current property, update the quantity, noOfProducts, and other fields
          const updatedEntry = await InventoryManagement.updateOne({
            uniqueId: existingEntry.uniqueId,
          }).set({
            quantity: existingEntry.quantity + quantity,
            noOfProducts: existingEntry.noOfProducts + noOfProducts,
            incomingDate,
            expiryDate,
            status:
              vendor.selfVending === "true" ? "InHouse" : existingEntry.status,
          });
          responses.push({
            status: 200,
            message: "Inventory entry updated successfully",
            data: updatedEntry,
          });
        } else {
          // If no entry exists for the current property, create a new inventory entry
          const uniqueId = uuidv4();
          const inventoryEntry = await InventoryManagement.create({
            uniqueId,
            propertyId,
            productId,
            mainCategoryId: product.mainCategory,
            mainCategoryName: mainCategory.name,
            subCategoryId: product.subCategory,
            subCategoryName: subCategory.name,
            productName: product.productName,
            quantity,
            unit,
            noOfProducts,
            vendorId,
            vendorName: vendor.vendorName,
            incomingDate,
            expiryDate,
            status: vendor.selfVending === "true" ? "InHouse" : "Ordered",
          }).fetch();
          responses.push({
            status: 201,
            message: "Inventory entry created successfully",
            data: inventoryEntry,
          });
        }
      }
      return res.json(responses);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  find: async function (req, res) {
    try {
      const { propertyId, vendorId, expiryDate, incomingDate, productId } =
        req.query;

      if (!propertyId) {
        return res.status(400).json({ error: "Property ID is required" });
      }

      const query = { propertyId };

      if (vendorId) {
        query.vendorId = vendorId;
      }

      if (expiryDate) {
        query.expiryDate = expiryDate;
      }

      if (incomingDate) {
        query.incomingDate = incomingDate;
      }

      if (productId) {
        query.productId = productId;
      }

      const inventoryEntries = await InventoryManagement.find(query);

      return res.json(inventoryEntries);
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
        return res
          .status(400)
          .json({ error: "Inventory entry uniqueId is required" });
      }

      const existingEntry = await InventoryManagement.findOne({ uniqueId });

      if (!existingEntry) {
        return res.status(404).json({
          error: `Inventory entry with uniqueId ${uniqueId} not found`,
        });
      }

      const updatedFields = {};

      if (updateData.productId) {
        updatedFields.productId = updateData.productId;
        const product = await MarketManagement.findOne({
          uniqueId: updateData.productId,
        });
        if (product) {
          updatedFields.productName = product.productName;
          updatedFields.mainCategoryId = product.mainCategory;
          updatedFields.subCategoryId = product.subCategory;

          const mainCategory = await MainCategory.findOne({
            uniqueId: product.mainCategory,
          });
          if (mainCategory) {
            updatedFields.mainCategoryName = mainCategory.name;
          }

          const subCategory = await SubCategory.findOne({
            uniqueId: product.subCategory,
          });
          if (subCategory) {
            updatedFields.subCategoryName = subCategory.name;
          }
        }
      }

      if (updateData.quantity !== undefined) {
        updatedFields.quantity = updateData.quantity;
      }

      if (updateData.unit) {
        updatedFields.unit = updateData.unit;
      }

      if (updateData.noOfProducts !== undefined) {
        updatedFields.noOfProducts = updateData.noOfProducts;
      }

      if (updateData.vendorId) {
        updatedFields.vendorId = updateData.vendorId;
        const vendor = await VendorsManagement.findOne({
          uniqueId: updateData.vendorId,
        });
        if (vendor) {
          updatedFields.vendorName = vendor.vendorName;
        }
      }

      if (updateData.incomingDate) {
        updatedFields.incomingDate = updateData.incomingDate;
      }

      if (updateData.expiryDate) {
        updatedFields.expiryDate = updateData.expiryDate;
      }

      if (updateData.status) {
        updatedFields.status = updateData.status;
      }

      const updatedEntry = await InventoryManagement.updateOne({
        uniqueId,
      }).set(updatedFields);

      return res.json({
        message: "Inventory entry updated successfully",
        data: updatedEntry,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  delete: async function (req, res) {
    try {
      const { uniqueId } = req.query;

      if (!uniqueId) {
        return res
          .status(400)
          .json({ error: "Inventory entry uniqueId is required" });
      }

      const deletedEntry = await InventoryManagement.destroyOne({
        uniqueId: uniqueId,
      });

      if (!deletedEntry) {
        return res.status(404).json({
          error: `Inventory entry with uniqueId ${uniqueId} not found`,
        });
      }

      return res.json({ message: "Inventory entry deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
