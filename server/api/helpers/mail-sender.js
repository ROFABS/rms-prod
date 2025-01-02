module.exports = {
  friendlyName: "Mail sender",

  description:
    "Sends an email using the credentials specified in the .env file",

  inputs: {
    mailTo: {
      friendlyName: "Email address of recipient",
      description: "The email address of recipient to send the email to.",
      type: "json",
      columnType: "array",
    },
    mailSubject: {
      friendlyName: "Email Subject",
      description: "The subject of the email.",
      type: "string",
    },
    mailBody: {
      friendlyName: "Email body",
      description: "The HTML or plain-text body of the email.",
      type: "string",
    },
    mailAttachments: {
      friendlyName: "Email attachments",
      description: "The documents to send",
      type: "json",
      columnType: "array",
    },
    mailCC: {
      friendlyName: "Email address of recipient",
      description: "The email address of recipient to send the email to.",
      type: "json",
      columnType: "array",
    },
  },

  exits: {
    success: {
      outputFriendlyName: "Mail is sent",
      outputDescription: "Mail has been sent successfully.",
    },

    mailError: {
      description:
        "Mail could not be sent due to some errors. Please check the logs for more details.",
    },
  },

  fn: async function (inputs, exits) {
    // Initializing nodemailer
    const nodemailer = require("nodemailer");

    var smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
      secure: false,
    });

    // Setting up mail options for sending mail.
    var mailOptions = {
      to: inputs.mailTo,
      from: process.env.SMTP_USERNAME,
      subject: inputs.mailSubject,
      html: inputs.mailBody,
      attachments: inputs.mailAttachments,
      cc: inputs.mailCC,
    };

    // Sends email asynchronously and capturing the response
    let data = await smtpTransport.sendMail(mailOptions);
    console.log(data, "data");

    return exits.success(true);
  },
};
