/*
  To call this helper:

  // With default usage:
  await sails.helpers.aws.s3Upload(…, …);

  // With named parameters:
  await sails.helpers.aws.s3Upload.with({
      someInput: …,
      someOtherInput: …
  });
*/
module.exports = {
  friendlyName: "S 3 upload",

  description:
    "Uploads the file to S3 as per the settings in .env file. Also deletes the file from the local filesystem after the file is uploaded.",

  inputs: {
    sourceFilePath: {
      friendlyName: "Source file path",
      description: "The absolute file path on the server system",
      type: "string",
    },
    fileName: {
      friendlyName: "Target file name",
      description: "The file name that you would like to have on s3",
      type: "string",
    },
    destinationDir: {
      friendlyName: "Target Directory",
      description:
        "The directory/folder on S3 that you would like to upload the file to. For root, keep it blank.",
      type: "string",
    },
    contentType: {
      friendlyName: "Content Type",
      description: "Type of file",
      type: "string",
    },
  },

  exits: {
    success: {
      outputFriendlyName: "File has been uploaded",
      outputDescription: "File has been uploaded successfully.",
    },

    error: {
      description:
        "File could not uploaded. Please check your settings and try again.",
    },
  },

  fn: async function (inputs, exits) {
    try {
      const { sourceFilePath, fileName, destinationDir, contentType } = inputs;

      const aws = require("aws-sdk");
      const axios = require("axios");
      const fs = require("fs");
      const util = require("util");
      const readFile = util.promisify(fs.readFile);
      const unlink = util.promisify(fs.unlink);

      const s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      });

      const file = await readFile(sourceFilePath);

      const presignedS3Url = s3.getSignedUrl("putObject", {
        Bucket: process.env.AWS_BUCKET,
        Key: `${destinationDir}/${fileName}`,
        ContentType: contentType,
        // ACL: "public-read",
      });

      const uploadedFile = await axios({
        url: presignedS3Url,
        method: "PUT",
        data: file,
        headers: {
          "Content-Type": contentType,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }).catch((error) => {
        sails.log.error(`Error while calling presigned URL`, error);
        return exits.error(error);
      });
      if (!uploadedFile) {
        return exits.error(`Error while calling presigned URL`);
      }

      await unlink(sourceFilePath);
      return exits.success(
        `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${destinationDir}/${fileName}`
      );
    } catch (err) {
      sails.log.error("main err", err);
      return exits.error(err);
    }
  },
};
