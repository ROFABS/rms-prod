/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ResponseCodes = sails.config.constants.ResponseCodes;
const messages = sails.config.messages;
const FileName = "AuthController";
const fs = require("fs-extra");
module.exports = {
  /**
   * @function login
   * @description Login user for web admin panel
   */
  login: async (req, res) => {
    sails.log.info(`${FileName} -  login`);

    let data = _.pick(req.body, ["email", "password"]);
    try {
      let { hasError, errors, user } = await User.validateUserLogin(data);

      if (hasError) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: errors,
        });
      }
      user = await User.findOne({
        email: user.email,
      });
      if (!user) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.NotFound,
        });
      }
      if (!user.is_verified) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.Verify,
        });
      }
      if (!user.isActive) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.InvalidUserId,
        });
      }
      const tempToken = JwtService.issue({ uniqueId: user.uniqueId });
      user.token = tempToken;
      user = _.omit(user, [
        "password",
        "password_reset_token",
        "company_name",
        "is_verified",
        "isActive",
        "isOnboarded",
        "onboardingStep",
        "phone",
      ]);
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: user,
        error: "",
        success: messages.LoggedIn,
      });
    } catch (error) {
      sails.log.error(error);
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },

  /**
   * @function verifyUser
   * @description verify user after creation
   */
  verifyUser: async (req, res) => {
    sails.log.info(`${FileName} -  verifyUser`);
    try {
      let { token } = _.pick(req.body, ["token"]);
      if (!token) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          error: messages.Missing_Verification_Token,
        });
      }
      let checkExistence = await User.findOne({
        password_reset_token: token,
      });

      if (!checkExistence) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          error: messages.Invalid_Token,
        });
      }
      let updatedUser = await User.updateOne({
        password_reset_token: token,
      }).set({ is_verified: true, password_reset_token: "" });
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: {},
        success: messages.User.Verified,
      });
    } catch (error) {
      // console.log(error);
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        error: error,
        message: error.msg,
      });
    }
  },

  /**
   * @function forgotPassword
   * @description send email to user with reset password link
   */
  forgotPassword: async (req, res) => {
    try {
      let { email } = _.pick(req.body, ["email"]);
      if (!email) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          error: messages.EmailRequired,
        });
      }
      let checkExistence = await User.findOne({
        email,
      });

      if (!checkExistence) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          error: messages.User.NotFound,
        });
      }
      const token = JwtService.issue({ email: checkExistence.email });
      let updatedUser = await User.updateOne({
        email,
      }).set({ password_reset_token: token });
      let mail = await sails.helpers.mailSender.with({
        mailTo: [updatedUser.email],
        mailSubject: "Forgot Password",

        mailBody: `
        <p>Reset Password link : ${
          `${process.env.Frontend_Reset_Password_Link}?token=` +
          updatedUser.password_reset_token
        }</p>
        `,
      });
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: {},
        success: messages.Forgot_Password_Link,
      });
    } catch (error) {
      console.log(error);
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        error: error,
        message: error.msg,
      });
    }
  },

  /**
   * @function resetPassword
   * @description Reset User Password
   */
  resetPassword: async (req, res) => {
    try {
      let { password, token } = _.pick(req.body, ["password", "token"]);
      let { hasError, errors } = await User.validateResetPasswordData({
        password: password,
        token: token,
      });
      if (hasError) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Required_Field_Missing,
        });
      }
      let checkExistence = await User.findOne({
        password_reset_token: token,
      });

      if (!checkExistence) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          error: messages.Invalid_Token,
        });
      }

      let updatedUser = await User.updateOne({
        password_reset_token: token,
      }).set({ password_reset_token: "", password });
      let mail = await sails.helpers.mailSender.with({
        mailTo: [updatedUser.email],
        mailSubject: "Password Reset Successful",

        mailBody: `
        <p>Password : ${password}</p>
        `,
      });
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: {},
        message: messages.Reset_Success,
      });
    } catch (error) {
      console.log(error);
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        error: error,
        message: error.msg,
      });
    }
  },

  /**
   * @function changePassword
   * @description Change User Password
   */
  ChangePassword: async (req, res) => {
    try {
      let userId = req.params.id;
      let data = _.pick(req.body, ["currentPassword", "newPassword"]);

      let { hasError, errors } = await User.validateChangePasswordData(data);
      if (hasError) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Required_Field_Missing,
        });
      }
      let existingUser = await User.findOne({ uniqueId: userId });
      if (!existingUser) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.InvalidUserId,
        });
      }
      let compareFlag = await User.comparePassword(
        data.currentPassword,
        existingUser
      );
      if (!compareFlag) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Invalid_Old_Password,
        });
      }
      let user = await User.updateOne(
        { uniqueId: userId },
        { password: data.newPassword }
      );
      if (user) {
        return res.status(ResponseCodes.OK).json({
          status: ResponseCodes.OK,
          data: {},
          error: "",
          success: messages.Changed_Password,
        });
      }
    } catch (error) {
      sails.log.error(error);
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },
  getMe: async (req, res) => {
    try {
      sails.log.info(`${FileName} -  getMe`);
      const user = req.user;
      if (!user) {
        return res.status(ResponseCodes.NOT_FOUND).json({
          status: ResponseCodes.NOT_FOUND,
          data: "",
          error: messages.User.NotFound,
        });
      }

      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: user,
        error: "",
      });
    } catch (error) {
      sails.log.error(error);
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },

  completeOnboarding: async (req, res) => {
    sails.log.info(`${FileName} - completeOnboarding`);
    const { property, noOfTables } = req.body;

    try {
      await sails.getDatastore().transaction(async (db) => {
        let propertyData = _.cloneDeep(property);
        propertyData.uniqueId = sails.config.constants.uuidv4();
        propertyData.titleSearch = propertyData.title.toLowerCase();
        // let createdProperty = await Property.create(propertyData)
        //   .usingConnection(db)
        //   .fetch();
        // if (!createdProperty) {
        //   throw new Error(messages.Property.Not_Created);
        // }

        const restaurantUniqueId = sails.config.constants.uuidv4();
        const restaurant = await Restaurant.create({
          uniqueId: restaurantUniqueId,
          propertyId: propertyData.uniqueId,
          restaurantName: propertyData.title,
          restaurantType: propertyData.property_type,
          startTime: property.startTime,
          endTime: property.endTime,
          groupId: req.user.groupUniqueId,
          email: property.email,
          phone: property.phone,
          website: property.website,
          address: property.address,
          landmark: property.landmark,
          city: property.city,
          state: property.state,
          countryCode: property.country_code,
          timezone: property.timezone,
          zipCode: property.zip_code,
          latitude: property.latitude,
          longitude: property.longitude,
          description: property.description,
          currency: property.currency,
        })
          .fetch()
          .usingConnection(db);

        if (!restaurant) {
          throw new Error(messages.Restaurant.Not_Created);
        }

        const tableRecords = [];

        for (let i = 0; i <= noOfTables; i++) {
          const tableUniqueId = sails.config.constants.uuidv4();
          const tableRecord = await KsrTables.create({
            uniqueId: tableUniqueId,
            restaurantUniqueId: restaurant.uniqueId,
            tableNumber: i,
            seatCounts: i === 0 ? 0 : 4,
          })
            .fetch()
            .usingConnection(db);
          tableRecords.push(tableRecord);
        }

        let updateduser = await User.updateOne({ uniqueId: req.user.uniqueId })
          .set({
            isOnboarded: true,
            onboardingStep: 2,
            properties: [restaurant.uniqueId],
          })
          .fetch()
          .usingConnection(db);

        if (!updateduser) {
          throw new Error(messages.User.Not_Updated);
        }

        const issueToken = JwtService.issue({ uniqueId: updateduser.uniqueId });
        updateduser.token = issueToken;
        updateduser = _.omit(updateduser, [
          "password",
          "password_reset_token",
          "company_name",
          "is_verified",
        ]);

        return res.status(ResponseCodes.OK).json({
          status: ResponseCodes.OK,
          data: updateduser,
          error: "",
          success: messages.User.Onboard,
        });
      });
    } catch (error) {
      sails.log.error(
        `${FileName} - completeOnboarding - error: ${error.message}`
      );
      return res.status(ResponseCodes.BAD_REQUEST).json({
        status: ResponseCodes.BAD_REQUEST,
        data: "",
        error: error.message,
      });
    }
  },
  updateOnBoardingStep: async (req, res) => {
    sails.log.info(`${FileName} - updateOnBoardingStep`);
    const { step } = req.body;
    const user = await User.findOne({ uniqueId: req.user.uniqueId });
    if (!user) {
      return res.status(ResponseCodes.BAD_REQUEST).json({
        status: ResponseCodes.BAD_REQUEST,
        data: "",
        error: messages.User.NotFound,
      });
    }
    let updateduser = await User.updateOne({ uniqueId: user.uniqueId }).set({
      onboardingStep: step,
    });
    if (!updateduser) {
      return res.status(ResponseCodes.BAD_REQUEST).json({
        status: ResponseCodes.BAD_REQUEST,
        data: "",
        error: messages.User.Not_Updated,
      });
    }
    return res.status(ResponseCodes.OK).json({
      status: ResponseCodes.OK,
      data: updateduser,
      error: "",
      success: messages.User.Onboard,
    });
  },
};
