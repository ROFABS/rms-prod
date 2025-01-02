/*

  To call this helper:



  // With default usage:

  await sails.helpers.aws.s3Delete(…, …);



  // With named parameters:

  await sails.helpers.aws.s3Delete.with({

    someInput: …,

    someOtherInput: …

  });

*/

module.exports = {
  friendlyName: "S 3 delete",

  description: "Deletes the file from S3 as per the settings defined in .env",

  inputs: {
    fileKey: {
      friendlyName: "File path on S3",

      description: "Path to the file you would like to delete from S3",

      type: "string",
    },
  },

  exits: {
    success: {
      description: "File has been deleted successfully.",
    },

    error: {
      description:
        "File could not deleted. Please check your settings and try again.",
    },
  },

  fn: async function (inputs, exits) {
    const aws = require("aws-sdk");

    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    });

    s3.deleteObject(
      { Bucket: process.env.AWS_BUCKET, Key: inputs.fileKey },
      (err, data) => {
        if (err) {
          console.log(err);
          return exits.success(false);
        }
        return exits.success(true);
      }
    );
  },
};
