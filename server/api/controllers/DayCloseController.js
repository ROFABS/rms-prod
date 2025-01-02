// api/controllers/DayCloseController.js
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const uuidv4 = require("uuid").v4;
const utils = require("../../lib/utils");
const ExcelJS = require("exceljs");

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = "Asia/Kolkata";

module.exports = {
  startDay: async function (req, res) {
    const TIMEZONE = "Asia/Kolkata";
    const today = dayjs().tz(TIMEZONE).format("YYYY-MM-DD");

    await sails
      .getDatastore()
      .transaction(async (db) => {
        const { restaurantId } = req.body;

        if (!restaurantId) {
          throw new Error("Restaurant ID is required");
        }

        const restaurant = await Restaurant.findOne({
          uniqueId: restaurantId,
        }).usingConnection(db);

        if (!restaurant) {
          throw new Error("Restaurant not found");
        }

        const query = {
          restaurant: restaurantId,
        };
        query.date = today;

        // Check if a day close record already exists for today
        const existingDayClose = await DayClose.findOne(query).usingConnection(
          db
        );
        if (existingDayClose) {
          throw new Error("Day has already been started for today");
        }

        // Create a new day close record
        const uniqueId = uuidv4();
        const startTime = dayjs().utc().valueOf();

        await DayClose.create({
          uniqueId,
          restaurant: restaurantId,
          date: today,
          startTime,
          status: "open",
          user: req.user.uniqueId,
        }).usingConnection(db);

        const updateSessions = await KsrTableSession.update({
          restaurant: restaurantId,
          status: "open",
        })
          .set({
            status: "ended",
            endTime: startTime,
          })
          .usingConnection(db);

        const updateTables = await KsrTables.update({
          restaurantUniqueId: restaurantId,
        })
          .set({
            status: "available",
          })
          .usingConnection(db);

        const updatedUser = await User.updateOne({
          uniqueId: req.user.uniqueId,
        })
          .set({
            dayStarted: true,
            dayEnded: false,
            lastLoginDate: today,
            lastLogoutDate: null,
          })
          .usingConnection(db);
        return res
          .status(200)
          .json({ message: "Day started successfully", user: updatedUser });
      })
      .catch((error) => {
        console.error("Error starting the day:", error);
        // trim the error message to avoid exposing sensitive information
        if (error.message) {
          error.message = error.message.split("at")[0];
        }

        return res.status(500).json({
          error: error.message,
          message: "Internal server error",
        });
      });
  },

  endDay: async function (req, res) {
    const today = dayjs().tz(TIMEZONE).format("YYYY-MM-DD");
    let workbook;

    try {
      await sails.getDatastore().transaction(async (db) => {
        const { restaurantId } = req.body;

        const restaurant = await Restaurant.findOne({
          uniqueId: restaurantId,
        }).usingConnection(db);

        if (!restaurant) {
          throw new Error("Restaurant not found");
        }

        // Find the day close record for today
        const dayCloseRecord = await DayClose.findOne({
          restaurant: restaurantId,
          date: today,
        }).usingConnection(db);
        if (!dayCloseRecord) {
          throw new Error("No day close record found for today");
        }

        // Calculate the end time and update the day close record and end time should be more beacuse of the time taken to generate the report
        const endTime = dayjs().utc().valueOf();
        // - 1000 * 60 * 5;

        // const { startTimestamp, endTimestamp } = utils.calculateTimeDuration(
        //   restaurant.startTime,
        //   restaurant.endTime,
        //   today
        //   // TIMEZONE
        // );

        // console.log("startTimestamp", startTimestamp);
        // console.log("endTimestamp", endTimestamp);

        const activeSessions = await KsrTableSession.find({
          restaurant: restaurantId,
          status: "active",
        }).usingConnection(db);

        if (activeSessions.length > 0) {
          throw new Error("Some sessions are still active");
        }

        const openTables = await KsrTables.find({
          restaurantUniqueId: restaurantId,
          status: "occupied",
        }).usingConnection(db);

        if (openTables.length > 0) {
          throw new Error("Some tables are still occupied");
        }

        const sessions = await KsrTableSession.find({
          where: {
            restaurant: restaurantId,
            createdAt: {
              ">=": dayCloseRecord.startTime,
              "<=": endTime,
            },
          },
          sort: "createdAt ASC",
        })
          .populate("orders")
          .populate("payments")
          .populate("table")
          .usingConnection(db);

        console.log("sessions", sessions);

        // Calculate total sessions, total bill amount, total discount amount, and total paid amount
        const totalSessions = sessions.length;
        const totalBillAmount = sessions.reduce(
          (sum, session) => sum + session.billAmount,
          0
        );
        const totalDiscountAmount = sessions.reduce(
          (sum, session) => sum + session.extraDiscountAmount,
          0
        );
        const totalPaidAmount = sessions.reduce(
          (sum, session) => sum + session.totalPaid,
          0
        );

        await DayClose.updateOne({ uniqueId: dayCloseRecord.uniqueId })
          .set({
            endTime,
            totalSessions,
            totalBillAmount,
            totalDiscountAmount,
            totalPaidAmount,
            status: "closed",
          })
          .usingConnection(db);

        // Update the user's day end status
        await User.updateOne({
          uniqueId: req.user.uniqueId,
        })
          .set({
            dayStarted: false,
            dayEnded: true,
            lastLogoutDate: today,
          })
          .usingConnection(db);

        workbook = new ExcelJS.Workbook();
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
        for (const session of sessions) {
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
            finalAmount:
              subTotal + tax - discount - session.extraDiscountAmount,
            billAmount: session.billAmount,
            amountPaid: session.totalPaid,
            cash: cash,
            upi: upi,
            card: card,
            zomato: zomato,
            swiggy: swiggy,
          });
        }
      });
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
      console.error("Error ending the day:", error);
      return res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  },
  continueDay: async function (req, res) {
    const today = dayjs().tz(TIMEZONE).format("YYYY-MM-DD");

    await sails
      .getDatastore()
      .transaction(async (db) => {
        const { restaurantId } = req.body;

        if (!restaurantId) {
          throw new Error("Restaurant ID is required");
        }

        const restaurant = await Restaurant.findOne({
          uniqueId: restaurantId,
        }).usingConnection(db);

        if (!restaurant) {
          throw new Error("Restaurant not found");
        }

        const query = {
          restaurant: restaurantId,
        };
        query.date = today;

        // Check if a day close record already exists for today
        const existingDayClose = await DayClose.findOne(query).usingConnection(
          db
        );
        if (!existingDayClose) {
          throw new Error("Day has not been started for today");
        }

        //update dayclose
        const updatedDayClose = await DayClose.updateOne({
          uniqueId: existingDayClose.uniqueId,
        })
          .set({
            status: "open",
          })
          .usingConnection(db);

        const updatedUser = await User.updateOne({
          uniqueId: req.user.uniqueId,
        })
          .set({
            dayStarted: true,
            dayEnded: false,
            lastLoginDate: today,
            lastLogoutDate: null,
          })
          .usingConnection(db);
        return res
          .status(200)
          .json({ message: "Day continued successfully", user: updatedUser });
      })
      .catch((error) => {
        console.error("Error continuing the day:", error);
        // trim the error message to avoid exposing sensitive information
        if (error.message) {
          error.message = error.message.split("at")[0];
        }

        return res.status(500).json({
          error: error.message,
          message: "Internal server error",
        });
      });
  },
  getStatus: async function (req, res) {
    const today = dayjs().tz(TIMEZONE).format("YYYY-MM-DD");
    const { restaurantId } = req.body;
    const dayCloseRecord = await DayClose.findOne({
      restaurant: restaurantId,
      date: today,
    });
    if (dayCloseRecord) {
      return res.status(200).json({ status: dayCloseRecord.status });
    }
    return res.status(200).json({ status: "closed" });
  },
  
  getOpenDayClose: async function (req, res) {
    const { restaurantId } = req.query;
    const dayCloseRecord = await DayClose.findOne({
      restaurant: restaurantId,
      status: "open",
    });
    if (dayCloseRecord) {
      return res.status(200).json(dayCloseRecord);
    }
    return res.status(200).json({});
  },



  closeDayClose: async function (req, res) {
    const { uniqueId, restaurantId, userId } = req.body;
    const dayCloseRecord = await DayClose.findOne({
      uniqueId,
      restaurant: restaurantId,
      status: "open",
    });
    if (!dayCloseRecord) {
      return res.status(404).json({ message: "Day close record not found" });
    }
    const endTime = dayjs().utc().valueOf();
    await DayClose.updateOne({ uniqueId }).set({
      endTime,
      status: "closed",
    });
    await User.updateOne({
      uniqueId: userId,
    }).set({
      dayStarted: false,
      dayEnded: true,
    });
    return res.status(200).json({ message: "Day closed successfully" });
  },

};











