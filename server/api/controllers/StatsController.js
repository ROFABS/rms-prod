const dayjs = require("dayjs");

module.exports = {
  getStats: async (req, res) => {
    try {
      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: "Property ID required" });
      }

      // Fetch weekly, monthly, and yearly sales data
      const weeklySales = await getWeeklySales(restaurantId);
      const monthlySales = await getMonthlySales(restaurantId);
      const yearlySales = await getYearlySales(restaurantId);

      // Fetch top selling products data
      const topSellingProducts = await getTopSellingProducts(restaurantId);

      // Fetch table utilization data
      const tableUtilization = await getTableUtilization(restaurantId);

      // Fetch discounts given data
      const discountsGiven = await getDiscountsGiven(restaurantId);

      // Fetch tax collected data
      const taxCollected = await getTaxCollected(restaurantId);

      return res.json({
        weeklySales,
        monthlySales,
        yearlySales,
        topSellingProducts,
        tableUtilization,
        discountsGiven,
        taxCollected,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};

async function getWeeklySales(restaurantId) {
  const startOfWeek = dayjs().startOf("week").toDate();
  const endOfWeek = dayjs().endOf("week").toDate();

  console.log(startOfWeek, endOfWeek, "startOfWeek, endOfWeek");

  const orders = await KsrOrders.find({
    restaurant: restaurantId,
    createdAt: { ">=": startOfWeek, "<=": endOfWeek },
  });

  const salesData = orders.reduce((acc, order) => {
    const day = dayjs(parseInt(order.createdAt)).format("dddd");
    acc[day] = (acc[day] || 0) + order.totalPrice;
    return acc;
  }, {});

  return Object.keys(salesData).map((day) => ({ day, sales: salesData[day] }));
}

async function getMonthlySales(restaurantId) {
  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();

  console.log(startOfMonth, endOfMonth, "startOfMonth, endOfMonth");
  const orders = await KsrOrders.find({
    restaurant: restaurantId,
    createdAt: { ">=": startOfMonth, "<=": endOfMonth },
  });

  const salesData = orders.reduce((acc, order) => {
    const week = `Week ${Math.ceil(
      dayjs(parseInt(order.createdAt)).date() / 7
    )}`;
    acc[week] = (acc[week] || 0) + order.totalPrice;
    return acc;
  }, {});

  return Object.keys(salesData).map((week) => ({
    week,
    sales: salesData[week],
  }));
}

async function getYearlySales(restaurantId) {
  const startOfYear = dayjs().startOf("year").toDate();
  const endOfYear = dayjs().endOf("year").toDate();

  const orders = await KsrOrders.find({
    restaurant: restaurantId,
    createdAt: { ">=": startOfYear, "<=": endOfYear },
  });

  const salesData = orders.reduce((acc, order) => {
    const month = dayjs(parseInt(order.createdAt)).format("MMMM");
    acc[month] = (acc[month] || 0) + order.totalPrice;
    return acc;
  }, {});

  return Object.keys(salesData).map((month) => ({
    month,
    sales: salesData[month],
  }));
}

async function getTopSellingProducts(restaurantId) {
  //for last month
  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();
  const orders = await KsrOrders.find({
    restaurant: restaurantId,
    createdAt: { ">=": startOfMonth, "<=": endOfMonth },
  }).populate("products");

  const productData = orders.reduce((acc, order) => {
    order.products.forEach((product) => {
      acc[product.productName] =
        (acc[product.productName] || 0) + product.quantity;
    });
    return acc;
  }, {});

  return Object.keys(productData).map((product) => ({
    product,
    quantity: productData[product],
  }));
}

async function getTableUtilization(restaurantId) {
  const startOfWeek = dayjs().startOf("week").toDate();
  const endOfWeek = dayjs().endOf("week").toDate();

  const sessions = await KsrTableSession.find({
    restaurant: restaurantId,
    createdAt: { ">=": startOfWeek, "<=": endOfWeek },
  });

  const utilizationData = sessions.reduce((acc, session) => {
    const day = dayjs(parseInt(session.createdAt)).format("dddd");
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(utilizationData).map((day) => ({
    day,
    sessions: utilizationData[day],
  }));
}

async function getDiscountsGiven(restaurantId) {
  const startOfWeek = dayjs().startOf("week").toDate();
  const endOfWeek = dayjs().endOf("week").toDate();

  const orders = await KsrOrders.find({
    restaurant: restaurantId,
    createdAt: { ">=": startOfWeek, "<=": endOfWeek },
  });

  const discountData = orders.reduce((acc, order) => {
    const day = dayjs(parseInt(order.createdAt)).format("dddd");
    acc[day] = (acc[day] || 0) + order.discountAmount;
    return acc;
  }, {});

  return Object.keys(discountData).map((day) => ({
    day,
    discount: discountData[day],
  }));
}

async function getTaxCollected(restaurantId) {
  const startOfWeek = dayjs().startOf("week").toDate();
  const endOfWeek = dayjs().endOf("week").toDate();

  const orders = await KsrOrders.find({
    restaurant: restaurantId,
    createdAt: { ">=": startOfWeek, "<=": endOfWeek },
  });

  const taxData = orders.reduce((acc, order) => {
    const day = dayjs(parseInt(order.createdAt)).format("dddd");
    acc[day] = (acc[day] || 0) + order.taxAmount;
    return acc;
  }, {});

  return Object.keys(taxData).map((day) => ({ day, tax: taxData[day] }));
}
