// api/controllers/dishmaincategoryController.js

const { v4: uuidv4 } = require("uuid");

module.exports = {
  createDishMainCategory: async (req, res) => {
    try {
      const { restaurantId, name, status } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant Id is required" });
      }

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const nameAlreadyExists = await DishMainCategory.findOne({
        name,
        restaurant: restaurantId,
      });
      if (nameAlreadyExists) {
        return res.status(400).json({ error: "Name already exists" });
      }

      const uniqueId = uuidv4();

      const mainCategory = await DishMainCategory.create({
        restaurant: restaurantId,
        uniqueId,
        name,
        status: status || "false",
      }).fetch();

      return res.status(201).json(mainCategory);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getDishMainCategories: async (req, res) => {
    try {
      const { restaurantId, includeItems, includeItemForCategories } =
        req.query;
      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant Id is required" });
      }

      const mainCategories = await DishMainCategory.find({
        restaurant: restaurantId,
      });

      if (includeItems === "true") {
        const inventoryItems = await KsrDishInventory.find({
          restaurant: restaurantId,
        });

        const categoryItems = {};
        inventoryItems.forEach((item) => {
          if (!categoryItems[item.dishMainCategory]) {
            categoryItems[item.dishMainCategory] = [];
          }
          categoryItems[item.dishMainCategory].push(item);
        });

        const mainCategoriesWithItems = mainCategories.map((category) => ({
          ...category,
          categoryItems: categoryItems[category.uniqueId] || [],
        }));

        return res.status(200).json(mainCategoriesWithItems);
      } else if (includeItemForCategories) {
        const includedCategories = includeItemForCategories.split(",");

        const inventoryItems = await KsrDishInventory.find({
          restaurant: restaurantId,
          dishMainCategory: { in: includedCategories },
        });

        const categoryItems = {};
        inventoryItems.forEach((item) => {
          if (!categoryItems[item.dishMainCategory]) {
            categoryItems[item.dishMainCategory] = [];
          }
          categoryItems[item.dishMainCategory].push(item);
        });

        const mainCategoriesWithItems = mainCategories.map((category) => {
          if (includedCategories.includes(category.uniqueId)) {
            return {
              ...category,
              categoryItems: categoryItems[category.uniqueId] || [],
            };
          } else {
            return category;
          }
        });

        return res.status(200).json(mainCategoriesWithItems);
      } else {
        return res.status(200).json(mainCategories);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  updateDishMainCategory: async (req, res) => {
    try {
      const { uniqueId } = req.query;
      const { name, status } = req.body;

      const updateData = {};

      if (!name && !status) {
        return res.status(400).json({ error: "Name or status is required" });
      }

      if (name) {
        updateData.name = name;
      }

      if (status !== undefined) {
        updateData.status = status;
      }

      const updatedMainCategory = await DishMainCategory.updateOne({
        uniqueId,
      }).set(updateData);

      if (!updatedMainCategory) {
        return res.status(404).json({ error: "Main category not found" });
      }

      return res
        .status(200)
        .json({ message: "Main category updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteDishMainCategory: async (req, res) => {
    try {
      const { uniqueId } = req.query;

      if (!uniqueId) {
        return res.status(400).json({ error: "uniqueId is required" });
      }

      const deletedMainCategory = await DishMainCategory.destroyOne({
        uniqueId,
      });

      if (!deletedMainCategory) {
        return res.status(404).json({ error: "Main category not found" });
      }

      return res
        .status(200)
        .json({ message: "Main category deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
