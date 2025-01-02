/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ResponseCodes = sails.config.constants.ResponseCodes;
const messages = sails.config.messages;
const FileName = "UserController";
const Roles = sails.config.constants.Roles;
const fs = require("fs-extra");
module.exports = {
  /**
   * @function register owner
   * @description Create a new owner
   */
  registerOwner: async (req, res) => {
    sails.log.info(`${FileName} -  registerOwner`);
    let data = _.pick(req.body, [
      "fname",
      "lname",
      "email",
      "country_code",
      "phone",
      "password",
      "company_name",
    ]);

    let result = await User.validateCreateOwnerData(data);
    if (result["hasError"]) {
      return res.status(ResponseCodes.BAD_REQUEST).json({
        status: ResponseCodes.BAD_REQUEST,
        data: "",
        error: messages.Required_Field_Missing,
      });
    }

    try {
      let existingUser = await User.find({
        email: data.email.toLowerCase(),
      });
      if (existingUser.length > 0) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.AlreadyExist,
        });
      }
      let group = await Group.create({
        name: data.company_name,
        nameSearch: data.company_name.toLowerCase(),
        uniqueId: sails.config.constants.uuidv4(),
      }).fetch();

      data.role = Roles.OWNER;
      data.isOnboarded = false;
      data.onboardingStep = 1;
      data.password_reset_token = JwtService.issue({ email: data.email });
      data.uniqueId = sails.config.constants.uuidv4();
      data.group = group.id;
      data.groupUniqueId = group.uniqueId;

      let user = await User.create({ ...data }).fetch();

      let mail = await sails.helpers.mailSender.with({
        mailTo: [user.email],
        mailSubject: "Created User Details",

        mailBody: `
        <p>Email : ${user.email}</p>
        <p>Password : ${data.password}</p>
        <p>Verification link : ${`${process.env.Frontend_Verify_User_Link}/${user.password_reset_token}`}</p>
        `,
      });

      return res.status(ResponseCodes.CREATED).json({
        status: ResponseCodes.CREATED,
        data: {},
        success: messages.User.Created,
        error: "",
      });
    } catch (error) {
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },

  /**
   * @function create user
   * @description Create a new user
   */
  createUser: async (req, res) => {
    sails.log.info(`${FileName} -  createUser`);
    try {
      let data = _.pick(req.body, [
        "fname",
        "lname",
        "email",
        "country_code",
        "phone",
        "role",
        "properties",
        //extra details
        "address",
        "dateOfJoining",
        "department",
        "gender",
        "nokName",
        "nokPhone",
        "nokRelationship",
        "nokAddress",
      ]);

      let result = await User.validateCreateUserData(data);
      if (result["hasError"]) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          // error: messages.Required_Field_Missing,
          error: result.errors,
        });
      }

      let existingUser = await User.find({
        email: data.email.toLowerCase(),
      });
      if (existingUser.length > 0) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.AlreadyExist,
        });
      }

      data.password = await User.PasswordGenerator();
      data.password_reset_token = JwtService.issue({ email: data.email });
      data.uniqueId = sails.config.constants.uuidv4();
      data.group = req.user.group;
      data.groupUniqueId = req.user.groupUniqueId;
      data.isOnboarded = true;
      data.subscription = req.user.subscription;

      let user = await User.create({ ...data }).fetch();

      let mail = await sails.helpers.mailSender.with({
        mailTo: [user.email],
        mailSubject: "Created User Details",

        mailBody: `
        <p>Email : ${user.email}</p>
        <p>Password : ${data.password}</p>
        <p>Verification link : ${`${process.env.Frontend_Verify_User_Link}/${user.password_reset_token}`}</p>
        `,
      });

      const uniqueId = sails.config.constants.uuidv4();

      const extraDetails = await UserDetails.create({
        uniqueId: uniqueId,
        address: data.address,
        dateOfJoining: data.dateOfJoining,
        department: data.department,
        gender: data.gender,
        nokName: data.nokName,
        nokPhone: data.nokPhone,
        nokAddress: data.nokAddress,
        nokRelationship: data.nokRelationship,
      }).fetch();

      await User.updateOne({ uniqueId: user.uniqueId }).set({
        extraDetails: extraDetails.uniqueId,
      });

      console.log(mail, "mail");

      return res.status(ResponseCodes.CREATED).json({
        status: ResponseCodes.CREATED,
        data: {},
        success: messages.User.Created,
        error: "",
      });
    } catch (error) {
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },

  /**
   * @function update user
   * @description Update a user
   */
  updateUser: async (req, res) => {
    sails.log.info(`${FileName} -  updateUser`);
    try {
      let userId = req.params.userId || "";
      let data = _.pick(req.body, [
        "fname",
        "lname",
        "country_code",
        "phone",
        "isActive",
        "properties",
        "profile_pic",
      ]);

      let existingUser = await User.findOne({
        uniqueId: userId,
      });
      if (!existingUser) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.NotFound,
        });
      }

      let result = await User.validateUpdateUserData(data);
      if (result["hasError"]) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Required_Field_Missing,
        });
      }

      let user = await User.updateOne({ uniqueId: userId }, { ...data });

      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: {},
        message: messages.User.Updated,
        error: "",
      });
    } catch (error) {
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },

  /**
   * @function delete user
   * @description Delete a user
   */
  deleteUser: async (req, res) => {
    sails.log.info(`${FileName} -  deleteUser`);
    try {
      let userId = req.params.userId || "";

      let existingUser = await User.findOne({
        uniqueId: userId,
        role: { "!=": Roles.OWNER },
      });
      if (!existingUser) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.NotFound,
        });
      }
      let user = await User.destroyOne({ uniqueId: userId });
      if (!user) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.Not_Deleted,
        });
      }

      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: {},
        success: messages.User.Deleted,
        error: "",
      });
    } catch (error) {
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },

  /**
   * @function get user
   * @description get a user
   */
  getUser: async (req, res) => {
    sails.log.info(`${FileName} -  getUser`);
    try {
      let userId = req.params.id || "";

      let existingUser = await User.findOne({
        uniqueId: userId,
      });
      if (!existingUser) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.NotFound,
        });
      }
      delete existingUser.password;
      delete existingUser.password_reset_token;
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: existingUser,
        success: messages.User.Details,
        error: "",
      });
    } catch (error) {
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },

  /**
   * @function getUserByRoles
   * @description get a users list by role
   * /api/v1/user/roles?role=role
   **/
  getUsersByRole: async (req, res) => {
    sails.log.info(`${FileName} -  getUserByRoles`);
    try {
      const groupUniqueId = req.user.groupUniqueId;
      let role = req.query.role || "";
      let page = req.query.page || 1;
      let limit = req.query.limit || 10;

      let existingUser = await User.find({
        where: {
          role: role,
          groupUniqueId: groupUniqueId,
        },
        limit: limit,
        skip: (page - 1) * limit,
        select: [
          "createdAt",
          "updatedAt",
          "id",
          "uniqueId",
          "fname",
          "lname",
          "email",
          "phone",
          "isActive",
          "is_verified",
          "company_name",
          "role",
          "groupUniqueId",
          "group",
        ],
      });
      if (!existingUser) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.NotFound,
        });
      }
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: existingUser || [],
        success: messages.User.Details,
        error: "",
      });
    } catch (error) {
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },

  /**
   * @function getUserList user list by group/company
   * @description get a user
   */
  getUserList: async (req, res) => {
    sails.log.info(`${FileName} -  getUserList`);
    try {
      let groupId = req.params.groupId || "";
      let page = req.query.page || 1;
      let limit = req.query.limit || 10;

      let checkExisting = await Group.findOne({ uniqueId: groupId });
      if (!checkExisting) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Group.Not_Exists,
        });
      }

      let existingUser = await User.find({
        where: {
          groupUniqueId: groupId,
          role: { "!=": Roles.OWNER },
        },
        limit: limit,
        skip: (page - 1) * limit,
        select: [
          "createdAt",
          "updatedAt",
          "id",
          "uniqueId",
          "fname",
          "lname",
          "email",
          "phone",
          "isActive",
          "is_verified",
          "company_name",
          "role",
          "groupUniqueId",
          "group",
        ],
      });
      if (!existingUser) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.User.NotFound,
        });
      }
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: existingUser || [],
        success: messages.User.Details,
        error: "",
      });
    } catch (error) {
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },

  uploadUserLogo: async (req, res) => {
    console.log("uploadUserLogo");
    try {
      let owner = req.user.uniqueId;
      return req.file("file").upload(
        {
          adapter: require("skipper-disk"),
          maxBytes: 1073741824,
        },
        async function onUploadComplete(err, files) {
          if (err) {
            sails.log.error(err);
            return res.status(ResponseCodes.BAD_REQUEST).json({
              status: ResponseCodes.BAD_REQUEST,
              data: "",
              error: err.toString(),
            });
          }
          if (_.isEmpty(files)) {
            return res.status(ResponseCodes.BAD_REQUEST).json({
              status: ResponseCodes.BAD_REQUEST,
              data: "",
              error: messages.User.Logo_Not_Found,
            });
          }

          if (!files.length) {
            return res.status(ResponseCodes.BAD_REQUEST).json({
              status: ResponseCodes.BAD_REQUEST,
              data: "",
              error: messages.User.Logo_Not_Found,
            });
          }

          const contentType =
            req.file("file")._files[0].stream.headers["content-type"];
          const fileName = req.file("file")._files[0].stream.filename;
          let docPath = `${owner}/Profile_Image/file_${Math.floor(
            Date.now()
          )}_${fileName}`;

          console.log(fileName, docPath);

          let uploadedFile = await sails.helpers.aws.s3Upload(
            files[0].fd,
            docPath,
            process.env.AWS_BUCKET,
            contentType
          );
          if (!uploadedFile) {
            return res.status(ResponseCodes.BAD_REQUEST).json({
              status: ResponseCodes.BAD_REQUEST,
              data: "",
              error: messages.User.Logo_Not_Uploaded,
            });
          }

          let createdImage = await Images.create({
            url: uploadedFile,
            author: owner,
            description: "User Profile Image",
            kind: "photo",
          }).fetch();

          return res.status(ResponseCodes.OK).json({
            status: ResponseCodes.OK,
            data: createdImage,
            success: messages.User.Logo_Uploaded,
          });
        }
      );
    } catch (error) {
      sails.log.error(error);
      return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({
        status: ResponseCodes.INTERNAL_SERVER_ERROR,
        data: "",
        error: error.toString(),
      });
    }
  },
};
