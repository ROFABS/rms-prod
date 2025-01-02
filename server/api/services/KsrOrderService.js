const dayjs = require("dayjs");
const utils = require("../../lib/utils");

module.exports = {
  generateBillId: async (restaurantId, startTimestamp, endTimestamp) => {
    // Generate an 8-digit numerical Bill ID ex-> BILL_03102401
    const currentDate = new Date();
    const dateString =
      currentDate.getDate().toString().padStart(2, "0") +
      (currentDate.getMonth() + 1).toString().padStart(2, "0") +
      currentDate.getFullYear().toString().slice(-2);

    const startTime = dayjs().tz(utils.TIMEZONE).startOf("day").valueOf();
    const endTime = dayjs()
      .tz(utils.TIMEZONE)
      .add(1, "day")
      .startOf("day")
      .valueOf();

    const billsToday = await KsrTableSession.count({
      restaurant: restaurantId,
      createdAt: { ">=": startTime, "<=": endTime },
    });

    // Generate the Bill ID by appending the count to the date string
    const billId =
      "BILL_" + dateString + (billsToday + 1).toString().padStart(2, "0");

    return billId;
  },
  generateOrderId: async (restaurantId, startTimestamp, endTimestamp) => {
    const currentDate = new Date();
    const dateString =
      currentDate.getDate().toString().padStart(2, "0") +
      (currentDate.getMonth() + 1).toString().padStart(2, "0") +
      currentDate.getFullYear().toString().slice(-2);

    const startTime = dayjs().tz(utils.TIMEZONE).startOf("day").valueOf();
    const endTime = dayjs()
      .tz(utils.TIMEZONE)
      .add(1, "day")
      .startOf("day")
      .valueOf();

    const ordersToday = await KsrOrders.count({
      restaurant: restaurantId,
      createdAt: { ">=": startTime, "<=": endTime },
    });

    // Generate the order ID by appending the count to the date string
    const orderId = dateString + (ordersToday + 1).toString().padStart(2, "0");

    return orderId;
  },
};
