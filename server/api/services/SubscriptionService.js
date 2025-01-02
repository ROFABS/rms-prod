const Razorpay = require("razorpay");
const dayjs = require("dayjs");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
  createSubscription: async (userId, plan, amount) => {
    const startDate = new Date();
    const endDate =
      plan === "yearly"
        ? dayjs(startDate).add(1, "year").toDate()
        : dayjs(startDate).add(3, "year").toDate();
    const subscriptionId = sails.config.constants.uuidv4();
    console.log(subscriptionId, "subscriptionId");
    console.log(userId, "userId");
    console.log(plan, "plan");
    const existingSubscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (existingSubscription) {
      throw new Error("User already has an active subscription");
    }
    const subscription = await Subscription.create({
      subscriptionId,
      userId,
      plan,
      amount,
      startDate,
      endDate,
    }).fetch();

    await User.updateOne({ uniqueId: userId }).set({
      subscription: subscription.subscriptionId,
      onboardingStep: 1,
    });

    return subscription;
  },

  renewSubscription: async (userId, plan, amount) => {
    const user = await User.findOne({ uniqueId: userId }).populate(
      "subscription"
    );

    if (!user.subscription) {
      throw new Error("No active subscription found");
    }

    const startDate = new Date();
    const endDate =
      plan === "yearly"
        ? dayjs(startDate).add(1, "year").toDate()
        : dayjs(startDate).add(3, "year").toDate();

    const updatedSubscription = await Subscription.updateOne({
      subscriptionId: user.subscription.subscriptionId,
    }).set({
      plan,
      amount,
      startDate,
      endDate,
      status: "active",
    });

    return updatedSubscription;
  },

  checkSubscriptionStatus: async (userId) => {
    const user = await User.findOne({ uniqueId: userId }).populate(
      "subscription"
    );

    if (!user.subscription) {
      return null;
    }

    const now = new Date();
    if (user.subscription.endDate < now) {
      await Subscription.updateOne({
        subscriptionId: user.subscription.subscriptionId,
      }).set({
        status: "expired",
      });
      return "expired";
    }

    return user.subscription.status;
  },

  createOrder: async (amount, currency = "INR") => {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return order;
  },
};
