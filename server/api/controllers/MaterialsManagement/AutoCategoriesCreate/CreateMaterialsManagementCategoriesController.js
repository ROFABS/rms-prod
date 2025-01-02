// api/controllers/CreateMaterialsManagementCategories.js

const { v4: uuidv4 } = require("uuid"); // Ensure uuidv4 is imported

module.exports = {
  createMaterialManagementCategories: async (req, res) => {
    try {
      const { restaurantId } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Property ID is required" });
      }

      const categories = [
        "Kitchen Management",
        "Laundry Management",
        "House Keeping Management",
        "Electronics Management",
        "Miscellaneous Management",
      ];

      // Find existing categories by name and propertyId
      const existingCategories = await MainCategory.find({
        name: categories,
        restaurant: restaurantId, // Ensure we search by both category name and propertyId
      });

      // If all categories already exist, return them
      if (existingCategories.length === categories.length) {
        return res.status(200).json(existingCategories);
      }

      const newCategories = [];

      for (const category of categories) {
        const existingCategory = existingCategories.find(
          (cat) => cat.name === category
        );

        // Create a new category if it doesn't exist
        if (!existingCategory) {
          const uniqueId = uuidv4();
          const newCategory = await MainCategory.create({
            uniqueId,
            name: category,
            status: "true",
            restaurant: restaurantId, // Add propertyId to the new category
          }).fetch();
          newCategories.push(newCategory);
        }
      }

      // Merge existing and new categories
      const allCategories = [...existingCategories, ...newCategories];
      return res.status(201).json(allCategories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
