module.exports = {
  updateSwiggy: async function (req, res) {
    try {
      const { restaurantId, swiggyRestaurantId, swiggyStatus } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ message: "Restaurant ID is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId: restaurantId });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      //create or update channel
      const channel = await Channels.findOne({
        restaurant: restaurant.uniqueId,
      });
      let updatedChannel;
      if (!channel) {
        const uniqueId = sails.config.constants.uuidv4();
        updatedChannel = await Channels.create({
          uniqueId,
          restaurant: restaurant.uniqueId,
          swiggyRestaurantId,
          swiggyStatus,
        });
      } else {
        updatedChannel = await Channels.updateOne({
          uniqueId: channel.uniqueId,
          restaurant: restaurant.uniqueId,
        }).set({
          swiggyRestaurantId,
          swiggyStatus,
        });
      }
      return res.status(200).json({
        message: "Channel updated successfully",
        data: updatedChannel,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  updateZomato: async function (req, res) {
    try {
      const { restaurantId, zomatoRestaurantId, zomatoStatus } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ message: "Restaurant ID is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId: restaurantId });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      //create or update channel
      const channel = await Channels.findOne({
        restaurant: restaurant.uniqueId,
      });

      let updatedChannel;
      if (!channel) {
        const uniqueId = sails.config.constants.uuidv4();
        updatedChannel = await Channels.create({
          uniqueId,
          restaurant: restaurant.id,
          zomatoRestaurantId,
          zomatoStatus,
        });
      } else {
        updatedChannel = await Channels.updateOne({
          uniqueId: channel.uniqueId,
          restaurant: restaurant.uniqueId,
        }).set({
          zomatoRestaurantId,
          zomatoStatus,
        });
      }
      return res.status(200).json({
        message: "Channel updated successfully",
        data: updatedChannel,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  getChannelStatus: async function (req, res) {
    try {
      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ message: "Restaurant ID is required" });
      }

      const restaurant = await Restaurant.findOne({ uniqueId: restaurantId });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      const channel = await Channels.findOne({
        restaurant: restaurant.uniqueId,
      });

      return res.status(200).json({
        message: "Channel status fetched successfully",
        data: channel,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};
