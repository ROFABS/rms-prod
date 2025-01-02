// api/controllers/KSRTableControllers.js

const { v4: uuidv4 } = require("uuid");

module.exports = {
  createTable: async (req, res) => {
    try {
      const { restaurantUniqueId, tableNumber, seatCounts, status } = req.body;

      if (!restaurantUniqueId) {
        return res
          .status(400)
          .json({ error: "Restaurant uniqueId is required" });
      }

      if (!tableNumber || !seatCounts) {
        return res
          .status(400)
          .json({ error: "Table Number and Seat Count are required" });
      }

      if (status && !["occupied", "reserved", "available"].includes(status)) {
        return res
          .status(400)
          .json({ error: "Status must be occupied, reserved, or available" });
      }

      if (tableNumber < 0 || seatCounts < 0) {
        return res.status(400).json({
          error:
            "Table Number and Seat Count must be greater than or equal to 0",
        });
      }

      const tableAlreadyExists = await KsrTables.findOne({
        restaurantUniqueId,
        tableNumber,
      });
      if (tableAlreadyExists) {
        return res.status(400).json({
          error: "Table Number already exists for the given restaurant",
        });
      }

      const uniqueId = uuidv4();

      const table = await KsrTables.create({
        restaurantUniqueId,
        uniqueId,
        tableNumber,
        seatCounts,
        status: status || "available",
      }).fetch();
      return res.status(201).json(table);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getTable: async (req, res) => {
    try {
      const { restaurantUniqueId, status } = req.query;

      const query = {};
      if (restaurantUniqueId) {
        query.restaurantUniqueId = restaurantUniqueId;
      }
      if (status) {
        query.status = status;
      }

      const tables = await KsrTables.find(query);
      return res.status(200).json(tables);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteTable: async (req, res) => {
    try {
      const { uniqueId } = req.params;
      if (!uniqueId) {
        return res.status(400).json({ error: "uniqueId is required" });
      }
      const table = await KsrTables.destroyOne({ uniqueId });
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      return res.status(200).json({ message: "Table deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
