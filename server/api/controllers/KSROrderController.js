// api/controllers/KsrOrderController.js

const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");
const dayjs = require("dayjs");
const utils = require("../../lib/utils");

module.exports = {
  create: async function (req, res) {
    const {
      restaurantId,
      totalPrice,
      products,
      typeOfSale,
      tableId,
      deliveryPartner,
      discountAmount,
      discountType,
      role,
      user,
      taxAmount,
    } = req.body;

    if (!restaurantId || !products || !totalPrice) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (!role) {
      return res
        .status(400)
        .json({ success: false, message: "user is required" });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid products array" });
    }

    let restaurant;
    if (restaurantId) {
      restaurant = await Restaurant.findOne({ uniqueId: restaurantId });
      if (!restaurant) {
        return res
          .status(404)
          .json({ success: false, message: "Restaurant not found" });
      }
    }

    const { startTimestamp, endTimestamp } = utils.calculateTimeDuration(
      restaurant.startTime,
      restaurant.endTime
    );

    let _discount = parseFloat(discountAmount) || 0;
    let _discountAmount = 0;
    let subTotal = totalPrice;

    let newTotalPrice = parseFloat((subTotal + taxAmount).toFixed(2));
    if (_discount) {
      if (discountType === "flat") {
        _discountAmount = parseFloat(_discount.toFixed(2));
        newTotalPrice = parseFloat(
          (newTotalPrice - _discountAmount).toFixed(2)
        );
      } else if (discountType === "percentage") {
        _discountAmount = parseFloat(
          (newTotalPrice * (_discount / 100)).toFixed(2)
        );
        newTotalPrice = parseFloat(
          (newTotalPrice - _discountAmount).toFixed(2)
        );
      }
    }

    let table;
    let session;

    try {
      await sails.getDatastore().transaction(async (db) => {
        if (tableId) {
          table = await KsrTables.findOne({
            uniqueId: tableId,
            restaurantUniqueId: restaurantId,
          }).usingConnection(db);

          if (!table) {
            throw new Error("Table not found");
          }

          if (table.status !== "available") {
            session = await KsrTableSession.findOne({
              table: tableId,
              restaurant: restaurantId,
              status: "active",
            }).usingConnection(db);

            if (!session) {
              const billId = await KsrOrderService.generateBillId(
                restaurantId,
                startTimestamp,
                endTimestamp
              );
              const sessionId = sails.config.constants.uuidv4();
              session = await KsrTableSession.create({
                sessionId: sessionId,
                billId: billId,
                restaurant: restaurantId,
                table: tableId,
                billAmount: 0,
                extraDiscountAmount: 0,
                typeOfSale: typeOfSale,
                deliveryPartner: deliveryPartner,
                userRole: role,
                userName: user,
              })
                .fetch()
                .usingConnection(db);
            }
          } else {
            const sessionId = sails.config.constants.uuidv4();
            const billId = await KsrOrderService.generateBillId(
              restaurantId,
              startTimestamp,
              endTimestamp
            );
            session = await KsrTableSession.create({
              billId: billId,
              sessionId: sessionId,
              restaurant: restaurantId,
              table: tableId,
              billAmount: 0,
              extraDiscountAmount: 0,
              typeOfSale: typeOfSale,
              deliveryPartner: deliveryPartner,
              userRole: role,
              userName: user,
            })
              .fetch()
              .usingConnection(db);
            await KsrTables.updateOne({ uniqueId: tableId })
              .set({
                status: "occupied",
              })
              .usingConnection(db);
          }
        }

        const orderUniqueId = sails.config.constants.uuidv4();
        const orderId = await KsrOrderService.generateOrderId(
          restaurantId,
          startTimestamp,
          endTimestamp
        );

        const order = await KsrOrders.create({
          uniqueId: orderUniqueId,
          orderId: orderId,
          restaurant: restaurantId,
          table: table ? table.uniqueId : null,
          typeOfSale: typeOfSale,
          deliveryPartner: deliveryPartner,
          discount: _discount,
          subTotal: subTotal,
          taxAmount: taxAmount,
          discountType,
          discountAmount: _discountAmount,
          totalPrice: parseFloat(newTotalPrice.toFixed(2)),
          role: role,
          user: user,
          session: session.sessionId,
        })
          .fetch()
          .usingConnection(db);

        for (const product of products) {
          const inventoryItem = await KsrDishInventory.findOne({
            uniqueId: product.uniqueId,
          }).usingConnection(db);

          if (!inventoryItem) {
            throw new Error(
              `Product with productId ${product.uniqueId} not found in inventory`
            );
          }

          const orderProductUniqueId = sails.config.constants.uuidv4();
          await KsrOrderProducts.create({
            uniqueId: orderProductUniqueId,
            orderId: order.orderId,
            orderUniqueId: orderUniqueId,
            restaurant: restaurantId,
            productId: product.uniqueId,
            productName: inventoryItem.productName,
            quantity: product.quantity,
            price: product.price,
            taxAmount: product.taxAmount,
          }).usingConnection(db);
        }

        await KsrTableSession.updateOne({
          sessionId: session.sessionId,
          restaurant: restaurantId,
        })
          .set({
            billAmount: session.billAmount + newTotalPrice,
          })
          .usingConnection(db);

        const updatedOrder = await KsrOrders.findOne({
          uniqueId: orderUniqueId,
          restaurant: restaurantId,
          createdAt: { ">=": startTimestamp, "<=": endTimestamp },
        })
          .populate("products")
          .populate("restaurant")
          .populate("table")
          .usingConnection(db);

        return res.status(201).json({
          success: true,
          message: "Order created successfully",
          order: updatedOrder,
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: "Failed to create order",
      });
    }
  },

  find: async function (req, res) {
    try {
      const { orderId, restaurantId } = req.query;

      let query = {};

      if (orderId) {
        query.orderId = orderId;
      }

      if (restaurantId) {
        query.restaurant = restaurantId;
      }

      // Find orders based on the query
      const orders = await KsrOrders.find(query)
        .populate("products")
        .populate("restaurant")
        .populate("table");

      if (orders.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Orders not found" });
      }

      return res.status(200).json({ success: true, orders });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve orders",
        error: error.message,
      });
    }
  },

  //NOT IN ROUTES YET

  delete: async function (req, res) {
    try {
      const { orderId } = req.query;

      if (!orderId) {
        return res
          .status(400)
          .json({ success: false, message: "Order ID is required" });
      }

      const order = await KsrOrders.findOne({ orderId: orderId });

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      await KsrOrderProducts.destroy({ orderId: orderId });

      await KsrOrders.destroyOne({ orderId: orderId });

      return res
        .status(200)
        .json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete order",
        error: error.message,
      });
    }
  },

  printFinalBill: async function (req, res) {
    try {
      const { tableId } = req.query;

      if (!tableId) {
        return res
          .status(400)
          .json({ success: false, message: "Table ID is required" });
      }

      const session = await KsrTableSession.findOne({
        table: tableId,
        status: "active",
      })
        .populate("orders")
        .populate("table");

      if (!session) {
        return res.status(400).json({
          success: false,
          message: "No active session found for table",
        });
      }

      if (session.orders.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No orders found in the session",
        });
      }

      const orders = session.orders;
      for (const order of orders) {
        order.products = await KsrOrderProducts.find({
          orderId: order.orderId,
        });
      }

      // Consolidate all orders in the session
      const subTotal = session.orders.reduce((acc, order) => {
        return acc + order.subTotal;
      }, 0);
      const discountAmount = session.orders.reduce((acc, order) => {
        return acc + order.discountAmount;
      }, 0);
      const totalTax = session.orders.reduce((acc, order) => {
        return acc + order.taxAmount;
      }, 0);
      const totalPrice = subTotal + totalTax - discountAmount;
      const totalProducts = session.orders
        .map((order) => {
          return order.products;
        })
        .flat();
      const consolidatedOrdersObject = {
        typeOfSale: session.orders[0].typeOfSale,
        deliveryPartner: session.orders[0].deliveryPartner,
        table: session.table,
        billId: session.billId,
        subTotal: subTotal,
        discountAmount: discountAmount,
        totalPrice: totalPrice,
        products: totalProducts,
        taxAmount: totalTax,
        tableNumber: session.table.tableNumber,
      };

      // End the session
      // await KsrTableSession.updateOne({ sessionId: session.sessionId }).set({
      //   status: "ended",
      // });

      // Set the table status to available
      // await KsrTables.updateOne({ uniqueId: tableId }).set({
      //   status: "available",
      // });

      return res.status(200).json({
        success: true,
        message: "Final bill printed and session ended",
        data: consolidatedOrdersObject,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  cancelKot: async function (req, res) {
    try {
      const { tableId } = req.query;

      if (!tableId) {
        return res
          .status(400)
          .json({ success: false, message: "tableId is required." });
      }

      // Find the active session for the table
      const session = await KsrTableSession.findOne({
        table: tableId,
        status: "active",
      }).populate("orders");

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Active session not found for the table.",
        });
      }

      // Find the last order in the session
      // const lastOrder = session.orders[session.orders.length - 1];
      // order with latest time
      const lastOrder = session.orders.reduce((prev, current) =>
        prev.createdAt > current.createdAt ? prev : current
      );

      if (!lastOrder) {
        return res.status(404).json({
          success: false,
          message: "No orders found for the session.",
        });
      }

      //delete order products
      await KsrOrderProducts.destroy({ orderUniqueId: lastOrder.uniqueId });

      const updatedBillAmount = parseFloat(
        (session.billAmount - lastOrder.totalPrice).toFixed(2)
      );
      //update the bill amount
      await KsrTableSession.updateOne({ sessionId: session.sessionId }).set({
        billAmount: updatedBillAmount,
      });

      // Delete the last order
      const deletedOrder = await KsrOrders.destroyOne({
        uniqueId: lastOrder.uniqueId,
      });

      if (!deletedOrder) {
        return res.status(404).json({
          success: false,
          message: "Failed to delete last order.",
        });
      }

      // Update the session
      const updatedSession = await KsrTableSession.findOne({
        sessionId: session.sessionId,
      }).populate("orders");

      // for (const order of updatedSession.orders) {
      //   order.products = await KsrOrderProducts.find({
      //     orderId: order.orderId,
      //   });
      // }

      return res.status(200).json({
        success: true,
        message: "Last order deleted successfully.",
        data: updatedSession,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete last ordered item.",
        error: error.message,
      });
    }
  },

  ksrOrderReceipt: async function (req, res) {
    try {
      const { orderId, restaurantId } = req.query;

      if (!restaurantId) {
        return res
          .status(400)
          .json({ success: false, message: "restaurantId is required." });
      }

      if (!orderId) {
        return res
          .status(400)
          .json({ success: false, message: "orderId is required." });
      }

      const order = await KsrOrders.findOne({ orderId: orderId })
        .populate("products")
        .populate("restaurantId");

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // let subtotal = 0;
      // const productsWithTotal = order.products.map((product) => {
      //   const total = product.quantity * product.price;
      //   subtotal += total;
      //   return {
      //     ...product,
      //     total: total.toFixed(2),
      //   };
      // });

      // let discountAmount = order.discountAmount || 0;
      // let discountedSubtotal = subtotal - discountAmount;

      // let totalTax = 0;
      // if (order.taxesList) {
      //   const { CGST, IGST, SGST, CESS } = order.taxesList;
      //   totalTax += discountedSubtotal * (SGST / 100);
      //   totalTax += discountedSubtotal * (CGST / 100);
      //   // totalTax += discountedSubtotal * (IGST / 100);
      //   // totalTax += discountedSubtotal * (CESS / 100);
      // }
      const templateData = {
        ...order,
        products: productsWithTotal,
        subtotal: order.subTotal,
        discountAmount: order.discountAmount,
        totalTax: order.taxAmount,
        totalPrice: order.totalPrice,
      };

      Handlebars.registerHelper("multiply", function (a, b) {
        return (a * b).toFixed(2);
      });

      const templatePath = path.resolve(
        __dirname,
        "../../assets/templates/order_receipt_template.html"
      );
      const templateHtml = fs.readFileSync(templatePath, "utf8");

      const template = Handlebars.compile(templateHtml);
      const htmlContent = template(templateData);

      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf({ format: "A4" });

      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=order_receipt.pdf"
      );
      res.end(pdfBuffer, "binary");
    } catch (error) {
      console.error("Error generating PDF:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  KsrOrdersDownloadExcel: async function (req, res) {
    try {
      const { restaurantId, orderId, includeProducts, all } = req.query;

      if (!restaurantId) {
        return res
          .status(400)
          .json({ success: false, message: "restaurantId is required." });
      }

      let query = {};
      if (orderId) query.orderId = orderId;
      if (restaurantId) query.restaurant = restaurantId;

      let orders = await KsrOrders.find(query)
        .populate("products")
        // .populate("tax")
        .populate("table")
        .populate("restaurant");
      // .populate("steward");

      if (orders.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Orders not found" });
      }

      const formatDate = (timestamp) => {
        const date = new Date(parseInt(timestamp));
        if (isNaN(date.getTime())) {
          return "Invalid Date";
        }
        return (
          date.toISOString().split("T")[0] +
          " " +
          date.toTimeString().split(" ")[0]
        );
      };

      const getDateOnly = (timestamp) => {
        const dateOnly = new Date(parseInt(timestamp));
        if (isNaN(dateOnly.getTime())) {
          return "Invalid Date";
        }
        return dateOnly.toISOString().split("T")[0];
      };

      const getTimeOnly = (timeStamp) => {
        const timeOnly = new Date(parseInt(timeStamp));
        if (isNaN(timeOnly.getTime())) {
          return "Invalid Time";
        }
        return timeOnly.toTimeString().split(" ")[0];
      };

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Orders");

      worksheet.columns = [
        { header: "Outlet Name", key: "resturantName", width: 20 },
        { header: "Date", key: "orderDate", width: 15 },
        { header: "Order ID", key: "orderId", width: 15 },
        { header: "Time", key: "orderTime", width: 15 },
        { header: "Type of Sale", key: "typeOfSale", width: 15 },
        { header: "Table Number", key: "tableNumber", width: 15 },
        { header: "Delivery Partner", key: "deliveryPartner", width: 20 },
        { header: "User Role", key: "role", width: 20 },
        { header: "User", key: "user", width: 20 },
        { header: "Gross Aammount", key: "subTotal", width: 15 },
        { header: "Discount", key: "discount", width: 15 },
        { header: "Discount Type", key: "discountType", width: 15 },
        { header: "Discount Amount", key: "discountAmount", width: 15 },
        // { header: "CGST", key: "CGST", width: 10 },
        // { header: "SGST", key: "SGST", width: 10 },
        { header: "Tax Amount", key: "taxAmount", width: 10 },
        /* { header: 'Tax Name', key: 'taxName', width: 20 }, */
        { header: "Net Ammout", key: "totalPrice", width: 15 },
      ];

      if (includeProducts || all) {
        worksheet.columns.push({
          header: "Products",
          key: "products",
          width: 50,
        });
      }

      orders.forEach((order) => {
        let restaurantName =
          (order.restaurant && order.restaurant.restaurantName) || "Self";

        let orderData = {
          resturantName: restaurantName,
          orderDate: getDateOnly(order.createdAt),
          orderId: order.orderId,
          orderTime: getTimeOnly(order.createdAt),
          typeOfSale: order.typeOfSale,
          tableNumber: order.table.tableNumber,
          deliveryPartner: order.deliveryPartner,
          discount: order.discount,
          discountType: order.discountType,
          discountAmount: order.discountAmount,
          subTotal: order.subTotal,
          totalPrice: order.totalPrice,
          role: order.role,
          user: order.user,
          taxAmount: order.taxAmount,
        };

        if (includeProducts || all) {
          orderData.products = JSON.stringify(
            order.products.map((product) => ({
              productName: product.productName,
              quantity: product.quantity,
              price: product.price,
            }))
          );
        }
        //worksheet.getColumn(3).numFmt = '@';
        //worksheet.getColumn(6).numFmt = '@';
        worksheet.addRow(orderData);
      });

      const filename = `orders_${Date.now()}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate Excel",
        error: error.message,
      });
    }
  },
  getDayClose: async function (req, res) {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res
        .status(400)
        .json({ success: false, message: "restaurantId is required" });
    }

    const startOfDay = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    // // total sessions ended
    // const totalSessionsEnded = await KsrTableSession.find({
    //   restaurant: restaurantId,
    //   status: "ended",
    //   createdAt: { ">": startOfDay, "<": endOfDay },
    // });

    // const totalSalesAmount = totalSessionsEnded.reduce((acc, order) => {
    //   return acc + order.totalPaid;
    // }, 0);

    const activeSessions = await KsrTableSession.find({
      restaurant: restaurantId,
      status: "active",
    })
      .populate("orders")
      .populate("table");

    for (const session of activeSessions) {
      const orders = session.orders;
      for (const order of orders) {
        order.products = await KsrOrderProducts.find({
          orderId: order.orderId,
          restaurant: restaurantId,
        });
      }
    }

    // const totalActiveSessions = activeSessions.length;

    // const totalSalesCount = totalSessionsEnded.length;

    return res.status(200).json({
      success: true,
      // //format it in a better way
      // sales: {
      //   salesAmount: totalSalesAmount,
      //   salesCount: totalSalesCount,
      // },
      sessions: {
        // activeSessionsCount: totalActiveSessions,
        activeSessions: activeSessions,
      },
    });
  },
};
