// api/controllers/ItemManagementController.js
const { v4: uuidv4 } = require("uuid");

module.exports = {
  createItems: async (req, res) => {
    try {
      const items = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ error: "Items array is required and must not be empty" });
      }

      const createdItems = [];

      for (const item of items) {
        const {
          subCategory,
          mainCategory,
          productName,
          measurementUnit,
          weight,
          status,
        } = item;

        if (!productName || !measurementUnit || !weight) {
          return res
            .status(400)
            .json({
              error:
                "productName, measurementUnit, and weight are required fields",
            });
        }

        const uniqueId = uuidv4();
        const newItem = await ItemManagement.create({
          uniqueId,
          subCategory: subCategory || null,
          mainCategory: mainCategory || null,
          productName,
          measurementUnit,
          weight,
          status: status || "false",
        }).fetch();

        createdItems.push(newItem);
      }

      return res.status(201).json(createdItems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteItem: async (req, res) => {
    try {
      const { uniqueId } = req.params;

      const deletedItem = await ItemManagement.destroyOne({ uniqueId });

      if (!deletedItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      return res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getItems: async (req, res) => {
    try {
      const { uniqueId, mainCategory, subCategory, status } = req.query;

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

      const items = await ItemManagement.find({ where });

      return res.status(200).json(items);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  updateItem: async (req, res) => {
    try {
      const { uniqueId } = req.params;
      const {
        subCategory,
        mainCategory,
        productName,
        measurementUnit,
        weight,
        status,
      } = req.body;

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
      if (measurementUnit) {
        updateData.measurementUnit = measurementUnit;
      }
      if (weight) {
        updateData.weight = weight;
      }
      if (status) {
        updateData.status = status;
      }

      const updatedItem = await ItemManagement.updateOne({ uniqueId }).set(
        updateData
      );

      if (!updatedItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      return res.status(200).json({ message: "Item updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
