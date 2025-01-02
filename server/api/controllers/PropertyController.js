/**
 * PropertyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ResponseCodes = sails.config.constants.ResponseCodes;
const messages = sails.config.messages;
const FileName = "PropertyController";
module.exports = {
  /**
   * Get Properties list
   */
  getProperty: async (req, res) => {
    try {
      let groupId = req.params.groupId;
      if (!groupId) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Group.Not_Exists,
        });
      }
      let checkExisting = await Group.findOne({ uniqueId: groupId });
      if (!checkExisting) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Group.Not_Exists,
        });
      }
      let properties = await Property.find({ group_id: groupId });
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: properties || [],
        success: messages.Property.List,
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
   * Create Property
   */

  createProperty: async (req, res) => {
    try {
      let propertyData = _.cloneDeep(req.body);

      // let result = await Property.validateCreatePropertyData(
      //   propertyData,
      //   true
      // );
      // if (result["hasError"]) {
      //   return res.status(ResponseCodes.BAD_REQUEST).json({
      //     status: ResponseCodes.BAD_REQUEST,
      //     data: "",
      //     // error: messages.Required_Field_Missing,
      //     error: result["errors"],
      //   });
      // }
      propertyData.uniqueId = sails.config.constants.uuidv4();
      let createdProperty = await Property.create(propertyData).fetch();
      if (!createdProperty) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Property.Not_Created,
        });
      }
      // let createdWebhook = await sails.helpers.createChannexWebhook.with({
      //   property_id: createdProperty.channexId,
      // });
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: createdProperty,
        success: messages.Property.Created,
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
   * Update Property
   */

  updateProperty: async (req, res) => {
    try {
      let propertyId = req.params.propertyId;
      let propertyData = _.cloneDeep(req.body);

      if (!propertyId) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Property.Not_Found,
        });
      }
      let checkExisting = await Property.findOne({ uniqueId: propertyId });
      if (!checkExisting) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Property.Not_Found,
        });
      }

      let result = await Property.validateCreatePropertyData(
        propertyData,
        false
      );
      if (result["hasError"]) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          // error: messages.Required_Field_Missing,
          error: result["errors"],
        });
      }
      let updatedProperty = await Property.updateOne(
        { uniqueId: propertyId },
        propertyData
      );
      if (!updatedProperty) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Property.Not_Updated,
        });
      }
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: updatedProperty,
        success: messages.Property.Updated,
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
   * Delete Property
   */

  deleteProperty: async (req, res) => {
    try {
      let propertyId = req.params.propertyId;
      if (!propertyId) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Property.Not_Found,
        });
      }
      let checkExisting = await Property.findOne({ uniqueId: propertyId });
      if (!checkExisting) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Property.Not_Found,
        });
      }
      let deletedProperty = await Property.destroyOne({ uniqueId: propertyId });
      if (!deletedProperty) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Property.Not_Delete,
        });
      }
      await sails.helpers.deleteChannexProperty.with({
        channexId: checkExisting.channexId,
      });
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: {},
        success: messages.Property.Updated,
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

  uploadPropertyLogo: async (req, res) => {
    try {
      let owner = req.user.uniqueId;
      let property = req.params.propertyId;
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
              error: messages.Property.Logo_Not_Found,
            });
          }

          if (!files.length) {
            return res.status(ResponseCodes.BAD_REQUEST).json({
              status: ResponseCodes.BAD_REQUEST,
              data: "",
              error: messages.Property.Logo_Not_Found,
            });
          }

          const contentType =
            req.file("file")._files[0].stream.headers["content-type"];
          const fileName = req.file("file")._files[0].stream.filename;
          let docPath = `${owner}/Property/${property}/file_${Math.floor(
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
              error: messages.Property.Logo_Not_Uploaded,
            });
          }

          let createdImage = await Images.create({
            url: uploadedFile,
            author: owner,
            description: "Property Logo",
            kind: "photo",
            property: property,
          }).fetch();

          return res.status(ResponseCodes.OK).json({
            status: ResponseCodes.OK,
            data: createdImage,
            success: messages.Property.Logo_Uploaded,
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

  deleteFile: async (req, res) => {
    try {
      let url = req.body.url;
      if (!url) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: "File url not found",
        });
      }
      let findFile = await Images.findOne({ url: url });
      if (!findFile) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: "File not found",
        });
      }
      const photoUrl = new URL(findFile.url);
      const photo = photoUrl.pathname.substring(1);
      let deleteAwsFile = await sails.helpers.aws.s3Delete(photo);
      if (!deleteAwsFile) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: "File not deleted",
        });
      }
      let deletedFile = await Images.destroyOne({ url: findFile.url });
      if (!deletedFile) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: "File not deleted",
        });
      }
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: "",
        success: "File deleted successfully",
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

  getPropertyFiles: async (req, res) => {
    try {
      let propertyId = req.params.propertyId;
      if (!propertyId) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Property.Not_Found,
        });
      }
      let checkExisting = await Property.findOne({ uniqueId: propertyId });
      if (!checkExisting) {
        return res.status(ResponseCodes.BAD_REQUEST).json({
          status: ResponseCodes.BAD_REQUEST,
          data: "",
          error: messages.Property.Not_Found,
        });
      }
      let propertyImages = await Images.find({
        property: propertyId,
        description: "Property Image",
      });
      return res.status(ResponseCodes.OK).json({
        status: ResponseCodes.OK,
        data: propertyImages,
        success: messages.Property.Images,
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

  uploadPropertyFiles: async (req, res) => {
    try {
      let owner = req.user.uniqueId;
      let property = req.params.propertyId;
      return req.file("files").upload(
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
              error: messages.Property.Logo_Not_Found,
            });
          }

          if (!files.length) {
            return res.status(ResponseCodes.BAD_REQUEST).json({
              status: ResponseCodes.BAD_REQUEST,
              data: "",
              error: messages.Property.Logo_Not_Found,
            });
          }
          for (let i = 0; i < files.length; i++) {
            const contentType =
              req.file("files")._files[i].stream.headers["content-type"];
            const fileName = req.file("files")._files[i].stream.filename;
            let docPath = `${owner}/Property/${property}/file_${Math.floor(
              Date.now()
            )}_${fileName}`;

            let uploadedFile = await sails.helpers.aws.s3Upload(
              files[i].fd,
              docPath,
              process.env.AWS_BUCKET,
              contentType
            );
            if (uploadedFile) {
              let createdImage = await Images.create({
                url: uploadedFile,
                author: owner,
                description: "Property Image",
                kind: "photo",
                property: property,
              }).fetch();
            }
          }

          return res.status(ResponseCodes.OK).json({
            status: ResponseCodes.OK,
            data: "",
            success: messages.Property.Files_Uploaded,
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
