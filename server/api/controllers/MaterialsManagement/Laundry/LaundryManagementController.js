// api/controllers/LaundryManagementController.js
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const Handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");

module.exports = {
  createOut: async function (req, res) {
    try {
      const { restaurantId, items, outDate } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "Property ID is required" });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ error: "Items array is required and must not be empty" });
      }

      if (!outDate) {
        return res.status(400).json({ error: "Out date is required" });
      }

      const laundryManagementEntries = [];

      for (const item of items) {
        const {
          productId,
          productName,
          outQuantity,
          outNoOfProducts,
          vendorName,
          vendorId,
        } = item;

        if (!productId || (!outQuantity && !outNoOfProducts) || !vendorId) {
          return res.status(400).json({
            error:
              "Product ID, outQuantity or outNoOfProducts, and vendor ID are required for each item",
          });
        }

        const laundryPriceEntry = await LaundryPriceList.findOne({
          productUniqueId: productId,
          vendorUniqueId: vendorId,
        });
        if (!laundryPriceEntry) {
          return res.status(404).json({
            error: `Laundry price entry not found for product ${productName} and vendor ${vendorName}`,
          });
        }

        const vendor = await VendorsManagement.findOne({ uniqueId: vendorId });
        if (!vendor) {
          return res
            .status(404)
            .json({ error: `Vendor with ID ${vendorId} not found` });
        }

        const inventoryEntry = await MMInHouseInventory.findOne({
          productId: productId,
          restaurant: restaurantId,
        });

        if (!inventoryEntry) {
          return res.status(404).json({
            error: `In House entry not found for product ${productName} and property ${restaurantId}`,
          });
        }

        const utilizationQuantity = outQuantity || outNoOfProducts;

        const inventoryQuantity = outQuantity
          ? inventoryEntry.quantity
          : inventoryEntry.noOfProducts;

        if (utilizationQuantity > inventoryQuantity) {
          return res.status(400).json({
            error: `Insufficient quantity or noOfProducts in In House for product ${productId}`,
          });
        }

        const updatedInventoryQuantity =
          inventoryQuantity - utilizationQuantity;

        await MMInHouseInventory.updateOne({
          uniqueId: inventoryEntry.uniqueId,
        }).set({
          quantity: outQuantity
            ? updatedInventoryQuantity
            : inventoryEntry.quantity,
          noOfProducts: outNoOfProducts
            ? updatedInventoryQuantity
            : inventoryEntry.noOfProducts,
        });

        const existingEntry = await LaundryManagement.findOne({
          productId: productId,
          vendorId: vendorId,
          outDate: outDate,
          status: "Out",
        });

        if (existingEntry) {
          await LaundryManagement.updateOne({
            uniqueId: existingEntry.uniqueId,
          }).set({
            outQuantity: outQuantity
              ? existingEntry.outQuantity + outQuantity
              : existingEntry.outQuantity,
            outNoOfProducts: outNoOfProducts
              ? existingEntry.outNoOfProducts + outNoOfProducts
              : existingEntry.outNoOfProducts,
          });
          laundryManagementEntries.push(existingEntry);
        } else {
          const uniqueId = uuidv4();
          const laundryManagementEntry = await LaundryManagement.create({
            uniqueId,
            restaurant: restaurantId,
            productId,
            laundryPrice: laundryPriceEntry.uniqueId,
            productName: laundryPriceEntry.productName,
            outQuantity: outQuantity || undefined,
            outNoOfProducts: outNoOfProducts || undefined,
            productPrice: laundryPriceEntry.price,
            vendorId,
            vendorName: vendor.vendorName,
            outDate,
            status: "Out",
          }).fetch();
          laundryManagementEntries.push(laundryManagementEntry);
        }
      }

      return res.status(201).json(laundryManagementEntries);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createIn: async function (req, res) {
    try {
      const { uniqueId, restaurantId, inDate, isDamaged, damagedItems } =
        req.body;

      if (!uniqueId || !restaurantId) {
        return res.status(400).json({
          error: "Laundry Management ID and Property ID are required",
        });
      }

      const laundryManagementEntry = await LaundryManagement.findOne({
        uniqueId: uniqueId,
        restaurant: restaurantId,
      });

      if (!laundryManagementEntry) {
        return res
          .status(404)
          .json({ error: "Laundry Management entry not found" });
      }

      if (laundryManagementEntry.status !== "Out") {
        return res
          .status(400)
          .json({ error: "Laundry Management entry is not in Out status" });
      }

      if (!inDate) {
        return res.status(400).json({ error: "In date is required" });
      }

      const outQuantity = laundryManagementEntry.outQuantity || 0;
      const outNoOfProducts = laundryManagementEntry.outNoOfProducts || 0;

      let inQuantity = outQuantity;
      let inNoOfProducts = outNoOfProducts;
      let missingQuantity = 0;
      let missingNoOfProducts = 0;
      let damageQuantity = 0;
      let damageNoOfProducts = 0;

      if (isDamaged && damagedItems) {
        let {
          damageQuantity,
          damageDescription,
          damageNoOfProducts,
          additionalInfo,
          refundStatus,
          laundryDamageItemStatus,
          missingQuantity,
          missingNoOfProducts,
          receivedQuantity,
          receivedNoOfProducts,
        } = damagedItems;

        if (damageQuantity !== undefined && outQuantity === null) {
          return res.status(400).json({
            error:
              "Damage quantity provided but out quantity is null in Laundry Management",
          });
        }

        if (damageNoOfProducts !== undefined && outNoOfProducts === null) {
          return res.status(400).json({
            error:
              "Damage number of products provided but out number of products is null in Laundry Management",
          });
        }

        if (missingQuantity !== undefined && outQuantity === null) {
          return res.status(400).json({
            error:
              "Missing quantity provided but out quantity is null in Laundry Management",
          });
        }

        if (missingNoOfProducts !== undefined && outNoOfProducts === null) {
          return res.status(400).json({
            error:
              "Missing number of products provided but out number of products is null in Laundry Management",
          });
        }

        if (receivedQuantity !== undefined && outQuantity === null) {
          return res.status(400).json({
            error:
              "Received quantity provided but out quantity is null in Laundry Management",
          });
        }

        if (receivedNoOfProducts !== undefined && outNoOfProducts === null) {
          return res.status(400).json({
            error:
              "Received number of products provided but out number of products is null in Laundry Management",
          });
        }

        if (damageQuantity !== undefined && damageQuantity > outQuantity) {
          return res
            .status(400)
            .json({ error: "Damage quantity cannot exceed out quantity" });
        }

        if (
          damageNoOfProducts !== undefined &&
          damageNoOfProducts > outNoOfProducts
        ) {
          return res.status(400).json({
            error:
              "Damage number of products cannot exceed out number of products",
          });
        }

        if (missingQuantity !== undefined && missingQuantity > outQuantity) {
          return res
            .status(400)
            .json({ error: "Missing quantity cannot exceed out quantity" });
        }

        if (
          missingNoOfProducts !== undefined &&
          missingNoOfProducts > outNoOfProducts
        ) {
          return res.status(400).json({
            error:
              "Missing number of products cannot exceed out number of products",
          });
        }

        if (receivedQuantity !== undefined && receivedQuantity > outQuantity) {
          return res
            .status(400)
            .json({ error: "Received quantity cannot exceed out quantity" });
        }

        if (
          receivedNoOfProducts !== undefined &&
          receivedNoOfProducts > outNoOfProducts
        ) {
          return res.status(400).json({
            error:
              "Received number of products cannot exceed out number of products",
          });
        }

        if (
          damageQuantity === undefined &&
          damageNoOfProducts === undefined &&
          missingQuantity === undefined &&
          missingNoOfProducts === undefined
        ) {
          return res.status(400).json({
            error:
              "Damage was set to true but no damage or missing details were provided",
          });
        }

        damageQuantity = damageQuantity || 0;
        damageNoOfProducts = damageNoOfProducts || 0;
        missingQuantity = missingQuantity || 0;
        missingNoOfProducts = missingNoOfProducts || 0;
        receivedQuantity =
          receivedQuantity || outQuantity - damageQuantity - missingQuantity;
        receivedNoOfProducts =
          receivedNoOfProducts ||
          outNoOfProducts - damageNoOfProducts - missingNoOfProducts;

        inQuantity = receivedQuantity;
        inNoOfProducts = receivedNoOfProducts;

        const inventoryEntry = await MMInHouseInventory.findOne({
          productId: laundryManagementEntry.productId,
          restaurant: restaurantId,
        });

        if (!inventoryEntry) {
          return res.status(404).json({
            error: `In House entry not found for product ${laundryManagementEntry.productId} and property ${restaurantId}`,
          });
        }

        const damagedItemUniqueId = uuidv4();

        await MMDamagedItems.create({
          uniqueId: damagedItemUniqueId,
          restaurant: restaurantId,
          laundryId: uniqueId,
          productId: laundryManagementEntry.productId,
          productName: laundryManagementEntry.productName,
          mainCategoryId: inventoryEntry.mainCategoryId,
          mainCategoryName: inventoryEntry.mainCategoryName,
          subCategoryId: inventoryEntry.subCategoryId,
          subCategoryName: inventoryEntry.subCategoryName,
          damageQuantity: damageQuantity,
          damageDescription: damageDescription,
          damageNoOfProducts: damageNoOfProducts,
          additionalInfo: additionalInfo || undefined,
          damageFrom: "Laundry",
          receivedQuantity: receivedQuantity,
          receivedNoOfProducts: receivedNoOfProducts,
          missingQuantity: missingQuantity,
          missingNoOfProducts: missingNoOfProducts,
          refundStatus: refundStatus || false,
          laundryDamageItemStatus: laundryDamageItemStatus || "null",
          vendorUniqueId: laundryManagementEntry.vendorId,
          vendorName: laundryManagementEntry.vendorName,
          price: laundryManagementEntry.productPrice,
        });
      }

      const inventoryEntry = await MMInHouseInventory.findOne({
        productId: laundryManagementEntry.productId,
        restaurant: restaurantId,
      });

      if (!inventoryEntry) {
        return res.status(404).json({
          error: `In House entry not found for product ${laundryManagementEntry.productId} and property ${restaurantId}`,
        });
      }

      await MMInHouseInventory.updateOne({
        uniqueId: inventoryEntry.uniqueId,
      }).set({
        quantity: inventoryEntry.quantity + inQuantity,
        noOfProducts: inventoryEntry.noOfProducts + inNoOfProducts,
      });

      await LaundryManagement.updateOne({ uniqueId: uniqueId }).set({
        inQuantity: inQuantity,
        inNoOfProducts: inNoOfProducts,
        inDate: inDate,
        status: "In",
        isDamaged: isDamaged || false,
      });

      return res
        .status(200)
        .json({ message: "Laundry In entry created successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  find: async function (req, res) {
    try {
      const { restaurantId, status } = req.query;

      if (!restaurantId) {
        return res.badRequest("Property ID is required");
      }

      let query = { restaurant: restaurantId };

      // Add status to the query if it's provided
      if (status) {
        query.status = status;
      }

      const laundryManagementEntries = await LaundryManagement.find(query);

      // SEND EMPTY ARRAY IN CASE NOTHING FOUND
      //  if (!laundryManagementEntries || laundryManagementEntries.length === 0) {
      //     return res.status(404).json({
      //       message: 'No laundry management entries found.',
      //      });
      //   }

      // Fetch damaged items for all retrieved laundry entries
      const damagedItems = await MMDamagedItems.find({
        laundryId: laundryManagementEntries.map((entry) => entry.uniqueId),
      });

      // Map damaged items to laundry entries
      const updatedLaundryManagementEntries = laundryManagementEntries.map(
        (entry) => {
          const damagedItem = damagedItems.find(
            (item) => item.laundryId === entry.uniqueId
          );
          if (damagedItem) {
            return { ...entry, damagedItems: damagedItem };
          }
          return entry;
        }
      );

      return res.ok(updatedLaundryManagementEntries);
    } catch (error) {
      sails.log.error(error);
      return res.serverError("Internal Server Error");
    }
  },

  /*  */

  getReport: async function (req, res) {
    try {
      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res.badRequest("Property ID is required");
      }

      const laundryManagementEntries = await LaundryManagement.find({
        restaurant: restaurantId,
      });
      const generateReportAction =
        sails.getActions()[
          "materialsmanagement/laundry/laundrymanagement/generatereport"
        ];
      const damagedItems = await MMDamagedItems.find({
        laundryId: laundryManagementEntries.map((entry) => entry.uniqueId),
      });

      const updatedLaundryManagementEntries = laundryManagementEntries.map(
        (entry) => {
          const damagedItem = damagedItems.find(
            (item) => item.laundryId === entry.uniqueId
          );
          return damagedItem ? { ...entry, damagedItems: damagedItem } : entry;
        }
      );

      const report = await generateReportAction(
        updatedLaundryManagementEntries
      );

      try {
        const response = await axios.post(
          "https://cheerful-raindrop-d0fd07.netlify.app/.netlify/functions/api/gemini",
          {
            reportData: report,
          }
        );

        if (response.status === 200) {
          report.summary =
            response.data.result.response.candidates[0].content.parts[0].text;
        }
      } catch (error) {
        console.error(error);
        // Handle the error, but still return the report
      }

      /* console.log(report); */

      const templatePath = path.resolve(
        __dirname,
        "../../../../assets/templates/laundry_report_template.html"
      );
      const templateHtml = fs.readFileSync(templatePath, "utf8");

      const template = Handlebars.compile(templateHtml);
      const htmlContent = template(report);

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf({ format: "A4" });

      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
      res.end(pdfBuffer, "binary");
    } catch (error) {
      console.error(error);
      return res.serverError("Internal Server Error");
    }
  },

  generateReport: async function (laundryData) {
    const report = {
      totalItemsIn: 0,
      totalItemsOut: 0,
      damagedItems: 0,
      vendorAnalysis: {},
      productBreakdown: {},
      costAnalysis: {},
      damageAnalysis: {},
    };

    laundryData.forEach((item) => {
      // Count total items in and out
      report.totalItemsIn += item.inNoOfProducts;
      report.totalItemsOut += item.outNoOfProducts;

      // Count damaged items and assign them to vendors
      if (item.isDamaged && item.damagedItems) {
        report.damagedItems += item.damagedItems.damageNoOfProducts;

        if (!report.damageAnalysis[item.vendorName]) {
          report.damageAnalysis[item.vendorName] = {
            totalDamagedItems: 0,
            damagedProducts: {},
          };
        }
        report.damageAnalysis[item.vendorName].totalDamagedItems +=
          item.damagedItems.damageNoOfProducts;

        if (
          !report.damageAnalysis[item.vendorName].damagedProducts[
            item.productName
          ]
        ) {
          report.damageAnalysis[item.vendorName].damagedProducts[
            item.productName
          ] = 0;
        }
        report.damageAnalysis[item.vendorName].damagedProducts[
          item.productName
        ] += item.damagedItems.damageNoOfProducts;
      }

      // Turnaround time
      if (!report.vendorAnalysis[item.vendorName]) {
        report.vendorAnalysis[item.vendorName] = {
          itemsHandled: 0,
          totalCost: 0,
          totalTurnaroundTime: 0,
          turnaroundCount: 0,
        };
      }
      report.vendorAnalysis[item.vendorName].itemsHandled +=
        item.outNoOfProducts;
      report.vendorAnalysis[item.vendorName].totalCost +=
        item.outNoOfProducts * item.productPrice;

      const outDate = new Date(item.outDate);
      const inDate = new Date(item.inDate);
      const turnaroundTime = (inDate - outDate) / (1000 * 60 * 60 * 24); // in days
      report.vendorAnalysis[item.vendorName].totalTurnaroundTime +=
        turnaroundTime;
      report.vendorAnalysis[item.vendorName].turnaroundCount++;

      // Product breakdown per vendor
      if (!report.productBreakdown[item.vendorName]) {
        report.productBreakdown[item.vendorName] = {};
      }
      if (!report.productBreakdown[item.vendorName][item.productName]) {
        report.productBreakdown[item.vendorName][item.productName] = 0;
      }
      report.productBreakdown[item.vendorName][item.productName] +=
        item.outNoOfProducts;

      // Cost analysis per product and vendor
      if (!report.costAnalysis[item.vendorName]) {
        report.costAnalysis[item.vendorName] = {};
      }
      if (!report.costAnalysis[item.vendorName][item.productName]) {
        report.costAnalysis[item.vendorName][item.productName] = {
          totalCost: 0,
          itemCount: 0,
        };
      }
      report.costAnalysis[item.vendorName][item.productName].totalCost +=
        item.outNoOfProducts * item.productPrice;
      report.costAnalysis[item.vendorName][item.productName].itemCount +=
        item.outNoOfProducts;
    });

    // Calculate average turnaround time per vendor
    for (const vendor in report.vendorAnalysis) {
      const vendorData = report.vendorAnalysis[vendor];
      vendorData.averageTurnaroundTime =
        vendorData.totalTurnaroundTime / vendorData.turnaroundCount;
      delete vendorData.totalTurnaroundTime;
      delete vendorData.turnaroundCount;
    }

    // Trim down the damageAnalysis and costAnalysis sections to 10 products per vendor
    for (const vendor in report.damageAnalysis) {
      report.damageAnalysis[vendor].damagedProducts = Object.entries(
        report.damageAnalysis[vendor].damagedProducts
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    }

    for (const vendor in report.costAnalysis) {
      report.costAnalysis[vendor] = Object.entries(report.costAnalysis[vendor])
        .sort((a, b) => b[1].totalCost - a[1].totalCost)
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    }

    return report;
  },

  downloadExcel: async function (req, res) {
    try {
      const { restaurantId, vendorId, status } = req.query;

      if (!restaurantId) {
        return res
          .status(400)
          .json({ success: false, message: "restaurantId is required" });
      }

      let query = { restaurant: restaurantId };

      if (status) query.status = status;
      if (vendorId) query.vendorId = vendorId;

      let laundryManagementEntries = await LaundryManagement.find(query);

      // Fetch damaged items for all retrieved laundry entries
      const damagedItems = await MMDamagedItems.find({
        laundryId: laundryManagementEntries.map((entry) => entry.uniqueId),
      });

      // Map damaged items to laundry entries
      const updatedLaundryManagementEntries = laundryManagementEntries.map(
        (entry) => {
          const damagedItem = damagedItems.find(
            (item) => item.laundryId === entry.uniqueId
          );
          if (damagedItem) {
            return { ...entry, damagedItems: damagedItem };
          }
          return entry;
        }
      );

      if (updatedLaundryManagementEntries.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Laundry Entries not found" });
      }

      const formatDate = (timestamp) => {
        const date = new Date(parseInt(timestamp));
        return (
          date.toISOString().split("T")[0] +
          " " +
          date.toTimeString().split(" ")[0]
        );
      };

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laundry Entries");

      worksheet.columns = [
        { header: "Product Name", key: "ProductName", width: 20 },
        { header: "Product Price", key: "ProductPrice", width: 15 },
        { header: "Out No. of Products", key: "OutNoOfProducts", width: 17 },
        { header: "In No. of Products", key: "InNoOfProducts", width: 17 },
        { header: "Vendor Name", key: "VendorName", width: 20 },
        { header: "Out Date", key: "OutDate", width: 25 },
        { header: "In Date", key: "InDate", width: 20 },
        { header: "Status", key: "Status", width: 10 },
        { header: "Is Damaged", key: "IsDamaged", width: 11 },
        {
          header: "Number of Damaged Products",
          key: "NumberOfDamagedProducts",
          width: 25,
        },
        { header: "Created At", key: "createdAt", width: 25 },
        { header: "Updated At", key: "updatedAt", width: 25 },
      ];

      // Add data
      updatedLaundryManagementEntries.forEach((entry) => {
        worksheet.addRow({
          ProductName: entry.productName,
          ProductPrice: entry.productPrice,
          OutNoOfProducts: entry.outNoOfProducts,
          InNoOfProducts: entry.inNoOfProducts,
          VendorName: entry.vendorName,
          OutDate: entry.outDate,
          InDate: entry.inDate,
          Status: entry.status,
          IsDamaged: entry.isDamaged ? "Yes" : "No",
          NumberOfDamagedProducts: entry.damagedItems
            ? entry.damagedItems.damageNoOfProducts
            : 0,
          createdAt: formatDate(entry.createdAt),
          updatedAt: formatDate(entry.updatedAt),
        });
      });

      res.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.attachment(`laundry_entries_${Date.now()}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to download Excel",
        error: error.message,
      });
    }
  },
};
