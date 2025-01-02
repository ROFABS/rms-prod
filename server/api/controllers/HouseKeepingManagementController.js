// api/controllers/HouseKeepingManagementController.js

const { v4: uuidv4 } = require("uuid");

module.exports = {
  create: async function (req, res) {
    try {
      const {
        restaurantId,
        productId,
        quantity,
        noOfProducts,
        utilizationDate,
        roomNumber,
        inHouseUniqueId,
      } = req.body;

      let uniqueId = uuidv4();

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      if (
        !productId ||
        (!quantity && !noOfProducts) ||
        !utilizationDate ||
        !roomNumber
      ) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      if (!inHouseUniqueId) {
        return res
          .status(400)
          .json({ error: "In House Unique Id is required" });
      }

      if (quantity && noOfProducts) {
        return res
          .status(400)
          .json({ error: "Provide either quantity or noOfProducts, not both" });
      }

      const utilizationQuantity = quantity || noOfProducts;

      if (utilizationQuantity % 1 !== 0) {
        return res
          .status(400)
          .json({ error: "Quantity or noOfProducts must be a whole number" });
      }

      const inventoryEntry = await MMInHouseInventory.findOne({
        productId: productId,
        restaurant: restaurantId,
        uniqueId: inHouseUniqueId,
      });

      if (!inventoryEntry) {
        return res.status(404).json({ error: "Inventory entry not found" });
      }

      const product = await MarketManagement.findOne({ uniqueId: productId });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const inventoryQuantity = quantity
        ? inventoryEntry.quantity
        : inventoryEntry.noOfProducts;

      if (utilizationQuantity > inventoryQuantity) {
        return res.status(400).json({
          error: `Insufficient quantity or noOfProducts in inventory is ${inventoryQuantity} `,
        });
      }

      const updatedInventoryQuantity = inventoryQuantity - utilizationQuantity;

      await MMInHouseInventory.updateOne({
        uniqueId: inventoryEntry.uniqueId,
      }).set({
        quantity: quantity ? updatedInventoryQuantity : inventoryEntry.quantity,
        noOfProducts: noOfProducts
          ? updatedInventoryQuantity
          : inventoryEntry.noOfProducts,
      });

      const houseKeepingManagementUtilizationEntry =
        await HouseKeepingManagement.create({
          uniqueId,
          restaurant: restaurantId,
          productId,
          productName: product.productName,
          quantity: quantity || undefined,
          noOfProducts: noOfProducts || undefined,
          utilizationDate,
          roomNumber,
        }).fetch();

      return res.status(201).json(houseKeepingManagementUtilizationEntry);
    } catch (error) {
      console.error(
        "Error creating houseKeepingManagementUtilizationEntry:",
        error
      );
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  find: async function (req, res) {
    try {
      const {
        restaurantId,
        productId,
        utilizationDateStart,
        utilizationDateEnd,
        roomNumber,
      } = req.query;

      if (!restaurantId) {
        return res
          .status(400)
          .json({ success: false, error: "Property ID is required" });
      }

      let query = { restaurant: restaurantId };

      if (productId) {
        query.productId = productId;
      }

      if (roomNumber) {
        query.roomNumber = roomNumber;
      }

      if (utilizationDateStart || utilizationDateEnd) {
        query.utilizationDate = {};
        if (utilizationDateStart) {
          query.utilizationDate[">="] = new Date(utilizationDateStart);
        }
        if (utilizationDateEnd) {
          query.utilizationDate["<="] = new Date(utilizationDateEnd);
        }
      }

      const houseKeepingEntries = await HouseKeepingManagement.find(query).sort(
        "utilizationDate DESC"
      );

      // Send Empty Array if nothing is found
      //    if (!houseKeepingEntries || houseKeepingEntries.length === 0) {
      //        return res.notFound('No house keeping entries found matching the criteria');
      //    }

      return res.ok(houseKeepingEntries);
    } catch (error) {
      sails.log.error("Error in HouseKeepingManagement.find:", error);
      return res.serverError("Internal Server Error");
    }
  },

  //House Keeping Graph
  findGraphDetailed: async function (req, res) {
    try {
      const {
        restaurantId,
        utilizationDateStart,
        utilizationDateEnd,
        productId,
        roomNumber,
        timeFrame,
        limit,
      } = req.query;

      if (!restaurantId) {
        return res
          .status(400)
          .json({ success: false, error: "Property ID is required" });
      }

      if (!timeFrame) {
        return res
          .status(400)
          .json({ success: false, error: "Time frame is required" });
      }

      let query = { restaurant: restaurantId };
      if (productId) query.productId = productId;
      if (roomNumber) query.roomNumber = roomNumber;

      const now = new Date();
      let startDate, endDate;

      const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
      };

      const getEndOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
        return new Date(d.setDate(diff));
      };

      switch (timeFrame) {
        case "daily":
          startDate = getStartOfWeek(now);
          endDate = getEndOfWeek(now);
          break;
        case "weekly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate = getStartOfWeek(startDate);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate = getEndOfWeek(endDate);
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        default:
          return res
            .status(400)
            .json({ success: false, error: "Invalid time frame" });
      }

      if (utilizationDateStart) startDate = new Date(utilizationDateStart);
      if (utilizationDateEnd) endDate = new Date(utilizationDateEnd);

      query.utilizationDate = { ">=": startDate, "<=": endDate };

      const houseKeepingEntries = await HouseKeepingManagement.find(query).sort(
        "utilizationDate ASC"
      );

      const keyGenerators = {
        daily: (date) => date.toISOString().split("T")[0],
        weekly: (date) => {
          const weekStart = getStartOfWeek(date);
          const weekEnd = getEndOfWeek(date);
          return `${weekStart.toISOString().split("T")[0]} to ${
            weekEnd.toISOString().split("T")[0]
          }`;
        },
        monthly: (date) =>
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`,
      };

      const getKeyFunction = keyGenerators[timeFrame];

      const aggregateData = async (entries, getKey) => {
        const aggregated = {};
        for (const entry of entries) {
          const key = await getKey(new Date(entry.utilizationDate));
          if (!aggregated[key]) {
            aggregated[key] = {
              period: key,
              totalUtilizations: 0,
              products: {},
              rooms: {},
              totalQuantity: 0,
              totalNoOfProducts: 0,
            };
          }

          aggregated[key].totalUtilizations++;
          if (!aggregated[key].products[entry.productName]) {
            aggregated[key].products[entry.productName] = {
              count: 0,
              quantity: 0,
              noOfProducts: 0,
            };
          }
          aggregated[key].products[entry.productName].count++;
          aggregated[key].products[entry.productName].quantity +=
            entry.quantity || 0;
          aggregated[key].products[entry.productName].noOfProducts +=
            entry.noOfProducts || 0;
          aggregated[key].rooms[entry.roomNumber] =
            (aggregated[key].rooms[entry.roomNumber] || 0) + 1;
          aggregated[key].totalQuantity += entry.quantity || 0;
          aggregated[key].totalNoOfProducts += entry.noOfProducts || 0;
        }
        return aggregated;
      };

      const aggregatedData = await aggregateData(
        houseKeepingEntries,
        getKeyFunction
      );

      // Generate all periods within the date range
      const allPeriods = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        allPeriods.push(await getKeyFunction(currentDate));
        switch (timeFrame) {
          case "daily":
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case "weekly":
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
      }
      // Fill in missing periods with zero data
      allPeriods.forEach((period) => {
        if (!aggregatedData[period]) {
          aggregatedData[period] = {
            period,
            totalUtilizations: 0,
            products: {},
            rooms: {},
            totalQuantity: 0,
            totalNoOfProducts: 0,
          };
        }
      });

      let formattedData = Object.entries(aggregatedData).map(
        ([key, value]) => ({
          period: key,
          totalUtilizations: value.totalUtilizations,
          topProducts: Object.entries(value.products)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, data]) => ({ name, ...data })),
          topRooms: Object.entries(value.rooms)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count })),
          totalQuantity: value.totalQuantity,
          totalNoOfProducts: value.totalNoOfProducts,
        })
      );

      // Sort the formatted data by period
      formattedData.sort((a, b) => new Date(a.period) - new Date(b.period));

      // Apply limit if provided
      if (limit) {
        const limitNumber = parseInt(limit, 10);
        switch (timeFrame) {
          case "daily":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() - limitNumber + 1
            );
            break;
          case "weekly":
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - (limitNumber - 1) * 7);
            startDate = getStartOfWeek(startDate);
            break;
          case "monthly":
            startDate = new Date(
              now.getFullYear() - Math.floor(limitNumber / 12),
              now.getMonth() - (limitNumber % 12) + 1,
              1
            );
            break;
        }
        formattedData = formattedData.filter(
          (item) => new Date(item.period.split(" to ")[0]) >= startDate
        );
        formattedData = formattedData.slice(-limitNumber);
      }

      return res.status(200).json({
        data: formattedData,
        message: "House keeping utilization data fetched successfully",
      });
    } catch (error) {
      sails.log.error(
        "Error in HouseKeepingManagementController.findGraphDetailed:",
        error
      );
      return res.serverError("Internal Server Error");
    }
  },

  findSimplifiedGraph: async function (req, res) {
    try {
      const { restaurantId, startDate, endDate, graphType } = req.query;

      let query = {};

      if (restaurantId) {
        query.restaurant = restaurantId;
      }

      // Set date range
      const now = new Date();
      const firstDayOfMonth = startDate
        ? new Date(startDate)
        : new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = endDate
        ? new Date(endDate)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0);

      if (startDate || endDate) {
        query.utilizationDate = {
          ">=": firstDayOfMonth.toISOString().split("T")[0],
          "<=": lastDayOfMonth.toISOString().split("T")[0],
        };
      }

      const houseKeepingEntries = await HouseKeepingManagement.find(query).sort(
        "utilizationDate ASC"
      );

      let result;

      const getDateKey = (date) => {
        return typeof date === "string"
          ? date.split("T")[0]
          : new Date(date).toISOString().split("T")[0];
      };

      if (graphType) {
        switch (graphType) {
          case "ByOverTime":
            result = houseKeepingEntries.reduce((acc, entry) => {
              const dateKey = getDateKey(entry.utilizationDate);
              if (!acc[dateKey]) {
                acc[dateKey] = {
                  utilizationDate: dateKey,
                  totalNoOfProducts: 0,
                };
              }
              acc[dateKey].totalNoOfProducts += entry.noOfProducts || 0;
              return acc;
            }, {});
            result = Object.values(result);
            break;

          case "ByProduct":
            result = houseKeepingEntries.reduce((acc, entry) => {
              if (!acc[entry.productName]) {
                acc[entry.productName] = {
                  productName: entry.productName,
                  totalNoOfProducts: 0,
                };
              }
              acc[entry.productName].totalNoOfProducts +=
                entry.noOfProducts || 0;
              return acc;
            }, {});
            result = Object.values(result);
            break;

          case "ByRoomNumber":
            result = houseKeepingEntries.reduce((acc, entry) => {
              const key = `${entry.roomNumber}-${entry.productName}`;
              if (!acc[key]) {
                acc[key] = {
                  roomNumber: entry.roomNumber,
                  productName: entry.productName,
                  totalNoOfProducts: 0,
                };
              }
              acc[key].totalNoOfProducts += entry.noOfProducts || 0;
              return acc;
            }, {});
            result = Object.values(result);
            break;

          case "TopProducts":
            result = Object.values(
              houseKeepingEntries.reduce((acc, entry) => {
                if (!acc[entry.productName]) {
                  acc[entry.productName] = {
                    productName: entry.productName,
                    totalNoOfProducts: 0,
                  };
                }
                acc[entry.productName].totalNoOfProducts +=
                  entry.noOfProducts || 0;
                return acc;
              }, {})
            )
              .sort((a, b) => b.totalNoOfProducts - a.totalNoOfProducts)
              .slice(0, 5);
            break;

          case "DailyUsage":
            result = houseKeepingEntries.reduce((acc, entry) => {
              const dateKey = getDateKey(entry.utilizationDate);
              if (!acc[dateKey]) {
                acc[dateKey] = { utilizationDate: dateKey, products: {} };
              }
              if (!acc[dateKey].products[entry.productName]) {
                acc[dateKey].products[entry.productName] = 0;
              }
              acc[dateKey].products[entry.productName] +=
                entry.noOfProducts || 0;
              return acc;
            }, {});
            result = Object.entries(result).map(([date, data]) => ({
              utilizationDate: date,
              products: data.products,
            }));
            break;

          default:
            return res
              .status(400)
              .json({ success: false, error: "Invalid graph type" });
        }
      } else {
        // Return all data grouped by graph types if no specific graphType is provided
        result = {
          ByOverTime: houseKeepingEntries.reduce((acc, entry) => {
            const dateKey = getDateKey(entry.utilizationDate);
            if (!acc[dateKey]) {
              acc[dateKey] = { utilizationDate: dateKey, totalNoOfProducts: 0 };
            }
            acc[dateKey].totalNoOfProducts += entry.noOfProducts || 0;
            return acc;
          }, {}),
          ByProduct: houseKeepingEntries.reduce((acc, entry) => {
            if (!acc[entry.productName]) {
              acc[entry.productName] = {
                productName: entry.productName,
                totalNoOfProducts: 0,
              };
            }
            acc[entry.productName].totalNoOfProducts += entry.noOfProducts || 0;
            return acc;
          }, {}),
          ByRoomNumber: houseKeepingEntries.reduce((acc, entry) => {
            const key = `${entry.roomNumber}-${entry.productName}`;
            if (!acc[key]) {
              acc[key] = {
                roomNumber: entry.roomNumber,
                productName: entry.productName,
                totalNoOfProducts: 0,
              };
            }
            acc[key].totalNoOfProducts += entry.noOfProducts || 0;
            return acc;
          }, {}),
          TopProducts: Object.values(
            houseKeepingEntries.reduce((acc, entry) => {
              if (!acc[entry.productName]) {
                acc[entry.productName] = {
                  productName: entry.productName,
                  totalNoOfProducts: 0,
                };
              }
              acc[entry.productName].totalNoOfProducts +=
                entry.noOfProducts || 0;
              return acc;
            }, {})
          )
            .sort((a, b) => b.totalNoOfProducts - a.totalNoOfProducts)
            .slice(0, 5),
          DailyUsage: houseKeepingEntries.reduce((acc, entry) => {
            const dateKey = getDateKey(entry.utilizationDate);
            if (!acc[dateKey]) {
              acc[dateKey] = { utilizationDate: dateKey, products: {} };
            }
            if (!acc[dateKey].products[entry.productName]) {
              acc[dateKey].products[entry.productName] = 0;
            }
            acc[dateKey].products[entry.productName] += entry.noOfProducts || 0;
            return acc;
          }, {}),
        };
        result = {
          ByOverTime: Object.values(result.ByOverTime),
          ByProduct: Object.values(result.ByProduct),
          ByRoomNumber: Object.values(result.ByRoomNumber),
          TopProducts: result.TopProducts,
          DailyUsage: Object.entries(result.DailyUsage).map(([date, data]) => ({
            utilizationDate: date,
            products: data.products,
          })),
        };
      }

      return res.status(200).json({
        success: true,
        data: result,
        message: `Simplified housekeeping utilization data (${
          graphType || "All Graph Types"
        }) fetched successfully`,
      });
    } catch (error) {
      sails.log.error(
        "Error in HouseKeepingManagement.findSimplifiedGraph:",
        error
      );
      return res.serverError("Internal Server Error");
    }
  },
};
