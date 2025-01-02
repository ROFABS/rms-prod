// api/controllers/CategoriesController.js

const { v4: uuidv4 } = require("uuid");

module.exports = {
  createMainCategory: async (req, res) => {
    try {
      const { name, status, restaurantId } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }
      const nameAlreadyExists = await MainCategory.findOne({
        restaurant: restaurantId,
        name,
      });
      if (nameAlreadyExists) {
        return res.status(400).json({ error: "Name already exists" });
      }

      const uniqueId = uuidv4();
      const mainCategory = await MainCategory.create({
        uniqueId,
        name,
        restaurant: restaurantId,
        status: status || "false",
      }).fetch();

      return res.status(201).json(mainCategory);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  createSubCategory: async (req, res) => {
    try {
      const { name, mainCategoryId, restaurantId, status } = req.body;
      if (!name || !mainCategoryId) {
        return res
          .status(400)
          .json({ error: "Name and mainCategoryId are required" });
      }

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      const mainCategory = await MainCategory.findOne({
        uniqueId: mainCategoryId,
      });

      //Check if name of sub category already exists
      const nameAlreadyExists = await SubCategory.findOne({ name });
      if (nameAlreadyExists) {
        return res.status(400).json({ error: "Name already exists" });
      }

      const uniqueId = uuidv4();
      const subCategory = await SubCategory.create({
        uniqueId,
        name,
        mainCategory: mainCategory.uniqueId,
        restaurant: restaurantId,
        status: status || "false",
      }).fetch();

      return res.status(201).json(subCategory);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getMainCategories: async (req, res) => {
    try {
      const { includeSubCategories, uniqueId, restaurantId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      let query = {};

      if (uniqueId) {
        query.uniqueId = uniqueId;
      }
      if (restaurantId) {
        query.restaurant = restaurantId;
      }

      let mainCategories;
      if (includeSubCategories === "true") {
        mainCategories = await MainCategory.find(query).populate(
          "subCategories"
        );
      } else {
        mainCategories = await MainCategory.find(query);
      }

      return res.status(200).json(mainCategories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getSubCategories: async (req, res) => {
    try {
      const { mainCategoryId, includeMainCategory, uniqueId, restaurantId } =
        req.query;
      let query = {};

      query.restaurant = restaurantId;

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      if (uniqueId) {
        query.uniqueId = uniqueId;
      }

      if (mainCategoryId) {
        query.mainCategory = mainCategoryId;
      }

      let subCategories = await SubCategory.find(query);

      if (includeMainCategory === "true") {
        subCategories = await Promise.all(
          subCategories.map(async (subCategory) => {
            const mainCategory = await MainCategory.findOne({
              uniqueId: subCategory.mainCategory,
            });
            return { ...subCategory, mainCategory };
          })
        );
      }

      return res.status(200).json(subCategories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  updateMainCategory: async (req, res) => {
    try {
      const { uniqueId } = req.query;
      const { name, status } = req.body;

      const updateData = {};

      if (name) {
        updateData.name = name;
      }

      if (status !== undefined) {
        updateData.status = status;
      }

      const updatedMainCategory = await MainCategory.updateOne({
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

  deleteMainCategory: async (req, res) => {
    try {
      const { uniqueId } = req.query;

      const deletedMainCategory = await MainCategory.destroyOne({ uniqueId });

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

  updateSubCategory: async (req, res) => {
    try {
      const { uniqueId } = req.query;
      const { name, mainCategoryId, status } = req.body;

      const updateData = {};

      if (name) {
        updateData.name = name;
      }

      if (mainCategoryId !== undefined) {
        if (mainCategoryId) {
          const mainCategory = await MainCategory.findOne({
            uniqueId: mainCategoryId,
          });
          if (mainCategory) {
            updateData.mainCategory = mainCategory.uniqueId;
          } else {
            updateData.mainCategory = null;
          }
        } else {
          updateData.mainCategory = null;
        }
      }

      if (status !== undefined) {
        updateData.status = status;
      }

      const updatedSubCategory = await SubCategory.updateOne({ uniqueId }).set(
        updateData
      );

      if (!updatedSubCategory) {
        return res.status(404).json({ error: "Sub category not found" });
      }

      return res
        .status(200)
        .json({ message: "Sub category updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteSubCategory: async (req, res) => {
    try {
      const { uniqueId } = req.query;

      const deletedSubCategory = await SubCategory.destroyOne({ uniqueId });

      if (!deletedSubCategory) {
        return res.status(404).json({ error: "Sub category not found" });
      }

      return res
        .status(200)
        .json({ message: "Sub category deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
