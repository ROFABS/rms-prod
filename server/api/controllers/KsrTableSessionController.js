const fs = require("fs");
const XLSX = require("xlsx");
const ExcelJS = require("exceljs");
const dayjs = require("dayjs");

module.exports = {
  fetchOne: async (req, res) => {
    try {
      const { sessionId, tableId, restaurantId, status } = req.query;
      console.log(req.query, "req.query");

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId required" });
      }
      if (!sessionId && !tableId) {
        return res.status(400).json({ error: "sessionId or tableId required" });
      }

      let query = {};
      query.restaurant = restaurantId;
      if (sessionId) {
        query.sessionId = sessionId;
      }
      if (tableId) {
        query.table = tableId;
      }
      if (status) {
        query.status = status;
      }

      await sails.getDatastore().transaction(async (db) => {
        const session = await KsrTableSession.findOne(query)
          .populate("orders")
          .populate("table")
          .populate("payments")
          .usingConnection(db);

        if (!session) {
          return res.status(200).json([]);
        }

        for (const order of session.orders) {
          order.products = await KsrOrderProducts.find({
            orderUniqueId: order.uniqueId,
            orderId: order.orderId,
            restaurant: restaurantId,
          }).usingConnection(db);
        }

        return res.json(session);
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  fetch: async (req, res) => {
    try {
      const { restaurantId } = req.query;
      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId required" });
      }

      // sort and populate the orders
      const sessions = await KsrTableSession.find({
        restaurant: restaurantId,
        status: "ended",
      })
        .populate("orders")
        .populate("table")
        .populate("payments")
        .sort("createdAt DESC");

      for (const session of sessions) {
        if (session.orders && session.orders.length > 0) {
          for (const order of session.orders) {
            order.products = await KsrOrderProducts.find({
              orderUniqueId: order.uniqueId,
              restaurant: restaurantId,
            });
          }
        }
      }

      return res.json(sessions);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  fetchActive: async (req, res) => {
    try {
      const { restaurantId } = req.query;
      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId required" });
      }
      const sessions = await KsrTableSession.find({
        restaurant: restaurantId,
        status: "active",
      })
        .populate("orders")
        .populate("table");

      for (const session of sessions) {
        if (session.orders && session.orders.length > 0) {
          for (const order of session.orders) {
            const products = await KsrOrderProducts.find({
              orderUniqueId: order.uniqueId,
              orderId: order.orderId,
              restaurant: restaurantId,
            });
            order.products = products;
          }
        }
      }

      return res.json(sessions);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  getPayment: async (req, res) => {
    try {
      const { tableId } = req.query;

      if (!tableId) {
        return res.status(400).json({ error: "tableId is required" });
      }

      const session = await KsrTableSession.findOne({
        table: tableId,
        status: "active",
      });

      if (!session) {
        return res.status(404).json({ error: "Active session not found" });
      }

      const payments = await KsrPayments.find({
        sessionId: session.sessionId,
      });

      return res.json(payments);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  addPayment: async function (req, res) {
    try {
      const { tableId, amount, method } = req.body;

      if (!tableId || !amount || !method) {
        return res.status(400).json({
          success: false,
          message: "table, amount, and method are required.",
        });
      }

      // Find the active session for the table
      const session = await KsrTableSession.findOne({
        table: tableId,
        status: "active",
      })
        .populate("orders")
        .populate("payments");

      console.log(session, "session");

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Active session not found for the table.",
        });
      }

      // Calculate the total amount paid
      const totalPaid = session.totalPaid;

      // Calculate the total order amount
      const totalOrderAmount = session.billAmount;

      //total amount can be 153.34 so we need to round it like the user should pay 154
      const totalAmount = Math.ceil(totalOrderAmount);

      if (totalPaid + amount > totalAmount) {
        const pendingAmount = totalAmount - totalPaid;
        return res.status(400).json({
          success: false,
          message: `Payment exceeds the total amount to be paid. Total amount to be paid is ${pendingAmount}.`,
        });
      }

      // Create a new payment
      const payment = await KsrPayments.create({
        paymentId: `payment_${Date.now()}`,
        sessionId: session.sessionId,
        amount,
        paymentMethod: method,
      }).fetch();

      await KsrTableSession.updateOne({ sessionId: session.sessionId }).set({
        totalPaid: totalPaid + amount,
      });

      return res.status(200).json({
        success: true,
        message: "Payment added successfully.",
        payment,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to add payment.",
        error: error.message,
      });
    }
  },
  printFinalBill: async function (req, res) {
    const { tableId, restaurantId } = req.query;
    if (!tableId) {
      return res.status(400).json({ error: "tableId is required" });
    }
    if (!restaurantId) {
      return res.status(400).json({ error: "restaurantId is required" });
    }
    const restaurant = await Restaurant.findOne({ uniqueId: restaurantId });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    const session = await KsrTableSession.findOne({
      table: tableId,
      status: "active",
    })
      .populate("orders")
      .populate("payments");

    if (!session) {
      return res.status(404).json({ error: "Active session not found" });
    }

    for (const order of session.orders) {
      order.products = await KsrOrderProducts.find({
        orderUniqueId: order.uniqueId,
        restaurant: restaurantId,
      });
    }

    const totalPaid = session.totalPaid;
    const totalOrderAmount = session.billAmount;
    const totalAmount = Math.ceil(totalOrderAmount);
    const subTotal = session.orders.reduce(
      (sum, order) => sum + order.subTotal,
      0
    );
    const tax = session.orders.reduce((sum, order) => sum + order.taxAmount, 0);
    const discount = session.orders.reduce(
      (sum, order) => sum + order.discountAmount,
      0
    );
    const extraDiscount = session.extraDiscountAmount;

    // if (totalPaid < totalAmount) {
    //   const pendingAmount = totalAmount - totalPaid;
    //   return res.status(400).json({
    //     success: false,
    //     message: `Payment is pending. Total amount to be paid is ${pendingAmount}.`,
    //   });
    // }

    return res.json({
      ...session,
      billDetails: {
        subTotal,
        tax,
        discount,
        extraDiscount,
        totalAmount,
        totalPaid,
      },
    });
  },
  completeSession: async function (req, res) {
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
      })
        .populate("orders")
        .populate("payments");

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Active session not found for the table.",
        });
      }

      if (session.orders.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No orders found for the session.",
        });
      }

      // Calculate the total amount paid
      // const totalPaid = session.payments.reduce(
      //   (sum, payment) => sum + payment.amount,
      //   0
      // );

      // Calculate the total order amount
      // const totalOrderAmount = session.orders.reduce(
      //   (sum, order) => sum + order.totalPrice,
      //   0
      // );

      //total amount can be 153.34 so we need to round it like the user should pay 154
      const totalAmount = Math.ceil(session.billAmount);

      if (session.totalPaid < totalAmount) {
        const pendingAmount = totalAmount - session.totalPaid;
        return res.status(400).json({
          success: false,
          message: `Payment is pending. Total amount to be paid is ${pendingAmount}.`,
        });
      }

      // Mark the session as ended
      await KsrTableSession.updateOne({ sessionId: session.sessionId }).set({
        status: "ended",
      });

      await KsrTables.updateOne({ uniqueId: tableId }).set({
        status: "available",
      });

      return res.status(200).json({
        success: true,
        message: "Session completed successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to complete session.",
        error: error.message,
      });
    }
  },
  deleteSession: async function (req, res) {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        return res
          .status(400)
          .json({ success: false, message: "sessionId is required." });
      }

      // Find the session
      const session = await KsrTableSession.findOne({ sessionId }).populate(
        "orders"
      );

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Session not found.",
        });
      }

      await KsrTables.updateOne({ uniqueId: session.table }).set({
        status: "available",
      });

      // Delete the orders and order products
      for (const order of session.orders) {
        await KsrOrderProducts.destroy({
          orderUniqueId: order.uniqueId,
          orderId: order.orderId,
          restaurant: order.restaurant,
        });
        await KsrOrders.destroyOne({
          uniqueId: order.uniqueId,
          orderId: order.orderId,
          restaurant: order.restaurant,
        });
      }

      // Delete the session
      await KsrTableSession.destroyOne({ sessionId });

      return res.status(200).json({
        success: true,
        message: "Session deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete session.",
        error: error.message,
      });
    }
  },
  applyDiscount: async function (req, res) {
    try {
      const {
        tableId,
        discount,
        discountType,
        discountAmount,
        reason,
        restaurantId,
      } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      if (!tableId) {
        return res.status(400).json({ error: "tableId is required" });
      }

      if (!discount || !discountType || !discountAmount) {
        return res.status(400).json({
          success: false,
          message: "discount, discountType, discountAmount are required.",
        });
      }

      // Find the active session for the table
      const session = await KsrTableSession.findOne({
        restaurant: restaurantId,
        table: tableId,
        status: "active",
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: "Active session not found for the table.",
        });
      }

      if (discountAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Discount amount should be greater than 0.",
        });
      }
      if (discountType !== "percentage" && discountType !== "flat") {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type.",
        });
      }
      if (discountAmount > session.billAmount) {
        return res.status(400).json({
          success: false,
          message: "Discount amount should be less than total bill amount.",
        });
      }

      if (session.billAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Bill amount is already 0.",
        });
      }

      if (session.extraDiscount) {
        const totalDiscount = session.extraDiscountAmount;
        const totalAmount = Math.ceil(session.billAmount);

        if (totalDiscount + discountAmount > totalAmount) {
          const pendingAmount = totalAmount - totalDiscount;
          return res.status(400).json({
            success: false,
            message: `Discount exceeds the total amount to be paid. Total amount to be paid is ${pendingAmount}.`,
          });
        }

        const previousBillAmount =
          session.billAmount + session.extraDiscountAmount;

        await KsrTableSession.updateOne({
          sessionId: session.sessionId,
          restaurant: restaurantId,
        }).set({
          extraDiscount: discount,
          extraDiscountType: discountType,
          extraDiscountAmount: discountAmount,
          extraDiscountReason: reason,
          billAmount: previousBillAmount - discountAmount,
        });

        return res.status(200).json({
          success: true,
          message: "Discount applied successfully.",
        });
      }

      await KsrTableSession.updateOne({
        sessionId: session.sessionId,
        restaurant: restaurantId,
      }).set({
        extraDiscount: discount,
        extraDiscountType: discountType,
        extraDiscountAmount: discountAmount,
        extraDiscountReason: reason,
        billAmount: session.billAmount - discountAmount,
      });

      return res.status(200).json({
        success: true,
        message: "Discount applied successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to apply discount.",
        error: error.message,
      });
    }
  },
  getExcelFile: async (req, res) => {
    const { restaurantId, startDate, endDate, sessionId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ error: "restaurantId is required" });
    }
    const query = {
      restaurant: restaurantId,
    };
    if (sessionId) {
      query.sessionId = sessionId;
    }
    try {
      const tableSessions = await KsrTableSession.find(query)
        .populate("orders")
        .populate("table")
        .populate("payments");

      console.log(tableSessions, "tableSessions");
      const restaurant = await Restaurant.findOne({
        uniqueId: restaurantId,
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sessions");

      worksheet.columns = [
        { header: "Outlet Name", key: "resturantName", width: 20 },
        { header: "Date", key: "sessionDate", width: 15 },
        { header: "Bill ID", key: "billId", width: 15 },
        { header: "Time", key: "sessionTime", width: 15 },
        { header: "Table Number", key: "tableNumber", width: 15 },
        { header: "Type of Sale", key: "typeOfSale", width: 15 },
        { header: "Delivery Partner", key: "deliveryPartner", width: 20 },
        { header: "User Role", key: "role", width: 20 },
        { header: "User Name", key: "user", width: 20 },
        { header: "Sub Total", key: "subTotal", width: 15 },
        { header: "Tax Amount", key: "taxAmount", width: 15 },
        { header: "Gross Amount", key: "grossAmount", width: 15 },
        { header: "Discount Amt", key: "discountAmt", width: 15 },
        { header: "Extra Discount Amt", key: "extraDiscountAmt", width: 20 },
        { header: "Final Amount", key: "finalAmount", width: 15 },
        { header: "Bill Amount", key: "billAmount", width: 15 },
        { header: "Ammout Paid", key: "amountPaid", width: 15 },
        { header: "Cash", key: "cash", width: 15 },
        { header: "Card", key: "card", width: 15 },
        { header: "UPI", key: "upi", width: 15 },
        { header: "Zomato", key: "zomato", width: 15 },
        { header: "Swiggy", key: "swiggy", width: 15 },
      ];
      for (const session of tableSessions) {
        const subTotal = session.orders.reduce(
          (sum, order) => sum + order.subTotal,
          0
        );
        const tax = session.orders.reduce(
          (sum, order) => sum + order.taxAmount,
          0
        );
        const discount = session.orders.reduce(
          (sum, order) => sum + order.discountAmount,
          0
        );

        const cash = session.payments.reduce((sum, payment) => {
          if (payment.paymentMethod === "cash") {
            return sum + payment.amount;
          }
          return sum;
        }, 0);
        const card = session.payments.reduce((sum, payment) => {
          if (payment.paymentMethod === "card") {
            return sum + payment.amount;
          }
          return sum;
        }, 0);
        const upi = session.payments.reduce((sum, payment) => {
          if (payment.paymentMethod === "upi") {
            return sum + payment.amount;
          }
          return sum;
        }, 0);
        const zomato = session.payments.reduce((sum, payment) => {
          if (payment.paymentMethod === "zomato") {
            return sum + payment.amount;
          }
          return sum;
        }, 0);
        const swiggy = session.payments.reduce((sum, payment) => {
          if (payment.paymentMethod === "swiggy") {
            return sum + payment.amount;
          }
          return sum;
        }, 0);
        const row = worksheet.addRow({
          resturantName: restaurant.restaurantName || "",
          sessionDate: dayjs(session.createdAt).format("YYYY-MM-DD"),
          billId: session.billId,
          sessionTime: dayjs(session.createdAt).format("HH:mm:ss"),
          tableNumber: session.table ? session.table.tableNumber : "",
          typeOfSale: session.typeOfSale,
          deliveryPartner: session.deliveryPartner,
          role: session.userRole,
          user: session.userName,
          subTotal: subTotal,
          taxAmount: tax,
          grossAmount: subTotal + tax,
          discountAmt: discount,
          extraDiscountAmt: session.extraDiscountAmount,
          finalAmount: subTotal + tax - discount - session.extraDiscountAmount,
          billAmount: session.billAmount,
          amountPaid: session.totalPaid,
          cash: cash,
          upi: upi,
          card: card,
          zomato: zomato,
          swiggy: swiggy,
        });
      }

      // group payments by paymentMethod
      const fileName = `Sessions_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      await workbook.xlsx.write(res);
      return res.end();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
