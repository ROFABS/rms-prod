// api/controllers/EmployeeManagementController.js
const Roles = sails.config.constants.Roles;

const { v4: uuidv4 } = require("uuid");

module.exports = {
  fetchDesignation: async (req, res) => {
    try {
      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: "Restaurant ID is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId: restaurantId });

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      // roles in this format {label: "Admin", value: "admin"}
      const roles = Object.keys(Roles).map((role) => ({
        name: role.charAt(0).toUpperCase() + role.slice(1),
        value: Roles[role],
      }));

      return res.status(200).json(roles);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
