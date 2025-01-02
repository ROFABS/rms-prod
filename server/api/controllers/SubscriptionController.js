const crypto = require("crypto");

module.exports = {
  createSubscription: async (req, res) => {
    try {
      const { plan, amount } = req.body;

      console.log(req.user, "req.user");

      const user = await User.findOne({ uniqueId: req.user.uniqueId });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const subscription = await SubscriptionService.createSubscription(
        req.user.uniqueId,
        plan,
        amount
      );
      console.log(subscription, "subscription");
      const order = await SubscriptionService.createOrder(amount);

      return res.status(200).json({ subscription, order });
    } catch (error) {
      sails.log.error(error);
      return res.status(422).json({ error: error.message });
    }
  },

  renewSubscription: async (req, res) => {
    try {
      const { userId, plan, amount } = req.body;

      const user = await User.findOne({ uniqueId: userId });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const subscription = await SubscriptionService.renewSubscription(
        userId,
        plan,
        amount
      );
      const order = await SubscriptionService.createOrder(amount);

      return res.status(200).json({ subscription, order });
    } catch (error) {
      sails.log.error(error);
      return res.status(500).json({ error: error.message });
    }
  },

  checkSubscriptionStatus: async (req, res) => {
    try {
      const { userId } = req.body;

      const status = await SubscriptionService.checkSubscriptionStatus(userId);

      return res.status(200).json({ status });
    } catch (error) {
      sails.log.error(error);
      return res.status(500).json({ error: error.message });
    }
  },

  handleWebhook: async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    try {
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      if (digest === req.headers["x-razorpay-signature"]) {
        const event = req.body.event;

        if (event === "payment.captured") {
          console.log("Payment captured");
          console.log(req.body.payload.payment.entity);
          const payment = req.body.payload.payment.entity;
          const subscriptionId = payment.notes.subscription_id;

          await Subscription.updateOne({ subscriptionId }).set({
            status: "active",
            transactionId: payment.id,
            paymentMethod: payment.method,
          });

          return res.status(200).json({ status: "ok" });
        }
      } else {
        return res.status(400).json({ error: "Invalid signature" });
      }
    } catch (error) {
      sails.log.error(error);
      return res.status(500).json({ error: error });
    }
  },
};
