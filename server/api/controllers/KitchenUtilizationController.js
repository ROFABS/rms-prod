// api/controllers/KitchenManagementUtilizationEntryController.js
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

module.exports = {
  create: async function (req, res) {
    try {
      const {
        restaurantId,
        productUniqueId,
        quantity,
        noOfProducts,
        utilizationDate,
        authorisedBy,
        utilizationType,
        roomNumber,
        eventId,
        eventDate,
        saleType,
        inHouseUniqueId,
      } = req.body;

      let uniqueId = uuidv4();

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      if (!inHouseUniqueId) {
        return res
          .status(400)
          .json({ error: "In House Unique Id is required" });
      }

      if (!quantity && !noOfProducts) {
        return res
          .status(400)
          .json({ error: "Either quantity or noOfProducts is required" });
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
        productId: productUniqueId,
        restaurant: restaurantId,
        uniqueId: inHouseUniqueId,
      });

      if (!inventoryEntry) {
        return res.status(404).json({ error: "In House Item entry not found" });
      }

      const product = await MarketManagement.findOne({
        uniqueId: productUniqueId,
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
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

      const kitchenManagementUtilizationEntry = await KitchenManagement.create({
        uniqueId,
        restaurant: restaurantId,
        productName: product.productName,
        productUniqueId,
        quantity: quantity || undefined,
        noOfProducts: noOfProducts || undefined,
        utilizationDate,
        authorisedBy,
        utilizationType,
        roomNumber,
        eventId,
        eventDate,
        saleType,
      }).fetch();

      return res.status(201).json(kitchenManagementUtilizationEntry);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //Normal
  find: async function (req, res) {
    try {
      const {
        restaurantId,
        utilizationDateStart,
        utilizationDateEnd,
        utilizationType,
        eventId,
        roomNumber,
        saleType,
        productUniqueId,
      } = req.query;

      if (!restaurantId) {
        return res.badRequest("restaurantId is required");
      }

      let query = { restaurant: restaurantId };

      if (utilizationType) {
        query.utilizationType = utilizationType;
      }

      if (eventId) {
        query.eventId = eventId;
      }

      if (roomNumber) {
        query.roomNumber = roomNumber;
      }

      if (saleType) {
        query.saleType = saleType;
      }

      if (productUniqueId) {
        query.productUniqueId = productUniqueId;
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

      const kitchenManagementEntries = await KitchenManagement.find(query).sort(
        "utilizationDate DESC"
      );

      /* Send Empty Array Instead of any error */
      //  if (!kitchenManagementEntries || kitchenManagementEntries.length === 0) {
      //      return res.notFound('No kitchen management entries found matching the criteria');
      //  }

      return res.ok(kitchenManagementEntries);
    } catch (error) {
      sails.log.error("Error in KitchenManagement.find:", error);
      return res.serverError("Internal Server Error");
    }
  },

  findGraph: async function (req, res) {
    try {
      const {
        restaurantId,
        utilizationDateStart,
        utilizationDateEnd,
        utilizationType,
        eventId,
        roomNumber,
        saleType,
        productUniqueId,
      } = req.query;

      if (!restaurantId) {
        return res.badRequest("restaurantId is required");
      }

      let query = { restaurant: restaurantId };

      if (utilizationType) {
        query.utilizationType = utilizationType;
      }

      if (eventId) {
        query.eventId = eventId;
      }

      if (roomNumber) {
        query.roomNumber = roomNumber;
      }

      if (saleType) {
        query.saleType = saleType;
      }

      if (productUniqueId) {
        query.productUniqueId = productUniqueId;
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

      const kitchenManagementEntries = await KitchenManagement.find(query).sort(
        "utilizationDate ASC"
      );

      // Group and aggregate data by month
      const monthlyData = kitchenManagementEntries.reduce((acc, entry) => {
        const date = new Date(entry.utilizationDate);
        const month = date.toLocaleString("default", { month: "long" });
        const year = date.getFullYear();
        const key = `${month} ${year}`;

        if (!acc[key]) {
          acc[key] = { month: key, kitchen: 0, event: 0, room: 0 };
        }

        if (entry.utilizationType === "Kitchen") {
          acc[key].kitchen++;
        } else if (entry.eventId) {
          acc[key].event++;
        } else if (entry.roomNumber) {
          acc[key].room++;
        }

        return acc;
      }, {});

      // Convert the aggregated data to an array
      const formattedData = Object.values(monthlyData);

      return res.status(200).json({
        data: formattedData,
        message: "Kitchen utilization data fetched successfully",
      });
    } catch (error) {
      sails.log.error("Error in KitchenManagement.find:", error);
      return res.serverError("Internal Server Error");
    }
  },

  // MORE DETAILS

  //Kitchen Utilization Graph
  findGraphDetailed: async function (req, res) {
    try {
      const {
        restaurantId,
        utilizationDateStart,
        utilizationDateEnd,
        utilizationType,
        eventId,
        roomNumber,
        saleType,
        productUniqueId,
        timeFrame,
        limit,
      } = req.query;

      if (!restaurantId) {
        return res
          .status(400)
          .json({ success: false, error: "Property ID is required" });
      }
      let query = { restaurant: restaurantId };

      if (Object.keys(req.query).length === 1 && restaurantId) {
        // Get the first and last day of the current month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );

        let query = {
          restaurant: restaurantId,
          utilizationDate: {
            ">=": firstDayOfMonth,
            "<=": lastDayOfMonth,
          },
        };

        const kitchenManagementEntries = await KitchenManagement.find(
          query
        ).sort("utilizationDate ASC");

        // Aggregate data by date
        const aggregatedData = kitchenManagementEntries.reduce((acc, entry) => {
          const dateKey =
            entry.utilizationDate instanceof Date
              ? entry.utilizationDate.toISOString().split("T")[0]
              : entry.utilizationDate.split("T")[0];

          if (!acc[dateKey]) {
            acc[dateKey] = {
              utilizationDate: dateKey,
              totalNoOfProducts: 0,
            };
          }

          acc[dateKey].totalNoOfProducts += entry.noOfProducts || 0;

          return acc;
        }, {});

        // Generate an array for all days of the month
        const allDaysOfMonth = [];
        for (
          let d = new Date(firstDayOfMonth);
          d <= lastDayOfMonth;
          d.setDate(d.getDate() + 1)
        ) {
          const dateString = d.toISOString().split("T")[0];
          allDaysOfMonth.push({
            utilizationDate: dateString,
            totalNoOfProducts: aggregatedData[dateString]
              ? aggregatedData[dateString].totalNoOfProducts
              : 0,
          });
        }

        return res.status(200).json({
          data: allDaysOfMonth,
          message:
            "Simplified kitchen utilization data fetched successfully for the entire month",
        });
      }

      if (!timeFrame) {
        return res
          .status(400)
          .json({ success: false, error: "Time frame is required" });
      }

      if (utilizationType) query.utilizationType = utilizationType;
      if (eventId) query.eventId = eventId;
      if (roomNumber) query.roomNumber = roomNumber;
      if (saleType) query.saleType = saleType;
      if (productUniqueId) query.productUniqueId = productUniqueId;

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

      const kitchenManagementEntries = await KitchenManagement.find(query).sort(
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
              utilizationTypes: {},
              products: {},
              authorizedBy: {},
              saleTypes: {},
              eventCount: 0,
              roomUtilizations: 0,
              totalQuantity: 0,
              totalNoOfProducts: 0,
            };
          }

          aggregated[key].totalUtilizations++;
          aggregated[key].utilizationTypes[entry.utilizationType] =
            (aggregated[key].utilizationTypes[entry.utilizationType] || 0) + 1;

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

          aggregated[key].authorizedBy[entry.authorisedBy] =
            (aggregated[key].authorizedBy[entry.authorisedBy] || 0) + 1;

          if (entry.saleType) {
            aggregated[key].saleTypes[entry.saleType] =
              (aggregated[key].saleTypes[entry.saleType] || 0) + 1;
          }

          if (entry.eventId) aggregated[key].eventCount++;
          if (entry.roomNumber) aggregated[key].roomUtilizations++;

          aggregated[key].totalQuantity += entry.quantity || 0;
          aggregated[key].totalNoOfProducts += entry.noOfProducts || 0;
        }
        return aggregated;
      };

      const aggregatedData = await aggregateData(
        kitchenManagementEntries,
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
            utilizationTypes: {},
            products: {},
            authorizedBy: {},
            saleTypes: {},
            eventCount: 0,
            roomUtilizations: 0,
            totalQuantity: 0,
            totalNoOfProducts: 0,
          };
        }
      });

      let formattedData = Object.entries(aggregatedData).map(
        ([key, value]) => ({
          period: key,
          totalUtilizations: value.totalUtilizations,
          utilizationTypes: Object.entries(value.utilizationTypes).map(
            ([type, count]) => ({ type, count })
          ),
          topProducts: Object.entries(value.products)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, data]) => ({ name, ...data })),
          topAuthorizedUsers: Object.entries(value.authorizedBy)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count })),
          saleTypes: Object.entries(value.saleTypes).map(([type, count]) => ({
            type,
            count,
          })),
          eventCount: value.eventCount,
          roomUtilizations: value.roomUtilizations,
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
        message: "Kitchen utilization data fetched successfully",
      });
    } catch (error) {
      sails.log.error("Error in KitchenManagement.findGraphDetailed:", error);
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

      const kitchenManagementEntries = await KitchenManagement.find(query).sort(
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
            result = kitchenManagementEntries.reduce((acc, entry) => {
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

          case "ByType":
            result = kitchenManagementEntries.reduce((acc, entry) => {
              const key = `${entry.productName}-${entry.utilizationType}`;
              if (!acc[key]) {
                acc[key] = {
                  productName: entry.productName,
                  utilizationType: entry.utilizationType,
                  totalNoOfProducts: 0,
                };
              }
              acc[key].totalNoOfProducts += entry.noOfProducts || 0;
              return acc;
            }, {});
            result = Object.values(result);
            break;

          case "ByUtilization":
            result = Object.values(
              kitchenManagementEntries.reduce((acc, entry) => {
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

          case "BySaleType":
            result = kitchenManagementEntries.reduce((acc, entry) => {
              const dateKey = getDateKey(entry.utilizationDate);
              const key = `${dateKey}-${entry.saleType}`;
              if (!acc[key]) {
                acc[key] = {
                  utilizationDate: dateKey,
                  saleType: entry.saleType,
                  totalNoOfProducts: 0,
                };
              }
              acc[key].totalNoOfProducts += entry.noOfProducts || 0;
              return acc;
            }, {});
            result = Object.values(result);
            break;

          case "ByRoomNumber":
            result = kitchenManagementEntries.reduce((acc, entry) => {
              if (entry.roomNumber) {
                const key = `${entry.roomNumber}-${entry.productName}`;
                if (!acc[key]) {
                  acc[key] = {
                    roomNumber: entry.roomNumber,
                    productName: entry.productName,
                    totalNoOfProducts: 0,
                  };
                }
                acc[key].totalNoOfProducts += entry.noOfProducts || 0;
              }
              return acc;
            }, {});
            result = Object.values(result);
            break;

          default:
            return res
              .status(400)
              .json({ success: false, error: "Invalid graph type" });
        }
      } else {
        // Return all data grouped by graph types if no specific graphType is provided
        result = {
          ByOverTime: kitchenManagementEntries.reduce((acc, entry) => {
            const dateKey = getDateKey(entry.utilizationDate);
            if (!acc[dateKey]) {
              acc[dateKey] = { utilizationDate: dateKey, totalNoOfProducts: 0 };
            }
            acc[dateKey].totalNoOfProducts += entry.noOfProducts || 0;
            return acc;
          }, {}),
          ByType: kitchenManagementEntries.reduce((acc, entry) => {
            const key = `${entry.productName}-${entry.utilizationType}`;
            if (!acc[key]) {
              acc[key] = {
                productName: entry.productName,
                utilizationType: entry.utilizationType,
                totalNoOfProducts: 0,
              };
            }
            acc[key].totalNoOfProducts += entry.noOfProducts || 0;
            return acc;
          }, {}),
          ByUtilization: Object.values(
            kitchenManagementEntries.reduce((acc, entry) => {
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
          BySaleType: kitchenManagementEntries.reduce((acc, entry) => {
            const dateKey = getDateKey(entry.utilizationDate);
            const key = `${dateKey}-${entry.saleType}`;
            if (!acc[key]) {
              acc[key] = {
                utilizationDate: dateKey,
                saleType: entry.saleType,
                totalNoOfProducts: 0,
              };
            }
            acc[key].totalNoOfProducts += entry.noOfProducts || 0;
            return acc;
          }, {}),
          ByRoomNumber: kitchenManagementEntries.reduce((acc, entry) => {
            if (entry.roomNumber) {
              const key = `${entry.roomNumber}-${entry.productName}`;
              if (!acc[key]) {
                acc[key] = {
                  roomNumber: entry.roomNumber,
                  productName: entry.productName,
                  totalNoOfProducts: 0,
                };
              }
              acc[key].totalNoOfProducts += entry.noOfProducts || 0;
            }
            return acc;
          }, {}),
        };
        result = {
          ByOverTime: Object.values(result.ByOverTime),
          ByType: Object.values(result.ByType),
          ByUtilization: result.ByUtilization,
          BySaleType: Object.values(result.BySaleType),
          ByRoomNumber: Object.values(result.ByRoomNumber),
        };
      }

      return res.status(200).json({
        success: true,
        data: result,
        message: `Simplified kitchen utilization data (${
          graphType || "All Graph Types"
        }) fetched successfully`,
      });
    } catch (error) {
      sails.log.error("Error in KitchenManagement.findSimplifiedGraph:", error);
      return res.serverError("Internal Server Error");
    }
  },

  findSimplifiedGraphV2: async function (req, res) {
    try {
      const {
        restaurantId,
        startDate,
        endDate,
        kitchenMainCategoryUniqueId,
        timeFrame,
      } = req.query;

      console.log("Request Query Params:", {
        restaurantId,
        startDate,
        endDate,
        kitchenMainCategoryUniqueId,
        timeFrame,
      });

      // Validate input
      if (!restaurantId || !kitchenMainCategoryUniqueId) {
        console.log(
          "Validation failed: Missing restaurantId or kitchenMainCategoryUniqueId"
        );
        return res.status(400).json({
          success: false,
          error: "Property id and main category are required",
        });
      }

      console.log(
        "Looking up Main Category with uniqueId:",
        kitchenMainCategoryUniqueId
      );
      const mainCategoryCheck = await MainCategory.findOne({
        uniqueId: kitchenMainCategoryUniqueId,
      });

      if (!mainCategoryCheck) {
        console.log("Main Category not found:", kitchenMainCategoryUniqueId);
        return res
          .status(404)
          .json({ success: false, error: "Main category not found" });
      }

      console.log("Main Category found:", mainCategoryCheck);

      // Set time range based on timeFrame or startDate and endDate
      let startDateObj, endDateObj;
      if (timeFrame) {
        console.log("TimeFrame provided:", timeFrame);
        endDateObj = moment().endOf("day");
        switch (timeFrame) {
          case "daily":
            startDateObj = moment().startOf("day");
            break;
          case "weekly":
            startDateObj = moment().startOf("week");
            break;
          case "monthly":
            startDateObj = moment().startOf("month");
            break;
          case "yearly":
            startDateObj = moment().startOf("year");
            break;
          default:
            console.log("Invalid timeFrame:", timeFrame);
            return res
              .status(400)
              .json({ success: false, error: "Invalid timeFrame" });
        }
      } else if (startDate && endDate) {
        console.log("Custom Date Range provided:", { startDate, endDate });
        startDateObj = moment(startDate);
        endDateObj = moment(endDate);
      } else {
        console.log("Missing timeFrame or date range");
        return res.status(400).json({
          success: false,
          error: "Either timeFrame or startDate and endDate are required",
        });
      }

      console.log(
        "Fetching purchased items for restaurantId:",
        restaurantId,
        "within date range:",
        { startDate: startDateObj, endDate: endDateObj }
      );
      const purchasedItems = await MMPurchaseOrder.find({
        restaurant: restaurantId,
        mainCategoryId: kitchenMainCategoryUniqueId,
        isReceived: true,
        incomingDate: {
          ">=": startDateObj.toISOString(),
          "<=": endDateObj.toISOString(),
        },
      });

      console.log("Purchased Items fetched:", purchasedItems);

      // Process purchased items
      console.log("Processing purchased items...");
      const processedPurchasedItems = purchasedItems.reduce((acc, item) => {
        const key = item.productName;
        if (!acc[key]) {
          acc[key] = {
            productName: key,
            totalPrice: 0,
            totalQuantity: 0,
            unit: item.unit,
          };
        }
        acc[key].totalPrice += item.price * item.noOfProducts;
        acc[key].totalQuantity += item.noOfProducts;
        return acc;
      }, {});

      console.log("Processed Purchased Items:", processedPurchasedItems);

      const TopPurchasedItemsByPrice = Object.values(processedPurchasedItems)
        .sort((a, b) => b.totalPrice - a.totalPrice)
        .slice(0, 5)
        .map(({ productName, totalPrice, unit }) => ({
          productName,
          totalPrice: Math.round(totalPrice),
          unit,
        }));

      const TopPurchasedItemsByQuantity = Object.values(processedPurchasedItems)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5)
        .map(({ productName, totalQuantity, unit }) => ({
          productName,
          totalQuantity: Math.round(totalQuantity),
          unit,
        }));

      console.log("Top Purchased Items By Price:", TopPurchasedItemsByPrice);
      console.log(
        "Top Purchased Items By Quantity:",
        TopPurchasedItemsByQuantity
      );

      // Get utilized products
      console.log(
        "Fetching Market Management Items for mainCategory:",
        kitchenMainCategoryUniqueId
      );
      const marketManagementItems = await MarketManagement.find({
        mainCategory: kitchenMainCategoryUniqueId,
      }).select("uniqueId");
      const marketManagementIds = marketManagementItems.map(
        (item) => item.uniqueId
      );

      console.log(
        "Fetching Kitchen Utilization for restaurantId:",
        restaurantId
      );
      const kitchenUtilization = await KitchenManagement.find({
        restaurant: restaurantId,
        productUniqueId: { in: marketManagementIds },
        utilizationDate: {
          ">=": startDateObj.toISOString(),
          "<=": endDateObj.toISOString(),
        },
      });

      console.log("Kitchen Utilization fetched:", kitchenUtilization);

      // Process utilized products
      console.log("Processing Kitchen Utilization by Week...");
      const utilizationByWeek = kitchenUtilization.reduce((acc, entry) => {
        const weekNumber =
          Math.floor(
            (moment(entry.utilizationDate) - startDateObj) /
              (7 * 24 * 60 * 60 * 1000)
          ) + 1;
        const key = `week ${weekNumber}`;
        if (!acc[key]) {
          acc[key] = {};
        }
        if (!acc[key][entry.productName]) {
          acc[key][entry.productName] = { quantity: 0, noOfProducts: 0 };
        }
        acc[key][entry.productName].quantity += entry.quantity || 0;
        acc[key][entry.productName].noOfProducts += entry.noOfProducts || 0;
        return acc;
      }, {});

      console.log("Utilization By Week:", utilizationByWeek);

      const TopUtilizedProductsByPrice = Object.entries(utilizationByWeek)
        .flatMap(([time, products]) =>
          Object.entries(products).map(([productName, { noOfProducts }]) => ({
            time,
            productName,
            totalPrice: Math.round(
              noOfProducts *
                (processedPurchasedItems[productName].totalPrice /
                  processedPurchasedItems[productName].totalQuantity || 0)
            ),
            unit: processedPurchasedItems[productName].unit,
          }))
        )
        .sort((a, b) => b.totalPrice - a.totalPrice)
        .slice(0, 5);

      console.log(
        "Top Utilized Products By Price:",
        TopUtilizedProductsByPrice
      );

      // Get expired products
      const now = moment();
      console.log("Checking for expired items...");
      const expiredItems = purchasedItems.filter(
        (item) => item.expiryDate && moment(item.expiryDate) <= now
      );

      console.log("Expired Items:", expiredItems);

      const TopExpireProductsByPrice = expiredItems
        .sort((a, b) => b.price * b.noOfProducts - a.price * a.noOfProducts)
        .slice(0, 5)
        .map((item) => ({
          productName: item.productName,
          totalPrice: Math.round(item.price * item.noOfProducts),
          expiryDate: item.expiryDate,
          unit: item.unit,
        }));

      const TopExpireProductsByQuantity = expiredItems
        .sort((a, b) => b.noOfProducts - a.noOfProducts)
        .slice(0, 5)
        .map((item) => ({
          productName: item.productName,
          quantity: Math.round(item.noOfProducts),
          expiryDate: item.expiryDate,
          unit: item.unit,
        }));

      console.log("Top Expired Products By Price:", TopExpireProductsByPrice);
      console.log(
        "Top Expired Products By Quantity:",
        TopExpireProductsByQuantity
      );

      return res.status(200).json({
        success: true,
        data: {
          TopPurchasedItemsByPrice,
          TopPurchasedItemsByQuantity,
          TopUtilizedProductsByPrice,
          TopExpireProductsByPrice,
          TopExpireProductsByQuantity,
        },
        message:
          "Simplified kitchen utilization data (V2) fetched successfully",
      });
    } catch (error) {
      console.log("Error in KitchenManagement.findSimplifiedGraphV2:", error);
      return res.serverError("Internal Server Error");
    }
  },
};
