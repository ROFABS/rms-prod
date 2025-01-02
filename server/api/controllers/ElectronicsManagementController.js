// api/controllers/ElectronicsManagementController.js

const { v4: uuidv4 } = require("uuid");

module.exports = {
  createPurchase: async function (req, res) {
    try {
      const { restaurantId, productId, quantity, vendorId, purchaseDate } =
        req.body;

      let uniqueId = uuidv4();

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }
      if (!productId || !vendorId) {
        return res
          .status(400)
          .json({ error: "Product Id and Vendor Id is required" });
      }

      if (!quantity || !purchaseDate) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const product = await MarketManagement.findOne({ uniqueId: productId });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      const vendor = await VendorsManagement.findOne({ uniqueId: vendorId });
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      const ElectronicsManagementPurchaseOrderEntry =
        await ElectronicsManagementPurchaseOrder.create({
          uniqueId,
          restaurant: restaurantId,
          productId,
          productName: product.productName,
          quantity,
          vendorId,
          vendorName: vendor.vendorName,
          purchaseDate,
        }).fetch();

      return res.status(201).json(ElectronicsManagementPurchaseOrderEntry);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createUtilization: async function (req, res) {
    try {
      const {
        restaurantId,
        productId,
        roomNumber,
        quantity,
        noOfProducts,
        dateOfInstallation,
        miscellaneous,
        damaged,
        damageDescription,
        damageAmount,
        inHouseUniqueId,
      } = req.body;
      let uniqueId = uuidv4();
      if (!restaurantId) {
        return res.status(400).json({ error: "Property Id is required" });
      }
      if (!inHouseUniqueId) {
        return res
          .status(400)
          .json({ error: "In House Unique Id is required" });
      }
      if (!productId) {
        return res.status(400).json({ error: "Product Id is required" });
      }
      if (
        !roomNumber ||
        (!quantity && !noOfProducts) ||
        !dateOfInstallation ||
        !miscellaneous
      ) {
        return res.status(400).json({ error: "Required fields are missing" });
      }
      if (quantity && noOfProducts) {
        return res
          .status(400)
          .json({ error: "Provide either quantity or noOfProducts, not both" });
      }
      const product = await MarketManagement.findOne({ uniqueId: productId });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
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

      const inventoryQuantity = quantity
        ? inventoryEntry.quantity
        : inventoryEntry.noOfProducts;

      if (utilizationQuantity > inventoryQuantity) {
        return res.status(400).json({
          error: "Insufficient quantity or noOfProducts in inventory",
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

      const ElectronicsManagementUtilizationEntry =
        await ElectronicsManagementUtilization.create({
          uniqueId,
          restaurant: restaurantId,
          productId,
          productName: product.productName,
          roomNumber,
          quantity: quantity || undefined,
          noOfProducts: noOfProducts || undefined,
          dateOfInstallation,
          miscellaneous,
          damaged,
          damageDescription,
          damageAmount,
        }).fetch();
      return res.status(201).json(ElectronicsManagementUtilizationEntry);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  findPurchases: async function (req, res) {
    try {
      const { restaurantId } = req.query;
      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }
      const purchases = await ElectronicsManagementPurchaseOrder.find({
        restaurant: restaurantId,
      });
      return res.json(purchases);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  findUtilizations: async function (req, res) {
    try {
      const {
        restaurantId,
        productId,
        roomNumber,
        dateOfInstallationStart,
        dateOfInstallationEnd,
        damaged,
        miscellaneous,
      } = req.query;

      if (!restaurantId) {
        return res.badRequest("restaurantId is required");
      }

      let query = { restaurant: restaurantId };

      if (productId) {
        query.productId = productId;
      }

      if (roomNumber) {
        query.roomNumber = roomNumber;
      }

      if (damaged !== undefined) {
        query.damaged = damaged === "true";
      }

      if (miscellaneous !== undefined) {
        query.miscellaneous = miscellaneous === "true";
      }

      if (dateOfInstallationStart || dateOfInstallationEnd) {
        query.dateOfInstallation = {};
        if (dateOfInstallationStart) {
          query.dateOfInstallation[">="] = new Date(dateOfInstallationStart);
        }
        if (dateOfInstallationEnd) {
          query.dateOfInstallation["<="] = new Date(dateOfInstallationEnd);
        }
      }

      const utilizations = await ElectronicsManagementUtilization.find(
        query
      ).sort("dateOfInstallation DESC");
      // Send Empty Array If NOthing Found
      //if (!utilizations || utilizations.length === 0) {
      //    return res.notFound('No electronics utilization entries found matching the criteria');
      //}

      return res.ok(utilizations);
    } catch (error) {
      sails.log.error(
        "Error in ElectronicsManagementUtilization.findUtilizations:",
        error
      );
      return res.serverError("Internal Server Error");
    }
  },

  //Electronics Management Graph
  findGraphDetailed: async function (req, res) {
    try {
      const {
        restaurantId,
        dateOfInstallationStart,
        dateOfInstallationEnd,
        productId,
        roomNumber,
        miscellaneous,
        damaged,
        timeFrame,
        limit,
      } = req.query;

      if (!restaurantId) {
        return res
          .status(400)
          .json({ success: false, error: "restaurantId is required" });
      }

      if (!timeFrame) {
        return res
          .status(400)
          .json({ success: false, error: "Time frame is required" });
      }

      let query = { restaurant: restaurantId };
      if (productId) query.productId = productId;
      if (roomNumber) query.roomNumber = roomNumber;
      if (miscellaneous !== undefined)
        query.miscellaneous = miscellaneous === "true";
      if (damaged !== undefined) query.damaged = damaged === "true";

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

      if (dateOfInstallationStart)
        startDate = new Date(dateOfInstallationStart);
      if (dateOfInstallationEnd) endDate = new Date(dateOfInstallationEnd);

      query.dateOfInstallation = { ">=": startDate, "<=": endDate };

      const electronicsManagementEntries =
        await ElectronicsManagementUtilization.find(query).sort(
          "dateOfInstallation ASC"
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
          const key = await getKey(new Date(entry.dateOfInstallation));
          if (!aggregated[key]) {
            aggregated[key] = {
              period: key,
              totalUtilizations: 0,
              products: {},
              rooms: {},
              damagedCount: 0,
              miscellaneousCount: 0,
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
          if (entry.damaged) aggregated[key].damagedCount++;
          if (entry.miscellaneous) aggregated[key].miscellaneousCount++;
          aggregated[key].totalQuantity += entry.quantity || 0;
          aggregated[key].totalNoOfProducts += entry.noOfProducts || 0;
        }
        return aggregated;
      };

      const aggregatedData = await aggregateData(
        electronicsManagementEntries,
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
            damagedCount: 0,
            miscellaneousCount: 0,
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
          damagedCount: value.damagedCount,
          miscellaneousCount: value.miscellaneousCount,
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
        message: "Electronics utilization data fetched successfully",
      });
    } catch (error) {
      sails.log.error(
        "Error in ElectronicsManagementController.findGraphDetailed:",
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
        query.dateOfInstallation = {
          ">=": firstDayOfMonth.toISOString().split("T")[0],
          "<=": lastDayOfMonth.toISOString().split("T")[0],
        };
      }

      const electronicsManagementEntries =
        await ElectronicsManagementUtilization.find(query).sort(
          "dateOfInstallation ASC"
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
            result = electronicsManagementEntries.reduce((acc, entry) => {
              const dateKey = getDateKey(entry.dateOfInstallation);
              if (!acc[dateKey]) {
                acc[dateKey] = {
                  dateOfInstallation: dateKey,
                  totalNoOfProducts: 0,
                };
              }
              acc[dateKey].totalNoOfProducts += entry.noOfProducts || 0;
              return acc;
            }, {});
            result = Object.values(result);
            break;

          case "ByProduct":
            result = electronicsManagementEntries.reduce((acc, entry) => {
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
            result = electronicsManagementEntries.reduce((acc, entry) => {
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

          case "ByDamageStatus":
            result = electronicsManagementEntries.reduce((acc, entry) => {
              const status = entry.damaged ? "Damaged" : "Not Damaged";
              if (!acc[status]) {
                acc[status] = { status: status, totalNoOfProducts: 0 };
              }
              acc[status].totalNoOfProducts += entry.noOfProducts || 0;
              return acc;
            }, {});
            result = Object.values(result);
            break;

          case "TopProducts":
            result = Object.values(
              electronicsManagementEntries.reduce((acc, entry) => {
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

          default:
            return res
              .status(400)
              .json({ success: false, error: "Invalid graph type" });
        }
      } else {
        // Return all data grouped by graph types if no specific graphType is provided
        result = {
          ByOverTime: electronicsManagementEntries.reduce((acc, entry) => {
            const dateKey = getDateKey(entry.dateOfInstallation);
            if (!acc[dateKey]) {
              acc[dateKey] = {
                dateOfInstallation: dateKey,
                totalNoOfProducts: 0,
              };
            }
            acc[dateKey].totalNoOfProducts += entry.noOfProducts || 0;
            return acc;
          }, {}),
          ByProduct: electronicsManagementEntries.reduce((acc, entry) => {
            if (!acc[entry.productName]) {
              acc[entry.productName] = {
                productName: entry.productName,
                totalNoOfProducts: 0,
              };
            }
            acc[entry.productName].totalNoOfProducts += entry.noOfProducts || 0;
            return acc;
          }, {}),
          ByRoomNumber: electronicsManagementEntries.reduce((acc, entry) => {
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
          ByDamageStatus: electronicsManagementEntries.reduce((acc, entry) => {
            const status = entry.damaged ? "Damaged" : "Not Damaged";
            if (!acc[status]) {
              acc[status] = { status: status, totalNoOfProducts: 0 };
            }
            acc[status].totalNoOfProducts += entry.noOfProducts || 0;
            return acc;
          }, {}),
          TopProducts: Object.values(
            electronicsManagementEntries.reduce((acc, entry) => {
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
        };
        result = {
          ByOverTime: Object.values(result.ByOverTime),
          ByProduct: Object.values(result.ByProduct),
          ByRoomNumber: Object.values(result.ByRoomNumber),
          ByDamageStatus: Object.values(result.ByDamageStatus),
          TopProducts: result.TopProducts,
        };
      }

      return res.status(200).json({
        success: true,
        data: result,
        message: `Simplified electronics utilization data (${
          graphType || "All Graph Types"
        }) fetched successfully`,
      });
    } catch (error) {
      sails.log.error(
        "Error in ElectronicsManagement.findSimplifiedGraph:",
        error
      );
      return res.serverError("Internal Server Error");
    }
  },
};
