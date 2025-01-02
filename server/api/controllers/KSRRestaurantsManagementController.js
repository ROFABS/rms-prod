// api/controllers/KSRRestaurantsManagementController.js

const { v4: uuidv4 } = require("uuid");

module.exports = {
  // create: async (req, res) => {
  //   try {
  //     const { propertyId, restaurantName, restaurantType, tables } = req.body;

  //     if (!propertyId) {
  //       return res.status(400).json({ error: "Property ID is required" });
  //     }
  //     if (!restaurantName) {
  //       return res.status(400).json({ error: "Restaurant Name is required" });
  //     }
  //     if (!restaurantType) {
  //       return res.status(400).json({ error: "Restaurant Type is required" });
  //     }

  //     const restaurantUniqueId = sails.config.constants.uuidv4();
  //     const restaurant = await Restaurant.create({
  //       uniqueId: restaurantUniqueId,
  //       propertyId,
  //       restaurantName,
  //       restaurantType,
  //     }).fetch();

  //     const tableRecords = [];
  //     for (const table of tables) {
  //       const { tableNumber, seatCounts } = table;

  //       if (!tableNumber) {
  //         return res.status(400).json({ error: "Table Number is required" });
  //       }
  //       if (!seatCounts) {
  //         return res.status(400).json({ error: "Seat Count is required" });
  //       }

  //       const tableUniqueId = sails.config.constants.uuidv4();
  //       const tableRecord = await KsrTables.create({
  //         uniqueId: tableUniqueId,
  //         restaurantUniqueId: restaurantUniqueId,
  //         tableNumber,
  //         seatCounts,
  //       }).fetch();

  //       tableRecords.push(tableRecord);
  //     }

  //     restaurant.tables = tableRecords;

  //     return res.status(201).json(restaurant);
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({
  //       error: "An error occurred while creating the restaurant and tables",
  //     });
  //   }
  // },

  fetch: async (req, res) => {
    try {
      const { groupId, uniqueId, includeTables } = req.query;

      // if (!propertyId) {
      //   return res.status(400).json({ error: "Property ID is required" });
      // }

      const query = {};
      if (groupId) {
        query.groupId = groupId;
      }
      if (uniqueId) {
        query.uniqueId = uniqueId;
      }
      const restaurants = await Restaurant.find(query);

      if (includeTables) {
        for (const restaurant of restaurants) {
          restaurant.tables = await KsrTables.find({
            where: { restaurantUniqueId: restaurant.uniqueId },
            sort: "tableNumber ASC",
          });
        }
      }
      // .populate("tables", {
      //   sort: "createdAt ASC",
      // });

      return res.status(200).json(restaurants);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching restaurants" });
    }
  },

  update: async (req, res) => {
    try {
      const { uniqueId, noOfTables, startTime, endTime } = req.body;

      if (!uniqueId) {
        return res
          .status(400)
          .json({ error: "Restaurant uniqueId is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId });

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      const tables = await KsrTables.find({ restaurantUniqueId: uniqueId });

      if ((noOfTables.length || 0) !== tables.length) {
        // Check if "N/A" table exists
        const naTable = tables.find((table) => table.tableNumber === 0);

        // Filter out the "N/A" table from the count
        let actualTables = tables.filter((table) => table.tableNumber !== 0);

        // Sort tables by tableNumber
        actualTables.sort((a, b) => a.tableNumber - b.tableNumber);

        if (actualTables.length > noOfTables) {
          const tablesToDelete = actualTables.slice(noOfTables);
          for (const table of tablesToDelete) {
            await KsrTables.destroyOne({ uniqueId: table.uniqueId });
          }
        } else if (actualTables.length < noOfTables) {
          const tablesToAdd = noOfTables - actualTables.length;
          for (let i = 0; i < tablesToAdd; i++) {
            const tableUniqueId = uuidv4();
            await KsrTables.create({
              uniqueId: tableUniqueId,
              restaurantUniqueId: uniqueId,
              tableNumber: actualTables.length + i + 1,
              seatCounts: 4,
            });
          }
        }

        // Fetch updated tables excluding "N/A"
        actualTables = await KsrTables.find({
          restaurantUniqueId: uniqueId,
          tableNumber: { "!=": 0 },
        });

        // Sort tables by tableNumber
        actualTables.sort((a, b) => a.tableNumber - b.tableNumber);

        // Reassign table numbers to ensure they are in the correct order
        for (let i = 0; i < actualTables.length; i++) {
          await KsrTables.updateOne({ uniqueId: actualTables[i].uniqueId }).set(
            {
              tableNumber: i + 1,
            }
          );
        }

        // Ensure the "N/A" table is at the end
        if (!naTable) {
          const naTableUniqueId = uuidv4();
          await KsrTables.create({
            uniqueId: naTableUniqueId,
            restaurantUniqueId: uniqueId,
            tableNumber: 0,
            seatCounts: 0,
          });
        }

        const updatedRestaurant = await Restaurant.findOne({
          uniqueId,
        }).populate("tables", { sort: "tableNumber ASC" });

        return res.status(200).json(updatedRestaurant);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "An error occurred while updating the restaurant and tables",
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { uniqueId } = req.query;

      if (!uniqueId) {
        return res
          .status(400)
          .json({ error: "Restaurant uniqueId is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId });

      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }

      await KsrTables.destroy({ restaurantUniqueId: uniqueId });

      await Restaurant.destroyOne({ uniqueId });

      return res.status(200).json({
        message: "Restaurant and its associated tables deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting the restaurant" });
    }
  },
};
