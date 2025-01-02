// api/controllers/VendorsManagementController.js
const { v4: uuidv4 } = require("uuid");

module.exports = {
  createVendor: async (req, res) => {
    try {
      const {
        vendorName,
        vendorEmail,
        vendorPhoneNumber,
        vendorAddress,
        vendorCategories,
        selfVending,
        vendorStatus,
        restaurantId,
      } = req.body;

      if (!vendorCategories || vendorCategories.length === 0) {
        return res
          .status(400)
          .json({ error: "Vendor Categories are required" });
      }

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      const mainCategories = await MainCategory.find({
        uniqueId: vendorCategories,
        restaurant: restaurantId,
      });

      if (mainCategories.length !== vendorCategories.length) {
        return res
          .status(400)
          .json({ error: "One or more categories not found" });
      }

      const uniqueId = uuidv4();

      const vendorData = {
        uniqueId,
        restaurant: restaurantId,
        vendorEmail,
        vendorAddress,
        selfVending: selfVending || "false",
        vendorStatus: vendorStatus || "false",
      };

      if (selfVending === "true") {
        vendorData.vendorName = `Self Vendor ${mainCategories
          .map((category) => category.name)
          .join(", ")}`;
        vendorData.vendorPhoneNumber = "1234567890";
      } else {
        if (!vendorName || !vendorPhoneNumber) {
          return res.status(400).json({
            error:
              "Vendor Name and Phone Number are required when selfVending is false",
          });
        }
        vendorData.vendorName = vendorName;
        vendorData.vendorPhoneNumber = vendorPhoneNumber;
      }

      const vendor = await VendorsManagement.create(vendorData).fetch();

      const vendorCategoryData = mainCategories.map((category) => ({
        uniqueId: uuidv4(),
        vendorsManagement: vendor.uniqueId,
        mainCategory: category.uniqueId,
      }));

      await VendorCategory.createEach(vendorCategoryData);

      return res.status(201).json(vendor);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  updateVendor: async (req, res) => {
    try {
      const { uniqueId } = req.query;
      const {
        vendorName,
        vendorEmail,
        vendorPhoneNumber,
        vendorAddress,
        vendorCategories,
        selfVending,
        vendorStatus,
      } = req.body;

      const updateData = {};

      if (vendorName) {
        updateData.vendorName = vendorName;
      }

      if (vendorEmail) {
        updateData.vendorEmail = vendorEmail;
      }

      if (vendorPhoneNumber) {
        updateData.vendorPhoneNumber = vendorPhoneNumber;
      }

      if (vendorAddress) {
        updateData.vendorAddress = vendorAddress;
      }

      if (vendorCategories !== undefined) {
        if (vendorCategories && vendorCategories.length > 0) {
          const mainCategories = await MainCategory.find({
            uniqueId: vendorCategories,
          });
          if (mainCategories.length === vendorCategories.length) {
            await VendorCategory.destroy({ vendorsManagement: uniqueId });

            const vendorCategoryData = mainCategories.map((category) => ({
              uniqueId: uuidv4(),
              vendorsManagement: uniqueId,
              mainCategory: category.uniqueId,
            }));

            await VendorCategory.createEach(vendorCategoryData);
          } else {
            return res
              .status(400)
              .json({ error: "One or more categories not found" });
          }
        } else {
          await VendorCategory.destroy({ vendorsManagement: uniqueId });
        }
      }

      if (selfVending !== undefined) {
        updateData.selfVending = selfVending;
      }

      if (vendorStatus !== undefined) {
        updateData.vendorStatus = vendorStatus;
      }

      const updatedVendor = await VendorsManagement.updateOne({
        uniqueId: uniqueId,
      }).set(updateData);

      if (!updatedVendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      return res.status(200).json({ message: "Vendor updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getVendors: async (req, res) => {
    try {
      const {
        uniqueId,
        vendorCategory,
        selfVending,
        vendorStatus,
        restaurantId,
      } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: "restaurantId is required" });
      }

      let query = {};
      query.restaurant = restaurantId;

      if (uniqueId) {
        query.uniqueId = uniqueId;
      }

      if (vendorCategory) {
        const mainCategory = await MainCategory.findOne({
          uniqueId: vendorCategory,
        });
        if (!mainCategory) {
          return res.status(404).json({ error: "Category not found" });
        }
        query.vendorCategories = { mainCategory: vendorCategory };
      }

      if (selfVending !== undefined) {
        query.selfVending = selfVending;
      }

      if (vendorStatus !== undefined) {
        query.vendorStatus = vendorStatus;
      }

      const vendors = await VendorsManagement.find(query).populate(
        "vendorCategories"
      );

      const vendorsWithCategories = vendors.map(async (vendor) => {
        const categories = await Promise.all(
          vendor.vendorCategories.map(async (category) => {
            const mainCategory = await MainCategory.findOne({
              uniqueId: category.mainCategory,
            });
            return mainCategory;
          })
        );

        return {
          ...vendor,
          vendorCategories: categories,
        };
      });

      const result = await Promise.all(vendorsWithCategories);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteVendor: async (req, res) => {
    try {
      const { uniqueId } = req.query;

      await VendorCategory.destroy({ vendorsManagement: uniqueId });
      const deletedVendor = await VendorsManagement.destroyOne({ uniqueId });

      if (!deletedVendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }

      return res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};
